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

/** 用于沟通记录的紧凑时间；完整时间由 time 元素的 title 提供，无效时间返回占位。 */
export function feedbackActivityTime(value) {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
}

/** 状态操作的按钮和结果说明保持同一词义；普通用户只提供重开与撤回。 */
export function getFeedbackActionMeta(action) {
  return (
    {
      status: {
        title: '更新处理状态',
        button: '保存处理结果',
        label: '处理说明',
        placeholder: '向提交者说明当前安排、需要补充的信息或处理结果。'
      },
      reopen: { title: '重新打开反馈', button: '重新打开', label: '重新打开的原因', placeholder: '说明仍然存在的问题，管理员会继续跟进。' },
      withdraw: { title: '撤回反馈', button: '确认撤回', label: '撤回原因', placeholder: '说明为什么不再需要处理这条反馈。' }
    }[action] || null
  )
}

/** 产生幂等请求标识；兼容普通 HTTP 开发环境下没有 randomUUID 的浏览器。 */
export function createFeedbackRequestId() {
  if (globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID()
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (char) =>
    (Number(char) ^ (globalThis.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(char) / 4)))).toString(16)
  )
}
