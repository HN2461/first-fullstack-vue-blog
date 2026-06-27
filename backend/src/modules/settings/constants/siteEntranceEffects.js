export const SITE_ENTRANCE_EFFECT_KEYS = [
  'confetti-fireworks',
  'cyber-broadcast',
  'star-gate',
  'golden-rain'
]

export const SITE_ENTRANCE_TRIGGER_PAGES = ['login', 'register', 'home', 'consoleHome']

export const DEFAULT_SITE_ENTRANCE_EFFECT = {
  enabled: false,
  effectKey: 'confetti-fireworks',
  titleTemplate: '欢迎 {username} 进入',
  subtitle: '今晚的知识库已点亮',
  duration: 4,
  triggerPages: ['consoleHome']
}
