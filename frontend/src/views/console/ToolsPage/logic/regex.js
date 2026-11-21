export const MAX_REGEX_MATCHES = 200
export const MAX_REGEX_TEXT_LENGTH = 200000
export const MAX_REGEX_PATTERN_LENGTH = 10000

/**
 * 检查 JavaScript 正则参数及资源边界，不在主线程执行用户表达式。
 * @param {string} pattern 表达式正文，空表达式合法，可用于测试空匹配。
 * @param {string} flags 不重复的 d/g/i/m/s/u/v/y 标志，u 与 v 不得并用。
 * @param {string} text 测试文本，允许空串。
 * @returns {void} 合法时无返回；类型、长度、标志重复/未知/不受支持时抛可读错误。
 */
export function validateRegexInput(pattern, flags, text) {
  if ([pattern, flags, text].some((value) => typeof value !== 'string')) throw new Error('表达式、标志和测试文本必须是字符串')
  if (pattern.length > MAX_REGEX_PATTERN_LENGTH) throw new Error(`表达式最多 ${MAX_REGEX_PATTERN_LENGTH} 个 UTF-16 单元`)
  if (text.length > MAX_REGEX_TEXT_LENGTH) throw new Error(`测试文本最多 ${MAX_REGEX_TEXT_LENGTH} 个 UTF-16 单元`)
  if (/[^dgimsuvy]/.test(flags)) throw new Error('仅支持 d、g、i、m、s、u、v、y 标志，请勿输入空格或斜杠')
  if (new Set(flags).size !== flags.length) throw new Error('正则标志不能重复')
  if (flags.includes('u') && flags.includes('v')) throw new Error('u 和 v 标志不能同时使用')
  try { new RegExp('', flags) } catch { throw new Error('当前浏览器不支持所选正则标志') }
}

/**
 * 执行有匹配数量上限的 JavaScript 正则，仅允许放在可终止的 Worker 内运行。
 * @param {object} input pattern/flags/text 均为字符串，flags 不包含 g 时只取首次匹配。
 * @returns {{matches: Array<object>, truncated: boolean}} 最多 200 条匹配及是否仍有后续结果。
 * 匹配位置采用 JavaScript UTF-16 索引；空匹配按 Unicode 标志推进，非法表达式抛错。
 */
export function executeRegex({ pattern, flags, text }) {
  validateRegexInput(pattern, flags, text)
  let expression
  try { expression = new RegExp(pattern, flags) } catch (cause) { throw new Error(`正则表达式无效：${cause.message}`) }
  const matches = []
  let truncated = false
  for (;;) {
    const item = expression.exec(text)
    if (!item) break
    if (matches.length === MAX_REGEX_MATCHES) { truncated = true; break }
    matches.push({ value: item[0], index: item.index, groups: item.slice(1), namedGroups: item.groups || null })
    if (!expression.global) break
    if (item[0] === '') {
      // exec 不会自动推进空匹配；Unicode 模式必须跨过完整代理对，避免重复或无限匹配。
      const codePoint = text.codePointAt(expression.lastIndex)
      expression.lastIndex += (expression.unicode || expression.unicodeSets) && codePoint > 0xffff ? 2 : 1
    }
  }
  return { matches, truncated }
}
