import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from './http'
import { readResourceBlob, uploadResource } from './resources'

vi.mock('./http', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

describe('统一资源传输', () => {
  beforeEach(() => vi.clearAllMocks())

  it('按场景提交文件及目标，不把磁盘路径和访问范围交给客户端决定', async () => {
    const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' })
    const signal = new AbortController().signal
    await uploadResource(file, { scene: 'resume-photo', targetId: 'resume-id', signal })
    const [url, body, config] = http.post.mock.calls[0]
    expect(url).toBe('/api/resources/upload/resume-photo')
    expect(body.get('file').name).toBe('photo.jpg')
    expect(body.has('storagePath')).toBe(false)
    expect(config.params).toEqual({ targetId: 'resume-id' })
    expect(config.signal).toBe(signal)
    expect(config.headers['Content-Type']).toBe('multipart/form-data')
  })

  it('私有读取使用已认证 HTTP 实例，并阻止认证信息被发给外站', async () => {
    const signal = new AbortController().signal
    await readResourceBlob('/api/resources/file-id/content', { signal })
    expect(http.get).toHaveBeenCalledWith('/api/resources/file-id/content', { responseType: 'blob', signal })
    for (const url of ['https://external.example/file', '//external.example/file', '/api\\external/file', 'javascript:alert(1)']) {
      expect(() => readResourceBlob(url)).toThrow('只允许读取本站文件')
    }
    expect(http.get).toHaveBeenCalledTimes(1)
  })
})
