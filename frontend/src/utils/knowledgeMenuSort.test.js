import { describe, expect, it } from 'vitest'
import { compareKnowledgeMenuArticles } from './knowledgeMenuSort'

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
})
