import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  compareKnowledgeMenuArticles,
  isUncategorizedKnowledgeArticle
} from './knowledgeMenuSort'

describe('compareKnowledgeMenuArticles', () => {
  it('sorts articles by the directory sort order returned by the API', () => {
    const articles = [
      { title: '第 10 篇', sortOrder: 100 },
      { title: '第 2 篇', sortOrder: 20 },
      { title: '第 1 篇', sortOrder: 10 }
    ]

    expect(articles.sort(compareKnowledgeMenuArticles).map((item) => item.title)).toEqual([
      '第 1 篇',
      '第 2 篇',
      '第 10 篇'
    ])
  })

  it('uses numeric title ordering as the final fallback', () => {
    const articles = [
      { title: '第 10 篇' },
      { title: '第 2 篇' },
      { title: '第 1 篇' }
    ]

    expect(articles.sort(compareKnowledgeMenuArticles).map((item) => item.title)).toEqual([
      '第 1 篇',
      '第 2 篇',
      '第 10 篇'
    ])
  })

  it('keeps every console directory branch on the shared comparator', () => {
    const consoleLayoutPath = fileURLToPath(new URL('../views/console/ConsoleLayout/index.vue', import.meta.url))
    const consoleLayoutSource = readFileSync(consoleLayoutPath, 'utf8')

    expect(consoleLayoutSource).not.toContain('compareDirectoryArticles')
    expect(consoleLayoutSource.match(/compareKnowledgeMenuArticles/g)).toHaveLength(3)
  })

  it('keeps articles visible when their category is not part of the active directory tree', () => {
    const categoryIds = new Set(['active-category'])

    expect(isUncategorizedKnowledgeArticle({ category: null }, categoryIds)).toBe(true)
    expect(isUncategorizedKnowledgeArticle({
      category: { id: 'system-category', slug: 'uncategorized', isSystem: true }
    }, categoryIds)).toBe(true)
    expect(isUncategorizedKnowledgeArticle({
      category: { id: 'inactive-category', slug: 'archived' }
    }, categoryIds)).toBe(true)
    expect(isUncategorizedKnowledgeArticle({
      category: { id: 'active-category', slug: 'active' }
    }, categoryIds)).toBe(false)
  })
})
