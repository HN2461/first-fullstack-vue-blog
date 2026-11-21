import { message } from 'ant-design-vue'

/**
 * 复制工具结果，并在浏览器完成写入后反馈成功，避免权限失败时误报。
 * @param {string | number} value 用户主动选择复制的结果，不自动读取剪贴板。
 * @param {string} label 用于反馈的结果名称，默认为“结果”。
 * @returns {Promise<boolean>} 成功写入返回 true；空结果、能力缺失或权限失败返回 false。
 */
export async function copyToolResult(value, label = '结果') {
  const text = value == null ? '' : String(value)
  if (!text) {
    message.warning('暂无可复制的结果')
    return false
  }
  if (!globalThis.navigator?.clipboard?.writeText) {
    message.error('当前环境不支持剪贴板写入，请选中结果手动复制')
    return false
  }
  try {
    await navigator.clipboard.writeText(text)
    message.success(`已复制${label}`)
    return true
  } catch {
    message.error('复制失败，请允许剪贴板访问或选中结果手动复制')
    return false
  }
}
