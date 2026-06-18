import mongoose from 'mongoose'
import { Memo, MEMO_PRIORITIES, MEMO_STATUSES, MEMO_TYPES } from '../models/Memo.js'

function createError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function normalizeDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function normalizeTags(tags = []) {
  const seen = new Set()
  return tags
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .filter((tag) => {
      const key = tag.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 8)
}

function deriveTitle(input) {
  const title = input.title?.trim()
  if (title) return title

  const firstLine = input.content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean)

  return (firstLine || '未命名备忘').slice(0, 80)
}

function buildMemoQuery(userId, filters = {}) {
  const query = { createdBy: userId }
  const keyword = String(filters.keyword || '').trim()

  if (filters.status && MEMO_STATUSES.includes(filters.status)) {
    query.status = filters.status
  }

  if (filters.type && MEMO_TYPES.includes(filters.type)) {
    query.type = filters.type
  }

  if (filters.priority && MEMO_PRIORITIES.includes(filters.priority)) {
    query.priority = filters.priority
  }

  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { content: { $regex: keyword, $options: 'i' } },
      { tags: { $regex: keyword, $options: 'i' } }
    ]
  }

  return query
}

async function findOwnedMemo(id, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(404, 'MEMO_NOT_FOUND', '备忘录不存在')
  }

  const memo = await Memo.findOne({ _id: id, createdBy: userId })
  if (!memo) {
    throw createError(404, 'MEMO_NOT_FOUND', '备忘录不存在')
  }

  return memo
}

export async function createMemo(input, userId) {
  const memo = await Memo.create({
    title: deriveTitle(input),
    content: input.content.trim(),
    type: input.type || 'idea',
    status: input.status || 'open',
    priority: input.priority || 'medium',
    tags: normalizeTags(input.tags),
    isPinned: input.isPinned === true,
    dueAt: normalizeDate(input.dueAt),
    createdBy: userId
  })

  return memo.toSafeJSON()
}

export async function listMemos(userId, filters = {}) {
  const page = Math.max(1, parseInt(filters.page, 10) || 1)
  const pageSize = Math.min(50, Math.max(1, parseInt(filters.pageSize, 10) || 12))
  const skip = (page - 1) * pageSize
  const query = buildMemoQuery(userId, filters)

  const [items, total] = await Promise.all([
    Memo.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Memo.countDocuments(query)
  ])

  return {
    items: items.map((item) => item.toSafeJSON()),
    total,
    page,
    pageSize
  }
}

export async function getMemoStats(userId) {
  const [statusRows, pinnedCount, dueSoonCount] = await Promise.all([
    Memo.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Memo.countDocuments({ createdBy: userId, isPinned: true, status: { $ne: 'archived' } }),
    Memo.countDocuments({
      createdBy: userId,
      status: 'open',
      dueAt: { $ne: null, $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    })
  ])

  const byStatus = statusRows.reduce((result, item) => {
    result[item._id] = item.count
    return result
  }, { open: 0, completed: 0, archived: 0 })

  return {
    ...byStatus,
    pinned: pinnedCount,
    dueSoon: dueSoonCount,
    total: byStatus.open + byStatus.completed + byStatus.archived
  }
}

export async function updateMemo(id, input, userId) {
  const memo = await findOwnedMemo(id, userId)

  if (input.title !== undefined || input.content !== undefined) {
    const nextContent = input.content !== undefined ? input.content.trim() : memo.content
    memo.title = deriveTitle({
      title: input.title !== undefined ? input.title : memo.title,
      content: nextContent
    })
    memo.content = nextContent
  }

  if (input.type !== undefined) memo.type = input.type
  if (input.status !== undefined) memo.status = input.status
  if (input.priority !== undefined) memo.priority = input.priority
  if (input.tags !== undefined) memo.tags = normalizeTags(input.tags)
  if (input.isPinned !== undefined) memo.isPinned = input.isPinned
  if (input.dueAt !== undefined) memo.dueAt = normalizeDate(input.dueAt)

  await memo.save()
  return memo.toSafeJSON()
}

export async function deleteMemo(id, userId) {
  const memo = await findOwnedMemo(id, userId)
  await memo.deleteOne()
  return { id: memo._id.toString(), deleted: true }
}
