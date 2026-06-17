import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { message, Modal } from 'ant-design-vue'

function toMessage(error, fallback) {
  return error?.message || fallback || '操作失败'
}

export function useAdminActions() {
  async function runAction(task, options = {}) {
    const {
      successMessage,
      errorMessage,
      onSuccess,
      onError
    } = options

    try {
      const result = await task()

      if (successMessage) {
        message.success(successMessage)
      }

      await onSuccess?.(result)
      return result
    } catch (error) {
      const text = toMessage(error, errorMessage)
      message.error(text)
      await onError?.(error)
      throw error
    }
  }

  function warn(text) {
    message.warning(text)
  }

  function confirmAction(options) {
    return new Promise((resolve, reject) => {
      Modal.confirm({
        okText: '确认',
        cancelText: '取消',
        centered: true,
        ...options,
        async onOk() {
          try {
            const result = await options.onOk?.()
            resolve(result)
          } catch (error) {
            reject(error)
            throw error
          }
        },
        onCancel() {
          options.onCancel?.()
          resolve(false)
        }
      })
    })
  }

  return {
    runAction,
    warn,
    confirmAction,
    toMessage
  }
}

function serializeSnapshot(snapshot) {
  return JSON.stringify(snapshot ?? null)
}

export function useUnsavedChanges(options) {
  const {
    getSnapshot,
    title = '离开当前页面？',
    content = '当前修改尚未保存，离开后将丢失本次编辑内容。',
    okText = '仍要离开',
    cancelText = '继续编辑',
    enabled = () => true
  } = options

  /** 兼容函数和 ref/computed 两种写法 */
  function resolveEnabled() {
    if (typeof enabled === 'function') {
      return enabled()
    }
    // 处理 ref / computed 等 Vue 响应式对象
    if (enabled && typeof enabled === 'object' && 'value' in enabled) {
      return enabled.value
    }
    return true
  }

  const baseline = ref('')
  const ready = ref(false)

  const currentSnapshot = computed(() => serializeSnapshot(getSnapshot?.()))
  const isDirty = computed(() => ready.value && resolveEnabled() && currentSnapshot.value !== baseline.value)

  function markClean(snapshot = getSnapshot?.()) {
    baseline.value = serializeSnapshot(snapshot)
    ready.value = true
  }

  function pauseTracking() {
    ready.value = false
  }

  function handleBeforeUnload(event) {
    if (!isDirty.value) {
      return
    }

    event.preventDefault()
    event.returnValue = ''
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  onBeforeRouteLeave(() => {
    if (!isDirty.value) {
      return true
    }

    return new Promise((resolve) => {
      Modal.confirm({
        title,
        content,
        okText,
        cancelText,
        okType: 'default',
        centered: true,
        onOk() {
          resolve(true)
        },
        onCancel() {
          resolve(false)
        }
      })
    })
  })

  return {
    isDirty,
    markClean,
    pauseTracking
  }
}
