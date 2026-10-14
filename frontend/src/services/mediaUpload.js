import http from './http'

const BASE_PATH = '/api/admin/media-uploads'
const MAX_RETRIES = 2

export function createUploadId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  // getRandomValues 在普通 HTTP 下也可用，兼容未启用 HTTPS 的开发站点。
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 15) | 64
  bytes[8] = (bytes[8] & 63) | 128
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function isUploadCancelled(error) {
  return ['ERR_CANCELED', 'ABORT_ERR'].includes(error?.code) || ['AbortError', 'CanceledError'].includes(error?.name)
}

function canRetry(error) {
  return !isUploadCancelled(error) && (
    !error.status || [408, 429].includes(error.status) || error.status >= 500 ||
    ['MEDIA_UPLOAD_BUSY', 'MEDIA_UPLOAD_OFFSET_CONFLICT'].includes(error.code)
  )
}

function waitForRetry(attempt, signal) {
  signal?.throwIfAborted()
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer)
      reject(new DOMException('上传已停止', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }, attempt * 1000)
    signal?.addEventListener('abort', abort, { once: true })
  })
}

async function retryRequest(request, options) {
  for (let attempt = 0; ; attempt += 1) {
    options.signal?.throwIfAborted()
    try {
      return await request()
    } catch (error) {
      if (attempt >= MAX_RETRIES || !canRetry(error)) throw error
      options.onPhase?.('retrying', `网络波动，正在重试（${attempt + 1}/${MAX_RETRIES}）`)
      await waitForRetry(attempt + 1, options.signal)
    }
  }
}

async function chunkChecksum(chunk) {
  // HTTPS 和本机开发环境可校验分片；普通 HTTP 环境仍使用大小和偏移校验。
  if (!globalThis.crypto?.subtle) return ''
  const digest = await crypto.subtle.digest('SHA-256', await chunk.arrayBuffer())
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('')
}

/**
 * 上传一个文件并复用任务 ID；每段只在服务器确认后推进续传位置。
 * @param {File} file - 浏览器选择的源文件
 * @param {Object} task - 包含可复用 uploadId 的任务，过期时会更新 ID
 * @param {Object} options - 分类、取消信号、进度和阶段回调
 * @returns {Promise<Object>} 已入库资源
 * @throws {Error} 不可重试的业务错误或重试耗尽时抛出；停止信号保留已确认的分片。
 */
export async function uploadMediaFile(file, task, options = {}) {
  const { signal, onProgress, onPhase } = options
  const config = { signal, timeout: 240000 }
  const create = () => http.post(BASE_PATH, {
    uploadId: task.uploadId, name: file.name, size: file.size,
    mimeType: file.type || 'application/octet-stream', lastModified: file.lastModified || 0,
    category: options.category || '默认素材',
    ...(options.categoryId ? { categoryId: options.categoryId } : {})
  }, config)

  onPhase?.('preparing', '正在检查文件和服务器空间')
  let session
  try {
    session = await retryRequest(create, options)
  } catch (error) {
    if (!['MEDIA_UPLOAD_SESSION_MISSING', 'MEDIA_UPLOAD_SESSION_EXPIRED'].includes(error.code)) throw error
    task.uploadId = createUploadId()
    onProgress?.(0)
    session = await retryRequest(create, options)
  }
  if (session.status === 'completed') return session.result
  onProgress?.(session.offset)

  let retries = 0
  while (session.offset < file.size) {
    signal?.throwIfAborted()
    const start = session.offset
    const chunk = file.slice(start, Math.min(file.size, start + session.chunkSize))
    const checksum = await chunkChecksum(chunk)
    signal?.throwIfAborted()
    onPhase?.('uploading', '')
    try {
      session = await http.put(`${BASE_PATH}/${task.uploadId}/chunk`, chunk, {
        ...config,
        headers: {
          'Content-Type': 'application/octet-stream', 'X-Upload-Offset': String(start),
          ...(checksum ? { 'X-Upload-Checksum': checksum } : {})
        },
        onUploadProgress: (event) => onProgress?.(start + Math.min(chunk.size, event.loaded))
      })
      onProgress?.(session.offset)
      retries = 0
    } catch (error) {
      if (retries >= MAX_RETRIES || !canRetry(error)) throw error
      retries += 1
      onPhase?.('retrying', `网络波动，正在恢复进度（${retries}/${MAX_RETRIES}）`)
      await waitForRetry(retries, signal)
      // 请求可能已经写入但响应丢失，先查服务器偏移，避免把同一分片追加两次。
      session = await retryRequest(() => http.get(`${BASE_PATH}/${task.uploadId}`, config), options)
      if (session.status === 'completed') return session.result
      onProgress?.(session.offset)
    }
  }

  onPhase?.('confirming', '文件已发送，正在确认入库')
  // 入库是短暂的提交阶段，停止操作等待本文件的真实结果，再停止后续文件。
  const completed = await retryRequest(() => http.post(`${BASE_PATH}/${task.uploadId}/complete`, {}, { timeout: 240000 }), { onPhase })
  return completed.result
}

/**
 * 清理临时任务，不删除已入库文件。
 * @param {string} uploadId - 上传任务 UUID
 * @returns {Promise<null>} 清理成功
 * @throws {Error} 网络或权限错误时抛出；服务器另有 24 小时过期清理兜底。
 */
export function discardMediaUpload(uploadId, options = {}) {
  const headers = options.accessToken
    ? { Authorization: `Bearer ${options.accessToken}` }
    : undefined
  return retryRequest(() => http.delete(`${BASE_PATH}/${uploadId}`, { timeout: 10000, headers }), {})
}
