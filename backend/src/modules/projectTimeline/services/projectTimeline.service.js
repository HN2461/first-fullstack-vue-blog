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

export async function listProjectTimelineRecords(options = {}) {
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const skip = (page - 1) * pageSize

  const query = {}
  if (options.category) {
    query.category = options.category
  }
  if (options.source) {
    query.source = options.source
  }
  if (options.keyword?.trim?.()) {
    const keyword = options.keyword.trim()
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { detail: { $regex: keyword, $options: 'i' } }
    ]
  }

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

function resolveImportOccurredAt(record, date) {
  if (record.occurredAt) {
    return normalizeDate(record.occurredAt)
  }

  return normalizeDate(`${date}T12:00:00+08:00`)
}

export async function importProjectTimelineRecords(input, user) {
  let inserted = 0
  let duplicated = 0
  const items = []

  for (const record of input.records) {
    const legacyId = `${input.date}-${record.id}`
    const payload = {
      title: record.title.trim(),
      detail: record.detail.trim(),
      occurredAt: resolveImportOccurredAt(record, input.date),
      category: record.category || '功能更新',
      source: input.source || 'collaboration_daily',
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
