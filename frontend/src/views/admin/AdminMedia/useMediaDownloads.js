import { ref } from 'vue'
import { downloadAdminMedia, downloadAdminMediaBatch } from '@/services/admin'
import { useMediaDownloadStore } from '@/stores/mediaDownload'
import { buildSingleMediaDownloadName, normalizeArchiveName } from './mediaDownloadOptions'

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  let link
  try {
    link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
  } finally {
    link?.remove()
    // 无论点击是否抛错，都回收对象 URL，避免大文件 Blob 长时间占用浏览器内存。
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

function createDownloadRequest(request) {
  return ({ onProgress, signal }) => request({
    signal,
    onDownloadProgress: (event) => onProgress(event.loaded, event.total || 0)
  })
}

export function useMediaDownloads({ selectedMediaRecords, clearSelection }) {
  const downloadStore = useMediaDownloadStore()
  const downloadModalVisible = ref(false)
  const downloadSubmitting = ref(false)

  function enqueueDownload(fileName, label, request, dedupeKey) {
    if (downloadStore.hasActiveTask(dedupeKey)) {
      downloadStore.showFeedback('warning', '该下载任务正在进行中，请勿重复点击', label)
      return Promise.resolve(null)
    }
    return downloadStore.enqueue({
      fileName,
      label,
      dedupeKey,
      request: async ({ onProgress, signal }) => {
        const blob = await createDownloadRequest(request)({ onProgress, signal })
        // 请求刚结束时仍可能被用户终止，必须在触发浏览器保存前再次检查。
        signal.throwIfAborted()
        if (!blob) return null
        saveBlob(blob, fileName)
        return blob
      }
    })
  }

  async function downloadSingleMedia(record) {
    if (!record?.id) return
    const fileName = buildSingleMediaDownloadName(record)
    try {
      await enqueueDownload(fileName, `下载：${record.originalName || fileName}`, (metadata) => downloadAdminMedia(record.id, metadata), `media:${record.id}`)
    } catch {
      // 队列统一记录错误并在下载中心反馈，避免多个通知分散用户注意力。
    }
  }

  function openBatchDownload() {
    if (!selectedMediaRecords.value.length) return
    downloadModalVisible.value = true
  }

  async function submitBatchDownload(options) {
    const records = [...selectedMediaRecords.value]
    if (!records.length) return

    downloadSubmitting.value = true
    try {
      const archiveName = normalizeArchiveName(options.archiveName)
      downloadModalVisible.value = false
      clearSelection()
      const downloadPromise = enqueueDownload(archiveName, `打包下载：${records.length} 个资源`, (metadata) => downloadAdminMediaBatch({
        ids: records.map((item) => item.id),
        namingMode: options.namingMode,
        prefix: options.prefix || undefined,
        archiveName
      }, metadata), `batch:${records.map((item) => item.id).sort().join(',')}|${archiveName}|${options.namingMode}|${options.prefix || ''}`)
      await downloadPromise
    } catch {
      // 失败由下载中心展示，结束表单提交态即可。
    } finally {
      downloadSubmitting.value = false
    }
  }

  return { downloadModalVisible, downloadSubmitting, downloadSingleMedia, openBatchDownload, submitBatchDownload }
}
