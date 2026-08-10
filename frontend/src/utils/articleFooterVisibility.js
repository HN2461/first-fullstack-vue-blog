export function shouldShowArticleFooter({
  isAdminPreview = false,
  isImmersiveReading = false,
  isSessionHidden = false,
  isLoggedIn = false,
  preferenceEnabled = false
} = {}) {
  if (isAdminPreview || isImmersiveReading || isSessionHidden) return false

  // 个人偏好只约束登录用户，未登录访客仍可使用公开文章操作栏。
  return !isLoggedIn || preferenceEnabled
}
