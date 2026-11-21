export const MAX_TOOL_TEXT_LENGTH = 1024 * 1024
export const MAX_STATS_TEXT_LENGTH = 100000

/**
 * 限制本地文本工具的处理规模，在分词、编码或转换前拒绝超量输入。
 * @param {string} text 输入文本，长度按 JavaScript UTF-16 单元计量。
 * @param {number} maximum 本次处理上限，默认 1 Mi 字符。
 * @returns {string} 原始文本；非文本或超过上限时抛出可读错误，不静默截断。
 */
export function assertToolText(text, maximum = MAX_TOOL_TEXT_LENGTH) {
  if (typeof text !== 'string') throw new Error('输入必须是文本')
  if (text.length > maximum) throw new Error(`最多处理 ${maximum.toLocaleString('en-US')} 个 UTF-16 字符，请拆分后处理`)
  return text
}

/**
 * 拒绝无法无损编码为 UTF-8 的孤立代理项，避免被 TextEncoder 静默替换。
 * @param {string} text 已验证类型和规模的原文。
 * @returns {void} 合法时无返回；发现孤立高/低代理项时抛错并指出原文位置。
 */
export function assertWellFormedUnicode(text) {
  for (let index = 0; index < text.length; index += 1) {
    const unit = text.charCodeAt(index)
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = text.charCodeAt(index + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new Error(`第 ${index + 1} 个位置存在孤立 Unicode 代理项`)
      index += 1
    } else if (unit >= 0xdc00 && unit <= 0xdfff) throw new Error(`第 ${index + 1} 个位置存在孤立 Unicode 代理项`)
  }
}
