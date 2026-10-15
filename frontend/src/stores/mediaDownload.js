import { computed, markRaw, ref } from 'vue'
import { defineStore } from 'pinia'
import { createTransferTracker } from '@/utils/transferProgress'

export const DOWNLOAD_STATE_LABELS = {
  queued: '排队中', downloading: '下载中', cancelling: '正在终止',
  success: '已交给浏览器保存', error: '下载失败', cancelled: '已终止'
}

const isPending = (task) => ['queued', 'downloading', 'cancelling'].includes(task.status)
const emptyProgress = () => ({ loaded: 0, total: 0, percent: 0, speed: 0, remainingSeconds: 0 })

export const useMediaDownloadStore = defineStore('mediaDownload', () => {
  const tasks = ref([])
  const running = ref(false)
  const currentTaskId = ref('')
  const lastTaskId = ref('')
  const progress = ref(emptyProgress())
  const state = ref('idle')
  const lastCompletedStatus = ref('')
  const queuedVersion = ref(0)
  const completedVersion = ref(0)
  const feedback = ref(null)
  let runPromise = null
  let controller = null

  const currentTask = computed(() => tasks.value.find((task) => task.id === currentTaskId.value) || null)
  const latestTask = computed(() => [...tasks.value].reverse().find(isPending) || tasks.value.find((task) => task.id === lastTaskId.value) || null)
  const queuedCount = computed(() => tasks.value.filter((task) => task.status === 'queued').length)
  const successCount = computed(() => tasks.value.filter((task) => task.status === 'success').length)
  const errorCount = computed(() => tasks.value.filter((task) => task.status === 'error').length)
  const cancelledCount = computed(() => tasks.value.filter((task) => task.status === 'cancelled').length)
  const hasHistory = computed(() => tasks.value.length > 0)
  const statusText = computed(() => {
    if (running.value) return currentTask.value?.status === 'cancelling' ? '正在终止' : '下载中'
    return { success: '下载接收完成', error: '下载失败', cancelled: '下载已终止' }[state.value] || '下载任务'
  })

  /** 显示下载中心内的操作反馈；重复点击也更新版本，保证每次都有即时回应。 */
  function showFeedback(type, message, description = '') {
    feedback.value = { type, message, description, version: (feedback.value?.version || 0) + 1 }
  }

  /**
   * 添加下载任务，按 dedupeKey 复用进行中的 Promise。
   * request 接收 signal / onProgress，并在完整接收后保存文件；返回 true 表示成功、null 表示终止，失败时拒绝。
   * Promise 只返回状态，避免任务记录长期持有大文件 Blob。
   */
  function enqueue({ fileName, label, request, dedupeKey = '' }) {
    const existing = tasks.value.find((task) => dedupeKey && task.dedupeKey === dedupeKey && isPending(task))
    if (existing) {
      showFeedback('warning', '该下载任务正在进行中，请勿重复点击', existing.label)
      return existing.promise
    }
    const task = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      fileName: fileName || '下载文件', label: label || fileName || '下载文件', dedupeKey, request: markRaw(request),
      status: 'queued', loaded: 0, total: 0, error: ''
    }
    task.promise = markRaw(new Promise((resolve, reject) => { task.resolve = resolve; task.reject = reject }))
    tasks.value.push(task)
    queuedVersion.value += 1
    showFeedback('info', running.value ? '已加入下载队列' : '下载已开始', task.label)
    start()
    return task.promise
  }

  function hasActiveTask(dedupeKey) {
    return Boolean(dedupeKey && tasks.value.some((task) => task.dedupeKey === dedupeKey && isPending(task)))
  }

  function start() {
    if (running.value) return runPromise
    const next = tasks.value.find((task) => task.status === 'queued')
    if (!next) return Promise.resolve()
    running.value = true
    state.value = 'active'
    currentTaskId.value = next.id
    next.status = 'downloading'
    progress.value = emptyProgress()
    const requestController = new AbortController()
    controller = requestController
    const tracker = createTransferTracker((value) => { progress.value = value })
    // 先保存队列 Promise 再调用请求，兼容同步抛错，并避免旧任务覆盖下一任务的取消句柄。
    runPromise = Promise.resolve().then(async () => {
      try {
        requestController.signal.throwIfAborted()
        const blob = await next.request({
          signal: requestController.signal,
          onProgress: (loaded, total) => {
            if (requestController.signal.aborted) return
            next.loaded = loaded
            next.total = total || next.total
            tracker(loaded, total || next.total)
          }
        })
        requestController.signal.throwIfAborted()
        next.status = 'success'
        next.loaded = next.total || blob?.size || next.loaded
        next.total = next.total || blob?.size || next.loaded
        tracker(next.loaded, next.total)
        next.resolve(true)
        showFeedback('success', '下载接收完成，已交给浏览器保存', next.label)
      } catch (error) {
        if (requestController.signal.aborted) {
          next.status = 'cancelled'
          next.resolve(null)
          showFeedback('warning', '下载已终止', next.label)
        } else {
          next.status = 'error'
          next.error = error.message || '下载失败'
          next.reject(error)
          showFeedback('error', '下载失败', `${next.label}：${next.error}`)
        }
      } finally {
        // 历史记录只保留状态和字节数，释放请求闭包、Promise 回调与大文件引用。
        delete next.request
        delete next.resolve
        delete next.reject
        running.value = false
        progress.value.speed = 0
        progress.value.remainingSeconds = 0
        state.value = next.status
        lastTaskId.value = next.id
        lastCompletedStatus.value = next.status
        completedVersion.value += 1
        runPromise = null
        controller = null
        currentTaskId.value = ''
        if (tasks.value.some((task) => task.status === 'queued')) start()
      }
    })
    return runPromise
  }

  /** 终止指定任务（默认当前文件）；排队任务立即移除，当前请求结束后再继续下一项。 */
  async function cancelTask(taskId = currentTaskId.value) {
    const task = tasks.value.find((item) => item.id === taskId)
    if (!task || !isPending(task)) return false
    if (task.status === 'queued') {
      task.status = 'cancelled'
      task.resolve(null)
      delete task.request
      delete task.resolve
      delete task.reject
      showFeedback('warning', '已取消排队任务', task.label)
      return true
    }
    const pendingRun = runPromise
    task.status = 'cancelling'
    controller?.abort()
    await pendingRun
    return true
  }

  /** 先取消所有排队任务再停止当前请求，防止终止全部时继续产生下载流量。 */
  async function cancelAll() {
    for (const task of tasks.value.filter((item) => item.status === 'queued')) cancelTask(task.id)
    await cancelTask()
  }

  function clearCompleted() {
    tasks.value = tasks.value.filter(isPending)
    if (!running.value) {
      state.value = 'idle'
      progress.value = emptyProgress()
    }
  }

  function clearAll() {
    if (running.value) return
    tasks.value = []
    state.value = 'idle'
    progress.value = emptyProgress()
    feedback.value = null
  }

  return { tasks, running, currentTask, latestTask, queuedCount, successCount, errorCount, cancelledCount, hasHistory, statusText, progress, state, lastCompletedStatus, queuedVersion, completedVersion, feedback, showFeedback, enqueue, hasActiveTask, start, cancelTask, cancelAll, clearCompleted, clearAll }
})
