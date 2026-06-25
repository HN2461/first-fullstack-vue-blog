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
 *
 * 维度：
 * 1. 星期消费规律（按星期几分组，用范围内实际天数算日均）
 * 2. 工作日 vs 周末（按有记录的天数算日均）
 * 3. 最近 7 天 vs 前 7 天环比
 * 4. 餐饮分析（用有餐饮记录的天数算日均）
 * 5. 消费最高日
 * 6. Top 3 消费分类
 * 7. 单笔最大消费
 * 8. 日均消费
 * 9. 记账连续性（最长连续记账天数）
 * 10. 消费波动（日支出标准差）
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

  const empty = {
    from, to, insights: [], weekdayStats: [], recentComparison: null,
    topCategories: [], largestEntry: null, dailyAvg: 0, longestStreak: 0, expenseStdDev: 0
  }
  if (!entries.length) return empty

  const moneyText = (value) => Number(value || 0).toFixed(2).replace(/\.00$/, '')

  // ─── 基础数据 ────────────────────────────────────────────
  const expenseEntries = entries.filter((e) => e.type === 'expense')
  const totalExpense = expenseEntries.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  if (!expenseEntries.length) return { ...empty, totalExpense: 0 }

  // 有消费记录的天数集合（用于日均等计算）
  const expenseDaySet = new Set()
  for (const e of expenseEntries) expenseDaySet.add(formatDay(e.occurredAt))

  // ─── 1. 星期消费规律 ──────────────────────────────────────
  // 修复：用范围内该星期几实际出现的天数算日均，而非笔数
  const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekdayMap = new Map()
  for (const name of weekdayNames) weekdayMap.set(name, { expense: 0, count: 0 })
  for (const entry of expenseEntries) {
    const day = new Date(entry.occurredAt).getDay()
    const stat = weekdayMap.get(weekdayNames[day])
    stat.expense += Number(entry.amount) || 0
    stat.count += 1
  }
  // 计算 from~to 范围内每个星期几出现的天数
  const weekdayDaysCount = [0, 0, 0, 0, 0, 0, 0]
  const fromDate = new Date(from)
  const toDate = new Date(to)
  for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
    weekdayDaysCount[d.getDay()]++
  }
  const weekdayStats = weekdayNames.map((name, idx) => {
    const stat = weekdayMap.get(name)
    const daysInRange = weekdayDaysCount[idx] || 1
    return {
      name,
      expense: stat.expense,
      count: stat.count,
      daysInRange,
      avg: Math.round(stat.expense / daysInRange)
    }
  })

  // ─── 2. 工作日 vs 周末 ────────────────────────────────────
  let workdayExpense = 0, weekendExpense = 0
  for (const entry of expenseEntries) {
    const day = new Date(entry.occurredAt).getDay()
    const amount = Number(entry.amount) || 0
    if (day >= 1 && day <= 5) workdayExpense += amount
    else weekendExpense += amount
  }
  const workdayDays = new Set()
  const weekendDays = new Set()
  for (const entry of entries) {
    const d = formatDay(entry.occurredAt)
    const day = new Date(entry.occurredAt).getDay()
    if (day >= 1 && day <= 5) workdayDays.add(d)
    else weekendDays.add(d)
  }

  // ─── 3. 最近 7 天 vs 前 7 天 ─────────────────────────────
  const msPerDay = 86400000
  const endDate = new Date(to)
  const recent7Start = new Date(endDate.getTime() - 6 * msPerDay)
  const prev7End = new Date(recent7Start.getTime() - msPerDay)
  const prev7Start = new Date(prev7End.getTime() - 6 * msPerDay)
  let recent7Expense = 0, prev7Expense = 0
  for (const entry of expenseEntries) {
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

  // ─── 4. 餐饮分析 ──────────────────────────────────────────
  // 修复：用有餐饮记录的天数算日均
  const mealCategories = new Set(['早餐', '午餐', '晚餐'])
  let mealExpense = 0
  const mealDaySet = new Set()
  for (const entry of expenseEntries) {
    const name = entry.categoryId?.name || entry.categoryNameSnapshot
    if (mealCategories.has(name)) {
      mealExpense += Number(entry.amount) || 0
      mealDaySet.add(formatDay(entry.occurredAt))
    }
  }
  const mealDays = mealDaySet.size || 1

  // ─── 5. 消费最高日 ────────────────────────────────────────
  const dailyMap = new Map()
  for (const entry of expenseEntries) {
    const d = formatDay(entry.occurredAt)
    dailyMap.set(d, (dailyMap.get(d) || 0) + (Number(entry.amount) || 0))
  }
  let maxDay = { date: '', expense: 0 }
  for (const [date, expense] of dailyMap) {
    if (expense > maxDay.expense) maxDay = { date, expense }
  }

  // ─── 6. Top 3 消费分类 ────────────────────────────────────
  const categoryMap = new Map()
  for (const entry of expenseEntries) {
    const name = entry.categoryId?.name || entry.categoryNameSnapshot || '未分类'
    categoryMap.set(name, (categoryMap.get(name) || 0) + (Number(entry.amount) || 0))
  }
  const topCategories = [...categoryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, amount]) => ({ name, amount, percent: Math.round((amount / (totalExpense || 1)) * 100) }))

  // ─── 7. 单笔最大消费 ──────────────────────────────────────
  let largestEntry = null
  for (const entry of expenseEntries) {
    const amount = Number(entry.amount) || 0
    if (!largestEntry || amount > largestEntry.amount) {
      largestEntry = {
        date: formatDay(entry.occurredAt),
        amount,
        categoryName: entry.categoryId?.name || entry.categoryNameSnapshot || '未分类',
        note: entry.note || ''
      }
    }
  }

  // ─── 8. 日均消费 ──────────────────────────────────────────
  const dailyAvg = expenseDaySet.size ? Math.round(totalExpense / expenseDaySet.size) : 0

  // ─── 9. 记账连续性 ────────────────────────────────────────
  // 找最长连续记账天数（包含所有类型记录）
  const allDaySet = new Set()
  for (const entry of entries) allDaySet.add(formatDay(entry.occurredAt))
  const sortedDays = [...allDaySet].sort()
  let longestStreak = 0, currentStreak = 0, prevDay = null
  for (const day of sortedDays) {
    if (prevDay) {
      const diff = (new Date(day) - new Date(prevDay)) / msPerDay
      currentStreak = diff === 1 ? currentStreak + 1 : 1
    } else {
      currentStreak = 1
    }
    if (currentStreak > longestStreak) longestStreak = currentStreak
    prevDay = day
  }

  // ─── 10. 消费波动（日支出标准差）──────────────────────────
  const dailyValues = [...dailyMap.values()]
  const dailyMean = dailyValues.length ? totalExpense / dailyValues.length : 0
  const variance = dailyValues.length
    ? dailyValues.reduce((s, v) => s + (v - dailyMean) ** 2, 0) / dailyValues.length
    : 0
  const expenseStdDev = Math.round(Math.sqrt(variance) * 100) / 100

  // ─── 生成文本洞察 ─────────────────────────────────────────
  // priority: 1=趋势/异常 2=核心统计 3=辅助信息
  const insights = []

  // 消费趋势（priority 1）
  if (prev7Expense > 0) {
    const dir = recent7Expense > prev7Expense ? '↑' : recent7Expense < prev7Expense ? '↓' : '→'
    const pct = Math.abs(recentComparison.changeRate)
    insights.push({
      icon: '📈',
      text: `最近 7 天消费 ${dir}${pct}%（¥${moneyText(recent7Expense)} vs 前 7 天 ¥${moneyText(prev7Expense)}）`,
      priority: 1,
      type: 'trend',
      recent7: recent7Expense,
      previous7: prev7Expense,
      changeRate: recentComparison.changeRate
    })
  }

  // 日均消费（priority 1）
  if (dailyAvg > 0) {
    insights.push({ icon: '📆', text: `日均消费 ¥${moneyText(dailyAvg)}`, priority: 1, type: 'dailyAvg', value: dailyAvg })
  }

  // Top 3 分类（priority 2）
  if (topCategories.length) {
    const text = topCategories.map((c) => `${c.name} ¥${moneyText(c.amount)}`).join('，')
    insights.push({ icon: '🏷️', text: `消费 Top 3：${text}`, priority: 2, type: 'topCategories', topCategories })
  }

  // 消费规律 - 星期（priority 2）
  const busiestWeekday = weekdayStats.reduce((max, item) => item.avg > max.avg ? item : max, weekdayStats[0])
  if (busiestWeekday.avg > 0) {
    insights.push({ icon: '📅', text: `你在${busiestWeekday.name}消费最多，日均 ¥${moneyText(busiestWeekday.avg)}`, priority: 2, type: 'weekday' })
  }

  // 工作日 vs 周末（priority 2）
  const workdayAvg = workdayDays.size ? Math.round(workdayExpense / workdayDays.size) : 0
  const weekendAvg = weekendDays.size ? Math.round(weekendExpense / weekendDays.size) : 0
  if (workdayAvg && weekendAvg) {
    const higher = weekendAvg > workdayAvg ? '周末' : '工作日'
    const diff = Math.abs(weekendAvg - workdayAvg)
    insights.push({ icon: '📊', text: `${higher}消费更高，日均多花 ¥${moneyText(diff)}（工作日 ¥${moneyText(workdayAvg)}，周末 ¥${moneyText(weekendAvg)}）`, priority: 2, type: 'workdayWeekend' })
  }

  // 餐饮分析（priority 2）
  if (mealExpense > 0) {
    insights.push({ icon: '🍜', text: `餐饮支出 ¥${moneyText(mealExpense)}，日均 ¥${moneyText(mealExpense / mealDays)}，占总支出 ${Math.round((mealExpense / (totalExpense || 1)) * 100)}%`, priority: 2, type: 'meal' })
  }

  // 消费最高日（priority 3）
  if (maxDay.date) {
    insights.push({ icon: '🔥', text: `${maxDay.date} 消费最高，共 ¥${moneyText(maxDay.expense)}`, priority: 3, type: 'maxDay' })
  }

  // 单笔最大消费（priority 3）
  if (largestEntry) {
    const noteText = largestEntry.note ? ` — ${largestEntry.note}` : ''
    insights.push({ icon: '💎', text: `单笔最大：${largestEntry.date} ${largestEntry.categoryName} ¥${moneyText(largestEntry.amount)}${noteText}`, priority: 3, type: 'largestEntry', largestEntry })
  }

  // 记账连续性（priority 3）
  if (longestStreak > 1) {
    insights.push({ icon: '🔥', text: `最长连续记账 ${longestStreak} 天`, priority: 3, type: 'streak' })
  }

  // 消费波动（priority 3）
  if (dailyValues.length >= 3) {
    const level = expenseStdDev <= dailyMean * 0.3 ? '较稳定' : expenseStdDev <= dailyMean * 0.6 ? '有波动' : '波动较大'
    insights.push({ icon: '📊', text: `日消费波动 ¥${moneyText(expenseStdDev)}（${level}）`, priority: 3, type: 'volatility', stdDev: expenseStdDev })
  }

  // 按 priority 排序
  insights.sort((a, b) => a.priority - b.priority)

  return {
    from,
    to,
    totalExpense,
    mealExpense,
    mealDays,
    mealRatio: totalExpense ? Math.round((mealExpense / totalExpense) * 100) : 0,
    weekdayStats,
    recentComparison,
    maxDay,
    topCategories,
    largestEntry,
    dailyAvg,
    longestStreak,
    expenseStdDev,
    insights
  }
}
