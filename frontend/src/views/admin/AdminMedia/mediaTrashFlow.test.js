import { effectScope, reactive, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MediaTrash from './MediaTrashModal.vue'

const fixture = vi.hoisted(() => ({ unmounted: [], list: vi.fn() }))
vi.mock('vue', async (actual) => ({
  ...await actual(),
  useSSRContext: () => ({ modules: new Set() }),
  onUnmounted: (callback) => fixture.unmounted.push(callback)
}))
vi.mock('@/components/BlogTable.vue', () => ({ default: {} }))
vi.mock('@/services/admin', () => ({
  listTrashMedia: fixture.list,
  batchPermanentDeleteAdminMedia: vi.fn(), batchRestoreAdminMedia: vi.fn(), emptyMediaTrash: vi.fn(),
  permanentDeleteAdminMedia: vi.fn(), restoreAdminMedia: vi.fn()
}))
vi.mock('@/composables/useAdminUi', () => ({ useAdminActions: () => ({ runAction: vi.fn(), confirmAction: vi.fn() }) }))
vi.mock('./useMediaConfirm', () => ({ useMediaConfirm: () => ({ confirmAction: vi.fn(), cancelConfirmations: vi.fn() }) }))

let scope, page, props
function deferred() {
  let resolve
  const promise = new Promise((done) => { resolve = done })
  return { promise, resolve }
}
beforeEach(() => {
  fixture.unmounted = []
  fixture.list.mockReset().mockResolvedValue({ items: [], total: 0 })
  props = reactive({ open: true, vaultUnlocked: false })
  scope = effectScope()
  page = scope.run(() => MediaTrash.setup(props, { expose: vi.fn(), emit: vi.fn() }))
})
afterEach(() => {
  fixture.unmounted.forEach((callback) => callback())
  scope.stop()
})

describe('回收站请求与选择隔离', () => {
  it('锁定时请求范围排除密码箱，翻页开始清除前页选择', async () => {
    page.selectedTrashKeys.value = ['previous']
    await page.loadTrash({ page: 2 })
    expect(fixture.list).toHaveBeenLastCalledWith({ page: 2, workspace: 'folders' })
    expect(page.selectedTrashKeys.value).toEqual([])
    props.vaultUnlocked = true
    await page.loadTrash({ page: 1 })
    expect(fixture.list).toHaveBeenLastCalledWith({ page: 1, workspace: 'all' })
  })

  it('关闭或卸载后的迟到数据不再返回表格', async () => {
    const pending = deferred()
    fixture.list.mockReturnValueOnce(pending.promise)
    const old = page.loadTrash()
    props.open = false
    await nextTick()
    pending.resolve({ items: [{ id: 'secret' }], total: 1 })
    await expect(old).resolves.toEqual({ items: [], total: 0 })
    expect(page.trashTotal.value).toBe(0)
  })

  it('翻页乱序响应只返回最新页，旧页不能覆盖新页', async () => {
    const pending = deferred()
    fixture.list.mockReturnValueOnce(pending.promise).mockResolvedValueOnce({ items: [{ id: 'new' }], total: 20 })
    const old = page.loadTrash({ page: 1 })
    await page.loadTrash({ page: 2 })
    pending.resolve({ items: [{ id: 'old' }], total: 10 })
    await expect(old).resolves.toEqual({ items: [{ id: 'new' }], total: 20 })
    expect(page.trashTotal.value).toBe(20)
  })
})
