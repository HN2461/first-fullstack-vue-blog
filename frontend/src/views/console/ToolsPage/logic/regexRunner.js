import { validateRegexInput } from './regex'

function abortError() {
  const cause = new Error('测试已取消')
  cause.name = 'AbortError'
  return cause
}

/**
 * 将正则执行隔离到独立 Worker，并在超时、取消和后续任务开始时终止旧 Worker。
 * @param {object} options workerFactory 为可替换 Worker 工厂，timeoutMs 为执行预算（默认 1000ms）。
 * @returns {{run: Function, cancel: Function}} run(input) 返回匹配 Promise；cancel() 拒绝在途任务。
 * Worker 不可用时明确报错，禁止退回主线程执行；取消以 AbortError 区分，超时提供可读提示。
 */
export function createRegexRunner({
  workerFactory = () => new Worker(new URL('../workers/regex.worker.js', import.meta.url), { type: 'module' }),
  timeoutMs = 1000
} = {}) {
  let activeTask = null
  function cancel() {
    if (activeTask) activeTask.finish(abortError())
  }
  function run(input) {
    cancel()
    try { validateRegexInput(input.pattern, input.flags, input.text) } catch (cause) { return Promise.reject(cause) }
    return new Promise((resolve, reject) => {
      let worker
      try {
        worker = workerFactory()
      } catch {
        reject(new Error('当前环境无法启动安全执行线程，未执行正则测试'))
        return
      }
      let timer
      const task = {
        finish(cause, result) {
          if (activeTask !== task) return
          activeTask = null
          clearTimeout(timer)
          worker.terminate()
          if (cause) reject(cause)
          else resolve(result)
        }
      }
      activeTask = task
      worker.onmessage = ({ data }) => {
        if (data?.error) task.finish(new Error(data.error))
        else if (data?.result) task.finish(null, data.result)
        else task.finish(new Error('正则执行线程返回了无效结果'))
      }
      worker.onerror = () => task.finish(new Error('正则执行线程异常，请重试或简化表达式'))
      timer = setTimeout(() => task.finish(new Error('测试超过执行时限，已终止；请简化表达式或缩小文本')), timeoutMs)
      try { worker.postMessage(input) } catch { task.finish(new Error('无法提交正则测试，请缩小输入后重试')) }
    })
  }
  return { run, cancel }
}
