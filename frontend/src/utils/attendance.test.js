import { describe, expect, it } from 'vitest'
import { calculateAttendancePreview, formatAttendanceMinutes, getNormalWorkMinutes } from './attendance'

describe('attendance preview', () => {
  const rule = {
    morningStartTime: '08:30',
    morningEndTime: '12:00',
    afternoonStartTime: '13:30',
    afternoonEndTime: '17:30',
    workdays: [1, 2, 3, 4, 5]
  }

  it('calculates normal and overtime minutes from a total work duration', () => {
    expect(getNormalWorkMinutes(rule)).toBe(450)
    expect(calculateAttendancePreview(9.5, '2026-06-01', rule)).toMatchObject({
      totalMinutes: 570,
      normalMinutes: 450,
      overtimeMinutes: 120,
      configured: true
    })
  })

  it('counts configured non-workday duration as overtime', () => {
    expect(calculateAttendancePreview(8, '2026-06-06', rule)).toMatchObject({
      normalMinutes: 0,
      overtimeMinutes: 480,
      isWorkday: false
    })
  })

  it('formats minutes without decimal-hour ambiguity', () => {
    expect(formatAttendanceMinutes(570)).toBe('9 小时 30 分钟')
    expect(formatAttendanceMinutes(120)).toBe('2 小时')
  })
})
