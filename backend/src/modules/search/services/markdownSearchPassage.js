// 保留代码里的下划线、连字符和运算符，命中行号沿用 Markdown 原文，供阅读器定位。
export function readSearchPassages(markdown) {
  const passages = []
  let section = ''
  let fence = ''
  String(markdown || '').split(/\r?\n/).forEach((line, index) => {
    const marker = /^\s*(\x60{3,}|~{3,})(.*)$/.exec(line)
    if (marker && (!fence || (marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()))) {
      fence = fence ? '' : marker[1]
      return
    }
    const heading = !fence && /^ {0,3}#{1,6}\s+(.+?)\s*#*\s*$/.exec(line)
    // 旧语雀文章的标题带字体和颜色标签，章节标签沿用阅读器可见文字。
    const source = heading ? heading[1].replace(/<\/?(?:font|span|strong|em|u|b|i)(?:\s[^>]*)?>/gi, '') : line
    const text = fence ? line.trim() : source
      .replace(/!?\[([^\]]*)\]\([^)]+\)/g, '$1')
      .replace(/(\x60+)(.+?)\1/g, '$2')
      .replace(/(\*\*|__)(.+?)\1/g, '$2')
      .trim()
    if (heading) section = text
    if (text) passages.push({ text, line: index + 1, section })
  })
  return passages
}

/** 选出覆盖最多查询词的原文行。无正文命中时返回 null，交由标题或摘要展示。 */
export function bestSearchPassage(passages, terms) {
  let best = null
  let bestScore = 0
  const needles = terms.map((term) => term.toLowerCase())
  for (const passage of passages) {
    const text = passage.text.toLowerCase()
    const score = needles.reduce((count, needle) => count + Number(text.includes(needle)), 0)
    if (score > bestScore) {
      best = passage
      bestScore = score
      if (score === needles.length) break
    }
  }
  return best
}
