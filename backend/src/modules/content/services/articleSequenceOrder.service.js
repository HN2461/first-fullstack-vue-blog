const CHINESE_DIGITS = Object.freeze({
  '零': 0,
  '〇': 0,
  '一': 1,
  '二': 2,
  '两': 2,
  '三': 3,
  '四': 4,
  '五': 5,
  '六': 6,
  '七': 7,
  '八': 8,
  '九': 9
})

function parseChineseNumber(value) {
  const text = String(value || '').trim()
  if (!text) return null
  if (/^\d+$/.test(text)) return Number(text)

  let total = 0
  let current = 0
  for (const character of text) {
    if (character === '十' || character === '百') {
      const unit = character === '十' ? 10 : 100
      total += (current || 1) * unit
      current = 0
      continue
    }
    if (CHINESE_DIGITS[character] === undefined) return null
    current = current * 10 + CHINESE_DIGITS[character]
  }
  return total + current
}

export function extractArticleSequence(title) {
  const text = String(title || '').trim()
  if (/(总目录|知识库总导航|学习导航|阅读导航)/.test(text)) return -1
  const patterns = [
    /第\s*([\d零〇一二两三四五六七八九十百]+)\s*[篇章节讲课]/,
    /^(?:附录|阶段)\s*([\d零〇一二两三四五六七八九十百]+)/,
    /(?:^|\s)(\d{2})\s*[：:]/,
    /^\.?(\d+)(?:\s*[-_、.：:]|\s+)/
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    const value = parseChineseNumber(match?.[1])
    if (Number.isInteger(value) && value >= 0) return value
  }
  return null
}

function compareCurrentDirectoryOrder(left, right) {
  const sortDiff = Number(left.sortOrder || 0) - Number(right.sortOrder || 0)
  if (sortDiff) return sortDiff

  const leftTime = new Date(left.publishedAt || left.createdAt || 0).getTime()
  const rightTime = new Date(right.publishedAt || right.createdAt || 0).getTime()
  if (rightTime !== leftTime) return rightTime - leftTime

  return String(left.originalId || left._id || '').localeCompare(String(right.originalId || right._id || ''))
}

function groupByCategory(records) {
  const groups = new Map()
  records.forEach((record) => {
    const key = (record.categoryPath || []).join('/')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(record)
  })
  return groups
}

/**
 * 规范快照内的分类文章顺序。
 * 有两篇以上文章带明确章节号时按章节升序，无编号文章稳定放在其后；
 * 其他分类完全保留当前线上顺序，只将 sortOrder 收敛为 10 的倍数。
 */
export function buildNormalizedArticleOrder(records = []) {
  const sortOrderById = new Map()
  const categoryPlans = []

  for (const [categoryPath, items] of groupByCategory(records)) {
    const current = [...items].sort(compareCurrentDirectoryOrder)
    const currentIndex = new Map(current.map((item, index) => [String(item.originalId || item._id), index]))
    const sequences = new Map(current.map((item) => [
      String(item.originalId || item._id),
      extractArticleSequence(item.title)
    ]))
    const numberedCount = [...sequences.values()].filter((value) => value !== null).length
    const sequenceCounts = new Map()
    sequences.forEach((value) => {
      if (value === null) return
      sequenceCounts.set(value, (sequenceCounts.get(value) || 0) + 1)
    })
    const duplicateSequenceCount = [...sequenceCounts.values()].filter((count) => count > 1).length
    // 同一分类出现多组重复章节号时，通常是多套旧教程混放，不做猜测性穿插重排。
    const useSequence = numberedCount >= 2 && duplicateSequenceCount <= 1
    const ordered = useSequence
      ? [...current].sort((left, right) => {
          const leftId = String(left.originalId || left._id)
          const rightId = String(right.originalId || right._id)
          const leftSequence = sequences.get(leftId)
          const rightSequence = sequences.get(rightId)
          if (leftSequence !== null && rightSequence !== null) {
            return leftSequence - rightSequence || currentIndex.get(leftId) - currentIndex.get(rightId)
          }
          if (leftSequence !== null) return -1
          if (rightSequence !== null) return 1
          return currentIndex.get(leftId) - currentIndex.get(rightId)
        })
      : current

    let reorderedCount = 0
    let changedCount = 0
    ordered.forEach((item, index) => {
      const id = String(item.originalId || item._id)
      const nextSortOrder = (index + 1) * 10
      sortOrderById.set(id, nextSortOrder)
      if (currentIndex.get(id) !== index) reorderedCount += 1
      if (Number(item.sortOrder || 0) !== nextSortOrder) changedCount += 1
    })
    categoryPlans.push({
      categoryPath,
      total: ordered.length,
      numberedCount,
      duplicateSequenceCount,
      useSequence,
      reorderedCount,
      changedCount,
      articleIds: ordered.map((item) => String(item.originalId || item._id))
    })
  }

  return { sortOrderById, categoryPlans }
}

export function buildNormalizedCategoryOrder(categories = []) {
  const groups = new Map()
  categories.forEach((category) => {
    const categoryPath = category.categoryPath || []
    const parentPath = categoryPath.slice(0, -1).join('/')
    if (!groups.has(parentPath)) groups.set(parentPath, [])
    groups.get(parentPath).push(category)
  })

  const sortOrderByPath = new Map()
  const groupPlans = []
  for (const [parentPath, items] of groups) {
    const ordered = [...items].sort((left, right) => {
      if (Boolean(left.isSystem) !== Boolean(right.isSystem)) return left.isSystem ? -1 : 1
      const sortDiff = Number(left.sortOrder || 0) - Number(right.sortOrder || 0)
      if (sortDiff) return sortDiff
      return String(left.name || '').localeCompare(String(right.name || ''), 'zh-Hans-CN')
    })
    let regularIndex = 0
    let changedCount = 0
    ordered.forEach((category) => {
      const key = (category.categoryPath || []).join('/')
      const nextSortOrder = category.isSystem ? -9999 : (++regularIndex * 10)
      sortOrderByPath.set(key, nextSortOrder)
      if (Number(category.sortOrder || 0) !== nextSortOrder) changedCount += 1
    })
    groupPlans.push({ parentPath, total: ordered.length, changedCount })
  }
  return { sortOrderByPath, groupPlans }
}
