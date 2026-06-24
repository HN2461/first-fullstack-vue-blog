import mongoose from 'mongoose'
import { LedgerBook } from '#modules/ledger/models/LedgerBook.js'
import { LedgerCategory } from '#modules/ledger/models/LedgerCategory.js'
import { LedgerEntry } from '#modules/ledger/models/LedgerEntry.js'
import { LedgerMoment } from '#modules/ledger/models/LedgerMoment.js'

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
  const category = await LedgerCategory.findOne({ _id: id, userId, bookId })
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

async function findOwnedMoment(momentId, userId) {
  const id = toObjectId(momentId, 'LEDGER_MOMENT_NOT_FOUND', '重要记录不存在')
  const moment = await LedgerMoment.findOne({ _id: id, userId })
  if (!moment) {
    throw createError(404, 'LEDGER_MOMENT_NOT_FOUND', '重要记录不存在')
  }
  return moment
}

function buildMomentQuery(userId, options = {}) {
  const query = { userId }
  if (options.bookId) query.bookId = toObjectId(options.bookId, 'LEDGER_BOOK_NOT_FOUND', '账本不存在')
  if (options.scope) query.scope = options.scope
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
      { title: { $regex: keyword, $options: 'i' } },
      { content: { $regex: keyword, $options: 'i' } },
      { categoryText: { $regex: keyword, $options: 'i' } },
      { mood: { $regex: keyword, $options: 'i' } },
      { tags: { $regex: keyword, $options: 'i' } }
    ]
  }

  return query
}

function normalizeTags(tags = []) {
  const seen = new Set()
  return tags
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 12)
}

export async function listLedgerMoments(userId, options = {}) {
  if (options.bookId) await findOwnedBook(options.bookId, userId)
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const query = buildMomentQuery(userId, options)
  const skip = (page - 1) * pageSize

  const [items, total] = await Promise.all([
    LedgerMoment.find(query)
      .populate('categoryId')
      .sort({ pinned: -1, occurredAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    LedgerMoment.countDocuments(query)
  ])

  return {
    items: items.map((item) => item.toSafeJSON()),
    total,
    page,
    pageSize
  }
}

export async function createLedgerMoment(userId, input) {
  const book = await findOwnedBook(input.bookId, userId)
  let category = null
  if (input.categoryId) {
    category = await findOwnedCategory(input.categoryId, userId, book._id)
  }
  if (input.entryId) {
    await findOwnedEntry(input.entryId, userId)
  }

  const moment = await LedgerMoment.create({
    ...input,
    userId,
    bookId: book._id,
    occurredAt: startOfDay(input.occurredAt),
    categoryId: category?._id || null,
    categoryText: input.categoryText || '',
    entryId: input.entryId || null,
    tags: normalizeTags(input.tags || [])
  })
  await moment.populate('categoryId')
  return moment.toSafeJSON()
}

export async function updateLedgerMoment(userId, id, input) {
  const moment = await findOwnedMoment(id, userId)
  if (input.categoryId) {
    await findOwnedCategory(input.categoryId, userId, moment.bookId)
  }
  if (input.entryId) {
    await findOwnedEntry(input.entryId, userId)
  }

  if (input.title !== undefined) moment.title = input.title
  if (input.scope !== undefined) moment.scope = input.scope
  if (input.occurredAt !== undefined) moment.occurredAt = startOfDay(input.occurredAt)
  if (input.amount !== undefined) moment.amount = input.amount
  if (input.categoryId !== undefined) moment.categoryId = input.categoryId || null
  if (input.categoryText !== undefined) moment.categoryText = input.categoryText
  if (input.entryId !== undefined) moment.entryId = input.entryId || null
  if (input.mood !== undefined) moment.mood = input.mood
  if (input.content !== undefined) moment.content = input.content
  if (input.tags !== undefined) moment.tags = normalizeTags(input.tags)
  if (input.pinned !== undefined) moment.pinned = input.pinned
  await moment.save()
  await moment.populate('categoryId')
  return moment.toSafeJSON()
}

export async function deleteLedgerMoment(userId, id) {
  const moment = await findOwnedMoment(id, userId)
  await moment.deleteOne()
  return { id: moment._id.toString(), deleted: true }
}
