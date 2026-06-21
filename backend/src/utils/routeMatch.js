function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function buildRoutePathRegex(routePath = '') {
  const normalized = String(routePath || '').trim()
  if (!normalized) return null

  const pattern = normalized
    .split('/')
    .map((segment) => {
      if (!segment) return ''
      if (segment.startsWith(':')) {
        return '[^/]+'
      }
      return escapeRegExp(segment)
    })
    .join('/')

  return new RegExp(`^${pattern}$`)
}

export function isRoutePathMatched(path = '', routePath = '') {
  const normalizedPath = String(path || '').trim()
  const normalizedRoutePath = String(routePath || '').trim()
  const regex = buildRoutePathRegex(normalizedRoutePath)
  if (!regex || !normalizedPath) return false

  if (normalizedRoutePath === '/console') {
    return regex.test(normalizedPath)
  }

  return regex.test(normalizedPath) || normalizedPath.startsWith(`${normalizedRoutePath}/`)
}
