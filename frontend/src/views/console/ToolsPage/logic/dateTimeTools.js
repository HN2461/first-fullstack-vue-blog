const DAY_MS = 86400000
const MAX_DATE_MS = 8640000000000000n

function pad(value, width = 2) { return String(value).padStart(width, '0') }

/**
 * 严格解析公历日期，不允许 Date 自动把二月三十日归一化到三月。
 * @param {string} value YYYY-MM-DD，年份 0001 至 9999。
 * @param {string} label 错误提示中的字段名。
 * @returns {{year:number,month:number,day:number}} 合法日历分量。
 * @throws {Error} 空值、格式错误或不存在的日期时拒绝。
 */
export function parseCalendarDate(value, label = '日期') {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? '').trim())
  if (!match) throw new Error(label + '应使用 YYYY-MM-DD 格式')
  const [year, month, day] = match.slice(1).map(Number)
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > days[month - 1]) throw new Error(label + '不是有效的公历日期')
  return { year, month, day }
}

function utcCalendarTime({ year, month, day }, hour = 0, minute = 0, second = 0, millisecond = 0) {
  const date = new Date(0)
  // setUTCFullYear 避免 Date.UTC 对 00 至 99 年自动加 1900。
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(hour, minute, second, millisecond)
  return date.getTime()
}

/**
 * 从浏览器本地日历取得日期，避免 UTC 截日导致凌晨显示前一天。
 * @param {Date} date 合法 Date，默认当前时间。
 * @returns {string} 本地 YYYY-MM-DD。
 * @throws {Error} Date 非法或年份超出 0001 至 9999 时拒绝。
 */
export function localCalendarDate(date = new Date()) {
  if (!Number.isFinite(date?.getTime?.()) || date.getFullYear() < 1 || date.getFullYear() > 9999) throw new Error('无法读取本地日期')
  return pad(date.getFullYear(), 4) + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
}

/**
 * 按公历天数偏移日期，不用本地一天的毫秒数推算。
 * @param {string} value 合法 YYYY-MM-DD。
 * @param {number} days 整数天数，可为负数。
 * @returns {string} 偏移后的 YYYY-MM-DD。
 * @throws {Error} 输入非法、非整数或结果超出支持年份时拒绝。
 */
export function addCalendarDays(value, days) {
  if (!Number.isSafeInteger(days)) throw new Error('偏移天数必须是安全整数')
  const date = new Date(utcCalendarTime(parseCalendarDate(value)) + days * DAY_MS)
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999) throw new Error('结果日期超出 0001 至 9999 年')
  return pad(date.getUTCFullYear(), 4) + '-' + pad(date.getUTCMonth() + 1) + '-' + pad(date.getUTCDate())
}

/**
 * 计算绝对日历间隔，夏令时的 23/25 小时日不影响日数。
 * @param {string} start 合法开始日期。
 * @param {string} end 合法结束日期，允许早于开始日期。
 * @param {boolean} inclusive 是否包含首尾两天，同日对应 1 天。
 * @returns {number} 未含首尾时同日为 0，含首尾时增加 1。
 * @throws {Error} 空值或不存在的日期时拒绝。
 */
export function calculateDateDifference(start, end, inclusive = false) {
  return Math.abs(utcCalendarTime(parseCalendarDate(end, '结束日期')) - utcCalendarTime(parseCalendarDate(start, '开始日期'))) / DAY_MS + (inclusive ? 1 : 0)
}

/**
 * 严格解析日期时间，未带时区按本地日历，支持 Z 或 ±HH:mm。
 * @param {string} value YYYY-MM-DD，可附 HH:mm[:ss[.SSS]] 与时区。
 * @returns {number} 对应的毫秒时间戳。
 * @throws {Error} 日期、时间、偏移非法或本地夏令时缺口中的不存在时间时拒绝。
 */
export function parseDateTime(value) {
  const match = /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?)?$/.exec(String(value ?? '').trim())
  if (!match) throw new Error('日期时间格式无效，请使用 YYYY-MM-DD HH:mm:ss，可附毫秒及 Z/±HH:mm 时区')
  const calendar = parseCalendarDate(match[1])
  const hour = Number(match[2] || 0)
  const minute = Number(match[3] || 0)
  const second = Number(match[4] || 0)
  const millisecond = Number((match[5] || '').padEnd(3, '0'))
  if (hour > 23 || minute > 59 || second > 59) throw new Error('时间应在 00:00:00 至 23:59:59 范围内')
  if (match[6]) {
    let offset = 0
    if (match[6] !== 'Z') {
      const offsetHour = Number(match[6].slice(1, 3))
      const offsetMinute = Number(match[6].slice(4))
      if (offsetHour > 23 || offsetMinute > 59) throw new Error('时区偏移无效')
      offset = (offsetHour * 60 + offsetMinute) * (match[6][0] === '-' ? -1 : 1)
    }
    return utcCalendarTime(calendar, hour, minute, second, millisecond) - offset * 60000
  }
  const date = new Date(0)
  date.setFullYear(calendar.year, calendar.month - 1, calendar.day)
  date.setHours(hour, minute, second, millisecond)
  if (date.getFullYear() !== calendar.year || date.getMonth() !== calendar.month - 1 || date.getDate() !== calendar.day || date.getHours() !== hour || date.getMinutes() !== minute || date.getSeconds() !== second || date.getMilliseconds() !== millisecond) throw new Error('当前本地时区中不存在该日期时间，请检查夏令时或显式指定时区')
  return date.getTime()
}

/**
 * 精确解析秒/毫秒时间戳，不做自动单位猜测或静默取整。
 * @param {string|number} value 有符号时间戳；秒最多三位小数，毫秒必须整数。
 * @param {'seconds'|'milliseconds'} unit 显式单位。
 * @returns {number} Date 范围内可精确表达的毫秒整数。
 * @throws {Error} 空值、格式、单位或 Date 范围非法时拒绝。
 */
export function timestampMilliseconds(value, unit) {
  if (!['seconds', 'milliseconds'].includes(unit)) throw new Error('请选择秒或毫秒单位')
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('请输入有效时间戳')
  const text = String(value ?? '').trim()
  const match = (unit === 'seconds' ? /^([+-]?)(\d+)(?:\.(\d{1,3}))?$/ : /^([+-]?)(\d+)$/).exec(text)
  if (!match) throw new Error(unit === 'seconds' ? '秒时间戳必须是数字，最多支持三位小数' : '毫秒时间戳必须是整数')
  if (match[2].length > 20) throw new Error('时间戳超出 Date 支持范围')
  let milliseconds = unit === 'seconds' ? BigInt(match[2]) * 1000n + BigInt((match[3] || '').padEnd(3, '0')) : BigInt(match[2])
  if (match[1] === '-') milliseconds = -milliseconds
  if (milliseconds < -MAX_DATE_MS || milliseconds > MAX_DATE_MS) throw new Error('时间戳超出 Date 支持范围')
  return Number(milliseconds)
}

/**
 * 格式化本地日期时间，保留非零毫秒。
 * @param {Date} date 合法日期对象。
 * @returns {string} 本地 YYYY-MM-DD HH:mm:ss[.SSS]。
 * @throws {Error} 非法日期时拒绝。
 */
export function formatLocalDateTime(date) {
  if (!Number.isFinite(date?.getTime?.())) throw new Error('无效日期时间')
  const year = date.getFullYear()
  const yearText = year < 0 ? '-' + pad(-year, 6) : year > 9999 ? '+' + pad(year, 6) : pad(year, 4)
  return yearText + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds()) + (date.getMilliseconds() ? '.' + pad(date.getMilliseconds(), 3) : '')
}

/**
 * 输出同一时刻的本地、ISO、秒与毫秒表示，负小数秒不会被向下取整。
 * @param {number} milliseconds Date 范围内的毫秒整数。
 * @returns {{local:string,iso:string,seconds:string,milliseconds:string}} 可直接复制的精确结果。
 * @throws {Error} 非整数或超出 Date 范围时拒绝。
 */
export function timestampResult(milliseconds) {
  if (!Number.isSafeInteger(milliseconds) || Math.abs(milliseconds) > Number(MAX_DATE_MS)) throw new Error('时间戳超出 Date 支持范围')
  const date = new Date(milliseconds)
  const absolute = BigInt(milliseconds < 0 ? -milliseconds : milliseconds)
  const fraction = (absolute % 1000n).toString().padStart(3, '0').replace(/0+$/, '')
  const seconds = (milliseconds < 0 ? '-' : '') + (absolute / 1000n).toString() + (fraction ? '.' + fraction : '')
  return { local: formatLocalDateTime(date), iso: date.toISOString(), seconds, milliseconds: String(milliseconds) }
}

/**
 * 格式化单调时钟测得的时长，不依赖系统日期调整。
 * @param {number} elapsed 非负且有限的毫秒时长，可有小数。
 * @returns {string} 小时存在时使用 HH:mm:ss.cc，否则 mm:ss.cc。
 * @throws {Error} 负值或非有限值时拒绝。
 */
export function formatStopwatch(elapsed) {
  if (!Number.isFinite(elapsed) || elapsed < 0) throw new Error('无效计时时长')
  const total = Math.floor(elapsed)
  const hours = Math.floor(total / 3600000)
  const minutes = Math.floor(total / 60000 % 60)
  return (hours ? pad(hours) + ':' : '') + pad(minutes) + ':' + pad(Math.floor(total / 1000 % 60)) + '.' + pad(Math.floor(total % 1000 / 10))
}

/**
 * 基于单调时钟累加当前运行段，暂停时间不计入累计。
 * @param {number} carried 已完成运行段的非负毫秒数。
 * @param {number} startedAt 当前段的 performance.now() 起点。
 * @param {number} now 当前单调时钟值。
 * @returns {number} 完整累计毫秒，不按 timer 回调次数估算。
 * @throws {Error} 非有限值、负累计或时间倒退时拒绝。
 */
export function stopwatchElapsed(carried, startedAt, now) {
  if (![carried, startedAt, now].every(Number.isFinite) || carried < 0 || now < startedAt) throw new Error('无效的单调时钟状态')
  return carried + now - startedAt
}
