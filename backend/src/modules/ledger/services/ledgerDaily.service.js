import { LedgerCategory } from '#modules/ledger/models/LedgerCategory.js'
import { LedgerEntry } from '#modules/ledger/models/LedgerEntry.js'
import { buildEntryQuery, formatDay } from './ledger.utils.js'
import { ensureDefaultBook, findOwnedBook } from './ledgerBook.service.js'

/**
 * 查询账本日表格所需的分类、每日汇总和流水明细。
 * @param {string} userId 当前用户 id。
 * @param {object} options 账本、日期及分类筛选条件。
 * @returns {Promise<object>} 当前账本、分类和按日聚合结果；无流水时返回空 items。
 */
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
