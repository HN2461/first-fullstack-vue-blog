const UINT32_RANGE = 0x100000000

function requireCrypto(provider) {
  if (typeof provider?.getRandomValues !== 'function') throw new Error('当前环境不支持安全随机数，请使用支持 Web Crypto 的浏览器')
  return provider
}

function requireInteger(value, min, max, label) {
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(label + '应为 ' + min + ' 至 ' + max + ' 的整数')
  return value
}

/**
 * 用拒绝采样生成无取模偏差的安全随机整数。
 * @param {number} maxExclusive 不包含的上界，范围 1 至 2^32。
 * @param {Crypto} provider Web Crypto 实现，测试可注入确定性随机源。
 * @returns {number} [0, maxExclusive) 内的整数。
 * @throws {Error} 上界非法或缺少安全随机源时拒绝，不退化为 Math.random。
 */
export function secureRandomIndex(maxExclusive, provider = globalThis.crypto) {
  requireInteger(maxExclusive, 1, UINT32_RANGE, '随机上界')
  const source = requireCrypto(provider)
  const threshold = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive
  const buffer = new Uint32Array(1)
  do { source.getRandomValues(buffer) } while (buffer[0] >= threshold)
  return buffer[0] % maxExclusive
}

/**
 * 生成包含每种所选字符的随机密码，使用安全抽样与洗牌。
 * @param {object} options 长度 8 至 128，及四种 includeUpper/Lower/Number/Symbol 开关。
 * @param {Crypto} provider 安全随机源，默认浏览器 Web Crypto。
 * @returns {string} 指定长度且覆盖所有已选字符集的密码。
 * @throws {Error} 空字符集、非法长度或随机源不可用时拒绝。
 */
export function generatePassword({ length, includeUpper = true, includeLower = true, includeNumber = true, includeSymbol = true }, provider = globalThis.crypto) {
  requireInteger(length, 8, 128, '密码长度')
  const groups = [
    includeUpper && 'ABCDEFGHJKLMNPQRSTUVWXYZ',
    includeLower && 'abcdefghijkmnopqrstuvwxyz',
    includeNumber && '23456789',
    includeSymbol && '!@#$%^&*_-+=?'
  ].filter(Boolean)
  if (!groups.length) throw new Error('请至少选择一种字符集')
  const pool = groups.join('')
  const chars = groups.map((group) => group[secureRandomIndex(group.length, provider)])
  while (chars.length < length) chars.push(pool[secureRandomIndex(pool.length, provider)])
  // 打散强制加入的字符，避免类别出现在可预测的固定位置。
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const other = secureRandomIndex(index + 1, provider)
    const current = chars[index]
    chars[index] = chars[other]
    chars[other] = current
  }
  return chars.join('')
}

/**
 * 批量生成 UUID v4，直接使用安全字节并设置版本与变体位。
 * @param {number} count 1 至 1000 的整数数量，不自动取整或钳制。
 * @param {Crypto} provider 安全随机源。
 * @returns {string[]} 小写标准 UUID v4 列表。
 * @throws {Error} 数量非法或安全随机源不可用时拒绝。
 */
export function generateUuids(count, provider = globalThis.crypto) {
  requireInteger(count, 1, 1000, '生成数量')
  const source = requireCrypto(provider)
  return Array.from({ length: count }, () => {
    const bytes = source.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6] & 15) | 64
    bytes[8] = (bytes[8] & 63) | 128
    const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')
    return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-')
  })
}

/**
 * 从非空文本行中等概率抽取一项，重复行保留为独立候选项。
 * @param {string} text 每行一项的文本，首尾空白和空行会忽略。
 * @param {Crypto} provider 安全随机源。
 * @returns {{value:string, count:number}} 抽中内容与本次候选数量快照。
 * @throws {Error} 没有候选项、超过一万项或随机源不可用时拒绝。
 */
export function chooseItem(text, provider = globalThis.crypto) {
  const items = String(text ?? '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
  if (!items.length) throw new Error('请先输入至少一个候选项')
  if (items.length > 10000) throw new Error('单次最多支持 10000 个候选项')
  return { value: items[secureRandomIndex(items.length, provider)], count: items.length }
}

/**
 * 生成骰子结果，快照记录面数、数量与总点数。
 * @param {{sides:number,count:number}} options 面数 2 至 100，数量 1 至 20，均为整数。
 * @param {Crypto} provider 安全随机源。
 * @returns {{sides:number,count:number,values:number[],total:number}} 本次完整结果。
 * @throws {Error} 空值、非整数、越界或安全随机源不可用时拒绝。
 */
export function rollDice({ sides, count }, provider = globalThis.crypto) {
  requireInteger(sides, 2, 100, '骰子面数')
  requireInteger(count, 1, 20, '骰子数量')
  const values = Array.from({ length: count }, () => secureRandomIndex(sides, provider) + 1)
  return { sides, count, values, total: values.reduce((sum, value) => sum + value, 0) }
}

/**
 * 批量抛硬币，统计结果与实际执行次数绑定。
 * @param {number} count 1 至 10000 的整数次数。
 * @param {Crypto} provider 安全随机源。
 * @returns {{total:number,heads:number,tails:number}} 同一次执行的统计快照。
 * @throws {Error} 数量非法或安全随机源不可用时拒绝。
 */
export function simulateCoins(count, provider = globalThis.crypto) {
  requireInteger(count, 1, 10000, '抛掷次数')
  const values = requireCrypto(provider).getRandomValues(new Uint8Array(count))
  const heads = values.reduce((sum, value) => sum + (value & 1), 0)
  return { total: count, heads, tails: count - heads }
}
