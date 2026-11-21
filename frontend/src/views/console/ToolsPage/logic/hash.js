import { assertToolText, assertWellFormedUnicode } from './textLimits'

export const HASH_ALGORITHMS = ['SHA-256', 'SHA-1', 'SHA-384', 'SHA-512']

/**
 * 用 Web Crypto 计算原始文本的 UTF-8 摘要，不修剪空白、不进行 Unicode 归一化。
 * @param {string} text 原始文本，空串也有明确摘要。
 * @param {string} algorithm SHA-1/SHA-256/SHA-384/SHA-512 中的一项。
 * @param {SubtleCrypto} subtle 可替换的摘要服务，默认当前浏览器的 crypto.subtle。
 * @returns {Promise<string>} 小写十六进制摘要；算法未知、超过 1 Mi 字符、孤立代理项或环境不支持时拒绝。
 */
export async function hashText(text, algorithm, subtle = globalThis.crypto?.subtle) {
  if (!HASH_ALGORITHMS.includes(algorithm)) throw new Error('请选择支持的摘要算法')
  const source = assertToolText(text)
  assertWellFormedUnicode(source)
  if (!subtle?.digest) throw new Error('当前环境无法使用 Web Crypto，请在 HTTPS 或本地环境中打开')
  try {
    const buffer = await subtle.digest(algorithm, new TextEncoder().encode(source))
    return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('')
  } catch {
    throw new Error('摘要计算失败，请检查输入大小和浏览器支持情况')
  }
}

/**
 * 隔离异步摘要任务，取消或后发任务会使先前结果失效，防止覆盖当前文本的结果。
 * @param {Function} digest 接收 text/algorithm 并返回摘要 Promise 的函数。
 * @returns {{run: Function, cancel: Function}} run 返回结果或 null（任务已失效），cancel 使在途结果失效。
 * Web Crypto 不能中止内部计算，失效任务的成功与失败都不会传播到当前界面。
 */
export function createHashRunner(digest = hashText) {
  let generation = 0
  return {
    cancel() { generation += 1 },
    async run(text, algorithm) {
      const current = ++generation
      try {
        const result = await digest(text, algorithm)
        return current === generation ? result : null
      } catch (cause) {
        if (current !== generation) return null
        throw cause
      }
    }
  }
}
