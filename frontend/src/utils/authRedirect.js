export function getAuthExpiredRedirect(route) {
  if (!route || route.path === '/login') return null
  if (!route.meta?.requiresAuth) return null

  return {
    name: 'Login',
    query: { redirect: route.fullPath }
  }
}
