import chineseDays from 'chinese-days'
import {
  EFFECT_META,
  LUNAR_FESTIVAL_META,
  MAJOR_FESTIVAL_LABEL,
  SOLAR_FESTIVALS
} from './festivalCatalog'
import { DEFAULT_SOLAR_TERM_META, SOLAR_TERM_META } from './solarTermCatalog'

const { getLunarDate, getSolarDateFromLunar, getSolarTerms, getLunarFestivals } = chineseDays

export { MAJOR_FESTIVAL_LABEL }

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

function stableIndex(seed, length) {
  if (!length) return 0
  let hash = 0
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) % 1000003
  }
  return hash % length
}

function normalizeFestivalKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'festival'
}

function resolveLunarFestivalMeta(name) {
  const exact = LUNAR_FESTIVAL_META[name]
  if (exact) return exact

  const partialKey = Object.keys(LUNAR_FESTIVAL_META).find((key) => name.includes(key) || key.includes(name))
  if (partialKey) return LUNAR_FESTIVAL_META[partialKey]

  return {
    key: `lunar-${normalizeFestivalKey(name)}`,
    name,
    effect: 'lunar-folk',
    level: 'normal',
    icons: ['🌙', '✨'],
    greetings: [`${name}，愿今日顺遂安宁。`, `今日${name}，愿心有所安，事有所成。`]
  }
}

function normalizeFestival(festival, date, source = festival.type) {
  const meta = EFFECT_META[festival.effect] || EFFECT_META['new-year']
  const greetings = festival.greetings || [festival.text || `${festival.name}快乐`]
  const text = greetings[stableIndex(`${festival.key}:${date}`, greetings.length)]
  return {
    ...festival,
    date,
    source,
    text,
    greetings,
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
  const lunar = getLunarFestivals(`${year}-01-01`, `${year}-12-31`)
    .flatMap((day) => {
      return day.name
        .map(resolveLunarFestivalMeta)
        .map((festival) => normalizeFestival({
          ...festival,
          type: 'lunar'
        }, day.date, '农历传统节日'))
    })
  const terms = getSolarTerms(`${year}-01-01`, `${year}-12-31`)
    .map((term) => normalizeFestival({
      ...DEFAULT_SOLAR_TERM_META,
      ...(SOLAR_TERM_META[term.term] || {}),
      key: SOLAR_TERM_META[term.term]?.key || `solar-term-${term.term}`,
      name: term.name,
      type: 'solar-term'
    }, term.date, '二十四节气'))

  return dedupeFestivals([...solar, ...lunar, ...terms])
}

function dedupeFestivals(items) {
  const map = new Map()
  for (const item of items) {
    const key = `${item.date}:${item.key}`
    if (!map.has(key)) {
      map.set(key, item)
    }
  }
  return [...map.values()]
}

function buildSolarBirthday(birthday, year) {
  if (!birthday) return null
  const [, month, day] = birthday.split('-')
  return normalizeFestival({
    key: 'birthday-solar',
    name: '阳历生日',
    type: 'birthday',
    greetings: ['愿今天被认真庆祝。', '生日快乐，愿这一岁更闪亮。'],
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
      greetings: [`农历${lunar.lunarMonCN}${lunar.lunarDayCN}，愿这一岁更闪亮。`, '生日快乐，愿今天被温柔记得。'],
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
    return `农历${lunar.lunarMonCN}${lunar.lunarDayCN}`
  } catch {
    return ''
  }
}

export function getSolarSummary(serverDateKey) {
  const date = parseDateKey(serverDateKey)
  if (Number.isNaN(date.getTime())) return ''
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
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
  const amount = isMobile ? 0 : 10
  const lanes = ['3%', '7%', '11%', '15%', '85%', '89%', '93%', '97%']
  return Array.from({ length: amount }, (_, index) => ({
    id: `${festival?.key || 'festival'}-${index}`,
    text: items[index % items.length],
    left: lanes[index % lanes.length],
    delay: `${(index % 6) * 0.8}s`,
    duration: `${12 + (index % 5)}s`
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
