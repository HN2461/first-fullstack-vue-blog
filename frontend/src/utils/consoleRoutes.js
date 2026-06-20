const EXACT_CONSOLE_ROUTE_PATHS = new Set([
  '/console',
  '/console/articles',
  '/console/search',
  '/console/memos',
  '/console/profile',
  '/console/manage/articles',
  '/console/write',
  '/console/manage/articles/new',
  '/console/manage/articles/import',
  '/console/manage/categories',
  '/console/manage/migration',
  '/console/manage/tags',
  '/console/manage/comments',
  '/console/manage/users',
  '/console/manage/roles',
  '/console/manage/menus',
  '/console/manage/approvals',
  '/console/manage/media',
  '/console/manage/notifications',
  '/console/manage/settings',
  '/console/manage/monitor',
  '/console/manage/trash'
])

const PREFIX_CONSOLE_ROUTE_PATHS = [
  '/console/articles/',
  '/console/categories/',
  '/console/tags/',
  '/console/manage/articles/'
]

export function isKnowledgeConsolePath(path = '') {
  return path === '/console/articles' ||
    path === '/console/memos' ||
    path === '/console/search' ||
    path === '/console/profile' ||
    path.startsWith('/console/articles/') ||
    path.startsWith('/console/categories/') ||
    path.startsWith('/console/tags/')
}

export function isKnownConsolePath(path = '') {
  return EXACT_CONSOLE_ROUTE_PATHS.has(path) ||
    PREFIX_CONSOLE_ROUTE_PATHS.some((prefix) => path.startsWith(prefix))
}

export function isKnownConsoleRoutePath(routePath = '') {
  return EXACT_CONSOLE_ROUTE_PATHS.has(routePath)
}
