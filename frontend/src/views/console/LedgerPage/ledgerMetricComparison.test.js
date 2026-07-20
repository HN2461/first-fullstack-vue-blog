import { describe, expect, it } from 'vitest'
import { buildMetricComparison } from './ledgerMetricComparison'

describe('ledger metric comparison', () => {
  it('shows a positive transition when balance changes from deficit to surplus', () => {
    const result = buildMetricComparison('balance', '结余', 3683.24, {
      balance: -2359.13,
      changeAmount: { balance: 6042.37 }
    })

    expect(result).toMatchObject({ arrow: '↑', className: 'change-good' })
    expect(result.text).toContain('由负转正')
    expect(result.text).toContain('6,042.37')
  })

  it('shows a negative transition when balance changes from surplus to deficit', () => {
    const result = buildMetricComparison('balance', '结余', -500, {
      balance: 1000,
      changeAmount: { balance: -1500 }
    })

    expect(result).toMatchObject({ arrow: '↓', className: 'change-bad' })
    expect(result.text).toContain('由正转负')
  })

  it('shows a new-period state instead of a false 100 percent rate', () => {
    const income = buildMetricComparison('income', '收入', 100, {
      income: 0,
      changeRate: { income: null },
      changeAmount: { income: 100 }
    })
    const expense = buildMetricComparison('expense', '支出', 100, {
      expense: 0,
      changeRate: { expense: null },
      changeAmount: { expense: 100 }
    })

    expect(income).toMatchObject({ text: '本期新增', className: 'change-good' })
    expect(expense).toMatchObject({ text: '本期新增', className: 'change-bad' })
  })

  it('keeps expense decreases green and income decreases red', () => {
    const previousPeriod = {
      income: 200,
      expense: 200,
      changeRate: { income: -25, expense: -25 }
    }

    expect(buildMetricComparison('income', '收入', 150, previousPeriod)).toMatchObject({
      arrow: '↓',
      text: '25% vs 上期',
      className: 'change-bad'
    })
    expect(buildMetricComparison('expense', '支出', 150, previousPeriod)).toMatchObject({
      arrow: '↓',
      text: '25% vs 上期',
      className: 'change-good'
    })
  })
})
