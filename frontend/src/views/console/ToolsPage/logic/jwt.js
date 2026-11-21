import { processJson } from './json'

function decodeBase64Url(segment, label, allowEmpty = false) {
  if ((!segment && !allowEmpty) || !/^[A-Za-z0-9_-]*$/.test(segment) || segment.length % 4 === 1) throw new Error(`${label} 不是合法的无填充 Base64url`)
  const bytes = Uint8Array.from(atob(segment.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - segment.length % 4) % 4)), (char) => char.charCodeAt(0))
  const canonical = btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  if (canonical !== segment) throw new Error(`${label} 的 Base64url 尾部位无效`)
  return bytes
}

function parseObject(segment, label) {
  let source
  try {
    source = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(decodeBase64Url(segment, label))
  } catch (cause) {
    if (cause.message.includes('Base64url')) throw cause
    throw new Error(`${label} 必须是有效 UTF-8 编码的 JSON 对象`)
  }
  let formatted
  try { formatted = processJson({ input: source }) } catch (cause) { throw new Error(`${label} JSON 无效：${cause.message}`) }
  if (formatted.stats.duplicateKeys) throw new Error(`${label} 含重复键，算法或声明可能存在歧义，请检查原始令牌`)
  const value = JSON.parse(source)
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error(`${label} 必须是 JSON 对象`)
  return { value, text: formatted.output }
}

/**
 * 解码三段式 JWT，仅检查结构与编码，不执行签名、算法可信性或发行者校验。
 * @param {string} token JWT 原文，允许首尾空白，不接受段内空白和 Base64 填充符。
 * @returns {{header: object, payload: object, headerText: string, payloadText: string, unsecured: boolean}} 保留数字 token 的格式化文本、元数据对象及未签名标记。
 * header/payload 对象只供算法和时间状态判断，不得代替 headerText/payloadText 展示、复制或保存，以免数字精度丢失。
 * 最长 100000 字符；JWE、非对象 JSON、重复键、非法 UTF-8/Base64url 和缺少 alg 均抛可读错误。
 */
export function decodeJwt(token) {
  if (typeof token !== 'string' || !token.trim()) throw new Error('请输入 JWT')
  const source = token.trim()
  if (source.length > 100000) throw new Error('JWT 超过 100000 字符，请缩小输入')
  const segments = source.split('.')
  if (segments.length !== 3) throw new Error('仅支持三段式 JWT（Header.Payload.Signature），不支持五段式 JWE')
  const headerPart = parseObject(segments[0], 'Header')
  const payloadPart = parseObject(segments[1], 'Payload')
  const header = headerPart.value
  const payload = payloadPart.value
  if (typeof header.alg !== 'string' || !header.alg.trim()) throw new Error('Header 必须包含非空算法字段 alg')
  const unsecured = header.alg === 'none'
  decodeBase64Url(segments[2], 'Signature', unsecured)
  if (unsecured && segments[2]) throw new Error('alg 为 none 的 JWT 必须使用空签名段')
  return { header, payload, headerText: headerPart.text, payloadText: payloadPart.text, unsecured }
}

/**
 * 展示 JWT 的未验证时间声明，使用 UTC 避免本地时区造成过期口径不清。
 * @param {object} payload 已解码载荷，时间字段按 NumericDate 秒处理。
 * @param {number} nowMs 当前 Unix 毫秒，用于确定 exp/nbf/iat 的相对状态。
 * @returns {Array<{key: string, label: string, text: string, state: string}>} 已存在声明及有效/异常状态。
 * 非数字、非有限值或超出日期范围的声明显示 invalid，不把字符串或空值强制转为数字。
 */
export function getJwtTimeClaims(payload, nowMs = Date.now()) {
  return [
    { key: 'exp', label: '到期时间' },
    { key: 'nbf', label: '生效时间' },
    { key: 'iat', label: '签发时间' }
  ].filter(({ key }) => Object.hasOwn(payload || {}, key)).map(({ key, label }) => {
    const value = payload[key]
    const milliseconds = typeof value === 'number' ? value * 1000 : NaN
    if (!Number.isFinite(milliseconds) || Math.abs(milliseconds) > 8640000000000000) {
      return { key, label, text: '声明必须是有效的 Unix 秒数', state: 'invalid' }
    }
    let state = 'normal'
    if (key === 'exp' && milliseconds <= nowMs) state = 'expired'
    if (key === 'nbf' && milliseconds > nowMs) state = 'pending'
    if (key === 'iat' && milliseconds > nowMs) state = 'future'
    const stateText = { normal: '', expired: ' · 已过期', pending: ' · 尚未生效', future: ' · 晚于当前时间' }[state]
    return { key, label, text: `${new Date(milliseconds).toISOString()}${stateText}`, state }
  })
}
