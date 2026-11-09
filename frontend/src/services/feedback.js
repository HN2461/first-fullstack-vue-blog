import http from './http'

const basePath = (management) => (management ? '/api/admin/feedback' : '/api/feedback')

/** 分页读取当前用户或管理范围内的反馈，越权由服务端拒绝。 */
export function listFeedback(params, management = false) {
  return http.get(basePath(management), { params })
}

/** 读取反馈详情和最新沟通记录；不存在或不属于当前范围时抛出接口错误。 */
export function getFeedback(id, management = false) {
  return http.get(`${basePath(management)}/${id}`)
}

/** 加载更早一页沟通记录，返回标准分页数据。 */
export function listFeedbackEvents(id, page, management = false) {
  return http.get(`${basePath(management)}/${id}/events`, { params: { page } })
}

function formData(payload, images) {
  const body = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) body.append(key, String(value))
  })
  images.forEach((image) => body.append('images', image.file, image.file.name || '截图.png'))
  return body
}

/** 同时提交文字与截图，使用 requestId 保证重试不会创建重复反馈。 */
export function createFeedback(payload, images = []) {
  return http.post('/api/feedback', formData(payload, images))
}

/** 提交回复、处理状态或重开/撤回，包含当前版本；冲突时由调用方保留输入并刷新。 */
export function updateFeedback(id, action, payload, images = [], management = false) {
  return http.post(`${basePath(management)}/${id}/${action}`, formData(payload, images))
}

/** 通过登录凭据读取私有反馈图片；返回 Blob，页面离开时释放预览 URL。 */
export function getFeedbackImage(id, signal) {
  return http.get(`/api/feedback/attachments/${id}`, { responseType: 'blob', signal })
}
