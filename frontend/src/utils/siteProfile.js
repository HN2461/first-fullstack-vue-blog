const SITE_PROFILE_STORAGE_KEY = 'blog-site-profile'

const defaultSiteEntranceEffect = {
  enabled: false,
  effectKey: 'confetti-fireworks',
  titleTemplate: '欢迎 {username} 进入',
  subtitle: '今晚的知识库已点亮',
  duration: 4,
  triggerPages: ['consoleHome']
}

export const defaultSiteProfile = {
  siteTitle: '个人全栈博客系统',
  siteDescription: '一个由 Vue、Express 和 MongoDB 驱动的个人技术博客。',
  authorName: 'Haonan',
  commentEnabled: true,
  defaultTheme: 'light',
  systemVersion: 'v1.0.0',
  accountRecovery: {
    enabled: true,
    instructions: '请联系站点管理员核验身份，核验通过后将获得一次性密码重置链接。',
    contactHours: '',
    qq: { enabled: false, account: '', allowLaunch: true, qrCodeUrl: '' },
    wechat: { enabled: false, account: '', qrCodeUrl: '' },
    email: { enabled: false, address: '' }
  },
  siteEntranceEffect: { ...defaultSiteEntranceEffect }
}

export function getCachedSiteProfile() {
  try {
    const raw = localStorage.getItem(SITE_PROFILE_STORAGE_KEY)
    if (!raw) return { ...defaultSiteProfile }
    return { ...defaultSiteProfile, ...JSON.parse(raw) }
  } catch {
    return { ...defaultSiteProfile }
  }
}

export function setCachedSiteProfile(profile) {
  localStorage.setItem(SITE_PROFILE_STORAGE_KEY, JSON.stringify({
    ...defaultSiteProfile,
    ...profile
  }))
}

export function getSiteTitleSuffix() {
  return getCachedSiteProfile().siteTitle || defaultSiteProfile.siteTitle
}

export function buildDocumentTitle(routeTitle, siteTitle = getSiteTitleSuffix()) {
  return routeTitle ? `${routeTitle} - ${siteTitle}` : siteTitle
}
