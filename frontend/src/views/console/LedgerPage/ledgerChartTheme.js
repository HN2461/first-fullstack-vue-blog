import { formatMoney } from './ledgerChartOptions'

export const INCOME_COLOR = '#22c55e'
export const EXPENSE_COLOR = '#ef4444'
export const BALANCE_COLOR = '#3b82f6'

export const METRIC_META = {
  income: { label: '收入', color: INCOME_COLOR },
  expense: { label: '支出', color: EXPENSE_COLOR },
  balance: { label: '结余', color: BALANCE_COLOR }
}

export function getMetricMeta(metric) {
  return METRIC_META[metric] || METRIC_META.expense
}

export function formatShortMoney(value) {
  const num = Number(value) || 0
  if (Math.abs(num) >= 10000) return `${(num / 10000).toFixed(1)}万`
  if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(1)}k`
  return String(Math.round(num))
}

export function axisTextColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--console-text-secondary') || '#667085'
}

export function splitLineColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--console-border') || '#eaecf0'
}

export function surfaceColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--console-surface') || '#fff'
}

export function baseTooltip() {
  return {
    backgroundColor: surfaceColor(),
    borderColor: splitLineColor(),
    textStyle: { color: axisTextColor(), fontSize: 12 }
  }
}

export function moneyLine(name, value) {
  return `${name}　<strong>${formatMoney(value)}</strong>`
}
