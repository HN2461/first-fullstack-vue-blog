const moneyFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  maximumFractionDigits: 2
})

export function formatMoney(value) {
  return moneyFormatter.format(Number(value) || 0)
}
