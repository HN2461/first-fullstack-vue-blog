import crypto from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { buildArticleAuthorityMergePlan } from '#modules/content/services/articleAuthorityMerge.service.js'

const id = '6a6b691f4bf50146e9b95e6c'
const categoryId = '6a6b691f4bf50146e9b95e60'
const tagId = '6a6b691f4bf50146e9b95e61'

function buildPlan({ localContent = 'base', remoteContent = 'base', remoteOrder = 10 } = {}) {
  const record = {
    originalId: id, originalSlug: 'article', title: '标题', contentMode: 'markdown', contentMarkdown: localContent,
    status: 'published', sortOrder: 10, categoryPath: ['前端'], tags: ['Vue'], publishedAt: null,
    data: { summary: '摘要', cover: '' }
  }
  return buildArticleAuthorityMergePlan({ manifest: { articles: [{
    originalId: id, title: '标题', summary: '摘要', cover: '', contentHash: crypto.createHash('sha256').update('base').digest('hex'),
    categoryPath: ['前端'], tags: ['Vue'], status: 'published', sortOrder: 10, publishedAt: null
  }] }, records: [record] }, [{
    _id: id, slug: 'article', title: '标题', summary: '摘要', cover: '', contentMode: 'markdown', contentMarkdown: remoteContent,
    category: categoryId, tags: [tagId], status: 'published', sortOrder: remoteOrder, publishedAt: null, updatedAt: new Date()
  }], [{ _id: categoryId, name: '前端', parent: null }], [{ _id: tagId, name: 'Vue' }])
}

describe('article authority three-way merge', () => {
  it('keeps a local-only body change as a content push', () => {
    const plan = buildPlan({ localContent: 'local', remoteContent: 'base' })
    expect(plan.items[0].pushFields).toContain('contentHash')
    expect(plan.items[0].blocked).toBe(false)
  })

  it('keeps an online-only order adjustment as metadata pull', () => {
    const plan = buildPlan({ remoteOrder: 20 })
    expect(plan.items[0].pullFields).toContain('sortOrder')
    expect(plan.items[0].blocked).toBe(false)
  })
})
