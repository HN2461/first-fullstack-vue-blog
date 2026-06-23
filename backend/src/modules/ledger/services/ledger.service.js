import crypto from 'node:crypto'
import mongoose from 'mongoose'
import * as XLSX from 'xlsx'
import { LedgerBook } from '#modules/ledger/models/LedgerBook.js'
import { LedgerCategory } from '#modules/ledger/models/LedgerCategory.js'
import { LedgerEntry } from '#modules/ledger/models/LedgerEntry.js'
import { LedgerImportBatch } from '#modules/ledger/models/LedgerImportBatch.js'

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

const DERIVED_COLUMNS = new Set(['当日吃饭总支出', '当日总支出', '当日逆差'])
const NOTE_COLUMN = '当日备注'
const DATE_COLUMN = '日期'
const TEMPLATE_TYPE = 'yuque_monthly_ledger_v1'

function createError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function toObjectId(id, code = 'INVALID_ID', message = 'id 不正确') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(404, code, message)
  }
  return new mongoose.Types.ObjectId(id)
}

function slugifyName(name = '') {
  const normalized = String(name).trim().toLowerCase()
  return normalized
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\u4e00-\u9fa5]/g, '')
    .slice(0, 72) || crypto.createHash('md5').update(String(name)).digest('hex').slice(0, 12)
}

function normalizeAliases(aliases = []) {
  const seen = new Set()
  return aliases
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 10)
}

function startOfDay(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return date
}

function endOfDay(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(23, 59, 59, 999)
  return date
}

function formatDay(date) {
  const value = new Date(date)
  const pad = (num) => String(num).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
}

function formatMonth(date) {
  const value = new Date(date)
  const pad = (num) => String(num).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}`
}

function formatYear(date) {
  return String(new Date(date).getFullYear())
}

function formatTrendKey(date, groupBy = 'month') {
  if (groupBy === 'day') return formatDay(date)
  if (groupBy === 'year') return formatYear(date)
  if (groupBy === 'all') return '全部'
  return formatMonth(date)
}

function parseExcelDate(value) {
  if (value instanceof Date) return startOfDay(value)
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (!parsed) return null
    return startOfDay(new Date(parsed.y, parsed.m - 1, parsed.d))
  }

  const text = String(value || '').trim()
  if (!text) return null
  const normalized = text.replace(/[年月.]/g, '/').replace(/日/g, '')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : startOfDay(date)
}

function parseAmount(value) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const normalized = String(value).replace(/,/g, '').trim()
  if (!normalized) return null
  const amount = Number(normalized)
  return Number.isFinite(amount) ? amount : null
}

function readCellComment(sheet, rowIndex, columnIndex) {
  const address = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })
  const comments = sheet[address]?.c || []
  return comments
    .map((comment) => String(comment.t || comment.h || '').replace(/<br\s*\/?>/gi, '\n').trim())
    .filter(Boolean)
    .join('\n')
    .slice(0, 500)
}

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

async function findOwnedCategory(categoryId, userId, bookId) {
  const id = toObjectId(categoryId, 'LEDGER_CATEGORY_NOT_FOUND', '分类不存在')
  const query = { _id: id, userId }
  if (bookId) query.bookId = bookId
  const category = await LedgerCategory.findOne(query)
  if (!category) {
    throw createError(404, 'LEDGER_CATEGORY_NOT_FOUND', '分类不存在')
  }
  return category
}

async function findOwnedEntry(entryId, userId) {
  const id = toObjectId(entryId, 'LEDGER_ENTRY_NOT_FOUND', '流水不存在')
  const entry = await LedgerEntry.findOne({ _id: id, userId })
  if (!entry) {
    throw createError(404, 'LEDGER_ENTRY_NOT_FOUND', '流水不存在')
  }
  return entry
}


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

async function ensureDefaultBook(userId) {
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

async function getCategoryMap(userId, bookId) {
  const categories = await LedgerCategory.find({ userId, bookId, archived: false }).sort({ sortOrder: 1, createdAt: 1 })
  const byName = new Map()
  const byId = new Map()

  for (const category of categories) {
    byId.set(category._id.toString(), category)
    byName.set(category.name.trim().toLowerCase(), category)
    for (const alias of category.aliases || []) {
      byName.set(alias.trim().toLowerCase(), category)
    }
  }

  return { categories, byName, byId }
}

async function getOrCreateCategoryByName(userId, bookId, name, type) {
  const key = String(name).trim().toLowerCase()
  const map = await getCategoryMap(userId, bookId)
  const matched = map.byName.get(key)
  if (matched && matched.type === type) return matched

  const sortOrder = type === 'income' ? 300 : 100
  const category = await LedgerCategory.create({
    userId,
    bookId,
    name: String(name).trim(),
    code: slugifyName(`${type}-${name}`),
    type,
    aliases: [String(name).trim()],
    sortOrder
  })
  return category
}

async function getExistingEntryKeySet(userId, bookId) {
  const entries = await LedgerEntry.find({ userId, bookId })
    .select('occurredAt type categoryId')
    .lean()

  return new Set(entries.map((entry) => {
    return `${formatDay(entry.occurredAt)}:${entry.type}:${entry.categoryId.toString()}`
  }))
}

function buildEntryQuery(userId, options = {}) {
  const query = { userId }
  if (options.bookId) query.bookId = toObjectId(options.bookId, 'LEDGER_BOOK_NOT_FOUND', '账本不存在')
  if (options.type) query.type = options.type
  if (options.categoryId) query.categoryId = toObjectId(options.categoryId, 'LEDGER_CATEGORY_NOT_FOUND', '分类不存在')

  const from = options.from ? startOfDay(options.from) : null
  const to = options.to ? endOfDay(options.to) : null
  if (from || to) {
    query.occurredAt = {}
    if (from) query.occurredAt.$gte = from
    if (to) query.occurredAt.$lte = to
  }

  const keyword = String(options.keyword || '').trim()
  if (keyword) {
    query.$or = [
      { note: { $regex: keyword, $options: 'i' } },
      { dailyNote: { $regex: keyword, $options: 'i' } },
      { categoryNameSnapshot: { $regex: keyword, $options: 'i' } }
    ]
  }

  return query
}


function classifyExcelColumn(header, categoryMap) {
  const name = String(header || '').trim()
  if (!name || name === DATE_COLUMN || name === NOTE_COLUMN || DERIVED_COLUMNS.has(name)) return null
  const existing = categoryMap.byName.get(name.toLowerCase())
  if (existing) return { name, type: existing.type, category: existing }

  if (['工资', '奖金', '其他收入'].includes(name)) {
    return { name, type: 'income', category: null }
  }

  return { name, type: 'expense', category: null }
}

async function parseYuqueWorkbook(buffer, userId, bookId) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const categoryMap = await getCategoryMap(userId, bookId)
  const existingEntryKeys = await getExistingEntryKeySet(userId, bookId)
  const previewItems = []
  const errors = []
  let skipped = 0
  let sheetCount = 0

  for (const sheetName of workbook.SheetNames) {
    if (sheetName.trim() === '模版') {
      skipped += 1
      continue
    }

    if (!/\d{4}年\d{1,2}月份收支明细/.test(sheetName)) {
      skipped += 1
      continue
    }

    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      defval: ''
    })
    const headerRowIndex = rows.findIndex((row) => String(row?.[0] || '').trim() === DATE_COLUMN)
    if (headerRowIndex < 0) {
      errors.push({ sheetName, row: 0, message: '未找到日期表头行' })
      continue
    }

    sheetCount += 1
    const headers = rows[headerRowIndex].map((item) => String(item || '').trim())
    const columns = headers.map((header, index) => ({
      header,
      index,
      ...classifyExcelColumn(header, categoryMap)
    })).filter((item) => item.name && item.type)
    const noteIndex = headers.findIndex((header) => header === NOTE_COLUMN)

    for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex] || []
      const occurredAt = parseExcelDate(row[0])
      if (!occurredAt) {
        if (row.some((cell) => String(cell || '').trim())) {
          errors.push({ sheetName, row: rowIndex + 1, message: '日期格式不正确' })
        }
        continue
      }

      const dailyNote = noteIndex >= 0 ? String(row[noteIndex] || '').trim() : ''
      for (const column of columns) {
        const amount = parseAmount(row[column.index])
        if (amount === null || amount === 0) {
          skipped += 1
          continue
        }

        if (amount < 0) {
          errors.push({ sheetName, row: rowIndex + 1, column: column.header, message: '金额不能为负数' })
          continue
        }

        const category = column.category || await getOrCreateCategoryByName(userId, bookId, column.name, column.type)
        if (!column.category) {
          column.category = category
          categoryMap.byName.set(category.name.toLowerCase(), category)
          categoryMap.byId.set(category._id.toString(), category)
        }

        const sourceKey = `${formatDay(occurredAt)}:${column.type}:${category._id.toString()}`
        const note = readCellComment(sheet, rowIndex, column.index)
        previewItems.push({
          action: existingEntryKeys.has(sourceKey) ? 'update' : 'insert',
          sheetName,
          rowNumber: rowIndex + 1,
          sourceKey,
          occurredAt,
          type: column.type,
          categoryId: category._id.toString(),
          categoryName: category.name,
          amount,
          note,
          dailyNote,
          raw: {
            date: row[0],
            header: column.header,
            value: row[column.index],
            cellNote: note,
            dailyNote
          }
        })
      }
    }
  }

  return { previewItems, errors, skipped, sheetCount }
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

export async function listLedgerCategories(userId, options = {}) {
  const book = options.bookId ? await findOwnedBook(options.bookId, userId) : await ensureDefaultBook(userId)
  await seedDefaultCategories(userId, book._id)
  const categories = await LedgerCategory.find({ userId, bookId: book._id }).sort({ type: 1, sortOrder: 1, createdAt: 1 })
  return categories.map((category) => category.toSafeJSON())
}

export async function createLedgerCategory(userId, input) {
  const book = await findOwnedBook(input.bookId, userId)
  const category = await LedgerCategory.create({
    ...input,
    userId,
    bookId: book._id,
    code: slugifyName(`${input.type}-${input.name}`),
    aliases: normalizeAliases([input.name, ...(input.aliases || [])])
  })
  return category.toSafeJSON()
}

export async function updateLedgerCategory(userId, id, input) {
  const category = await findOwnedCategory(id, userId)
  Object.assign(category, {
    ...input,
    aliases: input.aliases ? normalizeAliases(input.aliases) : category.aliases
  })
  if (input.name !== undefined) {
    category.code = slugifyName(`${category.type}-${input.name}`)
    category.aliases = normalizeAliases([input.name, ...(category.aliases || [])])
  }
  await category.save()
  return category.toSafeJSON()
}

export async function listLedgerEntries(userId, options = {}) {
  if (options.bookId) await findOwnedBook(options.bookId, userId)
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const query = buildEntryQuery(userId, options)
  const skip = (page - 1) * pageSize

  const [items, total] = await Promise.all([
    LedgerEntry.find(query)
      .populate('categoryId')
      .sort({ occurredAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(pageSize),
    LedgerEntry.countDocuments(query)
  ])

  return {
    items: items.map((item) => item.toSafeJSON()),
    total,
    page,
    pageSize
  }
}

export async function createLedgerEntry(userId, input) {
  const book = await findOwnedBook(input.bookId, userId)
  const category = await findOwnedCategory(input.categoryId, userId, book._id)
  if (category.type !== input.type) {
    throw createError(400, 'LEDGER_CATEGORY_TYPE_MISMATCH', '流水类型和分类类型不一致')
  }

  const occurredAt = startOfDay(input.occurredAt)
  const entry = await LedgerEntry.create({
    userId,
    bookId: book._id,
    occurredAt,
    type: input.type,
    categoryId: category._id,
    categoryNameSnapshot: category.name,
    amount: input.amount,
    note: input.note || '',
    dailyNote: input.dailyNote || '',
    source: 'manual',
    sourceKey: `${formatDay(occurredAt)}:${input.type}:${category._id.toString()}`
  })

  await entry.populate('categoryId')
  return entry.toSafeJSON()
}

export async function updateLedgerEntry(userId, id, input) {
  const entry = await findOwnedEntry(id, userId)
  const nextCategory = input.categoryId
    ? await findOwnedCategory(input.categoryId, userId, entry.bookId)
    : await findOwnedCategory(entry.categoryId, userId, entry.bookId)
  const nextType = input.type || entry.type
  if (nextCategory.type !== nextType) {
    throw createError(400, 'LEDGER_CATEGORY_TYPE_MISMATCH', '流水类型和分类类型不一致')
  }

  if (input.occurredAt !== undefined) entry.occurredAt = startOfDay(input.occurredAt)
  if (input.type !== undefined) entry.type = input.type
  if (input.categoryId !== undefined) {
    entry.categoryId = nextCategory._id
    entry.categoryNameSnapshot = nextCategory.name
  }
  if (input.amount !== undefined) entry.amount = input.amount
  if (input.note !== undefined) entry.note = input.note
  if (input.dailyNote !== undefined) entry.dailyNote = input.dailyNote
  entry.sourceKey = `${formatDay(entry.occurredAt)}:${entry.type}:${entry.categoryId.toString()}`
  await entry.save()
  await entry.populate('categoryId')
  return entry.toSafeJSON()
}

export async function batchUpdateLedgerEntries(userId, input) {
  const entries = await LedgerEntry.find({
    _id: { $in: input.ids.map((id) => toObjectId(id, 'LEDGER_ENTRY_NOT_FOUND', '流水不存在')) },
    userId
  })
  if (entries.length !== input.ids.length) {
    throw createError(404, 'LEDGER_ENTRY_NOT_FOUND', '部分流水不存在')
  }

  const categoryCache = new Map()
  const operations = []
  for (const entry of entries) {
    const patch = input.patch
    const nextType = patch.type || entry.type
    let nextCategory = null
    if (patch.categoryId) {
      const key = `${entry.bookId.toString()}:${patch.categoryId}`
      nextCategory = categoryCache.get(key)
      if (!nextCategory) {
        nextCategory = await findOwnedCategory(patch.categoryId, userId, entry.bookId)
        categoryCache.set(key, nextCategory)
      }
    } else {
      nextCategory = await findOwnedCategory(entry.categoryId, userId, entry.bookId)
    }

    if (nextCategory.type !== nextType) {
      throw createError(400, 'LEDGER_CATEGORY_TYPE_MISMATCH', '流水类型和分类类型不一致')
    }

    const nextOccurredAt = patch.occurredAt !== undefined ? startOfDay(patch.occurredAt) : entry.occurredAt
    const update = {
      updatedAt: new Date()
    }
    if (patch.occurredAt !== undefined) update.occurredAt = nextOccurredAt
    if (patch.type !== undefined) update.type = patch.type
    if (patch.categoryId !== undefined) {
      update.categoryId = nextCategory._id
      update.categoryNameSnapshot = nextCategory.name
    }
    if (patch.note !== undefined) update.note = patch.note
    if (patch.dailyNote !== undefined) update.dailyNote = patch.dailyNote
    update.sourceKey = `${formatDay(nextOccurredAt)}:${nextType}:${(patch.categoryId ? nextCategory._id : entry.categoryId).toString()}`

    operations.push({
      updateOne: {
        filter: { _id: entry._id, userId },
        update: { $set: update }
      }
    })
  }

  if (operations.length) {
    await LedgerEntry.bulkWrite(operations, { ordered: false })
  }

  return { matched: entries.length, modified: entries.length }
}

export async function deleteLedgerEntry(userId, id) {
  const entry = await findOwnedEntry(id, userId)
  await entry.deleteOne()
  return { id: entry._id.toString(), deleted: true }
}

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

export async function previewLedgerImport(userId, input, file) {
  if (!file?.buffer) {
    throw createError(400, 'LEDGER_IMPORT_FILE_REQUIRED', '请上传 Excel 文件')
  }
  if (!/\.xlsx?$/i.test(file.originalname || '')) {
    throw createError(400, 'LEDGER_IMPORT_FILE_TYPE_INVALID', '仅支持 xlsx/xls 文件')
  }

  const book = await findOwnedBook(input.bookId, userId)
  await seedDefaultCategories(userId, book._id)
  const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex')
  const parsed = await parseYuqueWorkbook(file.buffer, userId, book._id)
  const inserted = parsed.previewItems.filter((item) => item.action === 'insert').length
  const updated = parsed.previewItems.filter((item) => item.action === 'update').length
  const batch = await LedgerImportBatch.create({
    userId,
    bookId: book._id,
    filename: file.originalname || 'ledger.xlsx',
    fileHash,
    templateType: TEMPLATE_TYPE,
    status: 'previewed',
    stats: {
      inserted,
      updated,
      skipped: parsed.skipped,
      errors: parsed.errors.length,
      sheets: parsed.sheetCount,
      records: parsed.previewItems.length
    },
    previewItems: parsed.previewItems,
    errorItems: parsed.errors
  })

  return batch.toSafeJSON({ includePreview: true })
}

export async function commitLedgerImport(userId, id) {
  const batchId = toObjectId(id, 'LEDGER_IMPORT_NOT_FOUND', '导入批次不存在')
  const batch = await LedgerImportBatch.findOne({ _id: batchId, userId })
  if (!batch) {
    throw createError(404, 'LEDGER_IMPORT_NOT_FOUND', '导入批次不存在')
  }
  if (batch.status === 'committed') {
    return batch.toSafeJSON({ includePreview: true })
  }

  await findOwnedBook(batch.bookId, userId)
  const categoryIds = [...new Set((batch.previewItems || []).map((item) => item.categoryId?.toString()).filter(Boolean))]
  const categories = await LedgerCategory.find({
    _id: { $in: categoryIds },
    userId,
    bookId: batch.bookId
  })
  const categoryMap = new Map(categories.map((category) => [category._id.toString(), category]))
  if (categoryMap.size !== categoryIds.length) {
    throw createError(404, 'LEDGER_CATEGORY_NOT_FOUND', '分类不存在')
  }

  const operations = []

  for (const item of batch.previewItems || []) {
    const category = categoryMap.get(item.categoryId?.toString())
    const occurredAt = startOfDay(item.occurredAt)
    const payload = {
      userId,
      bookId: batch.bookId,
      occurredAt,
      type: item.type,
      categoryId: category._id,
      categoryNameSnapshot: category.name,
      amount: item.amount,
      note: item.note || '',
      dailyNote: item.dailyNote || '',
      source: 'excel_import',
      sourceKey: item.sourceKey,
      importBatchId: batch._id,
      raw: item.raw || null
    }
    operations.push({
      updateOne: {
        filter: {
          userId,
          bookId: batch.bookId,
          occurredAt,
          type: item.type,
          categoryId: category._id
        },
        update: { $set: payload },
        upsert: true
      }
    })
  }

  let inserted = 0
  let updated = 0
  if (operations.length) {
    const result = await LedgerEntry.bulkWrite(operations, { ordered: false })
    inserted = result.upsertedCount || 0
    updated = (result.modifiedCount || 0) + (result.matchedCount || 0) - inserted
  }

  batch.status = 'committed'
  batch.stats.inserted = inserted
  batch.stats.updated = updated
  batch.committedAt = new Date()
  await batch.save()

  return batch.toSafeJSON({ includePreview: true })
}

export async function listLedgerImports(userId, options = {}) {
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const query = { userId }
  if (options.bookId) {
    await findOwnedBook(options.bookId, userId)
    query.bookId = options.bookId
  }
  const skip = (page - 1) * pageSize
  const [items, total] = await Promise.all([
    LedgerImportBatch.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    LedgerImportBatch.countDocuments(query)
  ])

  return {
    items: items.map((item) => item.toSafeJSON()),
    total,
    page,
    pageSize
  }
}
