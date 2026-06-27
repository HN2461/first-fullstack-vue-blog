export const ENTRANCE_TRIGGER_OPTIONS = [
  { label: '登录页', value: 'login' },
  { label: '注册页', value: 'register' },
  { label: '网站首页', value: 'home' },
  { label: '登录完成主页', value: 'consoleHome' }
]

export const DEFAULT_ENTRANCE_EFFECT = {
  enabled: false,
  effectKey: 'fade-soft',
  duration: 4,
  triggerPages: ['consoleHome']
}

export const ENTRANCE_EFFECT_CATEGORIES = [
  {
    key: 'basic',
    label: '基础简约',
    effects: [
      { key: 'fade-soft', name: '柔和淡入', tone: '#22b8cf', accent: '#d6fbff', preview: 'wash' },
      { key: 'float-up', name: '轻浮上升', tone: '#35c36b', accent: '#d8ffd9', preview: 'rise' },
      { key: 'slide-left', name: '左侧滑入', tone: '#ff9f1c', accent: '#fff1bf', preview: 'left' },
      { key: 'slide-right', name: '右侧滑入', tone: '#4dabf7', accent: '#d8efff', preview: 'right' },
      { key: 'scale-pop', name: '缩放聚焦', tone: '#ff7ab6', accent: '#ffe0ef', preview: 'ring' },
      { key: 'flip-3d', name: '三维翻页', tone: '#22b8cf', accent: '#fff2a8', preview: 'page' }
    ]
  },
  {
    key: 'particle',
    label: '粒子视觉',
    effects: [
      { key: 'starlight', name: '星光点阵', tone: '#2f80ed', accent: '#ffe66d', preview: 'stars' },
      { key: 'firework-bloom', name: '烟花绽放', tone: '#ff5d8f', accent: '#ffd166', preview: 'firework' },
      { key: 'particle-burst', name: '粒子散开', tone: '#7c5cff', accent: '#7dd3fc', preview: 'burst' },
      { key: 'ripple', name: '水波扩散', tone: '#00bcd4', accent: '#b2f7ef', preview: 'ripple' },
      { key: 'light-sweep', name: '流光扫描', tone: '#ffc53d', accent: '#fff7ad', preview: 'beam' }
    ]
  },
  {
    key: 'ambient',
    label: '氛围感',
    effects: [
      { key: 'meteor-night', name: '流星夜幕', tone: '#2f80ed', accent: '#fff7ad', preview: 'meteor' },
      { key: 'shadow-sweep', name: '光影掠过', tone: '#26c6da', accent: '#fff176', preview: 'shadow' },
      { key: 'flash-open', name: '白闪启幕', tone: '#7dd3fc', accent: '#ffffff', preview: 'flash' },
      { key: 'curtain', name: '幕布展开', tone: '#ff8fab', accent: '#ffe66d', preview: 'curtain' }
    ]
  },
  {
    key: 'impact',
    label: '炫酷炸裂',
    effects: [
      { key: 'shatter', name: '碎片破场', tone: '#ff7ab6', accent: '#7dd3fc', preview: 'shard' },
      { key: 'color-burst', name: '色彩爆开', tone: '#ff7a00', accent: '#00d1ff', preview: 'color' },
      { key: 'shockwave', name: '冲击波', tone: '#22b8cf', accent: '#d8fb7d', preview: 'shock' },
      { key: 'screen-shake', name: '屏幕震荡', tone: '#00c2a8', accent: '#ffde59', preview: 'glitch' }
    ]
  },
  {
    key: 'soft',
    label: '轻柔氛围',
    effects: [
      { key: 'petals', name: '花瓣飘落', tone: '#ff6fae', accent: '#ffd6e8', preview: 'petal' },
      { key: 'snow', name: '细雪落幕', tone: '#56ccf2', accent: '#e0fbff', preview: 'snow' },
      { key: 'glow', name: '柔光浮现', tone: '#8bd450', accent: '#fff59d', preview: 'glow' },
      { key: 'fog', name: '薄雾散开', tone: '#9ad7e5', accent: '#f6fdff', preview: 'fog' }
    ]
  }
]

export const ENTRANCE_EFFECTS = ENTRANCE_EFFECT_CATEGORIES.flatMap((category) => (
  category.effects.map((effect) => ({
    ...effect,
    category: category.key,
    categoryLabel: category.label
  }))
))

export function normalizeEntranceEffectConfig(config = {}) {
  const effectKeys = new Set(ENTRANCE_EFFECTS.map((effect) => effect.key))
  const triggerValues = new Set(ENTRANCE_TRIGGER_OPTIONS.map((option) => option.value))
  const triggerPages = Array.isArray(config.triggerPages)
    ? config.triggerPages.filter((page) => triggerValues.has(page))
    : DEFAULT_ENTRANCE_EFFECT.triggerPages

  return {
    ...DEFAULT_ENTRANCE_EFFECT,
    ...config,
    enabled: Boolean(config.enabled),
    effectKey: effectKeys.has(config.effectKey) ? config.effectKey : DEFAULT_ENTRANCE_EFFECT.effectKey,
    duration: Math.min(8, Math.max(2, Number(config.duration) || DEFAULT_ENTRANCE_EFFECT.duration)),
    triggerPages: triggerPages.length ? [...new Set(triggerPages)] : DEFAULT_ENTRANCE_EFFECT.triggerPages
  }
}

export function getEntranceEffectMeta(effectKey) {
  return ENTRANCE_EFFECTS.find((effect) => effect.key === effectKey) || ENTRANCE_EFFECTS[0]
}
