import crypto from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { buildSnapshotDatabasePreview } from '#modules/content/services/articleSnapshotDatabasePreview.service.js'

describe('article snapshot database preview', () => {
  it('treats the same stable slug with a different id as an id remap', () => {
    const snapshot = {
      records: [{
        originalId: 'new-id',
        originalSlug: 'stable-slug',
        title: '文章',
        status: 'published',
        sortOrder: 10,
        categoryPath: [],
        tags: [],
        contentMode: 'markdown',
        contentMarkdown: '正文',
        data: { summary: '' }
      }]
    }
    const articles = [{
      _id: 'old-id',
      slug: 'stable-slug',
      title: '文章',
      summary: '',
      status: 'published',
      sortOrder: 10,
      category: null,
      tags: [],
      contentMode: 'markdown',
      sourceHash: crypto.createHash('sha256').update('正文').digest('hex')
    }]
    const preview = buildSnapshotDatabasePreview(snapshot, articles, [], [], { publishAll: true })
    expect(preview).toMatchObject({
      createCount: 0,
      removeCount: 0,
      rekeyCount: 1,
      updateCount: 0
    })
  })
})
