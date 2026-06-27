export const SITE_ENTRANCE_EFFECT_OPTIONS = [
  {
    label: '礼花欢迎',
    value: 'confetti-fireworks',
    description: '多点烟花和星形纸屑，适合朋友进入时的庆祝感。'
  },
  {
    label: '霓虹播报',
    value: 'cyber-broadcast',
    description: '扫描线、侧向彩带和高亮标题，像一条站内广播。'
  },
  {
    label: '星门入场',
    value: 'star-gate',
    description: '环形星光和中心爆发，更偏科幻开场。'
  },
  {
    label: '金色彩带',
    value: 'golden-rain',
    description: '暖金色彩带雨，克制但有仪式感。'
  }
]

export const DEFAULT_SITE_ENTRANCE_EFFECT = {
  enabled: false,
  effectKey: 'confetti-fireworks',
  titleTemplate: '欢迎 {username} 进入',
  subtitle: '今晚的知识库已点亮',
  duration: 4,
  triggerPages: ['consoleHome']
}

export const SITE_ENTRANCE_EFFECT_KEYS = SITE_ENTRANCE_EFFECT_OPTIONS.map((option) => option.value)

export function normalizeSiteEntranceEffectConfig(config = {}) {
  const effectKeys = new Set(SITE_ENTRANCE_EFFECT_KEYS)
  const triggerValues = new Set(['login', 'register', 'home', 'consoleHome'])
  const triggerPages = Array.isArray(config.triggerPages)
    ? config.triggerPages.filter((page) => triggerValues.has(page))
    : DEFAULT_SITE_ENTRANCE_EFFECT.triggerPages

  return {
    ...DEFAULT_SITE_ENTRANCE_EFFECT,
    ...config,
    enabled: Boolean(config.enabled),
    effectKey: effectKeys.has(config.effectKey) ? config.effectKey : DEFAULT_SITE_ENTRANCE_EFFECT.effectKey,
    titleTemplate: String(config.titleTemplate || DEFAULT_SITE_ENTRANCE_EFFECT.titleTemplate).slice(0, 80),
    subtitle: String(config.subtitle || DEFAULT_SITE_ENTRANCE_EFFECT.subtitle).slice(0, 120),
    duration: Math.min(8, Math.max(2, Number(config.duration) || DEFAULT_SITE_ENTRANCE_EFFECT.duration)),
    triggerPages: triggerPages.length ? [...new Set(triggerPages)] : DEFAULT_SITE_ENTRANCE_EFFECT.triggerPages
  }
}

export function renderSiteEntranceTitle(template, context = {}) {
  const values = {
    username: context.username || '朋友',
    siteTitle: context.siteTitle || '个人全栈博客系统'
  }

  return String(template || DEFAULT_SITE_ENTRANCE_EFFECT.titleTemplate).replace(
    /\{(username|siteTitle)\}/g,
    (_match, key) => values[key]
  )
}
