import { describe, expect, it } from 'vitest'
import { formatMomentDate, formatMomentDateParts, scopeLabel } from './ledgerMomentUtils'

describe('ledger moment date formatting', () => {
  it('formats a life-stage record as an inclusive date range', () => {
    const record = {
      scope: 'range',
      occurredAt: new Date(2026, 8, 2),
      endedAt: new Date(2026, 8, 9)
    }

    expect(scopeLabel(record.scope)).toBe('时间段')
    expect(formatMomentDate(record)).toBe('2026-09-02 至 2026-09-09')
    expect(formatMomentDateParts(record)).toMatchObject({
      primary: '09/02',
      year: '2026',
      weekday: '至 09/09'
    })
  })

  it('does not render a fake 1970 end date for incomplete historical data', () => {
    const record = {
      scope: 'range',
      occurredAt: new Date(2026, 8, 2),
      endedAt: null
    }

    expect(formatMomentDate(record)).toBe('2026-09-02')
    expect(formatMomentDateParts(record).weekday).toBe('至 -')
  })
})
