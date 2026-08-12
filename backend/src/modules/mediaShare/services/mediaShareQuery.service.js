const SORT_FIELDS = new Set(['createdAt', 'updatedAt', 'expiresAt', 'accessCount', 'viewCount', 'downloadCount', 'name'])

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildAvailableQuery(now) {
  return {
    status: 'active',
    $and: [
      { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
      {
        $or: [
          { maxAccessCount: null },
          { $expr: { $lt: ['$accessCount', '$maxAccessCount'] } }
        ]
      }
    ]
  }
}

export function buildMediaShareStatusQuery(status, now = new Date()) {
  if (status === 'revoked') return { status: 'revoked' }
  if (status === 'expired') return { status: 'active', expiresAt: { $ne: null, $lte: now } }
  if (status === 'exhausted') {
    return {
      status: 'active',
      $and: [
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
        { maxAccessCount: { $ne: null } },
        { $expr: { $gte: ['$accessCount', '$maxAccessCount'] } }
      ]
    }
  }
  if (status === 'active') return buildAvailableQuery(now)
  return {}
}

export function buildMediaShareListQuery(input = {}, actorQuery = {}, now = new Date()) {
  const conditions = [actorQuery]
  const keyword = String(input.keyword || '').trim()
  if (keyword) {
    const matcher = new RegExp(escapeRegex(keyword), 'i')
    conditions.push({ $or: [{ name: matcher }, { description: matcher }] })
  }
  if (['public', 'password'].includes(input.mode)) conditions.push({ mode: input.mode })
  if (['active', 'expired', 'exhausted', 'revoked'].includes(input.status)) {
    conditions.push(buildMediaShareStatusQuery(input.status, now))
  }

  const createdAt = {}
  const createdFrom = new Date(input.createdFrom || '')
  const createdTo = new Date(input.createdTo || '')
  if (Number.isFinite(createdFrom.getTime())) createdAt.$gte = createdFrom
  if (Number.isFinite(createdTo.getTime())) createdAt.$lte = createdTo
  if (Object.keys(createdAt).length) conditions.push({ createdAt })

  return conditions.length === 1 ? conditions[0] : { $and: conditions }
}

export function buildMediaShareSort(sortField, sortOrder) {
  const field = SORT_FIELDS.has(sortField) ? sortField : 'createdAt'
  const direction = String(sortOrder).toLowerCase() === 'asc' ? 1 : -1
  return { [field]: direction, _id: direction }
}

export async function countMediaShareStatuses(Model, actorQuery, now = new Date()) {
  const statuses = ['active', 'expired', 'exhausted', 'revoked']
  const values = await Promise.all(statuses.map((status) => Model.countDocuments({
    $and: [actorQuery, buildMediaShareStatusQuery(status, now)]
  })))
  const all = await Model.countDocuments(actorQuery)
  return Object.fromEntries([['all', all], ...statuses.map((status, index) => [status, values[index]])])
}
