import { describe, expect, it } from 'vitest'
import { getFestivalHistory, getFestivalSchedule } from './festivalCalendar'

describe('festival calendar birthday schedule', () => {
  it('keeps a later birthday when the full upcoming schedule is requested', () => {
    const schedule = getFestivalSchedule('2026-07-19', Number.POSITIVE_INFINITY, {
      birthday: '2002-10-13',
      birthdayCalendar: 'lunar'
    })

    expect(schedule.some((item) => item.key === 'birthday-lunar')).toBe(true)
  })

  it('keeps an earlier birthday when the full history is requested', () => {
    const history = getFestivalHistory('2026-07-19', Number.POSITIVE_INFINITY, {
      birthday: '2002-01-01',
      birthdayCalendar: 'solar'
    })

    expect(history.some((item) => item.key === 'birthday-solar')).toBe(true)
  })
})
