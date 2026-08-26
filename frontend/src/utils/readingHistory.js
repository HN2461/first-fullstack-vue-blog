import { getReadingProgressStorageKey } from './readingProgress'

export function getReadingHistoryArticlePath(slug, {
  resume = false,
  restart = false,
  restartToken = ''
} = {}) {
  const path = `/console/article-directory/articles/${encodeURIComponent(slug)}`
  if (resume) return `${path}?resume=1`
  if (restart) {
    const token = restartToken || Date.now()
    return `${path}?restart=${encodeURIComponent(token)}`
  }
  return path
}

export function clearLocalReadingProgress(articleId, userId) {
  if (!articleId || !userId) return
  try {
    localStorage.removeItem(getReadingProgressStorageKey(articleId, userId))
  } catch {
    // 浏览器禁用本地存储时，服务端记录仍可正常清除。
  }
}

export function formatReadingHistoryTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const diff = Date.now() - date.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function hasArticleChangedSinceReading(item) {
  const articleUpdatedAt = new Date(item?.article?.updatedAt || 0).getTime()
  const progressArticleUpdatedAt = new Date(item?.articleUpdatedAt || 0).getTime()
  return articleUpdatedAt > progressArticleUpdatedAt
}
