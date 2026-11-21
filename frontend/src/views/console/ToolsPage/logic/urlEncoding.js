import { assertToolText } from './textLimits'

/**
 * 在 URI 组件和完整 URI 两种语义下编解码，始终保留加号本身。
 * @param {string} text 原始文本，组件模式将 /?&= 等结构符也编码。
 * @param {string} mode encode/decode。
 * @param {string} scope component/uri，完整 URI 模式保留地址结构和保留字符。
 * @returns {string} 编解码结果；超过 1 Mi 字符、非法百分号、UTF-8 序列或孤立代理项抛出可读错误。
 * 这不是表单 application/x-www-form-urlencoded 编解码，不将 + 转为空格。
 */
export function convertUrlEncoding(text, mode = 'encode', scope = 'component') {
  if (!['encode', 'decode'].includes(mode) || !['component', 'uri'].includes(scope)) throw new Error('请选择有效的 URL 编解码模式')
  const source = assertToolText(text)
  try {
    if (mode === 'encode') return scope === 'uri' ? encodeURI(source) : encodeURIComponent(source)
    return scope === 'uri' ? decodeURI(source) : decodeURIComponent(source)
  } catch {
    throw new Error(mode === 'decode' ? '解码失败：请检查 % 后的两位十六进制数及 UTF-8 编码序列' : '编码失败：文本包含孤立的 Unicode 代理项，请检查输入')
  }
}
