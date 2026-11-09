import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from './http'
import { createFeedback, getFeedbackImage, listFeedback, updateFeedback } from './feedback'

vi.mock('./http', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

describe('反馈接口与图片提交', () => {
  beforeEach(() => vi.clearAllMocks())

  it('我的反馈和管理反馈使用不同的服务端授权入口', async () => {
    await listFeedback({ page: 2 }, false)
    await listFeedback({ status: 'pending' }, true)
    expect(http.get.mock.calls[0][0]).toBe('/api/feedback')
    expect(http.get.mock.calls[1][0]).toBe('/api/admin/feedback')
  })

  it('正文与选择或粘贴的图片作为同一请求提交，重试保持提交标识', async () => {
    const file = new File(['png'], '截图.png', { type: 'image/png' })
    await createFeedback({ requestId: 'stable-id', title: '筛选问题', sourcePath: undefined }, [{ file }])
    const [url, body] = http.post.mock.calls[0]
    expect(url).toBe('/api/feedback')
    expect(body.get('requestId')).toBe('stable-id')
    expect(body.get('title')).toBe('筛选问题')
    expect(body.has('sourcePath')).toBe(false)
    expect(body.getAll('images')[0].name).toBe('截图.png')
  })

  it('状态提交带版本，附件读取通过认证 HTTP 实例并支持取消', async () => {
    await updateFeedback('feedback-id', 'status', { requestId: 'id', version: 3, status: 'completed', content: '已上线' }, [], true)
    const [url, body] = http.post.mock.calls[0]
    expect(url).toBe('/api/admin/feedback/feedback-id/status')
    expect(body.get('version')).toBe('3')
    const controller = new AbortController()
    await getFeedbackImage('media-id', controller.signal)
    expect(http.get).toHaveBeenCalledWith('/api/feedback/attachments/media-id', { responseType: 'blob', signal: controller.signal })
  })
})
