import chineseDays from 'chinese-days'
import { FestivalDay } from '#modules/festival/models/FestivalDay.js'
import { CustomFestival } from '#modules/festival/models/CustomFestival.js'
import { FIXED_FESTIVALS } from '#modules/festival/constants/festivalCatalog.js'
import { getBusinessDate } from '#utils/businessDate.js'

const { getLunarDate, getLunarFestivals, getSolarDateFromLunar, getSolarTerms } = chineseDays
const STALE_MS = 7 * 24 * 60 * 60 * 1000
const pad = (value) => String(value).padStart(2, '0')
const key = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`

function item(data) {
  return { effect: 'new-year', greeting: '', isMajor: false, source: '内置纪念日目录', ...data }
}

async function fetchHolidayCn(year) {
  const response = await fetch(`https://api.github.com/repos/NateScarlet/holiday-cn/contents/${year}.json`, { signal: AbortSignal.timeout(8000), headers: { Accept: 'application/vnd.github+json' } })
  if (!response.ok) throw new Error(`holiday-cn 返回 ${response.status}`)
  const payload = await response.json()
  return JSON.parse(Buffer.from(payload.content, 'base64').toString('utf8'))
}

async function fetchTimor(year) {
  const response = await fetch(`https://timor.tech/api/holiday/year/${year}/`, { signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error(`timor 返回 ${response.status}`)
  const payload = await response.json()
  return Object.values(payload.holiday || {}).map((day) => ({ date: day.date, name: day.name, holiday: day.holiday, after: day.after }))
}

function normalizeRemote(year, source, payload) {
  const records = Array.isArray(payload) ? payload : (payload.days || Object.values(payload))
  return records.map((day) => ({
    year, date: day.date || key(year, ...String(day.date || '').split('-').slice(1).map(Number)), name: day.name || '法定安排',
    isHoliday: Boolean(day.isOffDay ?? day.holiday),
    isWorkday: Boolean(day.isWorkDay ?? (day.holiday === false)), source, syncedAt: new Date(), raw: day
  })).filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day.date))
}

export async function syncHolidayYear(year) {
  let source = 'holiday-cn'
  let data
  try { data = await fetchHolidayCn(year) } catch (primaryError) {
    source = 'timor.tech'
    try { data = await fetchTimor(year) } catch (fallbackError) { throw new Error(`节假日同步失败：${primaryError.message}；备用源：${fallbackError.message}`) }
  }
  const records = normalizeRemote(year, source, data)
  await FestivalDay.deleteMany({ year })
  if (records.length) await FestivalDay.insertMany(records)
  return { year, source, count: records.length, syncedAt: new Date() }
}

export async function ensureHolidayYears(years) {
  for (const year of years) {
    const latest = await FestivalDay.findOne({ year }).sort({ syncedAt: -1 }).lean()
    if (!latest || Date.now() - new Date(latest.syncedAt).getTime() > STALE_MS) {
      syncHolidayYear(year).catch((error) => console.warn(`节假日 ${year} 同步失败:`, error.message))
    }
  }
}

async function annualItems(year) {
  const [remote, custom] = await Promise.all([FestivalDay.find({ year }).lean(), CustomFestival.find({ enabled: true }).lean()])
  const fixed = FIXED_FESTIVALS.map((festival) => item({ ...festival, date: key(year, festival.month, festival.day), type: festival.category }))
  const manual = custom.map((festival) => item({ id: festival._id.toString(), name: festival.name, date: key(year, festival.month, festival.day), type: festival.category, source: festival.source, greeting: festival.greeting, effect: festival.effect, isMajor: festival.isMajor, isCustom: true }))
  const legal = remote.map((day) => item({ name: day.name, date: day.date, type: day.isHoliday ? 'legal-holiday' : 'make-up-workday', source: day.source, isHoliday: day.isHoliday, isWorkday: day.isWorkday, isMajor: day.isHoliday }))
  const lunar = getLunarFestivals(`${year}-01-01`, `${year}-12-31`).flatMap((day) => day.name.map((name) => item({ name, date: day.date, type: 'traditional', source: '农历传统节日' })))
  const terms = getSolarTerms(`${year}-01-01`, `${year}-12-31`).map((day) => item({ name: day.name, date: day.date, type: 'solar-term', source: '二十四节气' }))
  const map = new Map()
  ;[...fixed, ...lunar, ...terms, ...legal, ...manual].forEach((festival) => map.set(`${festival.date}:${festival.name}`, festival))
  return [...map.values()]
}

function buildPersonalFestivals(year, personalDates = []) {
  return personalDates.filter((item) => item.enabled !== false).flatMap((personal) => {
    if (!personal.repeatYearly && !personal.date.startsWith(`${year}-`)) return []
    let date = personal.date
    if (personal.repeatYearly) {
      const [, month, day] = personal.date.split('-')
      date = `${year}-${month}-${day}`
    }
    if (personal.repeatYearly && personal.calendar === 'lunar') {
      try {
        const lunar = getLunarDate(personal.date)
        date = getSolarDateFromLunar(`${year}-${pad(lunar.lunarMon)}-${pad(lunar.lunarDay)}`)?.date || ''
      } catch { date = '' }
    }
    return date ? [item({ id: personal.id || '', name: personal.name, date, type: 'personal', source: '个人日期', personalType: personal.type, isPersonal: true })] : []
  })
}

export async function getFestivalCalendar(dateKey = getBusinessDate(), options = {}) {
  const year = Number(dateKey.slice(0, 4))
  await ensureHolidayYears([year, year + 1])
  const items = [...await annualItems(year), ...await annualItems(year + 1), ...buildPersonalFestivals(year, options.personalDates), ...buildPersonalFestivals(year + 1, options.personalDates)].map((festival) => ({ ...festival, daysUntil: Math.round((new Date(`${festival.date}T00:00:00`) - new Date(`${dateKey}T00:00:00`)) / 86400000) }))
  const upcoming = items.filter((festival) => festival.daysUntil >= 0).sort((a, b) => (b.isHoliday - a.isHoliday) || (b.isMajor - a.isMajor) || a.daysUntil - b.daysUntil)
  const history = items.filter((festival) => festival.daysUntil < 0).sort((a, b) => b.daysUntil - a.daysUntil)
  const today = items.filter((festival) => festival.daysUntil === 0)
  return { serverDate: dateKey, today, dayStatus: today.find((festival) => festival.isHoliday || festival.isWorkday) || null, upcoming, history }
}

export async function getFestivalYear(year) { await ensureHolidayYears([year]); return annualItems(year) }
export async function listCustomFestivals() { return CustomFestival.find().sort({ month: 1, day: 1 }).lean() }
export async function saveCustomFestival(input, user) { return CustomFestival.create({ ...input, createdBy: user._id }) }
export async function updateCustomFestival(id, input) { return CustomFestival.findByIdAndUpdate(id, input, { new: true }) }
export async function deleteCustomFestival(id) { return CustomFestival.findByIdAndDelete(id) }
