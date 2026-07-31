import crypto from 'node:crypto'

export const CONTENT_FIELDS = ['title', 'summary', 'cover', 'contentHash']
export const OPERATION_FIELDS = ['categoryPath', 'tags', 'status', 'sortOrder', 'publishedAt']

function hash(value) {
  return crypto.createHash('sha256').update(String(value || '').replace(/\r\n/g, '\n').trim()).digest('hex')
}

function valueEquals(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function normalizeDate(value) {
  return value ? new Date(value).toISOString() : null
}

function buildCategoryPathMap(categories) {
  const byId = new Map(categories.map((item) => [String(item._id), item]))
  const paths = new Map()
  function resolve(item, seen = new Set()) {
    const id = String(item._id)
    if (paths.has(id)) return paths.get(id)
    if (seen.has(id)) return []
    seen.add(id)
    const parent = item.parent ? byId.get(String(item.parent)) : null
    const path = [...(parent ? resolve(parent, seen) : []), item.name]
    paths.set(id, path)
    return path
  }
  categories.forEach((item) => resolve(item))
  return paths
}

function resolveField(base, local, remote) {
  if (valueEquals(local, remote)) return 'same'
  if (base === undefined) return 'unknown'
  if (valueEquals(local, base)) return 'remote'
  if (valueEquals(remote, base)) return 'local'
  return 'conflict'
}

function getLocalValues(record) {
  return {
    title: String(record.title || ''),
    summary: String(record.metadata?.summary ?? record.data?.summary ?? ''),
    cover: String(record.metadata?.cover ?? record.data?.cover ?? ''),
    contentMarkdown: record.contentMode === 'markdown' ? String(record.contentMarkdown || '') : '',
    contentHash: record.contentMode === 'markdown' ? hash(record.contentMarkdown) : null,
    categoryPath: record.categoryPath || [],
    tags: [...(record.tags || [])].sort(),
    status: record.status,
    sortOrder: Number(record.sortOrder) || 0,
    publishedAt: normalizeDate(record.publishedAt)
  }
}

function getRemoteValues(article, categoryPathMap, tagById) {
  return {
    title: String(article.title || ''),
    summary: String(article.summary || ''),
    cover: String(article.cover || ''),
    contentHash: article.contentMode === 'markdown' ? hash(article.contentMarkdown) : null,
    categoryPath: categoryPathMap.get(String(article.category)) || [],
    tags: (article.tags || []).map((id) => tagById.get(String(id))).filter(Boolean).sort(),
    status: article.status,
    sortOrder: Number(article.sortOrder) || 0,
    publishedAt: normalizeDate(article.publishedAt)
  }
}

function getBaseValues(manifestArticle) {
  return {
    title: manifestArticle.title,
    summary: manifestArticle.summary,
    cover: manifestArticle.cover,
    contentHash: manifestArticle.contentHash,
    categoryPath: manifestArticle.categoryPath,
    tags: manifestArticle.tags ? [...manifestArticle.tags].sort() : undefined,
    status: manifestArticle.status,
    sortOrder: manifestArticle.sortOrder,
    publishedAt: manifestArticle.publishedAt ? normalizeDate(manifestArticle.publishedAt) : manifestArticle.publishedAt
  }
}

export function buildArticleAuthorityMergePlan(snapshot, articles, categories, tags) {
  const categoryPathMap = buildCategoryPathMap(categories)
  const tagById = new Map(tags.map((item) => [String(item._id), item.name]))
  const byId = new Map(articles.map((item) => [String(item._id), item]))
  const bySlug = new Map(articles.map((item) => [item.slug, item]))
  const manifestById = new Map(snapshot.manifest.articles.map((item) => [String(item.originalId), item]))
  const items = snapshot.records.map((record) => {
    const manifestArticle = manifestById.get(String(record.originalId))
    const idMatch = byId.get(String(record.originalId)) || null
    const slugMatch = bySlug.get(record.originalSlug) || null
    const identityConflict = idMatch && slugMatch && String(idMatch._id) !== String(slugMatch._id)
    const remote = idMatch || slugMatch || null
    const local = getLocalValues(record)
    const base = getBaseValues(manifestArticle)
    const outcomes = {}
    for (const field of [...CONTENT_FIELDS, ...OPERATION_FIELDS]) {
      outcomes[field] = remote ? resolveField(base[field], local[field], getRemoteValues(remote, categoryPathMap, tagById)[field]) : 'remote-only'
    }
    const conflicts = Object.entries(outcomes).filter(([, value]) => value === 'conflict' || value === 'unknown').map(([field]) => field)
    const pushFields = CONTENT_FIELDS.filter((field) => outcomes[field] === 'local')
    const pullFields = OPERATION_FIELDS.filter((field) => outcomes[field] === 'remote')
    return {
      originalId: String(record.originalId),
      slug: record.originalSlug,
      title: record.title,
      sourceFile: record.sourceFile,
      fileName: record.fileName,
      contentMode: record.contentMode,
      existing: remote ? { id: String(remote._id), updatedAt: normalizeDate(remote.updatedAt) } : null,
      local,
      remote: remote ? getRemoteValues(remote, categoryPathMap, tagById) : null,
      base,
      outcomes,
      pushFields,
      pullFields,
      conflicts,
      blocked: identityConflict || !remote || record.contentMode !== 'markdown' || conflicts.length > 0,
      blockReason: identityConflict
        ? '文章身份冲突'
        : !remote
          ? '线上文章不存在或已删除'
          : record.contentMode !== 'markdown'
            ? '文档型文章需人工处理'
            : ''
    }
  })
  const snapshotIds = new Set(snapshot.records.map((item) => String(item.originalId)))
  const remoteOnly = articles.filter((item) => !snapshotIds.has(String(item._id))).map((item) => ({
    id: String(item._id), slug: item.slug, title: item.title
  }))
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      inspected: items.length,
      contentPush: items.filter((item) => item.pushFields.length > 0 && !item.blocked).length,
      metadataPull: items.filter((item) => item.pullFields.length > 0 && !item.blocked).length,
      conflicts: items.filter((item) => item.blocked).length,
      remoteOnly: remoteOnly.length,
      aligned: items.filter((item) => item.pushFields.length === 0 && item.pullFields.length === 0 && !item.blocked).length
    },
    items,
    remoteOnly
  }
}

export function buildContentPushPayload(item) {
  const payload = {}
  item.pushFields.forEach((field) => {
    if (field === 'contentHash') payload.contentMarkdown = item.local.contentMarkdown
    else payload[field] = item.local[field]
  })
  if (item.pushFields.includes('contentHash')) payload.sourceHash = item.local.contentHash
  return payload
}
