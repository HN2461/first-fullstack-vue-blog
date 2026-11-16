import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import FestivalIcon from '@/components/festival/FestivalIcon.vue'
import { FESTIVAL_SUBJECT_ICONS, getFestivalIconSvg } from './festivalIconAssets'
import { getFestivalVisual } from './festivalCatalog'
import { FIXED_FESTIVALS } from '../../../../backend/src/modules/festival/constants/festivalCatalog'

const assets = import.meta.glob('../../assets/festival-icons/*.svg', { eager: true, query: '?raw', import: 'default' })
const asset = key => assets[`../../assets/festival-icons/${key}.svg`]

describe('节日主题图案', () => {
  it('为全部固定纪念日和 24 节气提供可用的主题 SVG', () => {
    const terms = ['立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至', '小寒', '大寒']
    for (const name of [...FIXED_FESTIVALS.map(item => item.name), ...terms, ...Object.keys(FESTIVAL_SUBJECT_ICONS)]) {
      expect(asset(FESTIVAL_SUBJECT_ICONS[name]), name).toContain('<svg')
      expect(getFestivalIconSvg('✨', { name }), name).toBe(asset(FESTIVAL_SUBJECT_ICONS[name]))
    }
    expect(new Set(terms.map(name => getFestivalIconSvg('', { name }))).size).toBe(24)
  })

  it.each([
    ['端午节', 'zongzi'], ['元宵节', 'tangyuan'], ['春节', 'lantern'], ['劳动节', '1f6e0'],
    ['世界艾滋病日', '1f397'], ['七夕', '1f49e'], ['小雪', '1f328'], ['大暑', 'great-heat']
  ])('%s 在 API 的原有 Emoji 映射上展示明确节日主体', (name, key) => {
    const visual = getFestivalVisual(name)
    expect(getFestivalIconSvg(visual.icons?.[0], { name })).toBe(asset(key))
  })

  it('保留民俗图案和个人配置，不把自定义日期名称误识别为系统节日', () => {
    expect(getFestivalIconSvg('🐓', { name: '鸡日', type: 'traditional' })).toBe(asset('1f413'))
    expect(getFestivalIconSvg('🎂', { name: '国庆节', type: 'birthday', isPersonal: true })).toBe(asset('1f382'))
    expect(getFestivalIconSvg('🎁', { name: '春节', isCustom: true })).toBe(asset('1f381'))
    expect(getFestivalIconSvg('🎁', { name: '中秋节', type: 'system-broadcast' })).toBe(asset('1f381'))
    expect(getFestivalIconSvg('🎁', { name: '未知节日' })).toBe(asset('1f381'))
  })

  it('缺失或不支持的图标显示日历，外部文本不会进入 SVG', () => {
    for (const icon of ['', undefined, '<svg onload="alert(1)">', 'https://example.com/a.svg', '🫥']) {
      expect(getFestivalIconSvg(icon, { name: '<script>alert(1)</script>' })).toBe(asset('1f4c5'))
    }
  })

  it('本地资源只包含静态图形，无外链和重复 ID', () => {
    for (const [name, svg] of Object.entries(assets)) {
      expect(svg, name).not.toMatch(/<script|<foreignObject|\bon\w+=|\bid=|\bhref=|url\(/i)
      expect(svg, name).toMatch(/viewBox="[-\d. ]+"/)
      expect(svg, name).toContain('aria-hidden="true"')
    }
  })

  it('组件直接渲染新版 SVG，不再依赖浏览器缓存中的旧图标地址', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(FestivalIcon, { icon: '🚣', festival: { name: '端午节' } }) }))
    expect(html).toContain('festival-icon')
    expect(html).toContain('<svg')
    expect(html).toContain('#79bb73')
    expect(html).not.toContain('/assets/festival-icons/')
    expect(html).not.toContain('<img')
  })
})
