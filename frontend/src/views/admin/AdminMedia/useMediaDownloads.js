import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { downloadAdminMedia, downloadAdminMediaBatch } from '@/services/admin'
import { useMediaDownloadStore } from '@/stores/mediaDownload'
import { buildSingleMediaDownloadName, normalizeArchiveName } from './mediaDownloadOptions'

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  try {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
  } finally {
    // 无论点击是否抛错，都回收对象 URL，避免大文件 Blob 长时间占用浏览器内存。
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

function createDownloadRequest(request) {
  return ({ onProgress }) => request({
    onDownloadProgress: (event) => onProgress(event.loaded, event.total || 0)
  })
}

export function useMediaDownloads({ selectedMediaRecords, clearSelection }) {
  const downloadStore = useMediaDownloadStore()
  const downloadModalVisible = ref(false)
  const downloadSubmitting = ref(false)

  function enqueueDownload(fileName, label, request, dedupeKey) {
    if (downloadStore.hasActiveTask(dedupeKey)) {
      message.warning('该下载任务正在进行中，请勿重复点击')
      const duplicate = Promise.resolve(null)
      duplicate.duplicate = true
      return duplicate
    }
    return downloadStore.enqueue({
      fileName,
      label,
      dedupeKey,
      request: async ({ onProgress }) => {
        const blob = await createDownloadRequest(request)({ onProgress })
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
    } catch (error) {
      message.error(error.message || '资源下载失败')
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
      if (downloadPromise.duplicate) return
      message.success(`已生成 ${records.length} 个资源的下载包`)
    } catch (error) {
      message.error(error.message || '批量下载失败')
    } finally {
      downloadSubmitting.value = false
    }
  }

  return { downloadModalVisible, downloadSubmitting, downloadSingleMedia, openBatchDownload, submitBatchDownload }
}
