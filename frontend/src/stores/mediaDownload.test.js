import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMediaDownloadStore } from './mediaDownload'

function createBlobRequest(content, delay = 0) {
  return ({ onProgress }) => new Promise((resolve) => {
    onProgress(content.length / 2, content.length)
    setTimeout(() => {
      onProgress(content.length, content.length)
      resolve(new Blob([content]))
    }, delay)
  })
}

describe('global media download queue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('shows progress and downloads queued files sequentially', async () => {
    const store = useMediaDownloadStore()
    const first = store.enqueue({ fileName: 'a.zip', label: '下载：a.zip', request: createBlobRequest('abcdef', 100) })
    const second = store.enqueue({ fileName: 'b.zip', label: '下载：b.zip', request: createBlobRequest('123456', 100) })
    await vi.waitFor(() => expect(store.running).toBe(true))
    expect(store.currentTask.label).toBe('下载：a.zip')
    expect(store.progress.percent).toBe(50)
    expect(store.queuedCount).toBe(1)
    vi.advanceTimersByTime(100)
    await first
    vi.advanceTimersByTime(100)
    await second
    expect(store.successCount).toBe(2)
    expect(store.state).toBe('success')
    expect(store.progress.percent).toBe(100)
  })

  it('keeps a failed task visible and lets the user clear completed history', async () => {
    const store = useMediaDownloadStore()
    const failed = store.enqueue({ fileName: 'bad.zip', request: () => Promise.reject(new Error('网络失败')) })
    await expect(failed).rejects.toThrow('网络失败')
    expect(store.errorCount).toBe(1)
    const success = store.enqueue({ fileName: 'ok.zip', request: createBlobRequest('ok') })
    vi.advanceTimersByTime(0)
    await success
    expect(store.successCount).toBe(1)
    expect(store.lastCompletedStatus).toBe('success')
    store.clearCompleted()
    expect(store.errorCount).toBe(1)
    expect(store.tasks).toHaveLength(1)
  })

  it('does not start duplicate requests while the same download is active', async () => {
    const store = useMediaDownloadStore()
    let resolveRequest
    const request = () => new Promise((resolve) => { resolveRequest = resolve })
    const first = store.enqueue({ fileName: 'large.zip', request, dedupeKey: 'media:1' })
    const duplicate = store.enqueue({ fileName: 'large.zip', request, dedupeKey: 'media:1' })
    expect(store.tasks).toHaveLength(1)
    expect(store.queuedVersion).toBe(1)
    expect(store.latestTask.fileName).toBe('large.zip')
    resolveRequest(new Blob(['done']))
    await first
  })

  it('shows the newest queued file while keeping the active file visible as current', async () => {
    const store = useMediaDownloadStore()
    let resolveFirst
    const first = store.enqueue({ fileName: 'first.zip', label: '下载：first.zip', request: () => new Promise((resolve) => { resolveFirst = resolve }) })
    const second = store.enqueue({ fileName: 'second.zip', label: '下载：second.zip', request: createBlobRequest('second') })
    expect(store.currentTask.fileName).toBe('first.zip')
    expect(store.latestTask.fileName).toBe('second.zip')
    resolveFirst(new Blob(['first']))
    await first
    vi.advanceTimersByTime(0)
    await second
  })
})
