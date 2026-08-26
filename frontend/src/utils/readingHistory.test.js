import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearLocalReadingProgress,
  getReadingHistoryArticlePath,
  hasArticleChangedSinceReading
} from './readingHistory'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('reading history utilities', () => {
  it('builds resume and repeatable restart paths for encoded article slugs', () => {
    expect(getReadingHistoryArticlePath('Vue 3/移动端', { resume: true }))
      .toBe('/console/article-directory/articles/Vue%203%2F%E7%A7%BB%E5%8A%A8%E7%AB%AF?resume=1')
    expect(getReadingHistoryArticlePath('same-article', { restart: true, restartToken: 12345 }))
      .toBe('/console/article-directory/articles/same-article?restart=12345')
    expect(getReadingHistoryArticlePath('same-article', { restart: true, restartToken: 67890 }))
      .toBe('/console/article-directory/articles/same-article?restart=67890')
  })

  it('clears only the current user and article local progress key', () => {
    const removeItem = vi.fn()
    vi.stubGlobal('localStorage', { removeItem })

    clearLocalReadingProgress('article-1', 'user-1')

    expect(removeItem).toHaveBeenCalledOnce()
    expect(removeItem).toHaveBeenCalledWith('article-reading-progress:v1:user-1:article-1')
  })

  it('detects an article update after the recorded article version', () => {
    expect(hasArticleChangedSinceReading({
      articleUpdatedAt: '2026-08-25T10:00:00.000Z',
      article: { updatedAt: '2026-08-26T10:00:00.000Z' }
    })).toBe(true)
    expect(hasArticleChangedSinceReading({
      articleUpdatedAt: '2026-08-26T10:00:00.000Z',
      article: { updatedAt: '2026-08-26T10:00:00.000Z' }
    })).toBe(false)
  })
})
