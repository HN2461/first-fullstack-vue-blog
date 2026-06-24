import { LedgerEntry } from '#modules/ledger/models/LedgerEntry.js'
import { buildEntryQuery, createError, formatDay, startOfDay, toObjectId } from './ledger.utils.js'
import { findOwnedBook } from './ledgerBook.service.js'
import { findOwnedCategory } from './ledgerCategory.service.js'

async function findOwnedEntry(entryId, userId) {
  const id = toObjectId(entryId, 'LEDGER_ENTRY_NOT_FOUND', '流水不存在')
  const entry = await LedgerEntry.findOne({ _id: id, userId })
  if (!entry) {
    throw createError(404, 'LEDGER_ENTRY_NOT_FOUND', '流水不存在')
  }
  return entry
}

export async function listLedgerEntries(userId, options = {}) {
  if (options.bookId) await findOwnedBook(options.bookId, userId)
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const query = buildEntryQuery(userId, options)
  const skip = (page - 1) * pageSize

  // 支持排序
  const sortField = options.sortField || 'occurredAt'
  const sortOrder = options.sortOrder === 'asc' ? 1 : -1
  const sort = { [sortField]: sortOrder }
  if (sortField !== 'updatedAt') sort.updatedAt = -1

  const [items, total] = await Promise.all([
    LedgerEntry.find(query)
      .populate('categoryId')
      .sort(sort)
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
