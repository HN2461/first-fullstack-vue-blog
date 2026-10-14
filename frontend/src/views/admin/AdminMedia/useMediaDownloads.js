import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { downloadAdminMedia, downloadAdminMediaBatch } from '@/services/admin'
import { useMediaDownloadStore } from '@/stores/mediaDownload'
import { buildSingleMediaDownloadName, normalizeArchiveName } from './mediaDownloadOptions'

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
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

  function enqueueDownload(fileName, label, request) {
    return downloadStore.enqueue({
      fileName,
      label,
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
      await enqueueDownload(fileName, `下载：${record.originalName || fileName}`, (metadata) => downloadAdminMedia(record.id, metadata))
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
      await enqueueDownload(archiveName, `打包下载：${records.length} 个资源`, (metadata) => downloadAdminMediaBatch({
        ids: records.map((item) => item.id),
        namingMode: options.namingMode,
        prefix: options.prefix || undefined,
        archiveName
      }, metadata))
      message.success(`已生成 ${records.length} 个资源的下载包`)
    } catch (error) {
      message.error(error.message || '批量下载失败')
    } finally {
      downloadSubmitting.value = false
    }
  }

  return { downloadModalVisible, downloadSubmitting, downloadSingleMedia, openBatchDownload, submitBatchDownload }
}
