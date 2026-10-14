import { computed, markRaw, ref } from 'vue'
import { defineStore } from 'pinia'
import { createUploadId, discardMediaUpload, isUploadCancelled, uploadMediaFile } from '@/services/mediaUpload'
import { createTransferTracker } from '@/utils/transferProgress'

export const UPLOAD_STATE_LABELS = {
  queued: '待上传', preparing: '检查中', uploading: '上传中', retrying: '重试中',
  confirming: '确认中', success: '已完成', error: '失败', paused: '已暂停', cancelled: '已取消'
}

export const useMediaUploadStore = defineStore('mediaUpload', () => {
  const tasks = ref([])
  const modalOpen = ref(false)
  const running = ref(false)
  const clearing = ref(false)
  const started = ref(false)
  const ownerId = ref('')
  const rules = ref({ maxFiles: 5, maxFileSizeMB: 20, allowedExtensions: [] })
  const categoryOptions = ref([])
  const categoryId = ref(undefined)
  const categoryName = ref('默认素材')
  const errorMessage = ref('')
  const state = ref('idle')
  const completedVersion = ref(0)
  const progress = ref({ loaded: 0, total: 0, percent: 0, speed: 0, remainingSeconds: 0 })
  let controller = null
  let runPromise = null
  let stopMode = 'paused'

  const totalSize = computed(() => tasks.value.reduce((sum, task) => sum + task.file.size, 0))
  const successCount = computed(() => tasks.value.filter((task) => task.status === 'success').length)
  const failedCount = computed(() => tasks.value.filter((task) => task.status === 'error').length)
  const remainingCount = computed(() => tasks.value.length - successCount.value)
  const currentTask = computed(() => tasks.value.find((task) => ['preparing', 'uploading', 'retrying', 'confirming'].includes(task.status)))
  const hasHistory = computed(() => started.value && tasks.value.length > 0)
  const statusText = computed(() => {
    if (running.value) return UPLOAD_STATE_LABELS[currentTask.value?.status] || '上传中'
    if (state.value === 'success') return '上传完成'
    if (state.value === 'error') return successCount.value ? '部分失败' : '上传失败'
    return UPLOAD_STATE_LABELS[state.value] || '等待上传'
  })

  function updateCategory(id) {
    if (started.value) return
    categoryId.value = id
    categoryName.value = categoryOptions.value.find((option) => option.value === id)?.name || '默认素材'
  }

  function open(options = {}) {
    if (!started.value) {
      if (options.rules) rules.value = { ...options.rules }
      if (options.categoryOptions) categoryOptions.value = options.categoryOptions.map((option) => ({ ...option }))
      ownerId.value = options.ownerId || ownerId.value
      const id = options.categoryId || categoryId.value || categoryOptions.value.find((option) => option.name === '默认素材')?.value
      updateCategory(id)
    }
    modalOpen.value = true
  }

  function addFile(file) {
    if (running.value || started.value || clearing.value) return
    if (tasks.value.some((task) => task.file.name === file.name && task.file.size === file.size && task.file.lastModified === file.lastModified)) return
    tasks.value.push({
      id: createUploadId(), uploadId: createUploadId(), file: markRaw(file),
      status: 'queued', loaded: 0, error: '', note: '', result: null
    })
    errorMessage.value = ''
  }

  async function removeFile(id) {
    if (running.value || clearing.value) return
    const task = tasks.value.find((item) => item.id === id)
    if (!task || task.status === 'success') return
    clearing.value = true
    try {
      if (started.value) await discardMediaUpload(task.uploadId).catch(() => {})
      tasks.value = tasks.value.filter((item) => item.id !== id)
      if (!tasks.value.length) {
        started.value = false
        state.value = 'idle'
      } else if (!remainingCount.value) state.value = 'success'
      refreshProgress()
    } finally {
      clearing.value = false
    }
  }

  function refreshProgress(tracker) {
    const loaded = tasks.value.reduce((sum, task) => sum + Math.min(task.file.size, task.loaded), 0)
    tracker?.(loaded, totalSize.value)
    progress.value = {
      ...progress.value, loaded, total: totalSize.value,
      // 全部字节已发送仍可能在确认入库，只有全部资源确认成功才能显示 100%。
      percent: tasks.value.length && successCount.value === tasks.value.length
        ? 100 : Math.min(99, totalSize.value ? Math.floor(loaded / totalSize.value * 100) : 0)
    }
  }

  /**
   * 顺序执行文件队列；失败只影响当前文件，重试跳过已入库资源。
   * @returns {Promise<void>} 本轮任务结束，不随上传弹窗或业务页面卸载而终止
   * @throws {Error} 业务错误记录在每个任务中；空队列不发起请求。
   */
  function start() {
    if (running.value || clearing.value || !tasks.value.length || !remainingCount.value) return runPromise
    started.value = true
    running.value = true
    state.value = 'active'
    errorMessage.value = ''
    stopMode = 'paused'
    controller = new AbortController()
    const signal = controller.signal
    const alreadyLoaded = tasks.value.reduce((sum, task) => sum + Math.min(task.file.size, task.loaded), 0)
    const update = createTransferTracker((next) => { progress.value = next }, alreadyLoaded)
    refreshProgress(update)
    let changed = false

    runPromise = (async () => {
      try {
        for (const task of tasks.value) {
          if (task.status === 'success' || signal.aborted) continue
          task.error = ''
          try {
            const result = await uploadMediaFile(task.file, task, {
              category: categoryName.value, categoryId: categoryId.value, signal,
              onProgress: (loaded) => {
                task.loaded = loaded
                refreshProgress(update)
              },
              onPhase: (phase, note) => {
                task.status = phase
                task.note = note
                if (phase === 'retrying' || phase === 'confirming') progress.value.speed = 0
              }
            })
            task.result = result
            task.status = 'success'
            task.loaded = task.file.size
            task.note = ''
            changed = true
            refreshProgress(update)
          } catch (error) {
            if (signal.aborted || isUploadCancelled(error)) {
              task.status = stopMode
              task.note = ''
              break
            }
            task.status = 'error'
            task.error = formatUploadError(error)
            task.note = ''
            // 身份失效后停止队列，避免继续使用已经失效或改变的账号。
            if ([401, 403].includes(error.status)) break
          }
        }
        if (signal.aborted) {
          tasks.value.filter((task) => task.status !== 'success' && task.status !== 'error').forEach((task) => { task.status = stopMode })
          state.value = remainingCount.value ? stopMode : 'success'
        } else {
          state.value = failedCount.value || remainingCount.value ? 'error' : 'success'
        }
      } finally {
        running.value = false
        controller = null
        progress.value.speed = 0
        progress.value.remainingSeconds = 0
        refreshProgress()
        if (changed) completedVersion.value += 1
      }
    })()
    return runPromise
  }

  function pause() {
    stopMode = 'paused'
    controller?.abort()
  }

  async function cancel() {
    if (clearing.value) return
    clearing.value = true
    stopMode = 'cancelled'
    controller?.abort()
    await runPromise
    try {
      const unfinished = tasks.value.filter((task) => task.status !== 'success')
      await Promise.allSettled(unfinished.map((task) => discardMediaUpload(task.uploadId)))
      unfinished.forEach((task) => {
        task.status = 'cancelled'
        task.loaded = 0
        task.uploadId = createUploadId()
        task.error = ''
      })
      state.value = remainingCount.value ? 'cancelled' : 'success'
      refreshProgress()
    } finally {
      clearing.value = false
    }
  }

  async function clear() {
    if (running.value || clearing.value) return
    clearing.value = true
    try {
      if (started.value) await Promise.allSettled(tasks.value.map((task) => discardMediaUpload(task.uploadId)))
      tasks.value = []
      started.value = false
      state.value = 'idle'
      errorMessage.value = ''
      refreshProgress()
    } finally {
      clearing.value = false
    }
  }

  async function resetForUser(options = {}) {
    // 账号切换时先停止网络请求，再释放源文件引用；旧账号临时数据由 TTL 兜底。
    stopMode = 'cancelled'
    controller?.abort()
    await runPromise
    // 账号退出或切换时主动删除全部上传会话，避免只清理前端状态而让服务器临时分片继续保留。
    const uploadIds = tasks.value.map((task) => task.uploadId).filter(Boolean)
    await Promise.allSettled(uploadIds.map((uploadId) => discardMediaUpload(uploadId, options)))
    tasks.value = []
    started.value = false
    modalOpen.value = false
    ownerId.value = ''
    state.value = 'idle'
    errorMessage.value = ''
    categoryOptions.value = []
    categoryId.value = undefined
    refreshProgress()
  }

  return {
    tasks, modalOpen, running, clearing, started, ownerId, rules, categoryOptions, categoryId, categoryName,
    errorMessage, state, progress, completedVersion, totalSize, successCount, failedCount, remainingCount,
    currentTask, hasHistory, statusText, updateCategory, open, addFile, removeFile, start, pause, cancel, clear, resetForUser
  }
})

function formatUploadError(error) {
  if (error.status === 408) return '服务器接收超时，可重试继续已确认的进度'
  if (error.status === 413) return '上传大小超过服务或网关限制，请检查上传配置'
  if (error.status === 429) return '上传任务较多，请稍后重试'
  return error.message || '网络连接失败，请重试'
}
