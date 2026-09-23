import { describe, expect, it } from 'vitest'
import { normalizeCalendar } from './festivalApi'

describe('festival calendar server data', () => {
  it('normalizes custom broadcast festivals with their configured greeting and scope', () => {
    const calendar = normalizeCalendar({
      today: [],
      upcoming: [{
        name: '网站纪念日',
        date: '2026-06-17',
        type: 'system-broadcast',
        greeting: '愿每一次记录都有回响。',
        effect: 'new-year',
        isMajor: true
      }],
      history: []
    })

    expect(calendar.upcoming[0]).toMatchObject({
      type: 'system-broadcast',
      displaySource: '系统广播纪念日',
      text: '愿每一次记录都有回响。',
      visibilityLabel: '全站公开'
    })
  })

  it('maps legacy project data to the system broadcast category', () => {
    const calendar = normalizeCalendar({
      today: [],
      upcoming: [{ name: '旧项目日期', date: '2026-06-17', type: 'project' }],
      history: []
    })

    expect(calendar.upcoming[0]).toMatchObject({
      type: 'system-broadcast',
      displaySource: '系统广播纪念日'
    })
  })

  it('assigns distinct festive visuals instead of falling back to one fireworks icon', () => {
    const calendar = normalizeCalendar({
      today: [],
      upcoming: [
        { name: '春节', date: '2027-02-06', type: 'legal-holiday', isHoliday: true },
        { name: '中秋节', date: '2027-09-15', type: 'legal-holiday', isHoliday: true },
        { name: '网站首次成功部署纪念日', date: '2027-06-17', type: 'system-broadcast' }
      ],
      history: []
    })

    expect(calendar.upcoming[0].icons).toEqual(['🏮', '🧧', '🎊'])
    expect(calendar.upcoming[1].icons).toEqual(['🥮', '🌕', '🏮'])
    expect(calendar.upcoming[2].icons).toEqual(['🎊', '🎁', '🌟'])
    expect(calendar.upcoming.every((item) => item.icons[0] !== '🎆')).toBe(true)
    expect(calendar.upcoming.every((item) => item.accent !== '#7c3aed')).toBe(true)
  })
})
