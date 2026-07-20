import { describe, expect, it } from 'vitest'
import {
  buildPeriodComparison,
  computePreviousRange
} from '../src/modules/ledger/services/ledgerComparison.js'

describe('ledger period comparison', () => {
  it('compares current periods with the matching natural period progress', () => {
    expect(computePreviousRange('2026-07-01', '2026-07-20', 'thisMonth')).toEqual({
      prevFrom: '2026-06-01',
      prevTo: '2026-06-20'
    })
    expect(computePreviousRange('2026-07-01', '2026-07-20', 'thisQuarter')).toEqual({
      prevFrom: '2026-04-01',
      prevTo: '2026-04-20'
    })
    expect(computePreviousRange('2026-01-01', '2026-07-20', 'thisYear')).toEqual({
      prevFrom: '2025-01-01',
      prevTo: '2025-07-20'
    })
  })

  it('compares a complete previous month with the complete month before it', () => {
    expect(computePreviousRange('2026-06-01', '2026-06-30', 'lastMonth')).toEqual({
      prevFrom: '2026-05-01',
      prevTo: '2026-05-31'
    })
  })

  it('clamps comparison dates to shorter months and years', () => {
    expect(computePreviousRange('2026-03-01', '2026-03-31', 'thisMonth')).toEqual({
      prevFrom: '2026-02-01',
      prevTo: '2026-02-28'
    })
    expect(computePreviousRange('2024-01-01', '2024-02-29', 'thisYear')).toEqual({
      prevFrom: '2023-01-01',
      prevTo: '2023-02-28'
    })
  })

  it('keeps adjacent equal-length comparison for custom ranges', () => {
    expect(computePreviousRange('2026-07-10', '2026-07-20', 'custom')).toEqual({
      prevFrom: '2026-06-29',
      prevTo: '2026-07-09'
    })
  })

  it('uses percentage only for non-zero income and expense baselines', () => {
    const comparison = buildPeriodComparison(
      { income: 5648.34, expense: 1965.1, balance: 3683.24 },
      { income: 8558.09, expense: 10917.22, balance: -2359.13 }
    )

    expect(comparison.changeRate).toEqual({ income: -34, expense: -82, balance: null })
    expect(comparison.changeAmount.balance).toBe(6042.37)
    expect(buildPeriodComparison(
      { income: 100, expense: 0, balance: 100 },
      { income: 0, expense: 0, balance: 0 }
    ).changeRate).toEqual({ income: null, expense: null, balance: null })
  })
})
