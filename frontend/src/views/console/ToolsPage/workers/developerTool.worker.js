import { processBase64 } from '../logic/base64'
import { processJson } from '../logic/json'

self.onmessage = ({ data }) => {
  try {
    if (!['json', 'base64'].includes(data.tool)) throw new Error('不支持的工具任务')
    const result = data.tool === 'json' ? processJson(data.options) : processBase64(data.options)
    if (result.output.length > 8 * 1024 * 1024) throw new Error('转换结果超过 8 Mi 字符，请拆分输入后处理')
    self.postMessage({ result })
  } catch (cause) {
    self.postMessage({ error: { message: cause.message || '处理失败', offset: cause.offset, line: cause.line, column: cause.column } })
  }
}
