function flattenMenus(items = []) {
  return items.flatMap((item) => [item, ...flattenMenus(item.children || [])])
}

function normalizeParamValue(value) {
  if (Array.isArray(value)) return value.join(',')
  return String(value ?? '')
}

export function buildConsoleTabKey(route) {
  if (route.meta?.tabKey) return String(route.meta.tabKey)

  const routeName = String(route.name || route.path || 'console-page')
  const params = Object.entries(route.params || {})
    .filter(([, value]) => value !== undefined && value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${normalizeParamValue(value)}`)

  return params.length ? `${routeName}:${params.join('&')}` : routeName
}

export function findExactRouteMenu(route, rootMenus = []) {
  const menus = flattenMenus(rootMenus)
  return [...menus].reverse().find((menu) => {
    return menu.enabled !== false && menu.routePath && menu.routePath === route.path
  }) || null
}

function getRouteTitle(route, menu) {
  const baseTitle = menu?.name || route.meta?.title || '控制台页面'
  const detailValue = route.params?.category || route.params?.tag || route.params?.slug
  if (!detailValue) return baseTitle

  let decodedValue = String(detailValue)
  try {
    decodedValue = decodeURIComponent(decodedValue)
  } catch {
    // 路由参数不是合法 URI 编码时保留原值，避免页签创建失败。
  }
  return `${baseTitle} · ${decodedValue}`
}

export function createConsoleTab(route, rootMenus = [], options = {}) {
  const menu = findExactRouteMenu(route, rootMenus)
  const routeCacheSetting = route.meta?.pageCacheEnabled
  const pageCacheEnabled = typeof routeCacheSetting === 'boolean'
    ? routeCacheSetting
    : Boolean(menu?.pageCacheEnabled && menu.openMode !== 'blank')

  return {
    key: buildConsoleTabKey(route),
    name: String(route.name || ''),
    title: getRouteTitle(route, menu),
    fullPath: route.fullPath,
    path: route.path,
    icon: menu?.icon || '',
    pageCacheEnabled,
    affix: Boolean(options.affix)
  }
}

export function isRestorableConsoleRoute(route, canAccessPath) {
  if (!route?.path?.startsWith('/console')) return false
  const hasRealRoute = route.matched?.some((record) => {
    return record.name && record.name !== 'NotFound' && record.name !== 'ConsoleUnavailable'
  })
  if (!hasRealRoute && route.name !== 'ConsoleUnavailable') return false
  return canAccessPath(route.path)
}
