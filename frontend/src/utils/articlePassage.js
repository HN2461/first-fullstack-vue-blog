import { resolveReadingScrollTarget } from './readingProgress'

/** 根据一基原文行号选出最内层 Markdown 块；范围错误或原文已变化时允许退回普通阅读。 */
export function findSourceBlock(blocks, line) {
  if (!Number.isSafeInteger(line) || line < 1) return null
  let match = null
  let size = Infinity
  for (const block of blocks) {
    const start = Number(block.dataset.sourceStart)
    const end = Number(block.dataset.sourceEnd)
    if (line >= start && line <= end && end - start <= size) {
      match = block
      size = end - start
    }
  }
  return match
}

/** 定位搜索命中行或纠错章节，优先显示浏览者主动选择的位置。 */
export function revealArticlePassage(root, route) {
  if (!root || (!route.query.line && !route.hash)) return false
  const line = Number(route.query.line)
  const block = findSourceBlock(root.querySelectorAll('.markdown-body [data-source-start]'), line)
  const element = block || Array.from(root.querySelectorAll('.markdown-body [id]')).find((item) => '#' + item.id === route.hash)
  if (!element) return false
  const toggle = element.querySelector('.code-block__toggle')
  if (element.classList.contains('is-collapsed')) toggle?.click()
  // 长代码块的行号栏与正文逐行对齐，直接定位目标行；普通段落定位到对应块。
  element.scrollIntoView({ block: 'center', behavior: 'auto' })
  const gutter = element.querySelector('.code-block__gutter')
  if (gutter && block) {
    const offset = Math.max(0, line - Number(block.dataset.sourceStart) - 1)
    const lineHeight = parseFloat(getComputedStyle(gutter).lineHeight)
    if (Number.isFinite(lineHeight)) {
      const target = resolveReadingScrollTarget(element)
      const center = target === window ? window.innerHeight / 2 : target.getBoundingClientRect().top + target.clientHeight / 2
      target.scrollBy({ top: gutter.getBoundingClientRect().top + offset * lineHeight - center, behavior: 'auto' })
    }
  }
  return true
}
