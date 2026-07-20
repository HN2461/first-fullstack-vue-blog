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

function formatRange(range = []) {
  const [from, to] = range
  if (!from || !to) return '未限定日期'
  return `${from} 至 ${to}`
}

/**
 * 构建账本指标卡片的上期对比文案和状态。
 * @param {'income'|'expense'|'balance'} key 指标类型。
 * @param {string} label 指标中文名称。
 * @param {number} current 本期金额。
 * @param {object|null} previousPeriod 上期汇总和变化数据。
 * @param {string[]} currentRange 本期开始和结束日期。
 * @returns {object|null} 卡片展示配置；无上期时返回 null。
 */
export function buildMetricComparison(key, label, current, previousPeriod, currentRange = []) {
  if (!previousPeriod) return null

  const currentValue = Number(current) || 0
  const previous = Number(previousPeriod[key]) || 0
  const amount = Number(previousPeriod.changeAmount?.[key] ?? currentValue - previous)
  const currentRangeText = formatRange(currentRange)
  const previousRangeText = formatRange([previousPeriod.from, previousPeriod.to])
  const formula = key === 'balance'
    ? `本期结余 ${formatMoney(currentValue)} - 上期结余 ${formatMoney(previous)} = ${signedMoney(amount)}`
    : previous === 0
      ? '上期金额为 0，不能计算百分比，因此显示“本期新增”或“与上期持平”。'
      : `(${formatMoney(currentValue)} - ${formatMoney(previous)}) ÷ ${formatMoney(previous)} × 100%`
  const tip = `本期：${currentRangeText}；上期：${previousRangeText}；上期${label}：${formatMoney(previous)}`
  const detail = { currentRangeText, previousRangeText, currentValue, previous, formula }

  if (key === 'balance') {
    if (amount === 0) return { arrow: '→', text: '与上期持平', className: 'change-neutral', tip, detail }
    if (previous < 0 && currentValue >= 0) {
      return { arrow: '↑', text: `由负转正 · ${signedMoney(amount)}`, className: 'change-good', tip, detail }
    }
    if (previous >= 0 && currentValue < 0) {
      return { arrow: '↓', text: `由正转负 · ${signedMoney(amount)}`, className: 'change-bad', tip, detail }
    }
    return {
      arrow: amount > 0 ? '↑' : '↓',
      text: `较上期 ${signedMoney(amount)}`,
      className: amount > 0 ? 'change-good' : 'change-bad',
      tip,
      detail
    }
  }

  const rate = previousPeriod.changeRate?.[key]
  if (rate === null || rate === undefined) {
    if (currentValue === 0) return { arrow: '→', text: '与上期持平', className: 'change-neutral', tip, detail }
    return {
      arrow: '↑',
      text: '本期新增',
      className: key === 'expense' ? 'change-bad' : 'change-good',
      tip,
      detail
    }
  }

  return {
    arrow: changeArrow(rate),
    text: `${Math.abs(rate)}% vs 上期`,
    className: changeClass(rate, key === 'expense'),
    tip,
    detail
  }
}
