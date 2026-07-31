export const MOMENT_SCOPE_OPTIONS = [
  { label: '全部范围', value: '' },
  { label: '日记录', value: 'day' },
  { label: '月记录', value: 'month' },
  { label: '年记录', value: 'year' }
]

export function scopeLabel(scope) {
  return MOMENT_SCOPE_OPTIONS.find((item) => item.value === scope)?.label || '日记录'
}

export function formatMomentDate(record, separator = '-') {
  if (!record?.occurredAt) return '-'
  const date = new Date(record.occurredAt)
  if (Number.isNaN(date.getTime())) return '-'
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  if (record.scope === 'year') return `${year}`
  if (record.scope === 'month') return [year, month].join(separator)
  return [year, month, day].join(separator)
}

export function formatMomentDateParts(record) {
  const date = new Date(record?.occurredAt)
  if (Number.isNaN(date.getTime())) {
    return { primary: '-', year: '', weekday: '' }
  }
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const primary = record.scope === 'year'
    ? String(date.getFullYear())
    : record.scope === 'month' ? month : `${month}/${day}`
  return {
    primary,
    year: record.scope === 'year' ? '' : String(date.getFullYear()),
    weekday: record.scope === 'day'
      ? new Intl.DateTimeFormat('zh-CN', { weekday: 'short' }).format(date)
      : scopeLabel(record.scope)
  }
}

export function momentCategoryText(record) {
  return record?.category?.name || record?.categoryText || ''
}
