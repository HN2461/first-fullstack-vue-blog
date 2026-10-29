const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/

export const DEFAULT_WORKDAYS = Object.freeze([1, 2, 3, 4, 5])
export const DEFAULT_WEEKLY_OVERTIME_TARGET_MINUTES = 7 * 60

function uniqueSortedDays(value) {
  if (!Array.isArray(value)) return [...DEFAULT_WORKDAYS]
  return [...new Set(value.map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))].sort((a, b) => a - b)
}

export function isAttendanceTime(value) {
  return value === '' || TIME_PATTERN.test(String(value || ''))
}

export function timeToMinutes(value) {
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

export function normalizeAttendanceRule(input = {}, legacy = {}) {
  const target = Number(input.weeklyOvertimeTargetMinutes)
  const workdays = uniqueSortedDays(input.workdays)
  return {
    morningStartTime: input.morningStartTime || legacy.workStartTime || '',
    morningEndTime: input.morningEndTime || '',
    lunchBreakStartTime: input.lunchBreakStartTime || '',
    lunchBreakEndTime: input.lunchBreakEndTime || '',
    afternoonStartTime: input.afternoonStartTime || '',
    afternoonEndTime: input.afternoonEndTime || legacy.workEndTime || '',
    eveningBreakStartTime: input.eveningBreakStartTime || '',
    eveningBreakEndTime: input.eveningBreakEndTime || '',
    overtimeStartTime: input.overtimeStartTime || input.eveningBreakEndTime || input.afternoonEndTime || legacy.workEndTime || '',
    weeklyOvertimeTargetMinutes: Number.isInteger(target) && target >= 0 ? target : DEFAULT_WEEKLY_OVERTIME_TARGET_MINUTES,
    workdays
  }
}

export function getNormalWorkIntervals(rule = {}, legacy = {}) {
  const normalized = normalizeAttendanceRule(rule, legacy)
  const intervals = [
    [normalized.morningStartTime, normalized.morningEndTime],
    [normalized.afternoonStartTime, normalized.afternoonEndTime]
  ]
    .filter(([start, end]) => timeToMinutes(start) !== null && timeToMinutes(end) !== null)
    .map(([start, end]) => ({ start, end, minutes: rangeMinutes(start, end) }))
    .filter((item) => item.minutes > 0)

  if (intervals.length) return intervals

  if (timeToMinutes(legacy.workStartTime) !== null && timeToMinutes(legacy.workEndTime) !== null) {
    const minutes = rangeMinutes(legacy.workStartTime, legacy.workEndTime)
    return minutes > 0 ? [{ start: legacy.workStartTime, end: legacy.workEndTime, minutes }] : []
  }

  return []
}

export function isAttendanceRuleConfigured(rule = {}, legacy = {}) {
  return getNormalWorkIntervals(rule, legacy).length > 0
}

export function getNormalWorkMinutes(rule = {}, legacy = {}) {
  return getNormalWorkIntervals(rule, legacy).reduce((total, item) => total + item.minutes, 0)
}

export function calculateAttendance(workHours, workDate, rule = {}, legacy = {}) {
  const totalMinutes = Math.max(0, Math.round(Number(workHours ?? 0) * 60))
  const normalized = normalizeAttendanceRule(rule, legacy)
  const configured = isAttendanceRuleConfigured(normalized, legacy)
  const weekday = /^\d{4}-\d{2}-\d{2}$/.test(String(workDate || ''))
    ? new Date(`${workDate}T00:00:00.000Z`).getUTCDay()
    : null
  const isWorkday = weekday === null || normalized.workdays.includes(weekday)
  const expectedNormalMinutes = getNormalWorkMinutes(normalized, legacy)
  const normalMinutes = configured && isWorkday ? Math.min(totalMinutes, expectedNormalMinutes) : 0
  const overtimeMinutes = configured && isWorkday ? Math.max(totalMinutes - expectedNormalMinutes, 0) : (configured ? totalMinutes : 0)

  return {
    totalMinutes,
    normalMinutes,
    overtimeMinutes,
    expectedNormalMinutes,
    targetMinutes: normalized.weeklyOvertimeTargetMinutes,
    isWorkday,
    ruleConfigured: configured,
    source: configured ? 'rule_inferred' : 'total_only'
  }
}

export function formatAttendanceMinutes(value) {
  const minutes = Math.max(0, Math.round(Number(value) || 0))
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (!hours) return `${remainder} 分钟`
  if (!remainder) return `${hours} 小时`
  return `${hours} 小时 ${remainder} 分钟`
}

export function validateAttendanceRule(rule = {}) {
  const normalized = normalizeAttendanceRule(rule)
  const pairs = [
    ['上午工作', normalized.morningStartTime, normalized.morningEndTime],
    ['中午休息', normalized.lunchBreakStartTime, normalized.lunchBreakEndTime],
    ['下午工作', normalized.afternoonStartTime, normalized.afternoonEndTime],
    ['晚间休息', normalized.eveningBreakStartTime, normalized.eveningBreakEndTime]
  ]
  for (const [label, start, end] of pairs) {
    if (start && end && rangeMinutes(start, end) <= 0) {
      const error = new Error(`${label}结束时间必须晚于开始时间`)
      error.statusCode = 400
      error.code = 'ATTENDANCE_RULE_TIME_ORDER_INVALID'
      throw error
    }
  }

  const morningEnd = timeToMinutes(normalized.morningEndTime)
  const lunchStart = timeToMinutes(normalized.lunchBreakStartTime)
  const lunchEnd = timeToMinutes(normalized.lunchBreakEndTime)
  const afternoonStart = timeToMinutes(normalized.afternoonStartTime)
  if ([morningEnd, lunchStart, lunchEnd, afternoonStart].every((value) => value !== null) && !(morningEnd <= lunchStart && lunchStart < lunchEnd && lunchEnd <= afternoonStart)) {
    const error = new Error('中午休息时间必须位于上午工作和下午工作之间')
    error.statusCode = 400
    error.code = 'ATTENDANCE_RULE_BREAK_INVALID'
    throw error
  }

  const overtimeStart = timeToMinutes(normalized.overtimeStartTime)
  const afternoonEnd = timeToMinutes(normalized.afternoonEndTime)
  const eveningBreakStart = timeToMinutes(normalized.eveningBreakStartTime)
  const eveningBreakEnd = timeToMinutes(normalized.eveningBreakEndTime)
  if ([afternoonEnd, eveningBreakStart, eveningBreakEnd, overtimeStart].every((value) => value !== null) && !(afternoonEnd <= eveningBreakStart && eveningBreakStart < eveningBreakEnd && eveningBreakEnd <= overtimeStart)) {
    const error = new Error('晚间休息时间必须位于下午工作结束和加班开始之间')
    error.statusCode = 400
    error.code = 'ATTENDANCE_RULE_BREAK_INVALID'
    throw error
  }
  if (overtimeStart !== null && afternoonEnd !== null && overtimeStart < afternoonEnd) {
    const error = new Error('加班开始时间不能早于下午正常工作结束时间')
    error.statusCode = 400
    error.code = 'ATTENDANCE_RULE_OVERTIME_START_INVALID'
    throw error
  }
  if (overtimeStart !== null && eveningBreakEnd !== null && overtimeStart < eveningBreakEnd) {
    const error = new Error('加班开始时间不能早于晚间休息结束时间')
    error.statusCode = 400
    error.code = 'ATTENDANCE_RULE_OVERTIME_START_INVALID'
    throw error
  }
}
