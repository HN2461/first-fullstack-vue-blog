// 仅内联随构建发布的可信本地 SVG；API 和个人日期只能选择图标，不能注入 SVG 内容。
const sources = import.meta.glob('../../assets/festival-icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default'
})
const assets = Object.fromEntries(Object.entries(sources).map(([path, svg]) => [path.split('/').at(-1).replace('.svg', ''), svg]))

// 主体优先表达节俗或自然现象，避免用通用礼花、天平和冰块代替具体含义。
export const FESTIVAL_SUBJECT_ICONS = {
  元旦: '1f386', 春节: 'lantern', 除夕: '1f9e8', 元宵节: 'tangyuan', 上元节: 'tangyuan',
  清明节: 'qingming', 端午节: 'zongzi', 七夕: '1f49e', 七夕节: '1f49e', 乞巧节: '1f49e',
  中秋节: '1f96e', 重阳节: '1f33c', 腊八节: '1f963', 小年: '1f9e8', 小年朝: '1f9e8',
  情人节: '1f497', 妇女节: '1f337', 国际妇女节: '1f337', 植树节: '1f333',
  劳动节: '1f6e0', 青年节: '1f525', 儿童节: '1f388', 建党节: '1f6a9', 建军节: '1f396',
  教师节: '1f4d6', 国庆节: '1f1e8-1f1f3', 圣诞节: '1f384',
  世界湿地日: '1fab7', 消费者权益日: '2696', 世界水日: '1f4a7', 世界气象日: '1f326',
  愚人节: '1f921', 世界卫生日: '2695', 世界读书日: '1f4da', 世界地球日: '1f30d',
  护士节: '2695', 国际博物馆日: '1f3db', 世界环境日: '267b', 世界献血者日: '1fa78',
  中国医师节: '1fa7a', 国际和平日: '1f54a', 烈士纪念日: '1f56f', 世界粮食日: '1f33e',
  联合国日: '1f310', 记者节: '1f4f0', 消防宣传日: '1f692', 世界艾滋病日: '1f397',
  国家宪法日: '2696', 南京大屠杀死难者国家公祭日: '1f56f',
  立春: '1f331', 雨水: '1f327', 惊蛰: '26a1', 春分: 'spring-equinox', 清明: 'qingming',
  谷雨: 'grain-rain', 立夏: 'summer-start', 小满: 'grain-full', 芒种: '1f33e', 夏至: '2600',
  小暑: '1f321', 大暑: 'great-heat', 立秋: '1f342', 处暑: '1f324', 白露: 'white-dew',
  秋分: 'autumn-equinox', 寒露: 'cold-dew', 霜降: 'frost', 立冬: '1f9e3', 小雪: '1f328',
  大雪: '2744', 冬至: '1f95f', 小寒: '1f9e4', 大寒: 'great-cold'
}

/**
 * 为节日展示解析可信本地图案，供列表、倒计时和庆祝弹层共用。
 * @param {string} icon 原有 Emoji 图标，作为民俗日或自定义日期的主题兜底。
 * @param {object|null} festival 节日名称、类型及个人/自定义标记。
 * @returns {string} 随构建内联的 SVG；未知、空值或非法图标返回日历，不发起远程请求。
 */
export function getFestivalIconSvg(icon = '', festival = null) {
  const type = festival?.type
  // 个人生日可能包含“国庆”等文字，不能据此覆盖用户所选的图案。
  const custom = festival?.isPersonal || festival?.isCustom || ['personal', 'birthday', 'project', 'system-broadcast'].includes(type)
  const name = String(festival?.name || '').trim().replace(/（补班）$/, '')
  const subject = custom ? null : FESTIVAL_SUBJECT_ICONS[name]
  const codepoints = [...String(icon || '')]
    .map(character => character.codePointAt(0).toString(16))
    .filter(codepoint => codepoint !== 'fe0f')
    .join('-')
  return assets[subject] || assets[codepoints] || assets['1f4c5']
}
