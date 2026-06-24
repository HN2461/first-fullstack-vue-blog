/**
 * 账本模块公共工具函数
 * 统一日期/时间格式化、金额颜色等，避免各组件重复实现
 */

export function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('zh-CN')
}

export function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 预设分类色板（企业级常用色）
 */
export const COLOR_PRESETS = [
  '#22c55e', '#16a34a', '#0ea5e9', '#0891b2', '#2563eb',
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#14b8a6',
  '#64748b', '#78716c', '#1677ff', '#faad14', '#ff4d4f'
]

/**
 * 快速日期范围选项
 */
export const QUICK_RANGE_OPTIONS = [
  { label: '最近 7 天', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '最近 30 天', value: 'last30' },
  { label: '最近 3 个月', value: 'last3m' },
  { label: '本年', value: 'year' },
  { label: '全部', value: 'all' },
  { label: '自定义', value: 'custom' }
]

/**
 * 根据快速范围值计算日期区间
 */
export function getQuickRangeDates(value) {
  const now = new Date()
  const pad = (num) => String(num).padStart(2, '0')
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  switch (value) {
    case 'week': {
      const start = new Date(now)
      start.setDate(start.getDate() - 6)
      return [fmt(start), fmt(now)]
    }
    case 'month':
      return [fmt(new Date(now.getFullYear(), now.getMonth(), 1)), fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0))]
    case 'last30': {
      const start = new Date(now)
      start.setDate(start.getDate() - 29)
      return [fmt(start), fmt(now)]
    }
    case 'last3m': {
      const start = new Date(now)
      start.setMonth(start.getMonth() - 2)
      start.setDate(1)
      return [fmt(start), fmt(now)]
    }
    case 'year':
      return [fmt(new Date(now.getFullYear(), 0, 1)), fmt(new Date(now.getFullYear(), 11, 31))]
    case 'all':
      return ['', '']
    default:
      return null
  }
}
