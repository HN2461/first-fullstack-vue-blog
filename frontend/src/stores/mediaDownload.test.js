import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

  afterEach(() => vi.useRealTimers())

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

  it('keeps failure details until clearing ended history and shows the latest result', async () => {
    const store = useMediaDownloadStore()
    const failed = store.enqueue({ fileName: 'bad.zip', request: () => Promise.reject(new Error('网络失败')) })
    await expect(failed).rejects.toThrow('网络失败')
    expect(store.errorCount).toBe(1)
    const success = store.enqueue({ fileName: 'ok.zip', request: createBlobRequest('ok') })
    await vi.runAllTimersAsync()
    await success
    expect(store.successCount).toBe(1)
    expect(store.lastCompletedStatus).toBe('success')
    expect(store.state).toBe('success')
    expect(store.tasks[0].error).toBe('网络失败')
    store.clearCompleted()
    expect(store.tasks).toHaveLength(0)
  })

  it('does not start duplicate requests while the same download is active', async () => {
    const store = useMediaDownloadStore()
    let resolveRequest
    const request = vi.fn(() => new Promise((resolve) => { resolveRequest = resolve }))
    const first = store.enqueue({ fileName: 'large.zip', request, dedupeKey: 'media:1' })
    const duplicate = store.enqueue({ fileName: 'large.zip', request, dedupeKey: 'media:1' })
    expect(store.tasks).toHaveLength(1)
    expect(store.queuedVersion).toBe(1)
    expect(store.latestTask.fileName).toBe('large.zip')
    expect(store.feedback.message).toContain('请勿重复点击')
    await Promise.resolve()
    expect(request).toHaveBeenCalledTimes(1)
    resolveRequest(new Blob(['done']))
    await first
    expect(await duplicate).toBe(true)
  })

  it('shows the newest queued file while keeping the active file visible as current', async () => {
    const store = useMediaDownloadStore()
    let resolveFirst
    const first = store.enqueue({ fileName: 'first.zip', label: '下载：first.zip', request: () => new Promise((resolve) => { resolveFirst = resolve }) })
    const second = store.enqueue({ fileName: 'second.zip', label: '下载：second.zip', request: createBlobRequest('second') })
    expect(store.currentTask.fileName).toBe('first.zip')
    expect(store.latestTask.fileName).toBe('second.zip')
    await Promise.resolve()
    resolveFirst(new Blob(['first']))
    await first
    await vi.runAllTimersAsync()
    await second
  })

  it('cancels the active request and marks it without starting a duplicate download', async () => {
    const store = useMediaDownloadStore()
    let rejectRequest
    const task = store.enqueue({ fileName: 'cancel.zip', request: ({ signal }) => new Promise((resolve, reject) => {
      rejectRequest = reject
      signal.addEventListener('abort', () => reject(new DOMException('已终止', 'AbortError')))
    }) })
    await Promise.resolve()
    await store.cancelTask()
    await task
    expect(store.tasks[0].status).toBe('cancelled')
    expect(store.running).toBe(false)
    expect(rejectRequest).toBeTypeOf('function')
    expect(store.state).toBe('cancelled')
    expect(store.statusText).toBe('下载已终止')
  })

  it('continues with the next queued file after terminating the current file', async () => {
    const store = useMediaDownloadStore()
    let rejectRequest
    const first = store.enqueue({ fileName: 'cancel.zip', request: ({ signal }) => new Promise((resolve, reject) => {
      rejectRequest = reject
      signal.addEventListener('abort', () => reject(new DOMException('已终止', 'AbortError')))
    }) })
    const second = store.enqueue({ fileName: 'next.zip', request: createBlobRequest('next') })

    await Promise.resolve()
    await store.cancelTask()
    await first
    await vi.runAllTimersAsync()
    await second

    expect(rejectRequest).toBeTypeOf('function')
    expect(store.tasks.map((task) => task.status)).toEqual(['cancelled', 'success'])
    expect(store.state).toBe('success')
  })

  it('cancels a queued file without starting its request', async () => {
    const store = useMediaDownloadStore()
    let resolveFirst
    const first = store.enqueue({ fileName: 'a.zip', request: () => new Promise((resolve) => { resolveFirst = resolve }) })
    const request = vi.fn()
    const second = store.enqueue({ fileName: 'b.zip', request })
    await Promise.resolve()
    await store.cancelTask(store.tasks[1].id)
    expect(await second).toBeNull()
    expect(request).not.toHaveBeenCalled()
    expect(store.running).toBe(true)
    resolveFirst(new Blob(['first']))
    await first
    expect(store.tasks.map((task) => task.status)).toEqual(['success', 'cancelled'])
  })

  it('terminates all downloads without starting queued requests', async () => {
    const store = useMediaDownloadStore()
    let activeSignal
    const first = store.enqueue({ fileName: 'a.zip', request: ({ signal }) => new Promise((resolve, reject) => {
      activeSignal = signal
      signal.addEventListener('abort', () => reject(new Error('stopped')))
    }) })
    const request = vi.fn()
    const second = store.enqueue({ fileName: 'b.zip', request })
    const third = store.enqueue({ fileName: 'c.zip', request })
    await Promise.resolve()
    await store.cancelAll()
    expect(activeSignal.aborted).toBe(true)
    expect(await Promise.all([first, second, third])).toEqual([null, null, null])
    expect(request).not.toHaveBeenCalled()
    expect(store.running).toBe(false)
    expect(store.cancelledCount).toBe(3)
    expect(store.successCount).toBe(0)
  })

  it('resets progress before the next server responds', async () => {
    const store = useMediaDownloadStore()
    const first = store.enqueue({ fileName: 'a.zip', request: createBlobRequest('first', 50) })
    let resolveSecond
    const second = store.enqueue({ fileName: 'b.zip', request: () => new Promise((resolve) => { resolveSecond = resolve }) })
    await vi.advanceTimersByTimeAsync(50)
    await first
    expect(store.currentTask.fileName).toBe('b.zip')
    expect(store.progress).toMatchObject({ loaded: 0, total: 0, percent: 0, speed: 0 })
    resolveSecond(new Blob(['second']))
    await second
    expect(store.latestTask.fileName).toBe('b.zip')
    expect(store.progress.percent).toBe(100)
  })

  it('keeps cancellation when a transport resolves after abort and ignores late progress', async () => {
    const store = useMediaDownloadStore()
    let finish
    let update
    const result = store.enqueue({ fileName: 'late.zip', request: ({ onProgress }) => new Promise((resolve) => {
      finish = resolve
      update = onProgress
      update(20, 100)
    }) })
    await Promise.resolve()
    const cancel = store.cancelTask()
    update(100, 100)
    expect(store.progress.percent).toBe(20)
    finish(new Blob(['late']))
    await cancel
    expect(await result).toBeNull()
    expect(store.state).toBe('cancelled')
  })

  it('handles immediate cancellation before a request starts', async () => {
    const store = useMediaDownloadStore()
    const request = vi.fn()
    const result = store.enqueue({ fileName: 'quick.zip', request })
    await store.cancelTask()
    expect(await result).toBeNull()
    expect(request).not.toHaveBeenCalled()
    expect(store.state).toBe('cancelled')
  })

  it('handles synchronous transport errors and continues the queue', async () => {
    const store = useMediaDownloadStore()
    const first = store.enqueue({ fileName: 'bad.zip', request: () => { throw new Error('sync failure') } })
    const rejected = expect(first).rejects.toThrow('sync failure')
    const second = store.enqueue({ fileName: 'ok.zip', request: createBlobRequest('ok') })
    await vi.runAllTimersAsync()
    await rejected
    expect(await second).toBe(true)
    expect(store.state).toBe('success')
    expect(store.running).toBe(false)
  })

  it('releases completed transport references without retaining the blob in history', async () => {
    const store = useMediaDownloadStore()
    const result = store.enqueue({ fileName: 'a.zip', request: () => Promise.resolve(new Blob(['large file'])) })
    expect(await result).toBe(true)
    expect(store.tasks[0].request).toBeUndefined()
    expect(store.tasks[0].resolve).toBeUndefined()
    expect(store.tasks[0].reject).toBeUndefined()
    expect(store.progress.percent).toBe(100)
  })
})
