import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import http from './http'
import { uploadMediaFile } from './mediaUpload'

vi.mock('./http', () => ({ default: { post: vi.fn(), put: vi.fn(), get: vi.fn() } }))

function session(offset = 0) {
  return { offset, size: 6, chunkSize: 3, status: 'uploading' }
}

describe('media upload transport', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers()
    vi.stubGlobal('crypto', { randomUUID: () => 'new-upload-id' })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('sends only bytes after the confirmed offset when a task is resumed', async () => {
    http.post.mockResolvedValueOnce(session(3)).mockResolvedValueOnce({ status: 'completed', result: { id: 'media-1' } })
    http.put.mockResolvedValueOnce(session(6))
    const progress = vi.fn()
    expect(await uploadMediaFile(new File(['abcdef'], 'a.txt'), { uploadId: 'task-1' }, { onProgress: progress })).toEqual({ id: 'media-1' })
    expect(http.put).toHaveBeenCalledTimes(1)
    const [, chunk, config] = http.put.mock.calls[0]
    expect(await chunk.text()).toBe('def')
    expect(config.headers['X-Upload-Offset']).toBe('3')
    expect(progress).toHaveBeenCalledWith(3)
    expect(progress).toHaveBeenCalledWith(6)
  })

  it('queries confirmed progress after a lost response and skips the received chunk', async () => {
    http.post.mockResolvedValueOnce(session()).mockResolvedValueOnce({ status: 'completed', result: { id: 'media-1' } })
    http.put.mockRejectedValueOnce(Object.assign(new Error('超时'), { status: 408 })).mockResolvedValueOnce(session(6))
    http.get.mockResolvedValueOnce(session(3))
    const upload = uploadMediaFile(new File(['abcdef'], 'a.txt'), { uploadId: 'task-1' })
    await vi.waitFor(() => expect(http.get).toHaveBeenCalledOnce(), { timeout: 2500 })
    expect(await upload).toEqual({ id: 'media-1' })
    expect(http.put.mock.calls.map((call) => call[2].headers['X-Upload-Offset'])).toEqual(['0', '3'])
  })

  it('does not resend or create a second resource when the task already completed', async () => {
    http.post.mockResolvedValueOnce({ status: 'completed', result: { id: 'existing' } })
    expect(await uploadMediaFile(new File(['abcdef'], 'a.txt'), { uploadId: 'task-1' })).toEqual({ id: 'existing' })
    expect(http.put).not.toHaveBeenCalled()
    expect(http.post).toHaveBeenCalledTimes(1)
  })

  it('stops permission errors immediately and never retries them', async () => {
    const error = Object.assign(new Error('无权限'), { status: 403 })
    http.post.mockRejectedValueOnce(error)
    await expect(uploadMediaFile(new File(['abcdef'], 'a.txt'), { uploadId: 'task-1' })).rejects.toBe(error)
    expect(http.post).toHaveBeenCalledTimes(1)
    expect(http.put).not.toHaveBeenCalled()
  })

  it('retries completion safely without binding the already committed file to the stop signal', async () => {
    http.post.mockResolvedValueOnce(session(6))
      .mockRejectedValueOnce(Object.assign(new Error('响应丢失'), { status: 502 }))
      .mockResolvedValueOnce({ status: 'completed', result: { id: 'same-resource' } })
    const signal = new AbortController().signal
    const upload = uploadMediaFile(new File(['abcdef'], 'a.txt'), { uploadId: 'task-1' }, { signal })
    await vi.waitFor(() => expect(http.post).toHaveBeenCalledTimes(3), { timeout: 2500 })
    expect(await upload).toEqual({ id: 'same-resource' })
    expect(http.post.mock.calls[1][2].signal).toBeUndefined()
  })
})
