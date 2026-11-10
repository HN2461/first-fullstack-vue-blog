import { ref, watch, onBeforeUnmount } from 'vue'
import { readResourceBlob } from '@/services/resources'

/**
 * 将私有资源转换为当前组件专属 Object URL，切换文件或卸载时回收。
 * @param {Function} source 响应式资源地址读取函数。
 * @returns {{url:object,error:object,loading:object}} 展示地址和状态。
 * @throws {Error} 请求异常通过 error 返回，过期请求不能覆盖新文件。
 */
export function useResourceUrl(source) {
  const url = ref('')
  const error = ref('')
  const loading = ref(false)
  let controller
  let objectUrl = ''
  function cleanup() {
    controller?.abort()
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    objectUrl = ''
  }
  watch(source, async (value) => {
    cleanup()
    url.value = ''
    error.value = ''
    loading.value = false
    if (!value) return
    if (!value.startsWith('/api/')) {
      url.value = value
      return
    }
    const current = new AbortController()
    controller = current
    loading.value = true
    try {
      const blob = await readResourceBlob(value, { signal: current.signal })
      if (current.signal.aborted) return
      objectUrl = URL.createObjectURL(blob)
      url.value = objectUrl
    } catch (reason) {
      if (!current.signal.aborted) error.value = reason.message || '文件加载失败'
    } finally {
      if (!current.signal.aborted) loading.value = false
    }
  }, { immediate: true })
  onBeforeUnmount(cleanup)
  return { url, error, loading }
}
