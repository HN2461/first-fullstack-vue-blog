import { formatMoney } from './ledgerChartOptions'

function changeArrow(rate) {
  return rate > 0 ? '↑' : rate < 0 ? '↓' : '→'
}

function changeClass(rate, invertForExpense = false) {
  if (rate === 0) return 'change-neutral'
  const positive = rate > 0
  if (invertForExpense) return positive ? 'change-bad' : 'change-good'
  return positive ? 'change-good' : 'change-bad'
}

function signedMoney(value) {
  if (value === 0) return formatMoney(0)
  return `${value > 0 ? '+' : '-'}${formatMoney(Math.abs(value))}`
}

/**
 * 构建账本指标卡片的上期对比文案和状态。
 * @param {'income'|'expense'|'balance'} key 指标类型。
 * @param {string} label 指标中文名称。
 * @param {number} current 本期金额。
 * @param {object|null} previousPeriod 上期汇总和变化数据。
 * @returns {object|null} 卡片展示配置；无上期时返回 null。
 */
export function buildMetricComparison(key, label, current, previousPeriod) {
  if (!previousPeriod) return null

  const currentValue = Number(current) || 0
  const previous = Number(previousPeriod[key]) || 0
  const amount = Number(previousPeriod.changeAmount?.[key] ?? currentValue - previous)
  const tip = `上期${label}：${formatMoney(previous)}`

  if (key === 'balance') {
    if (amount === 0) return { arrow: '→', text: '与上期持平', className: 'change-neutral', tip }
    if (previous < 0 && currentValue >= 0) {
      return { arrow: '↑', text: `由负转正 · ${signedMoney(amount)}`, className: 'change-good', tip }
    }
    if (previous >= 0 && currentValue < 0) {
      return { arrow: '↓', text: `由正转负 · ${signedMoney(amount)}`, className: 'change-bad', tip }
    }
    return {
      arrow: amount > 0 ? '↑' : '↓',
      text: `较上期 ${signedMoney(amount)}`,
      className: amount > 0 ? 'change-good' : 'change-bad',
      tip
    }
  }

  const rate = previousPeriod.changeRate?.[key]
  if (rate === null || rate === undefined) {
    if (currentValue === 0) return { arrow: '→', text: '与上期持平', className: 'change-neutral', tip }
    return {
      arrow: '↑',
      text: '本期新增',
      className: key === 'expense' ? 'change-bad' : 'change-good',
      tip
    }
  }

  return {
    arrow: changeArrow(rate),
    text: `${Math.abs(rate)}% vs 上期`,
    className: changeClass(rate, key === 'expense'),
    tip
  }
}
