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
})
