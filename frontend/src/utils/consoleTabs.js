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

export function shouldConfirmConsoleTabClose(tab, activeKey, isDirty) {
  return Boolean(tab && isDirty && (tab.key !== activeKey || tab.pageCacheEnabled))
}

export function findExactRouteMenu(route, rootMenus = []) {
  const menus = flattenMenus(rootMenus)
  return [...menus].reverse().find((menu) => {
    return menu.enabled !== false && menu.routePath && menu.routePath === route.path
  }) || null
}

export function findDisplayRouteMenu(route, rootMenus = []) {
  const exactMenu = findExactRouteMenu(route, rootMenus)
  if (exactMenu) return exactMenu

  return flattenMenus(rootMenus)
    .filter((menu) => {
      if (menu.enabled === false || !menu.routePath) return false
      return route.path.startsWith(`${menu.routePath}/`)
    })
    .sort((left, right) => right.routePath.length - left.routePath.length)[0] || null
}

function getRouteTitle(route, menu) {
  const baseTitle = menu?.name || route.meta?.title || '控制台页面'
  if (route.meta?.deferTabTitle) return baseTitle
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
  const displayMenu = findDisplayRouteMenu(route, rootMenus)
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
    icon: displayMenu?.icon || route.meta?.icon || 'FileTextOutlined',
    pageCacheEnabled,
    affix: Boolean(options.affix)
  }
}

export function reorderConsoleTabs(tabs = [], oldIndex, newIndex) {
  const nextTabs = [...tabs]
  if (
    oldIndex === newIndex ||
    oldIndex < 0 ||
    newIndex < 0 ||
    oldIndex >= nextTabs.length ||
    newIndex >= nextTabs.length
  ) {
    return nextTabs
  }

  const [movedTab] = nextTabs.splice(oldIndex, 1)
  nextTabs.splice(newIndex, 0, movedTab)
  return nextTabs
}

export function isRestorableConsoleRoute(route, canAccessPath) {
  if (!route?.path?.startsWith('/console')) return false
  const hasRealRoute = route.matched?.some((record) => {
    return record.name && record.name !== 'NotFound' && record.name !== 'ConsoleUnavailable'
  })
  if (!hasRealRoute && route.name !== 'ConsoleUnavailable') return false
  return canAccessPath(route.path)
}
