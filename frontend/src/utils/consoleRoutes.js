const EXACT_CONSOLE_ROUTE_PATHS = new Set([
  '/console',
  '/console/articles',
  '/console/article-directory',
  '/console/search',
  '/console/memos',
  '/console/ledger',
  '/console/ledger/overview',
  '/console/ledger/entries',
  '/console/ledger/daily',
  '/console/ledger/moments',
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
  '/console/manage/project-timeline',
  '/console/manage/trash'
])

const PREFIX_CONSOLE_ROUTE_PATHS = [
  '/console/articles/',
  '/console/ledger/',
  '/console/article-directory/articles/',
  '/console/article-directory/categories/',
  '/console/article-directory/tags/',
  '/console/categories/',
  '/console/tags/',
  '/console/manage/articles/'
]

export function isKnowledgeConsolePath(path = '') {
  return path === '/console/articles' ||
    path === '/console/article-directory' ||
    path === '/console/memos' ||
    path === '/console/ledger' ||
    path.startsWith('/console/ledger/') ||
    path === '/console/search' ||
    path === '/console/profile' ||
    path.startsWith('/console/articles/') ||
    path.startsWith('/console/article-directory/articles/') ||
    path.startsWith('/console/article-directory/categories/') ||
    path.startsWith('/console/article-directory/tags/') ||
    path.startsWith('/console/categories/') ||
    path.startsWith('/console/tags/')
}

export function isKnownConsolePath(path = '') {
  return EXACT_CONSOLE_ROUTE_PATHS.has(path) ||
    PREFIX_CONSOLE_ROUTE_PATHS.some((prefix) => path.startsWith(prefix))
}

export function isKnownConsoleRoutePath(routePath = '') {
  return EXACT_CONSOLE_ROUTE_PATHS.has(routePath) ||
    PREFIX_CONSOLE_ROUTE_PATHS.some((prefix) => routePath.startsWith(prefix))
}
