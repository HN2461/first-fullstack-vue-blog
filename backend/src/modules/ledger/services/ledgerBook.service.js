import { LedgerBook } from '#modules/ledger/models/LedgerBook.js'
import { LedgerCategory } from '#modules/ledger/models/LedgerCategory.js'
import { createError, slugifyName, toObjectId } from './ledger.utils.js'

const DEFAULT_EXPENSE_CATEGORIES = [
  ['早餐', '#22c55e', 'CoffeeOutlined'],
  ['午餐', '#0ea5e9', 'ShopOutlined'],
  ['晚餐', '#6366f1', 'MoonOutlined'],
  ['杂费', '#f97316', 'AppstoreOutlined'],
  ['电费', '#eab308', 'ThunderboltOutlined'],
  ['房租', '#ef4444', 'HomeOutlined'],
  ['工作所需', '#8b5cf6', 'ToolOutlined']
]

const DEFAULT_INCOME_CATEGORIES = [
  ['工资', '#16a34a', 'WalletOutlined'],
  ['奖金', '#0891b2', 'GiftOutlined'],
  ['其他收入', '#2563eb', 'PlusCircleOutlined']
]

function normalizeBookQuery(userId, options = {}) {
  const query = { userId }
  if (options.status) query.status = options.status
  return query
}

async function findOwnedBook(bookId, userId) {
  const id = toObjectId(bookId, 'LEDGER_BOOK_NOT_FOUND', '账本不存在')
  const book = await LedgerBook.findOne({ _id: id, userId })
  if (!book) {
    throw createError(404, 'LEDGER_BOOK_NOT_FOUND', '账本不存在')
  }
  return book
}

export { findOwnedBook, seedDefaultCategories }

async function seedDefaultCategories(userId, bookId) {
  const existingCount = await LedgerCategory.countDocuments({ userId, bookId })
  if (existingCount > 0) return

  const items = [
    ...DEFAULT_EXPENSE_CATEGORIES.map(([name, color, icon], index) => ({
      name,
      type: 'expense',
      color,
      icon,
      sortOrder: (index + 1) * 10
    })),
    ...DEFAULT_INCOME_CATEGORIES.map(([name, color, icon], index) => ({
      name,
      type: 'income',
      color,
      icon,
      sortOrder: 200 + (index + 1) * 10
    }))
  ]

  await LedgerCategory.insertMany(items.map((item) => ({
    ...item,
    userId,
    bookId,
    code: slugifyName(`${item.type}-${item.name}`),
    aliases: [item.name]
  })))
}

export async function ensureDefaultBook(userId) {
  let book = await LedgerBook.findOne({ userId }).sort({ sortOrder: 1, createdAt: 1 })
  if (!book) {
    book = await LedgerBook.create({
      userId,
      name: '默认账本',
      currency: 'CNY',
      description: '日常收支记录',
      sortOrder: 10
    })
  }
  await seedDefaultCategories(userId, book._id)
  return book
}

export async function listLedgerBooks(userId, options = {}) {
  await ensureDefaultBook(userId)
  const books = await LedgerBook.find(normalizeBookQuery(userId, options)).sort({ sortOrder: 1, createdAt: 1 })
  return books.map((book) => book.toSafeJSON())
}

export async function createLedgerBook(userId, input) {
  const book = await LedgerBook.create({ ...input, userId })
  await seedDefaultCategories(userId, book._id)
  return book.toSafeJSON()
}

export async function updateLedgerBook(userId, id, input) {
  const book = await findOwnedBook(id, userId)
  Object.assign(book, input)
  await book.save()
  return book.toSafeJSON()
}
