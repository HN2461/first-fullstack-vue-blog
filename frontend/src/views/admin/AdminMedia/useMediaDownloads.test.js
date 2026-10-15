import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { downloadAdminMedia } from '@/services/admin'
import { useMediaDownloadStore } from '@/stores/mediaDownload'
import { useMediaDownloads } from './useMediaDownloads'

vi.mock('@/services/admin', () => ({ downloadAdminMedia: vi.fn(), downloadAdminMediaBatch: vi.fn() }))

describe('media download save and cancellation', () => {
  let link
  let createUrl
  let revokeUrl
  let actions

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.clearAllMocks()
    link = { click: vi.fn(), remove: vi.fn() }
    vi.stubGlobal('document', { createElement: vi.fn(() => link), body: { appendChild: vi.fn() } })
    createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-download')
    revokeUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    actions = useMediaDownloads({ selectedMediaRecords: ref([]), clearSelection: vi.fn() })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('passes an abort signal and never saves an interrupted response', async () => {
    let signal
    downloadAdminMedia.mockImplementation((_id, metadata) => new Promise((_resolve, reject) => {
      signal = metadata.signal
      signal.addEventListener('abort', () => reject(new Error('cancelled')))
    }))
    const result = actions.downloadSingleMedia({ id: 'one', originalName: 'one.zip' })
    await Promise.resolve()
    await useMediaDownloadStore().cancelTask()
    await result
    expect(signal.aborted).toBe(true)
    expect(createUrl).not.toHaveBeenCalled()
    expect(link.click).not.toHaveBeenCalled()
    expect(useMediaDownloadStore().state).toBe('cancelled')
  })

  it('checks cancellation again if a transport delivers its blob after abort', async () => {
    let finish
    downloadAdminMedia.mockImplementation(() => new Promise((resolve) => { finish = resolve }))
    const result = actions.downloadSingleMedia({ id: 'one', originalName: 'one.zip' })
    await Promise.resolve()
    const cancelled = useMediaDownloadStore().cancelTask()
    finish(new Blob(['late data']))
    await cancelled
    await result
    expect(link.click).not.toHaveBeenCalled()
    expect(createUrl).not.toHaveBeenCalled()
  })

  it('saves only the full response and revokes the object URL after handoff', async () => {
    downloadAdminMedia.mockResolvedValue(new Blob(['complete data']))
    await actions.downloadSingleMedia({ id: 'one', originalName: 'one.zip' })
    expect(link.click).toHaveBeenCalledTimes(1)
    expect(link.remove).toHaveBeenCalledTimes(1)
    await vi.runAllTimersAsync()
    expect(revokeUrl).toHaveBeenCalledWith('blob:test-download')
    expect(useMediaDownloadStore().tasks[0].request).toBeUndefined()
  })

  it('uses the download center for duplicate feedback without another network request', async () => {
    let finish
    downloadAdminMedia.mockImplementation(() => new Promise((resolve) => { finish = resolve }))
    const first = actions.downloadSingleMedia({ id: 'one', originalName: 'one.zip' })
    await Promise.resolve()
    await actions.downloadSingleMedia({ id: 'one', originalName: 'one.zip' })
    expect(downloadAdminMedia).toHaveBeenCalledTimes(1)
    expect(useMediaDownloadStore().feedback.message).toContain('请勿重复点击')
    finish(new Blob(['full data']))
    await first
    await vi.runAllTimersAsync()
  })
})
