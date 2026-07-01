const MAX_IMPORT_BOOKMARKS = 10000

function decodeHtml(value = '') {
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function stripTags(value = '') {
  return decodeHtml(String(value).replace(/<[^>]*>/g, '')).trim()
}

function parseAttributes(tag = '') {
  const attrs = {}
  const attrRegex = /([A-Za-z_:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g
  let match

  while ((match = attrRegex.exec(tag))) {
    attrs[match[1].toUpperCase()] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? '')
  }

  return attrs
}

function parseUnixDate(value) {
  const num = Number(value)
  if (!Number.isFinite(num) || num <= 0) return null
  const date = new Date(num * 1000)
  return Number.isNaN(date.getTime()) ? null : date
}

function createNode(type, input = {}) {
  return {
    type,
    title: input.title || '',
    url: input.url || '',
    addDate: input.addDate || null,
    icon: input.icon || '',
    children: []
  }
}

export function parseBookmarksHtml(html = '') {
  const root = createNode('folder', { title: 'root' })
  const stack = [root]
  const tokenRegex = /<DT>\s*<H3\b[^>]*>[\s\S]*?<\/H3>|<DT>\s*<A\b[^>]*>[\s\S]*?<\/A>|<DL\b[^>]*>|<\/DL>/gi
  let pendingFolder = null
  let rootDlSeen = false
  let count = 0
  let match

  while ((match = tokenRegex.exec(html))) {
    const token = match[0]

    if (/^<DL/i.test(token)) {
      if (pendingFolder) {
        stack.push(pendingFolder)
        pendingFolder = null
      } else {
        rootDlSeen = true
      }
      continue
    }

    if (/^<\/DL>/i.test(token)) {
      if (stack.length > 1) stack.pop()
      pendingFolder = null
      continue
    }

    if (/^<DT>\s*<H3/i.test(token)) {
      const openTag = token.match(/<H3\b[^>]*>/i)?.[0] || ''
      const content = token.replace(/^<DT>\s*<H3\b[^>]*>/i, '').replace(/<\/H3>$/i, '')
      const attrs = parseAttributes(openTag)
      const folder = createNode('folder', {
        title: stripTags(content) || '未命名文件夹',
        addDate: parseUnixDate(attrs.ADD_DATE)
      })
      stack[stack.length - 1].children.push(folder)
      pendingFolder = folder
      continue
    }

    if (/^<DT>\s*<A/i.test(token)) {
      const openTag = token.match(/<A\b[^>]*>/i)?.[0] || ''
      const content = token.replace(/^<DT>\s*<A\b[^>]*>/i, '').replace(/<\/A>$/i, '')
      const attrs = parseAttributes(openTag)
      const url = String(attrs.HREF || '').trim()
      if (!url) continue
      count += 1
      if (count > MAX_IMPORT_BOOKMARKS) {
        const error = new Error(`单次最多导入 ${MAX_IMPORT_BOOKMARKS} 条书签`)
        error.statusCode = 400
        error.code = 'BOOKMARK_IMPORT_TOO_LARGE'
        throw error
      }
      stack[stack.length - 1].children.push(createNode('bookmark', {
        title: stripTags(content) || url,
        url,
        addDate: parseUnixDate(attrs.ADD_DATE),
        icon: attrs.ICON || ''
      }))
    }
  }

  if (!rootDlSeen && root.children.length === 0) {
    const error = new Error('未识别到浏览器书签 HTML 内容')
    error.statusCode = 400
    error.code = 'BOOKMARK_HTML_EMPTY'
    throw error
  }

  return root
}

function toUnixSeconds(value) {
  const date = value ? new Date(value) : new Date()
  return Math.floor(date.getTime() / 1000)
}

function appendNode(lines, node, level) {
  const indent = '    '.repeat(level)

  if (node.type === 'folder') {
    lines.push(`${indent}<DT><H3 ADD_DATE="${toUnixSeconds(node.createdAt)}" LAST_MODIFIED="${toUnixSeconds(node.updatedAt)}">${escapeHtml(node.name || node.title)}</H3>`)
    lines.push(`${indent}<DL><p>`)
    for (const child of node.children || []) appendNode(lines, child, level + 1)
    lines.push(`${indent}</DL><p>`)
    return
  }

  const attrs = [
    `HREF="${escapeHtml(node.url)}"`,
    `ADD_DATE="${toUnixSeconds(node.addDate || node.createdAt)}"`
  ]
  if (node.icon) attrs.push(`ICON="${escapeHtml(node.icon)}"`)
  lines.push(`${indent}<DT><A ${attrs.join(' ')}>${escapeHtml(node.title || node.url)}</A>`)
}

export function buildBookmarksHtml(tree = []) {
  const lines = [
    '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    '<TITLE>Bookmarks</TITLE>',
    '<H1>Bookmarks</H1>',
    '<DL><p>'
  ]

  for (const node of tree) appendNode(lines, node, 1)
  lines.push('</DL><p>')

  return `${lines.join('\n')}\n`
}
