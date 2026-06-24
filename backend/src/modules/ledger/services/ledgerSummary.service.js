import { LedgerCategory } from '#modules/ledger/models/LedgerCategory.js'
import { LedgerEntry } from '#modules/ledger/models/LedgerEntry.js'
import { buildEntryQuery, formatDay, formatMonth, formatYear, formatTrendKey } from './ledger.utils.js'
import { ensureDefaultBook, findOwnedBook } from './ledgerBook.service.js'

export async function getLedgerDailyMatrix(userId, options = {}) {
  const book = options.bookId ? await findOwnedBook(options.bookId, userId) : await ensureDefaultBook(userId)
  const [categories, entries] = await Promise.all([
    LedgerCategory.find({ userId, bookId: book._id }).sort({ type: 1, sortOrder: 1, createdAt: 1 }),
    LedgerEntry.find(buildEntryQuery(userId, { ...options, bookId: book._id.toString() }))
      .populate('categoryId')
      .sort({ occurredAt: 1, type: 1 })
  ])

  const dayMap = new Map()
  for (const entry of entries) {
    const dayKey = formatDay(entry.occurredAt)
    const categoryId = entry.categoryId?._id?.toString?.() || entry.categoryId?.toString?.()
    const day = dayMap.get(dayKey) || {
      date: dayKey,
      expense: 0,
      income: 0,
      balance: 0,
      dailyNote: '',
      categoryAmounts: {},
      categoryNotes: {},
      entries: []
    }
    const amount = Number(entry.amount) || 0
    if (entry.type === 'income') day.income += amount
    if (entry.type === 'expense') day.expense += amount
    day.balance = day.income - day.expense
    day.categoryAmounts[categoryId] = (day.categoryAmounts[categoryId] || 0) + amount
    if (entry.note) day.categoryNotes[categoryId] = entry.note
    if (!day.dailyNote && entry.dailyNote) day.dailyNote = entry.dailyNote
    day.entries.push(entry.toSafeJSON())
    dayMap.set(dayKey, day)
  }

  return {
    book: book.toSafeJSON(),
    categories: categories.map((category) => category.toSafeJSON()),
    items: Array.from(dayMap.values())
  }
}

/**
 * 根据当前日期范围计算上一个同等时间段
 * 用于环比（与上个周期对比）
 */
function computePreviousRange(from, to) {
  if (!from && !to) return { prevFrom: null, prevTo: null }
  const msPerDay = 86400000
  const start = from ? new Date(from) : null
  const end = to ? new Date(to) : new Date()
  if (!start) return { prevFrom: null, prevTo: null }
  const days = Math.max(1, Math.ceil((end - start) / msPerDay) + 1)
  const prevTo = new Date(start.getTime() - msPerDay)
  const prevFrom = new Date(prevTo.getTime() - (days - 1) * msPerDay)
  const pad = (n) => String(n).padStart(2, '0')
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return { prevFrom: fmt(prevFrom), prevTo: fmt(prevTo) }
}

export async function getLedgerSummary(userId, options = {}) {
  const book = options.bookId ? await findOwnedBook(options.bookId, userId) : await ensureDefaultBook(userId)
  const query = buildEntryQuery(userId, { ...options, bookId: book._id.toString() })
  const entries = await LedgerEntry.find(query).populate('categoryId').sort({ occurredAt: 1 })
  const groupBy = options.groupBy || 'month'

  const overview = {
    income: 0,
    expense: 0,
    balance: 0,
    averageDailyExpense: 0,
    maxDailyExpense: 0
  }
  const categoryMap = new Map()
  const dayMap = new Map()
  const monthMap = new Map()
  const yearMap = new Map()
  const trendMap = new Map()
  const mealCategories = new Set(['早餐', '午餐', '晚餐'])

  for (const entry of entries) {
    const amount = Number(entry.amount) || 0
    if (entry.type === 'income') overview.income += amount
    if (entry.type === 'expense') overview.expense += amount

    const categoryName = entry.categoryId?.name || entry.categoryNameSnapshot
    const dayKey = formatDay(entry.occurredAt)
    const monthKey = formatMonth(entry.occurredAt)
    const yearKey = formatYear(entry.occurredAt)
    const trendKey = formatTrendKey(entry.occurredAt, groupBy)
    const day = dayMap.get(dayKey) || { date: dayKey, income: 0, expense: 0, mealExpense: 0, balance: 0 }
    const month = monthMap.get(monthKey) || { month: monthKey, income: 0, expense: 0, balance: 0 }
    const year = yearMap.get(yearKey) || { year: yearKey, income: 0, expense: 0, balance: 0 }
    const trend = trendMap.get(trendKey) || { label: trendKey, income: 0, expense: 0, balance: 0 }

    const categoryKey = `${entry.type}:${categoryName}`
    const category = categoryMap.get(categoryKey) || {
      categoryId: entry.categoryId?._id?.toString?.() || entry.categoryId?.toString?.(),
      name: categoryName,
      type: entry.type,
      color: entry.categoryId?.color || '#1677ff',
      amount: 0
    }
    category.amount += amount
    categoryMap.set(categoryKey, category)

    if (entry.type === 'income') {
      day.income += amount
      month.income += amount
      year.income += amount
      trend.income += amount
    } else {
      day.expense += amount
      month.expense += amount
      year.expense += amount
      trend.expense += amount
      if (mealCategories.has(categoryName)) day.mealExpense += amount
    }

    day.balance = day.income - day.expense
    month.balance = month.income - month.expense
    year.balance = year.income - year.expense
    trend.balance = trend.income - trend.expense
    dayMap.set(dayKey, day)
    monthMap.set(monthKey, month)
    yearMap.set(yearKey, year)
    trendMap.set(trendKey, trend)
  }

  overview.balance = overview.income - overview.expense
  const days = Array.from(dayMap.values())
  overview.averageDailyExpense = days.length ? overview.expense / days.length : 0
  overview.maxDailyExpense = days.reduce((max, item) => Math.max(max, item.expense), 0)

  // 分类统计：同时包含收入和支出分类
  const allCategories = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount)
  const expenseCategories = allCategories.filter((item) => item.type === 'expense')
  const incomeCategories = allCategories.filter((item) => item.type === 'income')

  // 环比数据：计算上一个同等时间段的收支
  let previousPeriod = null
  const { prevFrom, prevTo } = computePreviousRange(options.from, options.to)
  if (prevFrom && prevTo) {
    const prevEntries = await LedgerEntry.find(
      buildEntryQuery(userId, { bookId: book._id.toString(), from: prevFrom, to: prevTo })
    )
    let prevIncome = 0
    let prevExpense = 0
    for (const entry of prevEntries) {
      const amount = Number(entry.amount) || 0
      if (entry.type === 'income') prevIncome += amount
      else prevExpense += amount
    }
    const prevBalance = prevIncome - prevExpense
    const rate = (curr, prev) => {
      if (!prev) return curr > 0 ? 100 : 0
      return Math.round(((curr - prev) / prev) * 100)
    }
    previousPeriod = {
      income: prevIncome,
      expense: prevExpense,
      balance: prevBalance,
      changeRate: {
        income: rate(overview.income, prevIncome),
        expense: rate(overview.expense, prevExpense),
        balance: rate(overview.balance, prevBalance)
      }
    }
  }

  return {
    book: book.toSafeJSON(),
    overview,
    previousPeriod,
    byCategory: expenseCategories,
    byIncomeCategory: incomeCategories,
    byDay: days,
    byMonth: Array.from(monthMap.values()),
    byYear: Array.from(yearMap.values()),
    trend: Array.from(trendMap.values()),
    groupBy,
    mealTrend: days.map((item) => ({ date: item.date, amount: item.mealExpense })),
    calendar: days.map((item) => [item.date, item.expense])
  }
}

/**
 * 生活洞察：基于消费数据生成多维度分析
 */
export async function getLedgerInsights(userId, options = {}) {
  const book = options.bookId ? await findOwnedBook(options.bookId, userId) : await ensureDefaultBook(userId)
  const bookId = book._id

  // 默认查最近 30 天
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const to = options.to || fmt(now)
  const from = options.from || (() => {
    const d = new Date(now)
    d.setDate(d.getDate() - 29)
    return fmt(d)
  })()

  const entries = await LedgerEntry.find(
    buildEntryQuery(userId, { ...options, bookId: bookId.toString(), from, to })
  ).populate('categoryId')

  if (!entries.length) {
    return { from, to, insights: [], weekdayStats: [], recentComparison: null }
  }

  // 按星期几分组统计
  const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekdayMap = new Map()
  for (const name of weekdayNames) weekdayMap.set(name, { expense: 0, count: 0 })
  for (const entry of entries) {
    if (entry.type !== 'expense') continue
    const day = new Date(entry.occurredAt).getDay()
    const stat = weekdayMap.get(weekdayNames[day])
    stat.expense += Number(entry.amount) || 0
    stat.count += 1
  }
  const weekdayStats = weekdayNames.map((name) => {
    const stat = weekdayMap.get(name)
    return { name, expense: stat.expense, count: stat.count, avg: stat.count ? Math.round(stat.expense / stat.count) : 0 }
  })

  // 工作日 vs 周末
  let workdayExpense = 0, workdayCount = 0, weekendExpense = 0, weekendCount = 0
  for (const entry of entries) {
    if (entry.type !== 'expense') continue
    const day = new Date(entry.occurredAt).getDay()
    const amount = Number(entry.amount) || 0
    if (day >= 1 && day <= 5) { workdayExpense += amount; workdayCount++ }
    else { weekendExpense += amount; weekendCount++ }
  }
  // 按天数算日均
  const daySet = new Set()
  const workdayDays = new Set()
  const weekendDays = new Set()
  for (const entry of entries) {
    const d = entry.occurredAt.toISOString().slice(0, 10)
    daySet.add(d)
    const day = new Date(entry.occurredAt).getDay()
    if (day >= 1 && day <= 5) workdayDays.add(d)
    else weekendDays.add(d)
  }

  // 最近 7 天 vs 前 7 天
  const msPerDay = 86400000
  const endDate = new Date(to)
  const recent7Start = new Date(endDate.getTime() - 6 * msPerDay)
  const prev7End = new Date(recent7Start.getTime() - msPerDay)
  const prev7Start = new Date(prev7End.getTime() - 6 * msPerDay)
  let recent7Expense = 0, prev7Expense = 0
  for (const entry of entries) {
    if (entry.type !== 'expense') continue
    const d = new Date(entry.occurredAt)
    const amount = Number(entry.amount) || 0
    if (d >= recent7Start && d <= endDate) recent7Expense += amount
    else if (d >= prev7Start && d <= prev7End) prev7Expense += amount
  }
  const recentComparison = {
    recent7: recent7Expense,
    previous7: prev7Expense,
    changeRate: prev7Expense ? Math.round(((recent7Expense - prev7Expense) / prev7Expense) * 100) : (recent7Expense > 0 ? 100 : 0)
  }

  // 餐饮分析
  const mealCategories = new Set(['早餐', '午餐', '晚餐'])
  let mealExpense = 0
  for (const entry of entries) {
    if (entry.type !== 'expense') continue
    const name = entry.categoryId?.name || entry.categoryNameSnapshot
    if (mealCategories.has(name)) mealExpense += Number(entry.amount) || 0
  }
  const totalExpense = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const mealDays = workdayDays.size + weekendDays.size || 1

  // 消费最高的一天
  const dailyMap = new Map()
  for (const entry of entries) {
    if (entry.type !== 'expense') continue
    const d = entry.occurredAt.toISOString().slice(0, 10)
    dailyMap.set(d, (dailyMap.get(d) || 0) + (Number(entry.amount) || 0))
  }
  let maxDay = { date: '', expense: 0 }
  for (const [date, expense] of dailyMap) {
    if (expense > maxDay.expense) maxDay = { date, expense }
  }

  // 生成文本洞察
  const insights = []
  const moneyText = (value) => Number(value || 0).toFixed(2).replace(/\.00$/, '')
  // 消费规律
  const busiestWeekday = weekdayStats.reduce((max, item) => item.avg > max.avg ? item : max, weekdayStats[0])
  if (busiestWeekday.avg > 0) {
    insights.push({ icon: '📅', text: `你在${busiestWeekday.name}消费最多，日均 ¥${moneyText(busiestWeekday.avg)}` })
  }
  // 工作日 vs 周末
  const workdayAvg = workdayDays.size ? Math.round(workdayExpense / workdayDays.size) : 0
  const weekendAvg = weekendDays.size ? Math.round(weekendExpense / weekendDays.size) : 0
  if (workdayAvg && weekendAvg) {
    const higher = weekendAvg > workdayAvg ? '周末' : '工作日'
    const diff = Math.abs(weekendAvg - workdayAvg)
    insights.push({ icon: '📊', text: `${higher}消费更高，日均多花 ¥${moneyText(diff)}（工作日 ¥${moneyText(workdayAvg)}，周末 ¥${moneyText(weekendAvg)}）` })
  }
  // 餐饮分析
  if (mealExpense > 0) {
    insights.push({ icon: '🍜', text: `餐饮支出 ¥${moneyText(mealExpense)}，日均 ¥${moneyText(mealExpense / mealDays)}，占总支出 ${Math.round((mealExpense / (totalExpense || 1)) * 100)}%` })
  }
  // 消费趋势
  if (prev7Expense > 0) {
    const dir = recent7Expense > prev7Expense ? '↑' : recent7Expense < prev7Expense ? '↓' : '→'
    const pct = Math.abs(recentComparison.changeRate)
    insights.push({ icon: '📈', text: `最近 7 天消费 ${dir}${pct}%（¥${moneyText(recent7Expense)} vs 前 7 天 ¥${moneyText(prev7Expense)}）` })
  }
  // 消费最高日
  if (maxDay.date) {
    insights.push({ icon: '🔥', text: `${maxDay.date} 消费最高，共 ¥${moneyText(maxDay.expense)}` })
  }

  return {
    from,
    to,
    totalExpense,
    mealExpense,
    mealRatio: totalExpense ? Math.round((mealExpense / totalExpense) * 100) : 0,
    weekdayStats,
    recentComparison,
    maxDay,
    insights
  }
}
