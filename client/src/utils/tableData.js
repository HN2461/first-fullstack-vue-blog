function toNumber(value, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function pickArray(source) {
  if (Array.isArray(source)) {
    return source
  }

  if (!source || typeof source !== 'object') {
    return null
  }

  const candidates = ['items', 'list', 'rows', 'records', 'content', 'data']

  for (const key of candidates) {
    if (Array.isArray(source[key])) {
      return source[key]
    }
  }

  return null
}

function pickTotal(source, items) {
  if (!source || typeof source !== 'object') {
    return Array.isArray(items) ? items.length : 0
  }

  const candidates = ['total', 'count', 'totalCount']

  for (const key of candidates) {
    if (source[key] !== undefined && source[key] !== null) {
      return toNumber(source[key], Array.isArray(items) ? items.length : 0)
    }
  }

  return Array.isArray(items) ? items.length : 0
}

/**
 * 统一表格数据格式，兼容常见列表响应形态。
 * 支持:
 * - Array
 * - { items, total }
 * - { list/rows/records/content, total/count/totalCount }
 * - { data: { ...分页对象... } }
 */
export function normalizeTableResponse(payload) {
  const directItems = pickArray(payload)
  if (directItems) {
    return {
      items: directItems,
      total: pickTotal(payload, directItems),
      raw: payload
    }
  }

  const nestedPayload = payload && typeof payload === 'object' ? payload.data : null
  const nestedItems = pickArray(nestedPayload)
  if (nestedItems) {
    return {
      items: nestedItems,
      total: pickTotal(nestedPayload, nestedItems),
      raw: payload
    }
  }

  return {
    items: [],
    total: 0,
    raw: payload
  }
}
