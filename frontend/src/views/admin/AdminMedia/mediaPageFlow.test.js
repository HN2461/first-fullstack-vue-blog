import { effectScope, nextTick, reactive, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MediaPage from './index.vue'

// 直接执行页面 setup 和请求链路；不启动浏览器、不创建 DOM，子组件在这里不渲染。
const fixture = vi.hoisted(() => ({ mounted: [], unmounted: [], route: null, auth: null, upload: null, api: {}, router: null, actions: null }))
vi.mock('vue', async (actual) => ({
  ...await actual(),
  useSSRContext: () => ({ modules: new Set() }),
  onMounted: (callback) => fixture.mounted.push(callback),
  onUnmounted: (callback) => fixture.unmounted.push(callback)
}))
vi.mock('vue-router', () => ({ useRoute: () => fixture.route, useRouter: () => fixture.router }))
vi.mock('@/stores/auth', () => ({ useAuthStore: () => fixture.auth }))
vi.mock('@/stores/mediaUpload', () => ({ useMediaUploadStore: () => fixture.upload }))
vi.mock('ant-design-vue', () => ({ message: { error: vi.fn(), info: vi.fn(), warning: vi.fn(), success: vi.fn() } }))
vi.mock('@/composables/useAdminUi', () => ({ useAdminActions: () => fixture.actions }))
vi.mock('./useMediaDownloads', () => ({ useMediaDownloads: () => ({ downloadModalVisible: ref(false), downloadSubmitting: ref(false), downloadSingleMedia: vi.fn(), openBatchDownload: vi.fn(), submitBatchDownload: vi.fn() }) }))
vi.mock('@/services/admin', () => {
  const names = ['createAdminMediaCategory', 'deleteAdminMedia', 'deleteAdminMediaCategory', 'getAdminMediaStatistics', 'getAdminMediaStorageUsage', 'getAdminMediaDeleteRisk', 'getAdminSettings', 'listAdminMedia', 'listAdminMediaCategories', 'batchDeleteAdminMedia', 'batchMoveAdminMediaCategory', 'moveAdminMediaCategory', 'renameAdminMedia', 'updateAdminMediaCategory', 'updateAdminSettings', 'getAdminMediaVaultStatus', 'lockAdminMediaVault', 'setupAdminMediaVault', 'unlockAdminMediaVault']
  fixture.api = Object.fromEntries(names.map((name) => [name, vi.fn()]))
  return fixture.api
})
vi.mock('@/components/BlogTable.vue', () => ({ default: {} }))
vi.mock('./MediaBatchActions.vue', () => ({ default: {} }))
vi.mock('./MediaDownloadModal.vue', () => ({ default: {} }))
vi.mock('./MediaHeaderActions.vue', () => ({ default: {} }))
vi.mock('./MediaRowActions.vue', () => ({ default: {} }))
vi.mock('./MediaTrashModal.vue', () => ({ default: {} }))
vi.mock('./MediaRenameModal.vue', () => ({ default: {} }))
vi.mock('./MediaCategoryMoveModal.vue', () => ({ default: {} }))
vi.mock('./MediaPreviewModal.vue', () => ({ default: {} }))
vi.mock('./MediaReferenceModal.vue', () => ({ default: {} }))
vi.mock('./MediaInventoryModal.vue', () => ({ default: {} }))
vi.mock('./MediaUploadSettingsModal.vue', () => ({ default: {} }))
vi.mock('./MediaGuideModal.vue', () => ({ default: {} }))
vi.mock('./MediaThumbnailCacheModal.vue', () => ({ default: {} }))
vi.mock('./MediaShareCreateModal.vue', () => ({ default: {} }))
vi.mock('./MediaFolderBrowser.vue', () => ({ default: {} }))
vi.mock('./MediaViewSwitcher.vue', () => ({ default: {} }))

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
let scope, page
const mine = { id: '111111111111111111111111', name: '部署', owner: 'admin' }
const vault = { id: '222222222222222222222222', name: '密码箱', owner: 'admin', accessMode: 'vault', builtinKey: 'vault' }
beforeEach(() => {
  vi.clearAllMocks()
  fixture.mounted = []
  fixture.unmounted = []
  fixture.route = reactive({ query: {}, fullPath: '/console/manage/media' })
  fixture.router = { replace: vi.fn().mockResolvedValue(undefined), push: vi.fn().mockResolvedValue(undefined) }
  fixture.auth = { user: { id: 'admin' }, isSuperAdmin: true, canAccessPath: () => true }
  fixture.actions = { runAction: async (action, options = {}) => {
    const value = await action()
    await options.onSuccess?.(value)
    return value
  }, confirmAction: vi.fn().mockResolvedValue(undefined) }
  fixture.upload = reactive({ completedVersion: 0, ownerId: 'admin', open: vi.fn() })
  fixture.api.listAdminMedia.mockResolvedValue({ items: [], total: 0 })
  fixture.api.getAdminMediaStatistics.mockResolvedValue({ vaultRecordsPresent: false, byFileClass: {} })
  fixture.api.listAdminMediaCategories.mockResolvedValue([mine, vault])
  vi.stubGlobal('window', { setInterval, clearInterval })
  scope = effectScope()
  page = scope.run(() => MediaPage.setup({}, { expose: vi.fn() }))
  page.categories.value = [mine, vault]
  page.folderCategories.value = [mine, vault]
})
afterEach(() => {
  for (const callback of fixture.unmounted) callback()
  scope.stop()
  vi.unstubAllGlobals()
})

describe('初代媒体页面实际操作链路', () => {
  it('切到列表后写入明确列表地址，地址同步不会再跳回目录', () => {
    page.changeViewMode('list')
    expect(fixture.router.replace.mock.lastCall[0].query.view).toBe('list')
  })

  it('进入和返回文件夹不会请求全库文件，迟到结果不能覆盖目录', async () => {
    const pending = deferred()
    fixture.api.listAdminMedia.mockReturnValueOnce(pending.promise)
    page.enterVaultFolder(mine)
    expect(fixture.api.listAdminMedia).toHaveBeenCalledTimes(1)
    page.backToFolderRoot()
    pending.resolve({ items: [{ id: 'old-file' }], total: 1 })
    await nextTick()
    await nextTick()
    expect(page.folderItems.value).toEqual([])
    expect(page.folderTotal.value).toBe(0)
    expect(fixture.api.listAdminMedia).toHaveBeenCalledTimes(1)
  })

  it('过期状态不能重新显示密码箱，锁定时立即清除预览和选中文件', () => {
    page.applyVaultStatus({ configured: true, unlocked: true, expiresAt: new Date(Date.now() - 1000).toISOString() })
    expect(page.vaultStatus.value.unlocked).toBe(false)
    page.applyVaultStatus({ configured: true, unlocked: true, expiresAt: new Date(Date.now() + 60000).toISOString() })
    page.previewVisible.value = true
    page.previewRecord.value = { id: 'secret' }
    page.folderSelectedRecords.value = [{ id: 'secret' }]
    page.applyVaultStatus({ configured: true, unlocked: false })
    expect(page.previewVisible.value).toBe(false)
    expect(page.previewRecord.value).toBeNull()
    expect(page.folderSelectedRecords.value).toEqual([])
  })

  it('系统分类禁止资源页上传，个人分类上传只使用本人普通分类', async () => {
    const system = { id: '333333333333333333333333', name: '用户头像', system: true }
    page.folderCategories.value = [mine, vault, system]
    page.activeFolderId.value = system.id
    await page.openUploadModal(system)
    expect(fixture.upload.open).not.toHaveBeenCalled()
    page.activeFolderId.value = mine.id
    await page.openUploadModal(mine)
    expect(fixture.upload.open).toHaveBeenCalledWith(expect.objectContaining({ categoryId: mine.id, categoryOptions: [{ value: mine.id, name: mine.name, label: mine.name }] }))
  })

  it('原页面批量移动使用文件夹内当前选中记录，保留本人分类', () => {
    page.folderSelectedRecords.value = [{ uploader: { id: 'admin' } }]
    page.folderSelectedKeys.value = ['file']
    page.openFolderBatchCategoryMove()
    expect(page.categoryMoveOptions.value).toEqual([mine, vault])
    expect(page.categoryMoveIds.value).toEqual(['file'])
  })
  it('迟到的解锁状态不能覆盖刚刚执行的锁定', async () => {
    const pending = deferred()
    fixture.api.getAdminMediaVaultStatus.mockReturnValueOnce(pending.promise)
    fixture.api.lockAdminMediaVault.mockResolvedValueOnce({ configured: true, unlocked: false })
    const old = page.syncVaultStatus()
    await page.lockVault()
    pending.resolve({ configured: true, unlocked: true, expiresAt: new Date(Date.now() + 60000).toISOString() })
    await old
    expect(page.vaultStatus.value.unlocked).toBe(false)
  })

  it('等待密码箱状态期间进入普通文件夹，迟到响应不得把用户带回密码箱', async () => {
    const pending = deferred()
    fixture.api.getAdminMediaVaultStatus.mockReturnValueOnce(pending.promise)
    const old = page.openFolder(vault)
    await page.openFolder(mine)
    pending.resolve({ configured: true, unlocked: true, expiresAt: new Date(Date.now() + 60000).toISOString() })
    await old
    expect(page.activeFolderId.value).toBe(mine.id)
    expect(page.vaultModalVisible.value).toBe(false)
  })

  it('密码箱锁定不应打断当前普通文件夹加载', async () => {
    const pending = deferred()
    page.applyVaultStatus({ configured: true, unlocked: true, expiresAt: new Date(Date.now() + 60000).toISOString() })
    page.activeFolderId.value = mine.id
    fixture.api.listAdminMedia.mockReturnValueOnce(pending.promise)
    const current = page.loadFolderItems()
    page.applyVaultStatus({ configured: true, unlocked: false })
    pending.resolve({ items: [{ id: 'normal' }], total: 1 })
    await current
    expect(page.folderLoading.value).toBe(false)
    expect(page.folderItems.value).toEqual([{ id: 'normal' }])
  })

  it('并发列表翻页中迟到的失败不能清空已经成功的新页', async () => {
    const first = deferred(), second = deferred()
    page.viewMode.value = 'list'
    fixture.api.listAdminMedia.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const old = page.loadMedia({ page: 1 })
    const current = page.loadMedia({ page: 2 })
    second.resolve({ items: [{ id: 'page2' }], total: 21 })
    await current
    first.reject(new Error('旧页加载失败'))
    await expect(old).resolves.toEqual({ items: [{ id: 'page2' }], total: 21 })
  })

  it('仍有引用或无法核对使用情况时，不打开删除确认继续执行', async () => {
    fixture.api.getAdminMediaDeleteRisk.mockResolvedValueOnce({ items: [{ media: { id: 'file' }, referenceCount: 1 }], referencedCount: 1 })
    await page.confirmMediaDelete(['file'], { title: '删除' })
    expect(fixture.actions.confirmAction).not.toHaveBeenCalled()
    fixture.api.getAdminMediaDeleteRisk.mockRejectedValueOnce(new Error('网络错误'))
    await page.confirmMediaDelete(['file'], { title: '删除' })
    expect(fixture.actions.confirmAction).not.toHaveBeenCalled()
  })

  it('上传完成后刷新当前文件夹和分类数量，重命名仍走原有保存接口', async () => {
    page.activeFolderId.value = mine.id
    fixture.api.listAdminMedia.mockResolvedValue({ items: [{ id: 'uploaded' }], total: 1 })
    await page.handleUploadCompleted()
    expect(page.folderItems.value).toEqual([{ id: 'uploaded' }])
    expect(fixture.api.listAdminMediaCategories).toHaveBeenCalled()
    page.renameRecord.value = { id: 'uploaded', originalName: 'old.txt' }
    page.renameModalVisible.value = true
    await page.submitRename('new.txt')
    expect(fixture.api.renameAdminMedia).toHaveBeenCalledWith('uploaded', { originalName: 'new.txt' })
    expect(page.renameModalVisible.value).toBe(false)
  })

  it('关闭解锁弹窗后，尚未完成的验证响应不能打开密码箱', async () => {
    const pending = deferred()
    fixture.api.unlockAdminMediaVault.mockReturnValueOnce(pending.promise)
    page.vaultModalMode.value = 'unlock'
    page.vaultTargetFolder.value = vault
    page.vaultPassword.value = 'not-a-real-password'
    page.vaultModalVisible.value = true
    const action = page.submitVaultAccess()
    page.closeVaultModal()
    pending.resolve({ configured: true, unlocked: true, expiresAt: new Date(Date.now() + 60000).toISOString() })
    await action
    expect(page.vaultModalVisible.value).toBe(false)
    expect(page.vaultPassword.value).toBe('')
    expect(page.activeFolderId.value).toBe('')
    expect(page.vaultStatus.value.unlocked).toBe(false)
  })

  it('浏览器返回目录时也会取消尚在等待的密码箱状态请求', async () => {
    const pending = deferred()
    page.activeFolderId.value = mine.id
    fixture.api.getAdminMediaVaultStatus.mockReturnValueOnce(pending.promise)
    const old = page.openFolder(vault)
    fixture.route.query = { view: 'folders' }
    fixture.route.fullPath = '/console/manage/media?view=folders'
    await nextTick()
    pending.resolve({ configured: true, unlocked: true, expiresAt: new Date(Date.now() + 60000).toISOString() })
    await old
    expect(page.activeFolderId.value).toBe('')
    expect(page.vaultModalVisible.value).toBe(false)
  })

})
