import crypto from 'node:crypto'
import mongoose from 'mongoose'

export function createError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

export function toObjectId(id, code = 'INVALID_ID', message = 'id 不正确') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(404, code, message)
  }
  return new mongoose.Types.ObjectId(id)
}

export function slugifyName(name = '') {
  const normalized = String(name).trim().toLowerCase()
  return normalized
    .replace(/\s+/g, '-')
    .replace(/[^\w\-一-龥]/g, '')
    .slice(0, 72) || crypto.createHash('md5').update(String(name)).digest('hex').slice(0, 12)
}

export function normalizeAliases(aliases = []) {
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

export function startOfDay(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return date
}

export function endOfDay(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(23, 59, 59, 999)
  return date
}

export function formatDay(date) {
  const value = new Date(date)
  const pad = (num) => String(num).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
}

export function formatMonth(date) {
  const value = new Date(date)
  const pad = (num) => String(num).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}`
}

export function formatYear(date) {
  return String(new Date(date).getFullYear())
}

export function formatTrendKey(date, groupBy = 'month') {
  if (groupBy === 'day') return formatDay(date)
  if (groupBy === 'year') return formatYear(date)
  if (groupBy === 'all') return '全部'
  return formatMonth(date)
}

export function parseAmount(value) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const normalized = String(value).replace(/,/g, '').trim()
  if (!normalized) return null
  const amount = Number(normalized)
  return Number.isFinite(amount) ? amount : null
}

export function buildEntryQuery(userId, options = {}) {
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

  if (options.tags && options.tags.length) {
    query.tags = { $in: options.tags }
  }

  return query
}
