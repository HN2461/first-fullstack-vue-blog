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
      const category = categoryMap.get(categoryName) || {
        categoryId: entry.categoryId?._id?.toString?.() || entry.categoryId?.toString?.(),
        name: categoryName,
        type: entry.type,
        color: entry.categoryId?.color || '#1677ff',
        amount: 0
      }
      category.amount += amount
      categoryMap.set(categoryName, category)
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

  return {
    book: book.toSafeJSON(),
    overview,
    byCategory: Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount),
    byDay: days,
    byMonth: Array.from(monthMap.values()),
    byYear: Array.from(yearMap.values()),
    trend: Array.from(trendMap.values()),
    groupBy,
    mealTrend: days.map((item) => ({ date: item.date, amount: item.mealExpense })),
    calendar: days.map((item) => [item.date, item.expense])
  }
}
