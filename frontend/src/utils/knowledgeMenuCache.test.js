import { describe, expect, it } from 'vitest'
import {
  KNOWLEDGE_MENU_CACHE_TTL,
  isKnowledgeMenuCacheFresh,
  readKnowledgeMenuCache,
  writeKnowledgeMenuCache
} from './knowledgeMenuCache'

function createStorage(initialValue = null) {
  let value = initialValue

  return {
    getItem: () => value,
    setItem: (key, nextValue) => {
      value = nextValue
    }
  }
}

describe('knowledgeMenuCache', () => {
  it('persists a lightweight directory snapshot across page reloads', () => {
    const storage = createStorage()
    const snapshot = {
      categories: [{ id: 'category-1', name: 'Vue' }],
      articles: [{ id: 'article-1', title: '响应式原理', slug: 'vue-reactivity' }],
      loadedAt: Date.now()
    }

    writeKnowledgeMenuCache(snapshot, storage)

    expect(readKnowledgeMenuCache(storage)).toEqual(snapshot)
  })

  it('keeps stale data readable while marking it for background refresh', () => {
    const now = Date.now()
    const cache = {
      categories: [{ id: 'category-1' }],
      articles: [],
      loadedAt: now - KNOWLEDGE_MENU_CACHE_TTL - 1
    }
    const storage = createStorage(JSON.stringify(cache))

    expect(readKnowledgeMenuCache(storage).categories).toHaveLength(1)
    expect(isKnowledgeMenuCacheFresh(cache, now)).toBe(false)
  })

  it('ignores malformed cache content', () => {
    const storage = createStorage('{invalid-json')

    expect(readKnowledgeMenuCache(storage)).toEqual({
      categories: [],
      articles: [],
      loadedAt: 0
    })
  })
})
