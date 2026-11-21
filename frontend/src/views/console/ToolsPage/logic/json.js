import { applyEdits, createScanner, format, parseTree, SyntaxKind } from 'jsonc-parser'

export const MAX_JSON_LENGTH = 2 * 1024 * 1024
const MAX_DEPTH = 256
const MAX_TOKENS = 500000
const MAX_OUTPUT_LENGTH = 8 * 1024 * 1024
const ERROR_MESSAGES = {
  1: '存在不符合 JSON 规范的字符', 2: '数字格式不正确', 3: '对象键名必须是双引号字符串',
  4: '此处缺少有效值', 5: '键名后缺少冒号', 6: '相邻项目之间缺少逗号',
  7: '缺少右花括号 }', 8: '缺少右方括号 ]', 9: '根节点后还有多余内容',
  10: '标准 JSON 不允许注释', 11: '注释未闭合', 12: '字符串未闭合',
  13: '数字未完成', 14: 'Unicode 转义格式不正确', 15: '字符串转义不正确', 16: '字符串中含未转义的控制字符'
}

function jsonError(message, source = '', offset = 0) {
  const before = source.slice(0, offset)
  const line = before.split(/\r\n|\r|\n/).length
  const lastBreak = Math.max(before.lastIndexOf('\n'), before.lastIndexOf('\r'))
  const column = offset - lastBreak
  return Object.assign(new Error(`${message}（第 ${line} 行，第 ${column} 列）`), { offset, line, column })
}

function parseDocument(source) {
  if (typeof source !== 'string' || !source.trim()) throw new Error('请输入 JSON 内容')
  if (source.length > MAX_JSON_LENGTH) throw new Error('JSON 最多支持 2 Mi 字符，请拆分后处理')
  assertUnicode(source)
  // 在递归解析前限制嵌套层数，避免极深输入使解析器耗尽调用栈。
  const scanner = createScanner(source, true)
  let depth = 0
  let tokens = 0
  let token
  while ((token = scanner.scan()) !== SyntaxKind.EOF) {
    tokens += 1
    if (tokens > MAX_TOKENS) throw new Error('JSON 项目过多，最多支持 50 万个语法标记，请拆分后处理')
    if (token === SyntaxKind.OpenBraceToken || token === SyntaxKind.OpenBracketToken) {
      depth += 1
      if (depth > MAX_DEPTH) throw jsonError(`JSON 嵌套不能超过 ${MAX_DEPTH} 层`, source, scanner.getTokenOffset())
    } else if (token === SyntaxKind.CloseBraceToken || token === SyntaxKind.CloseBracketToken) depth -= 1
  }
  const errors = []
  const root = parseTree(source, errors, { disallowComments: true, allowTrailingComma: false, allowEmptyContent: false })
  if (errors.length) throw jsonError(ERROR_MESSAGES[errors[0].error] || 'JSON 无法解析', source, errors[0].offset)
  if (!root) throw new Error('请输入有效 JSON')
  return root
}

function assertUnicode(source) {
  for (let index = 0; index < source.length; index += 1) {
    const unit = source.charCodeAt(index)
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = source.charCodeAt(index + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw jsonError('存在不完整的 Unicode 字符，请保留其 \\uXXXX 转义形式', source, index)
      index += 1
    } else if (unit >= 0xdc00 && unit <= 0xdfff) throw jsonError('存在不完整的 Unicode 字符，请保留其 \\uXXXX 转义形式', source, index)
  }
}

function inspectTree(root) {
  const stats = { objects: 0, arrays: 0, properties: 0, strings: 0, numbers: 0, values: 0, depth: 0, duplicateKeys: 0 }
  const pending = [{ node: root, depth: 0 }]
  while (pending.length) {
    const { node, depth } = pending.pop()
    stats.depth = Math.max(stats.depth, depth)
    stats.values += 1
    if (node.type === 'object') {
      stats.objects += 1
      const names = new Set()
      for (const property of node.children || []) {
        const [key, value] = property.children
        stats.properties += 1
        if (names.has(key.value)) stats.duplicateKeys += 1
        names.add(key.value)
        pending.push({ node: value, depth: depth + 1 })
      }
    } else if (node.type === 'array') {
      stats.arrays += 1
      for (const child of node.children || []) pending.push({ node: child, depth: depth + 1 })
    } else if (node.type === 'string') stats.strings += 1
    else if (node.type === 'number') stats.numbers += 1
  }
  return stats
}

function renderNode(node, source, { sort = false, recursive = true, unicode = '' } = {}, depth = 0) {
  if (node.type === 'object') {
    const properties = [...(node.children || [])]
    if (sort && (recursive || depth === 0)) properties.sort((a, b) => a.children[0].value < b.children[0].value ? -1 : a.children[0].value > b.children[0].value ? 1 : 0)
    return `{${properties.map((property) => property.children.map((child) => renderNode(child, source, { sort, recursive, unicode }, depth + 1)).join(':')).join(',')}}`
  }
  if (node.type === 'array') return `[${(node.children || []).map((child) => renderNode(child, source, { sort, recursive, unicode }, depth + 1)).join(',')}]`
  // 数字使用原始 token，不经 Number/JSON.parse，保留长 ID、小数尾零、指数和负零。
  let literal = source.slice(node.offset, node.offset + node.length)
  if (node.type === 'string' && unicode === 'decode') literal = JSON.stringify(node.value)
  if (node.type === 'string' && unicode === 'encode') literal = literal.replace(/[^\x00-\x7f]/g, (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`)
  return literal
}

function resolvePointer(root, pointer, source) {
  let path = String(pointer || '')
  if (path.startsWith('#')) {
    try { path = decodeURIComponent(path.slice(1)) } catch { throw new Error('JSON Pointer 的 URL 转义无效') }
  }
  if (!path) return root
  if (!path.startsWith('/')) throw new Error('JSON Pointer 应以 / 开头，例如 /items/0；空路径表示根节点')
  let node = root
  for (const raw of path.slice(1).split('/')) {
    if (/~(?![01])/u.test(raw)) throw new Error('JSON Pointer 仅支持 ~0 和 ~1 转义')
    const key = raw.replace(/~1/g, '/').replace(/~0/g, '~')
    if (node.type === 'object') {
      const matching = (node.children || []).filter((property) => property.children[0].value === key)
      if (matching.length > 1) throw new Error(`路径中的键 ${JSON.stringify(key)} 重复，无法唯一定位`)
      node = matching[0]?.children[1]
    } else if (node.type === 'array' && /^(0|[1-9]\d*)$/u.test(key)) node = node.children?.[Number(key)]
    else node = undefined
    if (!node) throw new Error(`路径 ${JSON.stringify(path)} 不存在`)
  }
  return node
}

function assertFormattedSize(compact, indentWidth) {
  const scanner = createScanner(compact, true)
  let estimate = compact.length
  let depth = 0
  let token
  // 先估计换行缩进的额外体积，避免小而极深的输入展开为巨量空格后才检查。
  while ((token = scanner.scan()) !== SyntaxKind.EOF) {
    if (token === SyntaxKind.OpenBraceToken || token === SyntaxKind.OpenBracketToken) {
      depth += 1
      estimate += 1 + depth * indentWidth
    } else if (token === SyntaxKind.CloseBraceToken || token === SyntaxKind.CloseBracketToken) {
      depth -= 1
      estimate += 1 + depth * indentWidth
    } else if (token === SyntaxKind.CommaToken) estimate += 1 + depth * indentWidth
    else if (token === SyntaxKind.ColonToken) estimate += 1
    if (estimate > MAX_OUTPUT_LENGTH) throw new Error('格式化后的内容将超过 8 Mi 字符，请改用压缩或拆分输入')
  }
}

/**
 * 严格校验并处理 JSON，保留数值字面量与重复键，不执行任何输入代码。
 * @param {object} options 输入、操作、缩进、递归排序及 RFC 6901 Pointer。
 * @returns {{output: string, stats: object|null, message: string, language: string}} 可直接展示的结果。
 * 空输入、非法 JSON、无效路径、超出长度或深度限制时抛出可读错误；解析错误携带行列。
 */
export function processJson({ input, operation = 'format', indent = '2', recursive = true, pointer = '' }) {
  if (typeof input !== 'string') throw new Error('输入必须是文本')
  if (input.length > MAX_JSON_LENGTH) throw new Error('JSON 最多支持 2 Mi 字符，请拆分后处理')
  if (operation === 'escape') {
    const output = JSON.stringify(input)
    if (output.length > MAX_OUTPUT_LENGTH) throw new Error('转义结果超过 8 Mi 字符，请拆分输入')
    return { output, stats: null, message: '已转换为 JSON 字符串', language: 'json' }
  }
  const root = parseDocument(input)
  if (operation === 'unescape') {
    if (root.type !== 'string') throw new Error('去转义需要带外层双引号的 JSON 字符串')
    // 孤立代理项可保留在 JSON 转义中，但还原成纯文本后不能无损编码为 UTF-8。
    assertUnicode(root.value)
    return { output: root.value, stats: null, message: '已还原字符串内容', language: 'text' }
  }
  if (!['format', 'minify', 'validate', 'sort', 'unicode-encode', 'unicode-decode', 'extract'].includes(operation)) throw new Error('不支持的 JSON 操作')
  const selected = operation === 'extract' ? resolvePointer(root, pointer, input) : root
  const stats = inspectTree(selected)
  const compact = renderNode(selected, input, { sort: operation === 'sort', recursive, unicode: operation === 'unicode-encode' ? 'encode' : operation === 'unicode-decode' ? 'decode' : '' })
  const indentation = ['2', '4', 'tab'].includes(String(indent)) ? String(indent) : '2'
  if (!['minify', 'validate'].includes(operation)) assertFormattedSize(compact, indentation === 'tab' ? 1 : Number(indentation))
  const output = operation === 'minify' ? compact : operation === 'validate' ? input.trim() : applyEdits(compact, format(compact, undefined, {
    insertSpaces: indentation !== 'tab', tabSize: indentation === '4' ? 4 : 2, eol: '\n', insertFinalNewline: false
  }))
  const warning = stats.duplicateKeys ? `；含 ${stats.duplicateKeys} 个重复键，已保留原文，请检查键名` : ''
  return { output, stats, message: `校验通过，${stats.values} 个值、${stats.properties} 个属性${warning}`, language: 'json' }
}
