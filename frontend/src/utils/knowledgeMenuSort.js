function toTimestamp(value) {
  const timestamp = new Date(value || 0).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

export function compareKnowledgeMenuArticles(left, right) {
  const sortDiff = Number(left?.sortOrder || 0) - Number(right?.sortOrder || 0)
  if (sortDiff) return sortDiff

  const timeDiff = toTimestamp(right?.publishedAt || right?.createdAt) -
    toTimestamp(left?.publishedAt || left?.createdAt)
  if (timeDiff) return timeDiff

  return String(left?.title || '').localeCompare(String(right?.title || ''), 'zh-Hans-CN', {
    numeric: true
  })
}
