import { describe, expect, it } from 'vitest'
import { access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { normalizeCalendar } from './festivalApi'
import { getFestivalVisual } from './festivalCatalog'

describe('festival calendar server data', () => {
  it('normalizes custom broadcast festivals with their configured greeting and scope', () => {
    const calendar = normalizeCalendar({
      today: [],
      upcoming: [{
        name: '网站纪念日',
        date: '2026-06-17',
        type: 'system-broadcast',
        greeting: '愿每一次记录都有回响。',
        effect: 'new-year',
        isMajor: true
      }],
      history: []
    })

    expect(calendar.upcoming[0]).toMatchObject({
      type: 'system-broadcast',
      displaySource: '系统广播纪念日',
      text: '愿每一次记录都有回响。',
      visibilityLabel: '全站公开'
    })
  })

  it('labels broad lunar calendar observances as folk observances instead of public festivals', () => {
    const calendar = normalizeCalendar({
      today: [],
      upcoming: [{ name: '鸡日', date: '2027-02-06', type: 'traditional' }],
      history: []
    })

    expect(calendar.upcoming[0].displaySource).toBe('农历民俗日')
  })

  it('maps legacy project data to the system broadcast category', () => {
    const calendar = normalizeCalendar({
      today: [],
      upcoming: [{ name: '旧项目日期', date: '2026-06-17', type: 'project' }],
      history: []
    })

    expect(calendar.upcoming[0]).toMatchObject({
      type: 'system-broadcast',
      displaySource: '系统广播纪念日'
    })
  })

  it('assigns distinct festive visuals instead of falling back to one fireworks icon', () => {
    const calendar = normalizeCalendar({
      today: [],
      upcoming: [
        { name: '春节', date: '2027-02-06', type: 'legal-holiday', isHoliday: true },
        { name: '中秋节', date: '2027-09-15', type: 'legal-holiday', isHoliday: true },
        { name: '网站首次成功部署纪念日', date: '2027-06-17', type: 'system-broadcast' }
      ],
      history: []
    })

    expect(calendar.upcoming[0].icons).toEqual(['🐲', '🧧', '🎊'])
    expect(calendar.upcoming[1].icons).toEqual(['🥮', '🌕', '🏮'])
    expect(calendar.upcoming[2].icons).toEqual(['🎊', '🎁', '🌟'])
    expect(calendar.upcoming.every((item) => item.icons[0] !== '🎆')).toBe(true)
    expect(calendar.upcoming.every((item) => item.accent !== '#7c3aed')).toBe(true)
  })

  it('uses the national day visual when the holiday API supplies the day name', () => {
    const calendar = normalizeCalendar({
      today: [{ name: '国庆节', date: '2026-10-06', type: 'legal-holiday', isHoliday: true, isMajor: true }],
      upcoming: [],
      history: []
    })

    expect(calendar.today[0].icons[0]).toBe('🇨🇳')
  })

  it('distinguishes a holiday make-up workday that reuses the holiday name', () => {
    const calendar = normalizeCalendar({
      today: [],
      upcoming: [{ name: '国庆节', date: '2026-10-10', type: 'make-up-workday', isHoliday: false, isWorkday: false }],
      history: []
    })

    expect(calendar.upcoming[0]).toMatchObject({
      displayName: '国庆节（补班）',
      displaySource: '调休补班'
    })
  })

  it('assigns subject-specific icons to the lunar observances shown in the live calendar', () => {
    const visibleLunarFestivals = [
      '接玉皇', '除夕', '封井', '祭井神', '贴春联', '迎财神', '春节', '鸡日',
      '元始天尊诞辰', '犬日', '猪日', '羊日', '孙天医诞辰', '牛日', '破五日',
      '开市', '路神诞辰', '马日', '人日', '送火神', '谷日', '阎王诞辰', '天日',
      '玉皇诞辰', '地日', '石头生日', '上(试)灯日', '关公升天日', '元宵节',
      '上元节', '正灯日', '天官诞辰', '落灯日'
    ]
    const icons = visibleLunarFestivals.map((name) => getFestivalVisual(name, 'traditional').icons[0])

    expect(icons.every(Boolean)).toBe(true)
    expect(icons.filter((icon) => icon === '🏮')).toHaveLength(1)
    expect(new Set(icons).size).toBeGreaterThan(20)
  })

  it('assigns a different main icon to all 24 solar terms', () => {
    const terms = ['立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至', '小寒', '大寒']
    const icons = terms.map((name) => getFestivalVisual(name, 'solar-term').icons[0])

    expect(new Set(icons).size).toBe(24)
  })

  it('ships a valid local SVG asset for each icon used by current lunar observances', async () => {
    const names = ['接玉皇', '封井', '祭井神', '贴春联', '迎财神', '鸡日', '犬日', '猪日', '羊日', '牛日', '马日', '小满', '芒种']
    const assetDirectory = new URL('../../../public/assets/festival-icons/', import.meta.url)

    for (const name of names) {
      const icon = getFestivalVisual(name, name === '小满' || name === '芒种' ? 'solar-term' : 'traditional').icons[0]
      const codepoints = [...icon].map((character) => character.codePointAt(0).toString(16)).filter((codepoint) => codepoint !== 'fe0f').join('-')
      const assetPath = fileURLToPath(new URL(`${codepoints}.svg`, assetDirectory))
      await expect(access(assetPath)).resolves.toBeUndefined()
    }
  })
})
