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
      { key: 'fade-soft', name: '柔和淡入', tone: '#376b7e', accent: '#b6dce5', preview: 'wash' },
      { key: 'float-up', name: '轻浮上升', tone: '#5d7661', accent: '#c8e7c4', preview: 'rise' },
      { key: 'slide-left', name: '左侧滑入', tone: '#7d6550', accent: '#e6c5a5', preview: 'left' },
      { key: 'slide-right', name: '右侧滑入', tone: '#596d8f', accent: '#bccdeb', preview: 'right' },
      { key: 'scale-pop', name: '缩放聚焦', tone: '#866e53', accent: '#ecd7b3', preview: 'ring' },
      { key: 'flip-3d', name: '三维翻页', tone: '#4f6982', accent: '#b9d3e7', preview: 'page' }
    ]
  },
  {
    key: 'particle',
    label: '粒子视觉',
    effects: [
      { key: 'starlight', name: '星光点阵', tone: '#315f86', accent: '#f8d66d', preview: 'stars' },
      { key: 'firework-bloom', name: '烟花绽放', tone: '#a35147', accent: '#ffd166', preview: 'firework' },
      { key: 'particle-burst', name: '粒子散开', tone: '#5e5a91', accent: '#8bd3ff', preview: 'burst' },
      { key: 'ripple', name: '水波扩散', tone: '#2f756f', accent: '#a7f3d0', preview: 'ripple' },
      { key: 'light-sweep', name: '流光扫描', tone: '#7c7246', accent: '#fff2a8', preview: 'beam' }
    ]
  },
  {
    key: 'ambient',
    label: '氛围感',
    effects: [
      { key: 'meteor-night', name: '流星夜幕', tone: '#33425d', accent: '#dbeafe', preview: 'meteor' },
      { key: 'shadow-sweep', name: '光影掠过', tone: '#5d5a4f', accent: '#f1e8d2', preview: 'shadow' },
      { key: 'flash-open', name: '白闪启幕', tone: '#767676', accent: '#ffffff', preview: 'flash' },
      { key: 'curtain', name: '幕布展开', tone: '#7d4c55', accent: '#e0a7b2', preview: 'curtain' }
    ]
  },
  {
    key: 'impact',
    label: '炫酷炸裂',
    effects: [
      { key: 'shatter', name: '碎片破场', tone: '#725166', accent: '#e7c2d5', preview: 'shard' },
      { key: 'color-burst', name: '色彩爆开', tone: '#986241', accent: '#38bdf8', preview: 'color' },
      { key: 'shockwave', name: '冲击波', tone: '#446a8c', accent: '#c6e7ff', preview: 'shock' },
      { key: 'screen-shake', name: '屏幕震荡', tone: '#714e45', accent: '#f4b4a4', preview: 'glitch' }
    ]
  },
  {
    key: 'soft',
    label: '轻柔氛围',
    effects: [
      { key: 'petals', name: '花瓣飘落', tone: '#8f5f6b', accent: '#ffd6e3', preview: 'petal' },
      { key: 'snow', name: '细雪落幕', tone: '#60788f', accent: '#e0f2fe', preview: 'snow' },
      { key: 'glow', name: '柔光浮现', tone: '#6b784d', accent: '#f4f6b1', preview: 'glow' },
      { key: 'fog', name: '薄雾散开', tone: '#6c7377', accent: '#edf2f7', preview: 'fog' }
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
