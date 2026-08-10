import { describe, expect, it } from 'vitest'
import {
  KNOWLEDGE_MENU_CACHE_TTL,
  isCompleteKnowledgeMenuSnapshot,
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
      articles: [{
        id: 'article-1',
        title: '响应式原理',
        slug: 'vue-reactivity',
        sortOrder: 10,
        publishedAt: '2026-08-10T08:00:00.000Z',
        createdAt: '2026-08-09T08:00:00.000Z'
      }],
      total: 1,
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
      total: 0,
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
      total: 0,
      loadedAt: 0
    })
  })

  it('rejects truncated or legacy snapshots without complete sort metadata', () => {
    expect(isCompleteKnowledgeMenuSnapshot({
      categories: [],
      articles: [{ id: 'article-1', title: '第 1 篇' }],
      total: 2
    })).toBe(false)

    expect(isCompleteKnowledgeMenuSnapshot({
      categories: [],
      articles: [{ id: 'article-1', title: '第 1 篇', sortOrder: 10 }],
      total: 1
    })).toBe(false)
  })
})
