import { effectScope, nextTick, reactive } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useMediaBrowser } from './useMediaBrowser'
import { getMediaActionRestrictions, resolveMediaWorkspace } from './mediaWorkspace'

vi.mock('@/services/admin', () => ({ listAdminMedia: vi.fn() }))
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function setup(layout, request, initialFilters = {}) {
  const scope = effectScope()
  const props = reactive({ workspace: 'library', layout, initialFilters })
  const state = scope.run(() => useMediaBrowser(props, request))
  return { scope, props, state }
}

describe('资源工作区查询', () => {
  it('筛选在列表和网格间保留，完整请求包含后端工作区及分类', async () => {
    const request = vi.fn().mockResolvedValue({ items: [{ id: 'item' }], total: 1 })
    const { scope, props, state } = setup('list', request, { keyword: '图片', categoryId: '123456789012345678901234' })
    await state.loadTable({ page: 2, pageSize: 16 })
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({
        workspace: 'library',
        keyword: '图片',
        categoryId: '123456789012345678901234',
        page: 2
      })
    )
    props.layout = 'folders'
    await nextTick()
    await nextTick()
    expect(state.filters.value.keyword).toBe('图片')
    expect(state.total.value).toBe(1)
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({ workspace: 'library', keyword: '图片', page: 1 })
    )
    scope.stop()
  })

  it('网格快速切换筛选时旧结果和旧异常不能覆盖当前页', async () => {
    const first = deferred(),
      second = deferred(),
      third = deferred()
    const request = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
      .mockReturnValueOnce(third.promise)
    const { scope, state } = setup('folders', request)
    state.filters.value.keyword = 'new'
    await nextTick()
    second.resolve({ items: [{ id: 'new' }], total: 1 })
    await nextTick()
    first.resolve({ items: [{ id: 'old' }], total: 99 })
    await nextTick()
    expect(state.items.value).toEqual([{ id: 'new' }])
    expect(state.total.value).toBe(1)
    const loading = state.loadGrid()
    scope.stop()
    third.reject(new Error('已经关闭的请求'))
    await loading
    expect(state.error.value).toBe('')
  })

  it('列表并发翻页的所有回调返回最新结果，失败可重试', async () => {
    const first = deferred(),
      second = deferred()
    const request = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
      .mockRejectedValueOnce(new Error('网络中断'))
      .mockResolvedValueOnce({ items: [], total: 0 })
    const { scope, state } = setup('list', request)
    const old = state.loadTable({ page: 1 })
    const current = state.loadTable({ page: 2 })
    second.resolve({ items: [{ id: 'page2' }], total: 20 })
    await current
    first.resolve({ items: [{ id: 'page1' }], total: 20 })
    expect(await old).toEqual({ items: [{ id: 'page2' }], total: 20 })
    await state.loadTable({ page: 3 })
    expect(state.error.value).toBe('网络中断')
    await state.loadTable({ page: 3 })
    expect(state.error.value).toBe('')
    scope.stop()
  })

  it('旧分类链接进入全部资源，特殊业务和引用文件提前说明操作限制', () => {
    expect(resolveMediaWorkspace({})).toBe('library')
    expect(resolveMediaWorkspace({ categoryId: 'old' })).toBe('all')
    expect(resolveMediaWorkspace({ tab: 'business' })).toBe('business')
    expect(resolveMediaWorkspace({ tab: 'unknown' })).toBe('library')
    expect(getMediaActionRestrictions({ scene: 'resume-photo' }).moveReason).toContain('所属业务')
    expect(getMediaActionRestrictions({ usage: { referenceCount: 2 } }).deleteReason).toContain('使用位置')
    expect(
      getMediaActionRestrictions({ scene: 'admin-library', lifecycleStatus: 'retained', usage: { referenceCount: 0 } })
    ).toEqual({ moveReason: '', deleteReason: '' })
  })
})
