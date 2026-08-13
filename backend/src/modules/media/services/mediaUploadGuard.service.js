import fs from 'node:fs/promises'
import path from 'node:path'
import { env } from '#config/env'
import { resolveUploadRoot } from '#utils/uploadPath.js'

const MB = 1024 * 1024
let activeUploadCount = 0
let activeDeclaredBytes = 0

function createHttpError(statusCode, code, message, details = undefined) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  if (details) error.details = details
  return error
}

export function getMediaUploadCapacity() {
  return {
    maxConcurrent: Math.max(1, env.mediaUploadMaxConcurrent),
    maxTotalBytes: Math.max(1, env.mediaUploadMaxTotalMB) * MB,
    diskReserveBytes: Math.max(0, env.mediaUploadDiskReserveMB) * MB
  }
}

async function assertMediaUploadStorage(contentLength = 0) {
  const capacity = getMediaUploadCapacity()
  const declaredBytes = Math.max(0, Number(contentLength) || 0)

  if (declaredBytes === 0) {
    throw createHttpError(411, 'MEDIA_UPLOAD_LENGTH_REQUIRED', '上传请求缺少内容长度，无法执行存储空间保护')
  }

  // Multipart headers add a small overhead, so preflight allows 16MB beyond file total.
  if (declaredBytes > capacity.maxTotalBytes + 16 * MB) {
    throw createHttpError(413, 'MEDIA_UPLOAD_TOTAL_LIMIT', `单次上传文件总量不能超过 ${env.mediaUploadMaxTotalMB}MB`)
  }
  const uploadRoot = resolveUploadRoot()
  await fs.mkdir(uploadRoot, { recursive: true })
  let disk
  try {
    disk = await fs.statfs(uploadRoot)
  } catch {
    throw createHttpError(503, 'MEDIA_UPLOAD_STORAGE_CHECK_FAILED', '暂时无法检查上传存储空间，请稍后重试')
  }

  const availableBytes = Number(disk.bavail) * Number(disk.bsize)
  // activeDeclaredBytes 包含当前请求，确保并发上传合计后仍保留安全空间。
  const requiredBytes = activeDeclaredBytes + capacity.diskReserveBytes
  if (!Number.isFinite(availableBytes) || availableBytes < requiredBytes) {
    throw createHttpError(507, 'MEDIA_UPLOAD_STORAGE_INSUFFICIENT', '服务器上传存储空间不足，请清理空间后重试', {
      availableBytes,
      requiredBytes,
      reserveBytes: capacity.diskReserveBytes
    })
  }
}

export async function acquireMediaUpload(contentLength = 0) {
  const { maxConcurrent } = getMediaUploadCapacity()
  const declaredBytes = Math.max(0, Number(contentLength) || 0)
  if (activeUploadCount >= maxConcurrent) {
    throw createHttpError(429, 'MEDIA_UPLOAD_CONCURRENCY_LIMIT', '当前大文件上传任务较多，请等待其他上传完成后重试')
  }

  // 先同步占用槽位，避免多个请求在异步磁盘检查期间同时越过并发上限。
  activeUploadCount += 1
  activeDeclaredBytes += declaredBytes
  let released = false
  const release = () => {
    if (released) return
    released = true
    activeUploadCount = Math.max(0, activeUploadCount - 1)
    activeDeclaredBytes = Math.max(0, activeDeclaredBytes - declaredBytes)
  }

  try {
    await assertMediaUploadStorage(declaredBytes)
    return release
  } catch (error) {
    release()
    throw error
  }
}

export function assertMediaUploadTotalSize(files = []) {
  const totalBytes = files.reduce((sum, file) => sum + (Number(file?.size) || 0), 0)
  const { maxTotalBytes } = getMediaUploadCapacity()
  if (totalBytes > maxTotalBytes) {
    throw createHttpError(413, 'MEDIA_UPLOAD_TOTAL_LIMIT', `单次上传文件总量不能超过 ${env.mediaUploadMaxTotalMB}MB`)
  }
  return totalBytes
}

export async function cleanupMediaUploadPaths(paths = []) {
  const uniquePaths = [...new Set(paths.filter(Boolean).map((item) => path.resolve(item)))]
  await Promise.all(uniquePaths.map(async (filePath) => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await fs.unlink(filePath)
        return
      } catch (error) {
        if (error.code === 'ENOENT') return
        if (!['EBUSY', 'EPERM'].includes(error.code) || attempt === 2) throw error
        await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)))
      }
    }
  }))
}

export function getActiveMediaUploadCount() {
  return activeUploadCount
}
