export function openMenuRoute(router, menu, fallbackPath = '') {
  const targetPath = menu?.routePath || fallbackPath || ''
  if (!targetPath) return

  if (menu?.openMode === 'blank') {
    window.open(targetPath, '_blank', 'noopener')
    return
  }

  router.push(targetPath)
}
