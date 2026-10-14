import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMediaUploadStore } from './mediaUpload'
import { uploadMediaFile, discardMediaUpload } from '@/services/mediaUpload'

vi.mock('@/services/mediaUpload', () => ({
  createUploadId: () => crypto.randomUUID(),
  uploadMediaFile: vi.fn(),
  discardMediaUpload: vi.fn().mockResolvedValue(null),
  isUploadCancelled: (error) => error.name === 'AbortError'
}))

function setup() {
  const store = useMediaUploadStore()
  store.open({ ownerId: 'user-1', rules: { maxFiles: 10, maxFileSizeMB: 200 }, categoryOptions: [{ value: 'category-1', name: '部署', label: '部署' }], categoryId: 'category-1' })
  store.addFile(new File(['abcd'], 'a.txt'))
  store.addFile(new File(['efgh'], 'b.txt'))
  return store
}

describe('global media upload queue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('continues the same task after the modal closes and can reopen it while running', async () => {
    const store = setup()
    let finish
    uploadMediaFile.mockImplementationOnce((_file, _task, options) => {
      options.onPhase('uploading', '')
      options.onProgress(2)
      return new Promise((resolve) => { finish = resolve })
    }).mockResolvedValueOnce({ id: 'media-b' })
    const run = store.start()
    store.modalOpen = false
    expect(store.running).toBe(true)
    expect(store.hasHistory).toBe(true)
    expect(store.progress.loaded).toBe(2)
    store.open({ categoryId: 'other-category' })
    expect(store.categoryId).toBe('category-1')
    expect(store.modalOpen).toBe(true)
    finish({ id: 'media-a' })
    await run
    expect(store.successCount).toBe(2)
    expect(store.state).toBe('success')
    expect(store.progress.percent).toBe(100)
  })

  it('keeps successful files and only retries the failed file', async () => {
    const store = setup()
    uploadMediaFile.mockResolvedValueOnce({ id: 'media-a' }).mockRejectedValueOnce(new Error('断网'))
    await store.start()
    expect(store.successCount).toBe(1)
    expect(store.failedCount).toBe(1)
    expect(store.state).toBe('error')
    const failedId = store.tasks[1].uploadId
    uploadMediaFile.mockResolvedValueOnce({ id: 'media-b' })
    await store.start()
    expect(uploadMediaFile).toHaveBeenCalledTimes(3)
    expect(uploadMediaFile.mock.calls[2][1].uploadId).toBe(failedId)
    expect(store.successCount).toBe(2)
  })

  it('does not report 100% until server confirmation completes', async () => {
    const store = setup()
    store.tasks.splice(1)
    let finish
    uploadMediaFile.mockImplementationOnce((_file, _task, options) => {
      options.onProgress(4)
      options.onPhase('confirming', '正在确认入库')
      return new Promise((resolve) => { finish = resolve })
    })
    const run = store.start()
    expect(store.progress.percent).toBe(99)
    expect(store.statusText).toBe('确认中')
    finish({ id: 'media-a' })
    await run
    expect(store.progress.percent).toBe(100)
  })

  it('pauses without discarding confirmed data and cancels unfinished files explicitly', async () => {
    const store = setup()
    uploadMediaFile.mockImplementationOnce((_file, _task, options) => {
      options.onPhase('uploading', '')
      options.onProgress(2)
      return new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('停止', 'AbortError'))))
    })
    const run = store.start()
    const id = store.tasks[0].uploadId
    store.pause()
    await run
    expect(store.state).toBe('paused')
    expect(store.tasks[0].loaded).toBe(2)
    expect(discardMediaUpload).not.toHaveBeenCalled()
    await store.cancel()
    expect(discardMediaUpload).toHaveBeenCalledWith(id)
    expect(store.tasks[0].loaded).toBe(0)
    expect(store.tasks[0].uploadId).not.toBe(id)
    expect(store.state).toBe('cancelled')
  })

  it('stops and clears private task state when the user changes', async () => {
    const store = setup()
    const uploadIds = store.tasks.map((task) => task.uploadId)
    uploadMediaFile.mockImplementationOnce((_file, _task, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new DOMException('停止', 'AbortError')))
    }))
    store.start()
    await store.resetForUser({ accessToken: 'old-token' })
    expect(discardMediaUpload).toHaveBeenCalledTimes(uploadIds.length)
    uploadIds.forEach((uploadId) => expect(discardMediaUpload).toHaveBeenCalledWith(uploadId, { accessToken: 'old-token' }))
    expect(store.tasks).toHaveLength(0)
    expect(store.running).toBe(false)
    expect(store.modalOpen).toBe(false)
    expect(store.ownerId).toBe('')
  })
})
