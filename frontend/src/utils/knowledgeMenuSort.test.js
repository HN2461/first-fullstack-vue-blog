import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
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

  it('keeps every console directory branch on the shared comparator', () => {
    const consoleLayoutPath = fileURLToPath(new URL('../views/console/ConsoleLayout/index.vue', import.meta.url))
    const consoleLayoutSource = readFileSync(consoleLayoutPath, 'utf8')

    expect(consoleLayoutSource).not.toContain('compareDirectoryArticles')
    expect(consoleLayoutSource.match(/compareKnowledgeMenuArticles/g)).toHaveLength(3)
  })
})
