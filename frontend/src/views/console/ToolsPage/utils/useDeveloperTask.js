import { onBeforeUnmount, onDeactivated, ref } from 'vue'

/**
 * 在可终止 Worker 中处理开发工具输入，取消旧任务并保证超时后释放线程。
 * @returns {{loading: import('vue').Ref<boolean>, run: Function, cancel: Function}} 任务状态与执行入口。
 * run(tool, options) 返回结果 Promise；取消、超时及运行错误拒绝，组件卸载/停用时自动取消。
 */
export function useDeveloperTask() {
  const loading = ref(false)
  let active = null

  function cancel() {
    if (!active) return
    const current = active
    active = null
    current.worker.terminate()
    clearTimeout(current.timeout)
    loading.value = false
    current.reject(Object.assign(new Error('处理已取消'), { cancelled: true }))
  }

  function run(tool, options) {
    cancel()
    return new Promise((resolve, reject) => {
      let worker
      try { worker = new Worker(new URL('../workers/developerTool.worker.js', import.meta.url), { type: 'module' }) } catch {
        reject(new Error('当前环境无法启动本地处理线程，请检查浏览器或站点设置'))
        return
      }
      loading.value = true
      const finish = (callback, value) => {
        if (active?.worker !== worker) return
        clearTimeout(active.timeout)
        worker.terminate()
        active = null
        loading.value = false
        callback(value)
      }
      const timeout = setTimeout(() => finish(reject, new Error('处理超过 8 秒已停止，请缩小输入后重试')), 8000)
      active = { worker, reject, timeout }
      worker.onmessage = ({ data }) => data.error ? finish(reject, Object.assign(new Error(data.error.message), data.error)) : finish(resolve, data.result)
      worker.onerror = () => finish(reject, new Error('本地处理线程出错，请重试'))
      try { worker.postMessage({ tool, options }) } catch { finish(reject, new Error('无法发送处理任务，请检查输入大小')) }
    })
  }

  onBeforeUnmount(cancel)
  onDeactivated(cancel)
  return { loading, run, cancel }
}
