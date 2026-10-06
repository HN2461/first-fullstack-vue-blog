import { getPublicFestivalCalendar } from '@/services/public'
import { getFestivalVisual } from './festivalCatalog'

function normalize(item) {
  const type = item.type === 'project' ? 'system-broadcast' : item.type
  const visual = getFestivalVisual(item.name, type, item.effect)
  const effect = visual.effect || item.effect || 'new-year'
  // 节假日源会把调休日期也命名为对应节日；按类型补充显示名称，避免与放假日期看起来重复。
  const isMakeUpWorkday = type === 'make-up-workday' || Boolean(item.isWorkday)
  const displaySource = item.isHoliday
    ? '法定假期'
    : isMakeUpWorkday
      ? '调休补班'
    : ({ traditional: '农历民俗日', 'solar-term': '二十四节气', national: '国家纪念日', industry: '行业纪念日', international: '国际纪念日', social: '社会节日', 'system-broadcast': '系统广播纪念日', project: '系统广播纪念日', personal: '我的日期', birthday: '我的生日' }[type] || '纪念日')
  return {
    ...item,
    type,
    displayName: isMakeUpWorkday && !String(item.name || '').includes('补班') ? `${item.name}（补班）` : item.name,
    key: `${item.date}-${item.name}`,
    effect,
    level: item.isMajor ? 'major' : 'normal',
    text: item.greeting || `${item.name}，愿今天顺遂安宁。`,
    icons: item.icons?.length ? item.icons : visual.icons || (item.isHoliday ? ['🎉', '✨'] : item.isWorkday ? ['💼', '📅'] : ['🎊', '✨']),
    accent: item.isHoliday ? '#dc2626' : item.isWorkday ? '#b45309' : visual.accent,
    tint: item.isHoliday ? '#fff1f2' : visual.tint,
    particle: visual.particle || visual.icons || ['🎊', '✨'],
    duration: item.isMajor ? [-2, 2] : [-1, 1],
    displaySource,
    visibilityLabel: item.isPersonal ? '仅你可见' : '全站公开'
  }
}

export async function loadFestivalCalendar(date) {
  const calendar = await getPublicFestivalCalendar(date)
  return normalizeCalendar(calendar)
}

export function normalizeCalendar(calendar = {}) {
  return {
    ...calendar,
    today: (calendar.today || []).map(normalize),
    upcoming: (calendar.upcoming || []).map(normalize),
    history: (calendar.history || []).map(normalize)
  }
}
