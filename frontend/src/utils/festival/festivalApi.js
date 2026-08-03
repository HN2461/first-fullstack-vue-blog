import { getPublicFestivalCalendar } from '@/services/public'

function normalize(item) {
  const displaySource = item.isHoliday
    ? '法定假期'
    : item.isWorkday
      ? '调休补班'
      : ({ traditional: '传统节日', 'solar-term': '二十四节气', national: '国家纪念日', industry: '行业纪念日', international: '国际纪念日', social: '社会节日' }[item.type] || '纪念日')
  return {
    ...item,
    key: `${item.date}-${item.name}`,
    level: item.isMajor ? 'major' : 'normal',
    text: item.greeting || `${item.name}，愿今天顺遂安宁。`,
    icons: item.isHoliday ? ['🎉', '✨'] : item.isWorkday ? ['💼', '📅'] : ['✨'],
    accent: item.isHoliday ? '#dc2626' : item.isWorkday ? '#b45309' : '#2563eb',
    tint: item.isHoliday ? '#fff1f2' : '#fffbeb',
    particle: ['✨'],
    duration: item.isMajor ? [-2, 2] : [-1, 1],
    displaySource
  }
}

export async function loadFestivalCalendar(date) {
  const calendar = await getPublicFestivalCalendar(date)
  return {
    ...calendar,
    today: (calendar.today || []).map(normalize),
    upcoming: (calendar.upcoming || []).map(normalize),
    history: (calendar.history || []).map(normalize)
  }
}
