import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { downloadAdminMedia, downloadAdminMediaBatch } from '@/services/admin'
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

export function useMediaDownloads({ selectedMediaRecords, clearSelection }) {
  const downloadModalVisible = ref(false)
  const downloadSubmitting = ref(false)

  async function downloadSingleMedia(record) {
    if (!record?.id) return

    try {
      const blob = await downloadAdminMedia(record.id)
      saveBlob(blob, buildSingleMediaDownloadName(record))
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
      const blob = await downloadAdminMediaBatch({
        ids: records.map((item) => item.id),
        namingMode: options.namingMode,
        prefix: options.prefix || undefined,
        archiveName
      })
      saveBlob(blob, archiveName)
      downloadModalVisible.value = false
      clearSelection()
      message.success(`已生成 ${records.length} 个资源的下载包`)
    } catch (error) {
      message.error(error.message || '批量下载失败')
    } finally {
      downloadSubmitting.value = false
    }
  }

  return {
    downloadModalVisible,
    downloadSubmitting,
    downloadSingleMedia,
    openBatchDownload,
    submitBatchDownload
  }
}
