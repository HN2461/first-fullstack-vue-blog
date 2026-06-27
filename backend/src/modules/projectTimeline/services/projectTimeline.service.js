import {
  PROJECT_TIMELINE_CATEGORIES,
  ProjectTimelineRecord
} from '#modules/projectTimeline/models/ProjectTimelineRecord.js'

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function normalizeDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, 'PROJECT_TIMELINE_DATE_INVALID', '记录时间不正确')
  }
  return date
}

function buildProjectTimelineQuery(options = {}) {
  const query = {}
  if (options.category) {
    query.category = options.category
  }
  if (options.source) {
    query.source = options.source
  }
  if (options.dateFrom || options.dateTo) {
    query.occurredAt = {}
    if (options.dateFrom) {
      query.occurredAt.$gte = normalizeDate(`${options.dateFrom}T00:00:00+08:00`)
    }
    if (options.dateTo) {
      query.occurredAt.$lte = normalizeDate(`${options.dateTo}T23:59:59+08:00`)
    }
  }
  if (options.keyword?.trim?.()) {
    const keyword = options.keyword.trim()
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { detail: { $regex: keyword, $options: 'i' } }
    ]
  }
  return query
}

export async function listProjectTimelineRecords(options = {}) {
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const skip = (page - 1) * pageSize

  const query = buildProjectTimelineQuery(options)

  const [items, total, existingCategories] = await Promise.all([
    ProjectTimelineRecord.find(query)
      .sort({ occurredAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    ProjectTimelineRecord.countDocuments(query),
    ProjectTimelineRecord.distinct('category')
  ])
  const categories = [...new Set([
    ...PROJECT_TIMELINE_CATEGORIES,
    ...existingCategories.filter(Boolean)
  ])].sort((first, second) => first.localeCompare(second, 'zh-CN'))

  return {
    items: items.map((item) => item.toSafeJSON()),
    total,
    page,
    pageSize,
    categories
  }
}

export async function createProjectTimelineRecord(input, user) {
  const record = await ProjectTimelineRecord.create({
    title: input.title.trim(),
    detail: input.detail.trim(),
    occurredAt: normalizeDate(input.occurredAt),
    category: input.category || '手动记录',
    source: input.source || 'manual',
    legacyId: input.legacyId || null,
    createdBy: user?._id || null
  })

  return record.toSafeJSON()
}

export async function updateProjectTimelineRecord(id, input) {
  const updates = {}
  if (typeof input.title === 'string') updates.title = input.title.trim()
  if (typeof input.detail === 'string') updates.detail = input.detail.trim()
  if (typeof input.category === 'string') updates.category = input.category || '手动记录'
  if (typeof input.occurredAt === 'string') updates.occurredAt = normalizeDate(input.occurredAt)

  const record = await ProjectTimelineRecord.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  )

  if (!record) {
    throw createHttpError(404, 'PROJECT_TIMELINE_NOT_FOUND', '项目记录不存在')
  }

  return record.toSafeJSON()
}

function resolveImportOccurredAt(record, date) {
  if (record.occurredAt) {
    return normalizeDate(record.occurredAt)
  }

  return normalizeDate(`${date}T12:00:00+08:00`)
}

function isMongoObjectId(value) {
  return /^[a-f\d]{24}$/i.test(String(value || ''))
}

export async function importProjectTimelineRecords(input, user) {
  let inserted = 0
  let duplicated = 0
  const items = []

  for (const record of input.records) {
    const legacyId = record.legacyId || `${input.date}-${record.id}`
    const source = record.source || input.source || 'collaboration_daily'
    const existingRecord = isMongoObjectId(record.id)
      ? await ProjectTimelineRecord.findById(record.id)
      : null

    if (existingRecord) {
      duplicated += 1
      items.push({ id: record.id, title: record.title, inserted: false })
      continue
    }

    const payload = {
      title: record.title.trim(),
      detail: record.detail.trim(),
      occurredAt: resolveImportOccurredAt(record, input.date),
      category: record.category || '功能更新',
      source,
      legacyId,
      createdBy: user?._id || null
    }

    const result = await ProjectTimelineRecord.updateOne(
      { source: payload.source, legacyId },
      { $setOnInsert: payload },
      { upsert: true }
    )

    if (result.upsertedCount > 0) inserted += 1
    else duplicated += 1
    items.push({ id: record.id, title: record.title, inserted: result.upsertedCount > 0 })
  }

  return {
    inserted,
    duplicated,
    total: input.records.length,
    items
  }
}

export async function importProjectTimelinePayloads(imports, user) {
  const results = []
  let inserted = 0
  let duplicated = 0
  let total = 0

  for (const item of imports) {
    const result = await importProjectTimelineRecords(item.input, user)
    inserted += result.inserted
    duplicated += result.duplicated
    total += result.total
    results.push({
      filename: item.filename,
      ...result
    })
  }

  return {
    inserted,
    duplicated,
    total,
    files: results
  }
}

function formatExportDateKey(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function buildExportRecordId(record) {
  if (record.legacyId) {
    return String(record.legacyId).replace(/^\d{4}-\d{2}-\d{2}-/, '')
  }
  return record._id.toString()
}

function buildExportLegacyId(record) {
  return record.legacyId || `record-${record._id.toString()}`
}

export async function exportProjectTimelineRecords(options = {}) {
  const query = buildProjectTimelineQuery(options)
  const records = await ProjectTimelineRecord.find(query)
    .sort({ occurredAt: 1, createdAt: 1 })
    .limit(5000)

  return {
    schemaVersion: 1,
    date: formatExportDateKey(),
    source: 'current_project',
    exportedAt: new Date().toISOString(),
    records: records.map((record) => ({
      id: buildExportRecordId(record),
      legacyId: buildExportLegacyId(record),
      source: record.source || 'manual',
      title: record.title,
      detail: record.detail,
      occurredAt: record.occurredAt?.toISOString?.() || record.occurredAt,
      category: record.category || '手动记录'
    }))
  }
}

export async function upsertProjectTimelineSeedRecord(input) {
  const payload = {
    title: input.title.trim(),
    detail: input.detail.trim(),
    occurredAt: normalizeDate(input.occurredAt),
    category: input.category || '手动记录',
    source: input.source,
    legacyId: input.legacyId || null,
    createdBy: null
  }

  if (!payload.legacyId) {
    return {
      created: await ProjectTimelineRecord.create(payload)
    }
  }

  const result = await ProjectTimelineRecord.updateOne(
    { source: payload.source, legacyId: payload.legacyId },
    { $setOnInsert: payload },
    { upsert: true }
  )

  return {
    inserted: result.upsertedCount > 0,
    matched: result.matchedCount > 0
  }
}
