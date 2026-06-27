import chineseDays from 'chinese-days'

const { getLunarDate, getSolarDateFromLunar, getSolarTerms } = chineseDays

export const MAJOR_FESTIVAL_LABEL = '元旦、春节、中秋、国庆和生日'

const SOLAR_FESTIVALS = [
  { key: 'new-year', name: '元旦', type: 'solar', month: 1, day: 1, text: '新年快乐', effect: 'new-year', level: 'major', icons: ['🎆', '✨'] },
  { key: 'valentine', name: '情人节', type: 'solar', month: 2, day: 14, text: '愿今天有温柔相伴', effect: 'love', level: 'normal', icons: ['💗', '🌹'] },
  { key: 'labor', name: '劳动节', type: 'solar', month: 5, day: 1, text: '劳动节快乐', effect: 'labor', level: 'normal', icons: ['🌿', '✨'] },
  { key: 'national-day', name: '国庆节', type: 'solar', month: 10, day: 1, text: '山河锦绣，国泰民安', effect: 'national', level: 'major', icons: ['🇨🇳', '🎉'] },
  { key: 'christmas', name: '圣诞节', type: 'solar', month: 12, day: 25, text: '愿冬夜有暖意', effect: 'christmas', level: 'normal', icons: ['🎄', '❄️'] }
]

const LUNAR_FESTIVALS = [
  { key: 'spring-festival', name: '春节', type: 'lunar', month: 1, day: 1, text: '新春快乐，万事顺遂', effect: 'spring', level: 'major', icons: ['🏮', '🧧'] },
  { key: 'lantern', name: '元宵节', type: 'lunar', month: 1, day: 15, text: '灯火团圆，元宵喜乐', effect: 'lantern', level: 'normal', icons: ['🏮', '✨'] },
  { key: 'dragon-boat', name: '端午节', type: 'lunar', month: 5, day: 5, text: '端午安康', effect: 'duanwu', level: 'normal', icons: ['🥟', '🌿'] },
  { key: 'qixi', name: '七夕', type: 'lunar', month: 7, day: 7, text: '愿星河有约', effect: 'qixi', level: 'normal', icons: ['✨', '💫'] },
  { key: 'mid-autumn', name: '中秋节', type: 'lunar', month: 8, day: 15, text: '月满人团圆', effect: 'mid-autumn', level: 'major', icons: ['🥮', '🌕'] },
  { key: 'double-ninth', name: '重阳节', type: 'lunar', month: 9, day: 9, text: '岁岁重阳，久久安康', effect: 'chongyang', level: 'normal', icons: ['🍂', '🌼'] }
]

const SOLAR_TERM_EFFECT = {
  pure_brightness: { key: 'qingming', name: '清明', text: '清明时节，心怀清朗', effect: 'qingming', level: 'normal', icons: ['🌿', '☔'] },
  the_winter_solstice: { key: 'winter-solstice', name: '冬至', text: '冬至安康', effect: 'winter', level: 'normal', icons: ['❄️', '🥟'] }
}

const EFFECT_META = {
  spring: { accent: '#c2410c', tint: '#fff1f2', particle: ['🏮', '🧧', '✨'] },
  lantern: { accent: '#dc2626', tint: '#fff1f2', particle: ['🏮', '✨'] },
  duanwu: { accent: '#15803d', tint: '#f0fdf4', particle: ['🥟', '🌿'] },
  'mid-autumn': { accent: '#b45309', tint: '#fffbeb', particle: ['🥮', '🌕', '✨'] },
  national: { accent: '#dc2626', tint: '#fff1f2', particle: ['🇨🇳', '🎉', '✨'] },
  christmas: { accent: '#0f766e', tint: '#ecfdf5', particle: ['🎄', '❄️'] },
  love: { accent: '#db2777', tint: '#fdf2f8', particle: ['💗', '🌹'] },
  qixi: { accent: '#7c3aed', tint: '#f5f3ff', particle: ['✨', '💫'] },
  qingming: { accent: '#4d7c0f', tint: '#f7fee7', particle: ['🌿', '☔'] },
  winter: { accent: '#0369a1', tint: '#eff6ff', particle: ['❄️', '🥟'] },
  labor: { accent: '#047857', tint: '#ecfdf5', particle: ['🌿', '✨'] },
  chongyang: { accent: '#b45309', tint: '#fffbeb', particle: ['🍂', '🌼'] },
  'new-year': { accent: '#2563eb', tint: '#eff6ff', particle: ['🎆', '✨'] }
}

function pad(value) {
  return String(value).padStart(2, '0')
}

export function formatDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey).split('-').map(Number)
  return new Date(year, month - 1, day)
}

function diffDays(leftDateKey, rightDateKey) {
  const left = parseDateKey(leftDateKey)
  const right = parseDateKey(rightDateKey)
  return Math.round((left - right) / 86400000)
}

function solarDate(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`
}

function lunarDate(year, month, day) {
  const result = getSolarDateFromLunar(`${year}-${pad(month)}-${pad(day)}`)
  return result?.date || ''
}

function normalizeFestival(festival, date, source = festival.type) {
  const meta = EFFECT_META[festival.effect] || EFFECT_META['new-year']
  return {
    ...festival,
    date,
    source,
    accent: meta.accent,
    tint: meta.tint,
    particle: meta.particle,
    duration: festival.duration || (festival.level === 'major' ? [-2, 2] : [-1, 1])
  }
}

function buildYearFestivals(year) {
  const solar = SOLAR_FESTIVALS.map((festival) => normalizeFestival(
    festival,
    solarDate(year, festival.month, festival.day),
    '公历节日'
  ))
  const lunar = LUNAR_FESTIVALS.map((festival) => normalizeFestival(
    festival,
    lunarDate(year, festival.month, festival.day),
    '农历传统节日'
  )).filter((festival) => festival.date)
  const terms = getSolarTerms(`${year}-01-01`, `${year}-12-31`)
    .filter((term) => SOLAR_TERM_EFFECT[term.term])
    .map((term) => normalizeFestival({
      ...SOLAR_TERM_EFFECT[term.term],
      type: 'solar-term'
    }, term.date, '二十四节气'))

  return [...solar, ...lunar, ...terms]
}

function buildSolarBirthday(birthday, year) {
  if (!birthday) return null
  const [, month, day] = birthday.split('-')
  return normalizeFestival({
    key: 'birthday-solar',
    name: '阳历生日',
    type: 'birthday',
    text: '愿今天被认真庆祝',
    effect: 'birthday',
    level: 'major',
    icons: ['🎂', '✨']
  }, `${year}-${month}-${day}`, '个人生日')
}

function buildLunarBirthday(birthday, year) {
  if (!birthday) return null
  try {
    const lunar = getLunarDate(birthday)
    const result = getSolarDateFromLunar(`${year}-${pad(lunar.lunarMon)}-${pad(lunar.lunarDay)}`)
    if (!result?.date) return null
    return normalizeFestival({
      key: 'birthday-lunar',
      name: '农历生日',
      type: 'birthday',
      text: `农历${lunar.lunarMonCN}${lunar.lunarDayCN}，愿这一岁更闪亮`,
      effect: 'birthday',
      level: 'major',
      icons: ['🎂', '🌙']
    }, result.date, '个人生日')
  } catch {
    return null
  }
}

function buildBirthdayFestivals(year, birthday = '', birthdayCalendar = 'solar') {
  if (!birthday) return []
  const items = []
  if (birthdayCalendar === 'solar' || birthdayCalendar === 'both') {
    items.push(buildSolarBirthday(birthday, year))
  }
  if (birthdayCalendar === 'lunar' || birthdayCalendar === 'both') {
    items.push(buildLunarBirthday(birthday, year))
  }
  return items.filter(Boolean)
}

function buildCalendarItems(serverDateKey, options = {}) {
  const today = parseDateKey(serverDateKey)
  const year = today.getFullYear()
  return [
    ...buildYearFestivals(year),
    ...buildBirthdayFestivals(year, options.birthday, options.birthdayCalendar)
  ].map((festival) => ({
    ...festival,
    daysUntil: diffDays(festival.date, serverDateKey),
    absDays: Math.abs(diffDays(festival.date, serverDateKey))
  }))
}

export function getFestivalSchedule(serverDateKey, count = 10, options = {}) {
  const dates = buildCalendarItems(serverDateKey, options)

  return dates
    .filter((festival) => festival.daysUntil >= 0)
    .sort((left, right) => left.daysUntil - right.daysUntil || left.date.localeCompare(right.date))
    .slice(0, count)
}

export function getFestivalHistory(serverDateKey, count = 6, options = {}) {
  return buildCalendarItems(serverDateKey, options)
    .filter((festival) => festival.daysUntil < 0)
    .sort((left, right) => right.daysUntil - left.daysUntil || right.date.localeCompare(left.date))
    .slice(0, count)
}

export function getActiveFestival(serverDateKey) {
  const today = parseDateKey(serverDateKey)
  const candidates = [
    ...buildYearFestivals(today.getFullYear() - 1),
    ...buildYearFestivals(today.getFullYear()),
    ...buildYearFestivals(today.getFullYear() + 1)
  ]

  return candidates
    .map((festival) => {
      const daysUntil = diffDays(festival.date, serverDateKey)
      const [before, after] = festival.duration
      return {
        ...festival,
        daysUntil,
        active: daysUntil <= after && daysUntil >= before
      }
    })
    .filter((festival) => festival.active)
    .sort((left, right) => Math.abs(left.daysUntil) - Math.abs(right.daysUntil))
    .at(0) || null
}

export function getLunarSummary(serverDateKey) {
  try {
    const lunar = getLunarDate(serverDateKey)
    return `${lunar.lunarYearCN}${lunar.lunarMonCN}${lunar.lunarDayCN}`
  } catch {
    return ''
  }
}

export function getTodayKeyFromServer(serverTime) {
  if (!serverTime) return formatDateKey(new Date())
  return formatDateKey(new Date(serverTime))
}

export function getEffectStorageKey(device, userId, key) {
  return `festival:${device}:${userId || 'guest'}:${key}`
}

export function getDeviceType(isMobile) {
  return isMobile ? 'mobile' : 'pc'
}

export function getParticleItems(festival, isMobile) {
  const items = festival?.particle || ['✨']
  const amount = isMobile ? 8 : 18
  return Array.from({ length: amount }, (_, index) => ({
    id: `${festival?.key || 'festival'}-${index}`,
    text: items[index % items.length],
    left: `${Math.round((index + 1) * 100 / (amount + 1))}%`,
    delay: `${(index % 6) * 0.8}s`,
    duration: `${isMobile ? 9 + (index % 3) : 11 + (index % 5)}s`
  }))
}

export function buildBirthdayFestival(serverDateKey) {
  return {
    key: 'birthday',
    name: '生日快乐',
    text: '愿今天被认真庆祝',
    date: serverDateKey,
    daysUntil: 0,
    source: '生日彩蛋',
    accent: '#db2777',
    tint: '#fdf2f8',
    particle: ['🎂', '💗', '🎉'],
    icons: ['🎂', '💗'],
    effect: 'birthday',
    level: 'major'
  }
}
