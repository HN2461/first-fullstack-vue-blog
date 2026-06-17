function toNumber(value, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

export function toPageResult(result, fallbackPageSize = 10) {
  if (Array.isArray(result)) {
    return {
      items: result,
      total: result.length,
      page: 1,
      pageSize: result.length || fallbackPageSize
    }
  }

  const items = Array.isArray(result?.items) ? result.items : []

  return {
    items,
    total: toNumber(result?.total, items.length),
    page: toNumber(result?.page, 1),
    pageSize: toNumber(result?.pageSize, fallbackPageSize)
  }
}

export function toItemList(result) {
  return toPageResult(result).items
}
