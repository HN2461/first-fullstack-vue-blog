/** 认证页间传递站内目标，保留文章查询和章节，缺失或外部地址时回到控制台。 */
export function getReturnPath(value) {
  if (typeof value !== 'string' || !/^\/(?!\/)/.test(value) || /[\\\u0000-\u001f]/.test(value)) return '/console'
  return value
}

export function getAuthExpiredRedirect(route) {
  if (!route || route.path === '/login') return null
  if (!route.meta?.requiresAuth) return null

  return {
    name: 'Login',
    query: { redirect: route.fullPath }
  }
}
