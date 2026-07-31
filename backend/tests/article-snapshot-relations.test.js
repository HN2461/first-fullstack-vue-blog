import mongoose from 'mongoose'
import { describe, expect, it } from 'vitest'
import { buildArticleIdRemaps } from '#modules/content/services/articleSnapshotRelations.service.js'

describe('article snapshot relation migration', () => {
  it('remaps a legacy article id only when its stable slug matches', () => {
    const legacyId = new mongoose.Types.ObjectId()
    const authoritativeId = new mongoose.Types.ObjectId()
    const snapshot = {
      records: [
        { originalId: authoritativeId.toString(), originalSlug: 'stable-slug' },
        { originalId: new mongoose.Types.ObjectId().toString(), originalSlug: 'new-slug' }
      ]
    }
    const localArticles = [{ _id: legacyId, slug: 'stable-slug' }]

    const remaps = buildArticleIdRemaps(snapshot, localArticles)

    expect(remaps).toHaveLength(1)
    expect(remaps[0]).toMatchObject({ from: legacyId, slug: 'stable-slug' })
    expect(remaps[0].to.toString()).toBe(authoritativeId.toString())
  })
})
