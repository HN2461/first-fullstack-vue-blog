const bases = [2, 8, 10, 16]
const digitsByBase = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^\d+$/, 16: /^[\da-f]+$/i }
const prefixes = { 2: '0b', 8: '0o', 10: '', 16: '0x' }

/**
 * 使用 BigInt 完整解析整数，避免 parseInt 截断无效后缀或 Number 丢失大整数精度。
 * @param {string} input 带可选正负号的整数，可使用与来源进制一致的 0b/0o/0x 前缀。
 * @param {number} fromBase 来源进制，仅支持 2、8、10、16。
 * @returns {{ binary: string, octal: string, decimal: string, hex: string }} 四种无精度损失的整数表示。
 * @throws {Error} 空输入、无效字符、进制不匹配或超过 10000 位时抛出中文错误。
 */
export function convertInteger(input, fromBase) {
  if (!bases.includes(fromBase)) throw new Error('不支持当前来源进制')
  let value = String(input).trim()
  if (!value) throw new Error('请输入整数')
  const negative = value.startsWith('-')
  if (/^[+-]/.test(value)) value = value.slice(1)
  if (prefixes[fromBase] && value.toLowerCase().startsWith(prefixes[fromBase])) value = value.slice(2)
  if (value.length > 10000) throw new Error('整数最多支持 10000 位，请缩短输入')
  if (!digitsByBase[fromBase].test(value)) throw new Error(`请输入完整的 ${fromBase} 进制整数，不支持小数、指数或无效后缀`)
  const parsed = BigInt(`${prefixes[fromBase]}${value}`) * (negative ? -1n : 1n)
  return { binary: parsed.toString(2), octal: parsed.toString(8), decimal: parsed.toString(10), hex: parsed.toString(16).toUpperCase() }
}
