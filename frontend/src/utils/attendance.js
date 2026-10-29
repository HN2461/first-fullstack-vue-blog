const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/

function timeToMinutes(value) {
  if (!TIME_PATTERN.test(String(value || ''))) return null
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function rangeMinutes(start, end) {
  const startMinutes = timeToMinutes(start)
  const endMinutes = timeToMinutes(end)
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) return 0
  return endMinutes - startMinutes
}

export function getNormalWorkMinutes(rule = {}, legacy = {}) {
  const intervals = [
    [rule.morningStartTime, rule.morningEndTime],
    [rule.afternoonStartTime, rule.afternoonEndTime]
  ]
    .map(([start, end]) => rangeMinutes(start, end))
    .filter(Boolean)

  if (intervals.length) return intervals.reduce((total, minutes) => total + minutes, 0)
  return rangeMinutes(legacy.workStartTime, legacy.workEndTime)
}

export function isAttendanceRuleConfigured(rule = {}, legacy = {}) {
  return getNormalWorkMinutes(rule, legacy) > 0
}

export function calculateAttendancePreview(workHours, workDate, rule = {}, legacy = {}) {
  const totalMinutes = Math.max(0, Math.round(Number(workHours ?? 0) * 60))
  const expectedNormalMinutes = getNormalWorkMinutes(rule, legacy)
  const configured = expectedNormalMinutes > 0
  const weekday = /^\d{4}-\d{2}-\d{2}$/.test(String(workDate || ''))
    ? new Date(`${workDate}T00:00:00.000Z`).getUTCDay()
    : null
  const workdays = Array.isArray(rule.workdays) && rule.workdays.length ? rule.workdays : [1, 2, 3, 4, 5]
  const isWorkday = weekday === null || workdays.includes(weekday)
  const normalMinutes = configured && isWorkday ? Math.min(totalMinutes, expectedNormalMinutes) : 0
  const overtimeMinutes = configured && isWorkday ? Math.max(totalMinutes - expectedNormalMinutes, 0) : (configured ? totalMinutes : 0)
  return { totalMinutes, expectedNormalMinutes, normalMinutes, overtimeMinutes, configured, isWorkday }
}

export function formatAttendanceMinutes(value) {
  const minutes = Math.max(0, Math.round(Number(value) || 0))
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (!hours) return `${remainder} 分钟`
  if (!remainder) return `${hours} 小时`
  return `${hours} 小时 ${remainder} 分钟`
}
