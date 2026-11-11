import { describe, expect, it } from 'vitest'
import { getMovableMediaCategories, getUploadMediaCategories, getMediaCategoryQuery, getMediaActionRestrictions } from './mediaCategoryOptions'

const categories = [
  { id: 'system', name: '默认素材', system: true },
  { id: 'mine', name: '项目资料', system: false, owner: 'user-a' },
  { id: 'other', name: '项目资料', system: false, owner: 'user-b' },
  { id: 'vault', name: '密码箱', system: false, owner: 'user-a', accessMode: 'vault' },
  { id: 'legacy', name: '历史分类', virtual: true, system: false, owner: 'user-a' }
]

describe('初代页面的统一资源规则适配', () => {
  it('普通上传只提供本人普通分类，排除系统、他人、密码箱和虚拟分类', () => {
    expect(getUploadMediaCategories(categories, 'user-a')).toEqual([categories[1]])
  })
  it('密码箱上传只提供本人密码箱', () => {
    expect(getUploadMediaCategories(categories, 'user-a', true)).toEqual([categories[3]])
    expect(getUploadMediaCategories(categories, 'user-b', true)).toEqual([])
  })
  it('本人文件可整理到本人分类，系统分类不作为手动目标', () => {
    expect(getMovableMediaCategories(categories, [{ uploader: { id: 'user-a' } }], 'user-a')).toEqual([categories[1], categories[3]])
  })
  it('查看其他人的文件不代表有权手动改变分类归属', () => {
    expect(getMovableMediaCategories(categories, [{ uploader: { id: 'user-a' } }, { uploader: { id: 'user-b' } }], 'user-a')).toEqual([])
  })
  it('旧文件夹仍按ID、名称和归属查找，历史虚拟分类不作为真实分类ID发送', () => {
    const own = { id: '123456789012345678901234', name: '项目', owner: '111111111111111111111111' }
    const other = { id: 'legacy:222222222222222222222222:项目', name: '项目', owner: '222222222222222222222222' }
    expect(getMediaCategoryQuery(own.id, [own, other])).toEqual({ categoryId: own.id, category: '项目', categoryOwner: own.owner })
    expect(getMediaCategoryQuery(other.id, [own, other])).toEqual({ category: '项目', categoryOwner: other.owner })
  })
  it('业务与历史系统文件禁止移动，仍有使用位置的文件受到删除保护', () => {
    for (const record of [{ systemManaged: true }, { category: '文章原始文档' }, { scene: 'article-content' }, { scene: 'resume-photo' }]) {
      expect(getMediaActionRestrictions(record).moveReason).toContain('所属业务')
    }
    expect(getMediaActionRestrictions({ usage: { referenceCount: 1 } }).deleteReason).toContain('使用位置')
    expect(getMediaActionRestrictions({ scene: 'admin-library' })).toEqual({ moveReason: '', deleteReason: '' })
  })
})
