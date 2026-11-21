function decimal(value, label) {
  if (value == null || typeof value === 'boolean' || (typeof value === 'number' && !Number.isFinite(value))) throw new Error('请输入有效的' + label)
  if (typeof value === 'number' && Number.isInteger(value) && !Number.isSafeInteger(value)) throw new Error(label + '超出安全整数范围，请使用文本输入')
  const text = String(value).trim().replace(/^([+-]?)\./, (_match, sign) => sign + '0.')
  const match = /^([+-]?)(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(text)
  if (!match || text.length > 120) throw new Error(label + '必须是完整十进制数字')
  const exponent = Number(match[4] || 0)
  if (Math.abs(exponent) > 100) throw new Error(label + '的指数超出支持范围（-100 至 100）')
  const scale = (match[3] || '').length - exponent
  let numerator = BigInt(match[2] + (match[3] || '')) * (match[1] === '-' ? -1n : 1n)
  const denominator = scale > 0 ? 10n ** BigInt(scale) : 1n
  if (scale < 0) numerator *= 10n ** BigInt(-scale)
  return { n: numerator, d: denominator }
}

function requirePositive(value, label, allowZero = false) {
  const parsed = decimal(value, label)
  if (allowZero ? parsed.n < 0n : parsed.n <= 0n) throw new Error(label + (allowZero ? '不能小于 0' : '必须大于 0'))
  return parsed
}

// 精确计算中间分数，只在声明的小数位处四舍五入，避免浮点金额误差。
function roundedInteger(numerator, denominator) {
  if (!denominator) throw new Error('除数不能为 0')
  const sign = (numerator < 0n) !== (denominator < 0n) ? -1n : 1n
  const n = numerator < 0n ? -numerator : numerator
  const d = denominator < 0n ? -denominator : denominator
  return (n / d + (n % d * 2n >= d ? 1n : 0n)) * sign
}

function fixed(numerator, denominator, digits = 2) {
  const integer = roundedInteger(numerator * 10n ** BigInt(digits), denominator)
  const negative = integer < 0n
  const text = (negative ? -integer : integer).toString().padStart(digits + 1, '0')
  return (negative ? '-' : '') + (digits ? text.slice(0, -digits) + '.' + text.slice(-digits) : text)
}

/**
 * 按优惠百分比计算金额，原价最多两位小数，节省金额由原价减去折后价保持分币守恒。
 * @param {string|number} original 非负金额，文本输入可保留大整数精度。
 * @param {string|number} discount 0 至 100 的优惠百分比，20 代表八折。
 * @returns {{price:string,saved:string}} 保留两位小数的折后价和节省金额。
 * @throws {Error} 空值、非完整数字、过多金额小数或越界比例时拒绝。
 */
export function calculateDiscount(original, discount) {
  const amount = requirePositive(original, '原价', true)
  const rate = requirePositive(discount, '优惠比例', true)
  if (rate.n > 100n * rate.d) throw new Error('优惠比例不能超过 100%')
  if (amount.n * 100n % amount.d) throw new Error('原价最多支持两位小数，不能自动改变输入金额')
  const cents = amount.n * 100n / amount.d
  const price = roundedInteger(cents * (100n * rate.d - rate.n), 100n * rate.d)
  return { price: fixed(price, 100n), saved: fixed(cents - price, 100n) }
}

/**
 * 计算部分占总量的百分比，允许超过 100%。
 * @param {string|number} part 非负部分数量。
 * @param {string|number} total 大于零的总量。
 * @returns {string} 保留两位小数的百分数，不含百分号。
 * @throws {Error} 空值、非数字或总量为零/负数时拒绝。
 */
export function calculateShare(part, total) {
  const a = requirePositive(part, '部分数量', true)
  const b = requirePositive(total, '总量')
  return fixed(a.n * b.d * 100n, a.d * b.n)
}

/**
 * 使用（现值－原值）÷原值计算增长率，原值限定为正数避免负基数歧义。
 * @param {string|number} previous 大于零的原值。
 * @param {string|number} current 任意合法现值。
 * @returns {string} 保留两位小数的增长百分数，不含百分号。
 * @throws {Error} 非数字及零/负原值时拒绝，负现值可得到低于 -100% 的结果。
 */
export function calculateGrowth(previous, current) {
  const a = requirePositive(previous, '原值')
  const b = decimal(current, '现值')
  return fixed((b.n * a.d - a.n * b.d) * 100n, b.d * a.n)
}

/**
 * 按原 A:B 和新 A 求新 B，只在结果显示时四舍五入。
 * @param {string|number} a 大于零的原 A。
 * @param {string|number} b 非负原 B。
 * @param {string|number} newA 非负新 A。
 * @returns {string} 保留两位小数的新 B。
 * @throws {Error} 空值、非完整数字、零除数或负尺寸时拒绝。
 */
export function calculateRatio(a, b, newA) {
  const originalA = requirePositive(a, '原 A')
  const originalB = requirePositive(b, '原 B', true)
  const targetA = requirePositive(newA, '新 A', true)
  return fixed(targetA.n * originalB.n * originalA.d, targetA.d * originalB.d * originalA.n)
}

/**
 * 计算成人 BMI，分类使用未舍入值，显示保留一位小数。
 * @param {string|number} height 身高厘米，大于零且不超过 300。
 * @param {string|number} weight 体重千克，大于零且不超过 1000。
 * @returns {{bmi:string,level:string}} BMI 与中国成人参考分级。
 * @throws {Error} 空值、非数字、非正或超出合理测量范围时拒绝。
 */
export function calculateBmi(height, weight) {
  const h = requirePositive(height, '身高')
  const w = requirePositive(weight, '体重')
  if (h.n > 300n * h.d || w.n > 1000n * w.d) throw new Error('请检查单位：身高不超过 300 cm，体重不超过 1000 kg')
  const n = w.n * 10000n * h.d * h.d
  const d = w.d * h.n * h.n
  const level = n * 2n < 37n * d ? '偏低' : n < 24n * d ? '正常' : n < 28n * d ? '偏高' : '较高'
  return { bmi: fixed(n, d, 1), level }
}
