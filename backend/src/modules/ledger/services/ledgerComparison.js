const MS_PER_DAY = 86400000

function formatDate(date) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function shiftMonth(date, months) {
  const targetFirstDay = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const targetDay = Math.min(
    date.getDate(),
    daysInMonth(targetFirstDay.getFullYear(), targetFirstDay.getMonth())
  )
  return new Date(targetFirstDay.getFullYear(), targetFirstDay.getMonth(), targetDay)
}

function shiftYear(date, years) {
  const targetYear = date.getFullYear() + years
  const targetDay = Math.min(date.getDate(), daysInMonth(targetYear, date.getMonth()))
  return new Date(targetYear, date.getMonth(), targetDay)
}

function calendarDayNumber(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY
}

/**
 * 根据当前筛选周期计算自然上期。
 * @param {Date|string} from 当前周期开始日期。
 * @param {Date|string} to 当前周期结束日期。
 * @param {'thisMonth'|'lastMonth'|'thisQuarter'|'thisYear'|'custom'|'all'} period 快捷周期类型。
 * @returns {{ prevFrom: string|null, prevTo: string|null }} 上期日期范围；全部或缺少起始日期时返回空范围。
 */
export function computePreviousRange(from, to, period = 'custom') {
  if (period === 'all' || (!from && !to)) return { prevFrom: null, prevTo: null }

  const start = from ? new Date(from) : null
  const end = to ? new Date(to) : new Date()
  if (!start || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { prevFrom: null, prevTo: null }
  }

  let prevFrom
  let prevTo

  if (period === 'thisMonth') {
    prevFrom = shiftMonth(start, -1)
    prevTo = shiftMonth(end, -1)
  } else if (period === 'lastMonth') {
    prevFrom = new Date(start.getFullYear(), start.getMonth() - 1, 1)
    prevTo = new Date(start.getFullYear(), start.getMonth(), 0)
  } else if (period === 'thisQuarter') {
    prevFrom = shiftMonth(start, -3)
    prevTo = shiftMonth(end, -3)
  } else if (period === 'thisYear') {
    prevFrom = shiftYear(start, -1)
    prevTo = shiftYear(end, -1)
  } else {
    const days = Math.max(1, calendarDayNumber(end) - calendarDayNumber(start) + 1)
    prevTo = new Date(start.getFullYear(), start.getMonth(), start.getDate() - 1)
    prevFrom = new Date(prevTo.getFullYear(), prevTo.getMonth(), prevTo.getDate() - days + 1)
  }

  return { prevFrom: formatDate(prevFrom), prevTo: formatDate(prevTo) }
}

function changeRate(current, previous) {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

function changeAmount(current, previous) {
  return Math.round((current - previous) * 100) / 100
}

/**
 * 生成上期对比数据。
 * @param {{ income: number, expense: number, balance: number }} current 本期汇总。
 * @param {{ income: number, expense: number, balance: number }} previous 上期汇总。
 * @returns {{ changeRate: object, changeAmount: object }} 收支环比和各指标金额变化；上期为零及结余不返回百分比。
 */
export function buildPeriodComparison(current, previous) {
  return {
    changeRate: {
      income: changeRate(current.income, previous.income),
      expense: changeRate(current.expense, previous.expense),
      // 结余可能跨越正负数，百分比会反转业务含义，因此只提供金额变化。
      balance: null
    },
    changeAmount: {
      income: changeAmount(current.income, previous.income),
      expense: changeAmount(current.expense, previous.expense),
      balance: changeAmount(current.balance, previous.balance)
    }
  }
}
