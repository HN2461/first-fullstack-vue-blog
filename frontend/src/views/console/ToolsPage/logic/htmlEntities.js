import { decodeHTML, escapeUTF8 } from 'entities'

/**
 * 在纯文本与 HTML 实体之间转换，全程不创建 DOM 或执行 HTML。
 * @param {string} input 原始文本或包含命名/十进制/十六进制实体的文本。
 * @param {'encode' | 'decode'} mode 编码会转义 HTML 特殊字符并保留可读中文；解码只返回字符串。
 * @returns {string} 转换后的文本；未知实体原样保留，非法数字引用按 HTML 标准替换。
 * @throws {Error} 超过 1 Mi 字符或模式无效时抛出中文错误，空文本返回空字符串。
 */
export function convertHtmlEntities(input, mode) {
  const text = String(input)
  if (text.length > 1024 * 1024) throw new Error('HTML 实体文本最多支持 1 Mi 字符，请拆分后处理')
  if (mode === 'encode') return escapeUTF8(text)
  if (mode === 'decode') return decodeHTML(text)
  throw new Error('不支持的 HTML 实体转换模式')
}
