import { describe, expect, it } from 'vitest'
import {
  buildReadingSnapshot,
  getReadingProgressStorageKey,
  resolveReadingRestoreOffset,
  shouldSaveReadingProgress
} from './readingProgress'

describe('reading progress utilities', () => {
  it('builds a percentage and the nearest heading anchor', () => {
    expect(buildReadingSnapshot({
      scrollTop: 400,
      scrollHeight: 1000,
      viewportHeight: 200,
      headings: [
        { slug: 'first', offsetTop: 0 },
        { slug: 'second', offsetTop: 300 },
        { slug: 'third', offsetTop: 700 }
      ]
    })).toEqual({
      progressPercent: 50,
      scrollRatio: 0.5,
      anchorSlug: 'second',
      anchorOffset: 100
    })
  })

  it('clamps scroll positions to valid progress boundaries', () => {
    expect(buildReadingSnapshot({ scrollTop: -20, scrollHeight: 1000, viewportHeight: 200 }).progressPercent).toBe(0)
    expect(buildReadingSnapshot({ scrollTop: 1200, scrollHeight: 1000, viewportHeight: 200 }).progressPercent).toBe(100)
  })

  it('waits for the save interval and a meaningful change', () => {
    const previous = { progressPercent: 20, anchorSlug: 'intro', savedAt: 1000 }
    expect(shouldSaveReadingProgress({ progressPercent: 30, anchorSlug: 'next' }, previous, 3000)).toBe(false)
    expect(shouldSaveReadingProgress({ progressPercent: 20.9, anchorSlug: 'intro' }, previous, 6000)).toBe(false)
    expect(shouldSaveReadingProgress({ progressPercent: 21, anchorSlug: 'intro' }, previous, 6000)).toBe(true)
    expect(shouldSaveReadingProgress({ progressPercent: 20, anchorSlug: 'next' }, previous, 6000)).toBe(true)
  })

  it('isolates local fallback progress by user and article', () => {
    expect(getReadingProgressStorageKey('article-1', 'user-1'))
      .toBe('article-reading-progress:v1:user-1:article-1')
  })

  it('prefers a stable anchor and falls back to the scroll ratio', () => {
    const progress = { scrollRatio: 0.4, anchorOffset: 25 }
    expect(resolveReadingRestoreOffset({
      progress,
      maxScroll: 1000,
      anchorOffsetTop: 300,
      articleMatches: true
    })).toBe(325)
    expect(resolveReadingRestoreOffset({
      progress,
      maxScroll: 1000,
      anchorOffsetTop: 300,
      articleMatches: false
    })).toBe(400)
  })
})
