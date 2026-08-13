import { describe, expect, it } from 'vitest'
import { getMovableMediaCategories } from './mediaCategoryOptions'

const categories = [
  { id: 'system', name: '默认素材', system: true },
  { id: 'private', name: '项目资料', system: false }
]

describe('media category move options', () => {
  it('keeps private categories for media owned by the current user', () => {
    expect(getMovableMediaCategories(categories, [
      { uploader: { id: 'user-a' } }
    ], 'user-a')).toEqual(categories)
  })

  it('only keeps system categories when selected media includes another owner', () => {
    expect(getMovableMediaCategories(categories, [
      { uploader: { id: 'user-a' } },
      { uploader: { id: 'user-b' } }
    ], 'user-a')).toEqual([categories[0]])
  })
})
