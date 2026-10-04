import mongoose from 'mongoose'
import { Memo, MEMO_FIELD_TYPES, MEMO_KINDS, MEMO_PRIORITIES, MEMO_SENSITIVE_FIELD_TYPES, MEMO_STATUSES, MEMO_TYPES } from '#modules/memo/models/Memo.js'
import { decryptMemoField, encryptMemoField } from '#utils/memoFieldEncryption.js'

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

  const firstLine = String(input.content || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean)

  return (firstLine || '未命名记录').slice(0, 80)
}

function isSensitiveField(field) {
  return field.isSensitive === true || MEMO_SENSITIVE_FIELD_TYPES.includes(field.type)
}

function fieldContext(memo, fieldKey) {
  return {
    ownerId: memo.createdBy.toString(),
    memoId: memo._id.toString(),
    fieldKey
  }
}

function persistFields(fields = [], memo, existingFields = []) {
  const existingByKey = new Map(existingFields.map((field) => [field.key, field]))

  return fields.map((field, index) => {
    const existing = existingByKey.get(field.key)
    const type = MEMO_FIELD_TYPES.includes(field.type) ? field.type : 'text'
    const isSensitive = isSensitiveField({ ...field, type })
    const fieldValueProvided = typeof field.value === 'string'
    const preserveExistingCipher = isSensitive
      && !fieldValueProvided
      && existing?.isSensitive === true

    if (isSensitive) {
      return {
        key: field.key,
        label: field.label,
        type,
        value: '',
        encryptedValue: preserveExistingCipher
          ? existing.encryptedValue || ''
          : encryptMemoField(field.value || '', fieldContext(memo, field.key)),
        isSensitive: true,
        order: Number.isInteger(field.order) ? field.order : index
      }
    }

    return {
      key: field.key,
      label: field.label,
      type,
      value: fieldValueProvided ? field.value : existing?.value || '',
      encryptedValue: '',
      isSensitive: false,
      order: Number.isInteger(field.order) ? field.order : index
    }
  })
}

function serializeMemoList(memo) {
  const kind = memo.kind || 'capture'
  const fields = memo.fields || []
  return {
    id: memo._id.toString(),
    title: memo.title,
    kind,
    category: memo.category || '',
    summary: kind === 'reference'
      ? `${fields.length} 项资料${fields.some((field) => field.isSensitive) ? ' · 含敏感字段' : ''}`
      : String(memo.content || '').trim().slice(0, 240),
    fieldCount: fields.length,
    sensitiveFieldCount: fields.filter((field) => field.isSensitive).length,
    type: memo.type,
    status: memo.status,
    priority: memo.priority,
    tags: memo.tags || [],
    isPinned: memo.isPinned,
    dueAt: memo.dueAt,
    createdAt: memo.createdAt,
    updatedAt: memo.updatedAt
  }
}

function serializeMemoDetail(memo) {
  return {
    ...serializeMemoList(memo),
    content: memo.kind === 'reference' ? '' : memo.content || '',
    fields: (memo.fields || []).map((field) => ({
      key: field.key,
      label: field.label,
      type: field.type,
      value: field.isSensitive ? '' : field.value || '',
      isSensitive: field.isSensitive === true,
      hasValue: field.isSensitive
        ? Boolean(field.encryptedValue)
        : Boolean(field.value),
      order: field.order || 0
    }))
  }
}

function buildMemoQuery(userId, filters = {}) {
  const query = { createdBy: userId }
  const clauses = []
  const keyword = String(filters.keyword || '').trim().slice(0, 80)

  if (filters.status === 'active') {
    query.status = { $ne: 'archived' }
  } else if (filters.status && MEMO_STATUSES.includes(filters.status)) {
    query.status = filters.status
  }

  if (filters.kind === 'capture') {
    clauses.push({
      $or: [
        { kind: 'capture' },
        { kind: { $exists: false } }
      ]
    })
  } else if (filters.kind && MEMO_KINDS.includes(filters.kind)) {
    query.kind = filters.kind
  }

  if (filters.type && MEMO_TYPES.includes(filters.type)) {
    query.type = filters.type
  }

  if (filters.priority && MEMO_PRIORITIES.includes(filters.priority)) {
    query.priority = filters.priority
  }

  const category = String(filters.category || '').trim().slice(0, 60)
  if (category) {
    query.category = new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
  }

  if (keyword) {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    clauses.push({
      $or: [
        { title: { $regex: escapedKeyword, $options: 'i' } },
        { content: { $regex: escapedKeyword, $options: 'i' } },
        { tags: { $regex: escapedKeyword, $options: 'i' } },
        { category: { $regex: escapedKeyword, $options: 'i' } },
        { 'fields.label': { $regex: escapedKeyword, $options: 'i' } },
        { 'fields.value': { $regex: escapedKeyword, $options: 'i' } }
      ]
    })
  }

  if (clauses.length) query.$and = clauses

  return query
}

async function findOwnedMemo(id, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(404, 'MEMO_NOT_FOUND', '记录不存在')
  }

  const memo = await Memo.findOne({ _id: id, createdBy: userId }).select('+fields.encryptedValue')
  if (!memo) {
    throw createError(404, 'MEMO_NOT_FOUND', '记录不存在')
  }

  return memo
}

export async function createMemo(input, userId) {
  const kind = input.kind || 'capture'
  const memo = new Memo({
    title: deriveTitle(input),
    content: kind === 'reference' ? '' : String(input.content || '').trim(),
    kind,
    category: String(input.category || '').trim(),
    type: input.type || 'idea',
    status: input.status || 'open',
    priority: input.priority || 'medium',
    tags: normalizeTags(input.tags),
    isPinned: input.isPinned === true,
    dueAt: normalizeDate(input.dueAt),
    createdBy: userId
  })
  memo.fields = persistFields(input.fields || [], memo)
  await memo.save()
  return serializeMemoList(memo)
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
    items: items.map(serializeMemoList),
    total,
    page,
    pageSize
  }
}

export async function getMemo(id, userId) {
  return serializeMemoDetail(await findOwnedMemo(id, userId))
}

export async function getMemoSensitiveField(id, fieldKey, userId) {
  const memo = await findOwnedMemo(id, userId)
  const field = memo.fields.find((item) => item.key === fieldKey)
  if (!field || !field.isSensitive) {
    throw createError(404, 'MEMO_SENSITIVE_FIELD_NOT_FOUND', '敏感字段不存在')
  }

  return {
    key: field.key,
    value: decryptMemoField(field.encryptedValue, fieldContext(memo, field.key))
  }
}

export async function getMemoStats(userId) {
  const now = new Date()
  const [statusRows, pinnedCount, dueSoonCount] = await Promise.all([
    Memo.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Memo.countDocuments({ createdBy: userId, isPinned: true, status: { $ne: 'archived' } }),
    Memo.countDocuments({
      createdBy: userId,
      status: 'open',
      dueAt: { $ne: null, $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
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

  if (input.kind !== undefined && input.kind !== (memo.kind || 'capture')) {
    throw createError(400, 'MEMO_KIND_IMMUTABLE', '记录类型不能直接切换')
  }

  if (input.title !== undefined || input.content !== undefined) {
    const nextContent = input.content !== undefined ? input.content.trim() : memo.content
    memo.title = deriveTitle({
      title: input.title !== undefined ? input.title : memo.title,
      content: nextContent
    })
    if (memo.kind !== 'reference' && input.content !== undefined) memo.content = nextContent
  }

  if (input.category !== undefined) memo.category = input.category.trim()
  if (input.type !== undefined) memo.type = input.type
  if (input.status !== undefined) memo.status = input.status
  if (input.priority !== undefined) memo.priority = input.priority
  if (input.tags !== undefined) memo.tags = normalizeTags(input.tags)
  if (input.isPinned !== undefined) memo.isPinned = input.isPinned
  if (input.dueAt !== undefined) memo.dueAt = normalizeDate(input.dueAt)
  if (input.fields !== undefined) memo.fields = persistFields(input.fields, memo, memo.fields || [])

  await memo.save()
  return serializeMemoList(memo)
}

export async function deleteMemo(id, userId) {
  const memo = await findOwnedMemo(id, userId)
  await memo.deleteOne()
  return { id: memo._id.toString(), deleted: true }
}
