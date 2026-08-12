export const shareStatusOptions = [
  { value: '', label: '全部' },
  { value: 'active', label: '生效中' },
  { value: 'expired', label: '已过期' },
  { value: 'exhausted', label: '次数用尽' },
  { value: 'revoked', label: '已撤销' }
]

export const shareModeOptions = [
  { value: 'public', label: '直接公开' },
  { value: 'password', label: '提取码访问' }
]

export function getShareStatusMeta(status) {
  return {
    active: { label: '生效中', color: 'success' },
    expired: { label: '已过期', color: 'warning' },
    exhausted: { label: '次数用尽', color: 'gold' },
    revoked: { label: '已撤销', color: 'default' }
  }[status] || { label: status || '未知', color: 'default' }
}

export function formatFileSize(size = 0) {
  const value = Number(size) || 0
  if (value >= 1024 ** 3) return `${(value / 1024 ** 3).toFixed(2)} GB`
  if (value >= 1024 ** 2) return `${(value / 1024 ** 2).toFixed(1)} MB`
  if (value >= 1024) return `${Math.round(value / 1024)} KB`
  return `${value} B`
}

export function formatDate(value) {
  return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '-'
}

export function buildShareUrl(sharePath) {
  return new URL(sharePath, window.location.origin).href
}

export function getAccessLabel(record) {
  return record.maxAccessCount === null
    ? `${record.accessCount} / 不限`
    : `${record.accessCount} / ${record.maxAccessCount}`
}
