import { computed, markRaw, ref } from 'vue'
import { defineStore } from 'pinia'
import { createTransferTracker } from '@/utils/transferProgress'

export const DOWNLOAD_STATE_LABELS = { queued: '排队中', downloading: '下载中', success: '已完成', error: '下载失败' }

export const useMediaDownloadStore = defineStore('mediaDownload', () => {
  const tasks = ref([])
  const running = ref(false)
  const currentTaskId = ref('')
  const progress = ref({ loaded: 0, total: 0, percent: 0, speed: 0, remainingSeconds: 0 })
  const state = ref('idle')
  const lastCompletedStatus = ref('')
  const queuedVersion = ref(0)
  const completedVersion = ref(0)
  let runPromise = null

  const currentTask = computed(() => tasks.value.find((task) => task.id === currentTaskId.value) || null)
  const queuedCount = computed(() => tasks.value.filter((task) => task.status === 'queued').length)
  const successCount = computed(() => tasks.value.filter((task) => task.status === 'success').length)
  const errorCount = computed(() => tasks.value.filter((task) => task.status === 'error').length)
  const hasHistory = computed(() => tasks.value.length > 0)
  const statusText = computed(() => {
    if (running.value) return currentTask.value?.status === 'queued' ? '排队中' : '下载中'
    if (state.value === 'success') return '下载完成'
    if (state.value === 'error') return errorCount.value > 1 ? `${errorCount.value} 个下载失败` : '下载失败'
    return '下载任务'
  })

  function enqueue({ fileName, label, request, dedupeKey = '' }) {
    if (dedupeKey) {
      const existing = tasks.value.find((task) => task.dedupeKey === dedupeKey && ['queued', 'downloading'].includes(task.status))
      if (existing) return existing.promise
    }
    const task = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      fileName: fileName || '下载文件', label: label || fileName || '下载文件', dedupeKey, request: markRaw(request),
      status: 'queued', loaded: 0, total: 0, error: ''
    }
    task.promise = new Promise((resolve, reject) => { task.resolve = resolve; task.reject = reject })
    tasks.value.push(task)
    queuedVersion.value += 1
    start()
    return task.promise
  }

  function start() {
    if (running.value) return runPromise
    const next = tasks.value.find((task) => task.status === 'queued')
    if (!next) return Promise.resolve()
    running.value = true
    state.value = 'active'
    currentTaskId.value = next.id
    const tracker = createTransferTracker((value) => { progress.value = value })
    runPromise = (async () => {
      try {
        next.status = 'downloading'
        const blob = await next.request({
          onProgress: (loaded, total) => {
            next.loaded = loaded
            next.total = total || next.total
            tracker(loaded, total || next.total)
          }
        })
        next.status = 'success'
        next.loaded = next.total || blob?.size || next.loaded
        next.total = next.total || blob?.size || next.loaded
        next.resolve(blob)
      } catch (error) {
        next.status = 'error'
        next.error = error.message || '下载失败'
        next.reject(error)
      } finally {
        running.value = false
        progress.value.speed = 0
        progress.value.remainingSeconds = 0
        state.value = tasks.value.some((task) => task.status === 'error') ? 'error' : 'success'
        lastCompletedStatus.value = next.status
        completedVersion.value += 1
        runPromise = null
        currentTaskId.value = ''
        if (tasks.value.some((task) => task.status === 'queued')) start()
      }
    })()
    return runPromise
  }

  function clearCompleted() {
    if (running.value) return
    tasks.value = tasks.value.filter((task) => task.status !== 'success')
    if (!tasks.value.length) state.value = 'idle'
  }

  function clearAll() {
    if (running.value) return
    tasks.value = []
    state.value = 'idle'
    progress.value = { loaded: 0, total: 0, percent: 0, speed: 0, remainingSeconds: 0 }
  }

  return { tasks, running, currentTask, queuedCount, successCount, errorCount, hasHistory, statusText, progress, state, lastCompletedStatus, queuedVersion, completedVersion, enqueue, start, clearCompleted, clearAll }
})
