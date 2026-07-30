import crypto from 'node:crypto'

function buildCategoryPathMap(categories) {
  const byId = new Map(categories.map((item) => [String(item._id), item]))
  const result = new Map()
  function resolve(item, seen = new Set()) {
    const id = String(item._id)
    if (result.has(id)) return result.get(id)
    if (seen.has(id)) return []
    seen.add(id)
    const parent = item.parent ? byId.get(String(item.parent)) : null
    const value = [...(parent ? resolve(parent, seen) : []), item.name]
    result.set(id, value)
    return value
  }
  categories.forEach((item) => resolve(item))
  return result
}

export function buildSnapshotDatabasePreview(snapshot, localArticles, localCategories, localTags, options = {}) {
  const publishAll = Boolean(options.publishAll)
  const categoryPathMap = buildCategoryPathMap(localCategories)
  const tagById = new Map(localTags.map((item) => [String(item._id), item.name]))
  const localById = new Map(localArticles.map((item) => [String(item._id), item]))
  const localBySlug = new Map(localArticles.map((item) => [item.slug, item]))
  const matchedLocalIds = new Set()
  let createCount = 0
  let updateCount = 0
  let publishCount = 0
  let rekeyCount = 0

  for (const record of snapshot.records) {
    const existingById = localById.get(String(record.originalId))
    const existing = existingById || localBySlug.get(record.originalSlug)
    if (!existing) {
      createCount += 1
      continue
    }
    matchedLocalIds.add(String(existing._id))
    if (!existingById) rekeyCount += 1
    const nextStatus = publishAll ? 'published' : record.status
    const existingSignature = JSON.stringify({
      title: existing.title,
      slug: existing.slug,
      summary: existing.summary || '',
      status: existing.status,
      sortOrder: Number(existing.sortOrder) || 0,
      categoryPath: categoryPathMap.get(String(existing.category)) || [],
      tags: (existing.tags || []).map((id) => tagById.get(String(id))).filter(Boolean).sort(),
      contentHash: existing.contentMode === 'document' ? '' : existing.sourceHash || ''
    })
    const nextContentHash = record.contentMode === 'document'
      ? ''
      : crypto.createHash('sha256').update(record.contentMarkdown).digest('hex')
    const nextSignature = JSON.stringify({
      title: record.title,
      slug: record.originalSlug,
      summary: record.metadata?.summary ?? record.data?.summary ?? '',
      status: nextStatus,
      sortOrder: Number(record.sortOrder) || 0,
      categoryPath: record.categoryPath || [],
      tags: [...(record.tags || [])].sort(),
      contentHash: nextContentHash
    })
    if (existing.status !== 'published' && nextStatus === 'published') publishCount += 1
    if (existingSignature !== nextSignature) updateCount += 1
  }

  return {
    createCount,
    updateCount,
    removeCount: localArticles.filter((item) => !matchedLocalIds.has(String(item._id))).length,
    rekeyCount,
    publishCount,
    finalPublishedCount: snapshot.records.filter((item) => publishAll || item.status === 'published').length
  }
}
