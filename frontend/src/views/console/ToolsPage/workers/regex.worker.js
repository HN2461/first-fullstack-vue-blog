import { executeRegex } from '../logic/regex'

// 用户表达式可能灾难性回溯，主页面通过终止此 Worker 实现真正的超时和取消。
self.onmessage = ({ data }) => {
  try {
    self.postMessage({ result: executeRegex(data) })
  } catch (cause) {
    self.postMessage({ error: cause.message || '正则测试失败' })
  }
}
