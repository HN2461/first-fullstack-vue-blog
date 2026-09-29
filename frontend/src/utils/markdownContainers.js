const CONTAINER_TYPES = new Set([
  'caution',
  'danger',
  'details',
  'important',
  'info',
  'note',
  'tip',
  'tips',
  'warning',
  ...Array.from({ length: 9 }, (_, index) => `color${index + 1}`)
])

function getLineText(state, line) {
  const start = state.bMarks[line] + state.tShift[line]
  const end = state.eMarks[line]
  return state.src.slice(start, end)
}

function getFenceMarker(line) {
  const match = line.match(/^(`{3,}|~{3,})/)
  return match ? { character: match[1][0], length: match[1].length } : null
}

function isFenceClose(line, marker) {
  if (!marker) return false
  const match = line.match(/^(`+|~+)(.*)$/)
  return Boolean(
    match &&
    match[1][0] === marker.character &&
    match[1].length >= marker.length &&
    !match[2].trim()
  )
}

function parseContainer(state, startLine, endLine, silent) {
  if (state.sCount[startLine] - state.blkIndent >= 4) return false

  const openingLine = getLineText(state, startLine)
  const opening = openingLine.match(/^:::(\S+)(?:[ \t]+(.+?))?[ \t]*$/)
  const type = opening?.[1]?.toLowerCase()
  if (!type || !CONTAINER_TYPES.has(type)) return false

  let nesting = 1
  let closingLine = -1
  let fenceMarker = null

  for (let line = startLine + 1; line < endLine; line += 1) {
    const text = getLineText(state, line)
    const fence = getFenceMarker(text)

    if (fenceMarker) {
      if (isFenceClose(text, fenceMarker)) fenceMarker = null
      continue
    }

    if (fence) {
      fenceMarker = fence
      continue
    }

    const nestedOpening = text.match(/^:::(\S+)(?:[ \t]+.+?)?[ \t]*$/)
    if (nestedOpening && CONTAINER_TYPES.has(nestedOpening[1].toLowerCase())) {
      nesting += 1
      continue
    }

    if (!/^:::[ \t]*$/.test(text)) continue
    nesting -= 1
    if (nesting === 0) {
      closingLine = line
      break
    }
  }

  if (closingLine < 0) return false
  if (silent) return true

  const token = state.push('markdown_container_open', 'div', 1)
  token.block = true
  token.map = [startLine, closingLine + 1]
  token.markup = ':::'
  token.attrSet('class', `markdown-container markdown-container--${type}`)

  const title = opening[2]?.trim()
  if (title) {
    const titleOpen = state.push('paragraph_open', 'p', 1)
    titleOpen.block = true
    titleOpen.map = [startLine, startLine + 1]
    titleOpen.attrSet('class', 'markdown-container__title')

    const inline = state.push('inline', '', 0)
    inline.content = title
    inline.map = [startLine, startLine + 1]
    inline.children = []

    const titleClose = state.push('paragraph_close', 'p', -1)
    titleClose.block = true
  }

  const previousParentType = state.parentType
  state.parentType = 'container'
  state.md.block.tokenize(state, startLine + 1, closingLine)
  state.parentType = previousParentType

  const closeToken = state.push('markdown_container_close', 'div', -1)
  closeToken.block = true
  closeToken.markup = ':::'
  state.line = closingLine + 1
  return true
}

export default function markdownContainers(md) {
  md.block.ruler.before('fence', 'markdown_container', parseContainer, {
    alt: ['paragraph', 'reference', 'blockquote', 'list']
  })
}
