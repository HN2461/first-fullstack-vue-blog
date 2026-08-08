export const READING_PROGRESS_STORAGE_PREFIX = 'article-reading-progress:v1:'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0))
}

export function buildReadingSnapshot({
  scrollTop = 0,
  scrollHeight = 0,
  viewportHeight = 0,
  headings = []
}) {
  const maxScroll = Math.max(0, scrollHeight - viewportHeight)
  const safeScrollTop = clamp(scrollTop, 0, maxScroll)
  const scrollRatio = maxScroll > 0 ? safeScrollTop / maxScroll : 0
  const currentHeading = headings
    .filter((item) => Number.isFinite(item.offsetTop) && item.offsetTop <= safeScrollTop + 80)
    .sort((left, right) => left.offsetTop - right.offsetTop)
    .at(-1)

  return {
    progressPercent: Math.round(scrollRatio * 10000) / 100,
    scrollRatio: Math.round(scrollRatio * 10000) / 10000,
    anchorSlug: currentHeading?.slug || '',
    anchorOffset: currentHeading
      ? Math.max(0, Math.round(safeScrollTop - currentHeading.offsetTop))
      : 0
  }
}

export function shouldSaveReadingProgress(current, previous, now, interval = 4000) {
  if (!current || !previous) return true
  if (now - (previous.savedAt || 0) < interval) return false

  const percentChanged = Math.abs(current.progressPercent - previous.progressPercent) >= 1
  const anchorChanged = current.anchorSlug !== previous.anchorSlug
  return percentChanged || anchorChanged
}

export function getReadingProgressStorageKey(articleId, userId = 'anonymous') {
  return `${READING_PROGRESS_STORAGE_PREFIX}${userId}:${articleId}`
}

export function resolveReadingScrollTarget(element) {
  let current = element?.parentElement

  while (current && current !== document.body) {
    const overflowY = window.getComputedStyle(current).overflowY
    if (['auto', 'scroll', 'overlay'].includes(overflowY) && current.scrollHeight > current.clientHeight + 1) {
      return current
    }
    current = current.parentElement
  }

  return window
}

export function captureReadingMetrics(target) {
  const isWindow = target === window
  const scrollTop = isWindow ? window.scrollY : target.scrollTop
  const viewportHeight = isWindow ? window.innerHeight : target.clientHeight
  const scrollHeight = isWindow
    ? Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
    : target.scrollHeight
  const root = isWindow ? document : target
  const containerRect = isWindow ? { top: 0 } : target.getBoundingClientRect()
  const headings = Array.from(root.querySelectorAll(
    '.markdown-body h1[id], .markdown-body h2[id], .markdown-body h3[id], .markdown-body h4[id]'
  )).map((heading) => ({
    slug: heading.id,
    offsetTop: (isWindow ? window.scrollY : target.scrollTop) +
      heading.getBoundingClientRect().top - containerRect.top
  }))

  return { scrollTop, scrollHeight, viewportHeight, headings }
}

export function resolveReadingRestoreOffset({
  progress,
  maxScroll,
  anchorOffsetTop = null,
  articleMatches = false
}) {
  if (articleMatches && Number.isFinite(anchorOffsetTop)) {
    return Math.max(0, anchorOffsetTop + Number(progress.anchorOffset || 0))
  }
  return Math.max(0, Number(progress.scrollRatio || 0) * maxScroll)
}

export function restoreReadingPosition(target, progress) {
  const isWindow = target === window
  const root = isWindow ? document : target
  const anchor = progress.anchorSlug
    ? Array.from(root.querySelectorAll('[id]')).find((item) => item.id === progress.anchorSlug)
    : null
  const scrollHeight = isWindow
    ? Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
    : target.scrollHeight
  const viewportHeight = isWindow ? window.innerHeight : target.clientHeight
  const currentScrollTop = isWindow ? window.scrollY : target.scrollTop
  const containerRect = isWindow ? { top: 0 } : target.getBoundingClientRect()
  const anchorOffsetTop = anchor
    ? currentScrollTop + anchor.getBoundingClientRect().top - containerRect.top
    : null
  const top = resolveReadingRestoreOffset({
    progress,
    maxScroll: Math.max(0, scrollHeight - viewportHeight),
    anchorOffsetTop,
    articleMatches: Boolean(anchor) && progress.articleUpdatedAt === progress.currentArticleUpdatedAt
  })

  if (isWindow) {
    window.scrollTo({ top, behavior: 'auto' })
    return
  }
  target.scrollTo({ top, behavior: 'auto' })
}
