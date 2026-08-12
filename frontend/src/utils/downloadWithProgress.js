import { createTransferTracker } from './transferProgress'

function getFilenameFromDisposition(value, fallback) {
  const encoded = String(value || '').match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  if (encoded) {
    try {
      return decodeURIComponent(encoded)
    } catch {
      return fallback
    }
  }
  return String(value || '').match(/filename="([^"]+)"/i)?.[1] || fallback
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function startBrowserDownload(url, filename) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}

/**
 * 流式下载并报告进度。支持文件系统访问 API 时直接写盘，避免大文件整体驻留内存。
 */
export async function downloadWithProgress(url, options = {}) {
  const {
    filename = 'download',
    signal,
    onProgress = () => {},
    preferFileSystem = true,
    blobFallbackLimit = 100 * 1024 * 1024,
    expectedSize = 0
  } = options
  let writable = null
  let fileHandle = null

  if (preferFileSystem && typeof window !== 'undefined' && window.showSaveFilePicker) {
    fileHandle = await window.showSaveFilePicker({ suggestedName: filename })
    writable = await fileHandle.createWritable()
  }

  if (!writable && (!expectedSize || expectedSize > blobFallbackLimit)) {
    startBrowserDownload(url, filename)
    onProgress({ loaded: 0, total: expectedSize, percent: 0, speed: 0, remainingSeconds: 0, status: 'browser' })
    return { filename, method: 'browser' }
  }

  try {
    const response = await fetch(url, { credentials: 'include', signal })
    if (!response.ok) {
      let message = `下载失败：${response.status}`
      try {
        const payload = await response.json()
        message = payload.message || message
      } catch {
        // 非 JSON 错误响应使用 HTTP 状态兜底。
      }
      throw new Error(message)
    }

    const total = Number(response.headers.get('content-length')) || expectedSize || 0
    const actualFilename = getFilenameFromDisposition(response.headers.get('content-disposition'), filename)
    const reader = response.body?.getReader()
    if (!reader) {
      const blob = await response.blob()
      if (writable) {
        await writable.write(blob)
        await writable.close()
      } else {
        saveBlob(blob, actualFilename)
      }
      onProgress({ loaded: blob.size, total: total || blob.size, percent: 100, speed: 0, remainingSeconds: 0, status: 'success' })
      return { filename: actualFilename, method: writable ? 'file-system' : 'blob' }
    }

    const chunks = writable ? null : []
    let loaded = 0
    const update = createTransferTracker((progress) => onProgress({ ...progress, status: 'active' }))
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      loaded += value.byteLength
      if (writable) {
        await writable.write(value)
      } else {
        chunks.push(value)
      }
      update(loaded, total)
    }

    if (writable) {
      await writable.close()
    } else {
      saveBlob(new Blob(chunks, { type: response.headers.get('content-type') || 'application/octet-stream' }), actualFilename)
    }

    onProgress({ loaded, total, percent: total ? 100 : 0, speed: 0, remainingSeconds: 0, status: 'success' })
    return { filename: actualFilename, method: writable ? 'file-system' : 'blob' }
  } catch (error) {
    if (writable) {
      await writable.abort().catch(() => {})
    }
    throw error
  }
}
