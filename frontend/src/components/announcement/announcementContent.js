const LIST_ITEM_PATTERN = /^(\d+[.、]|[-*])\s+(.+)$/
const HEADING_PATTERN = /^(#{1,3})\s+(.+)$/

function normalizeLine(line) {
  return String(line || '').trim()
}

function isSectionHeading(line) {
  const text = normalizeLine(line)
  return text.length > 0 && text.length <= 36 && /[：:]$/.test(text)
}

function pushParagraph(blocks, lines) {
  const content = lines.map(normalizeLine).filter(Boolean).join(' ')
  if (content) blocks.push({ type: 'paragraph', content })
}

function pushList(blocks, items) {
  if (items.length) blocks.push({ type: 'list', items: [...items] })
}

export function parseAnnouncementContent(content) {
  const lines = String(content || '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let paragraphLines = []
  let listItems = []

  const flushParagraph = () => {
    pushParagraph(blocks, paragraphLines)
    paragraphLines = []
  }
  const flushList = () => {
    pushList(blocks, listItems)
    listItems = []
  }

  lines.forEach((rawLine) => {
    const line = normalizeLine(rawLine)
    if (!line) {
      flushParagraph()
      flushList()
      return
    }

    const markdownHeading = line.match(HEADING_PATTERN)
    if (markdownHeading) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'heading', content: markdownHeading[2].trim().replace(/[：:]$/, '') })
      return
    }

    if (isSectionHeading(line)) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'heading', content: line.replace(/[：:]$/, '') })
      return
    }

    const listItem = line.match(LIST_ITEM_PATTERN)
    if (listItem) {
      flushParagraph()
      listItems.push(listItem[2].trim())
      return
    }

    flushList()
    paragraphLines.push(line)
  })

  flushParagraph()
  flushList()
  return blocks
}
