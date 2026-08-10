const KNOWLEDGE_MENU_CACHE_KEY = 'blog-knowledge-menu-cache-v2'
const KNOWLEDGE_MENU_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

export const KNOWLEDGE_MENU_CACHE_TTL = 60 * 1000

function createEmptyCache() {
  return {
    categories: [],
    articles: [],
    total: 0,
    loadedAt: 0
  }
}

export function isCompleteKnowledgeMenuSnapshot(value) {
  if (!value || !Array.isArray(value.categories) || !Array.isArray(value.articles)) {
    return false
  }

  const total = Number(value.total)
  if (!Number.isInteger(total) || total < 0 || total !== value.articles.length) {
    return false
  }

  return value.articles.every((article) => (
    Number.isFinite(Number(article?.sortOrder)) &&
    Object.prototype.hasOwnProperty.call(article, 'publishedAt') &&
    Object.prototype.hasOwnProperty.call(article, 'createdAt')
  ))
}

function normalizeCache(value) {
  if (!isCompleteKnowledgeMenuSnapshot(value)) {
    return createEmptyCache()
  }

  const loadedAt = Number(value.loadedAt) || 0
  if (!loadedAt || Date.now() - loadedAt > KNOWLEDGE_MENU_CACHE_MAX_AGE) {
    return createEmptyCache()
  }

  return {
    categories: value.categories,
    articles: value.articles,
    total: Number(value.total),
    loadedAt
  }
}

export function readKnowledgeMenuCache(storage = globalThis.localStorage) {
  try {
    return normalizeCache(JSON.parse(storage?.getItem(KNOWLEDGE_MENU_CACHE_KEY) || 'null'))
  } catch {
    return createEmptyCache()
  }
}

export function writeKnowledgeMenuCache(value, storage = globalThis.localStorage) {
  const cache = normalizeCache(value)

  try {
    storage?.setItem(KNOWLEDGE_MENU_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // 本地缓存失败时仍使用当前接口数据，不阻断知识库菜单渲染。
  }

  return cache
}

export function isKnowledgeMenuCacheFresh(cache, now = Date.now()) {
  return cache.loadedAt > 0 && now - cache.loadedAt < KNOWLEDGE_MENU_CACHE_TTL
}
