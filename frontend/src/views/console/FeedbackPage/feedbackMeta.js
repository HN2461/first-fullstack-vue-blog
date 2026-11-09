export const feedbackTypes = [
  { value: 'bug', label: '问题 / Bug' },
  { value: 'suggestion', label: '功能建议' },
  { value: 'question', label: '使用咨询 / 其他' }
]

export const feedbackStatuses = [
  { value: 'pending', label: '待处理', color: 'default' },
  { value: 'waiting', label: '待补充', color: 'warning' },
  { value: 'accepted', label: '已采纳', color: 'cyan' },
  { value: 'processing', label: '处理中', color: 'processing' },
  { value: 'completed', label: '已完成', color: 'success' },
  { value: 'closed', label: '已关闭', color: 'default' }
]

export const getFeedbackStatus = (status) => feedbackStatuses.find((item) => item.value === status) || feedbackStatuses[0]
export const getFeedbackType = (type) => feedbackTypes.find((item) => item.value === type)?.label || type
export const feedbackTime = (value) => (value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '-')

/** 产生幂等请求标识；兼容普通 HTTP 开发环境下没有 randomUUID 的浏览器。 */
export function createFeedbackRequestId() {
  if (globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID()
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (char) =>
    (Number(char) ^ (globalThis.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(char) / 4)))).toString(16)
  )
}
