import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { resolveLegacyUploadRoot, resolveUploadRoot } from '#utils/uploadPath.js'
import { getVaultStorageRoot } from './mediaVault.service.js'

const THUMBNAIL_DIRECTORY = '.generated-thumbnails'
const THUMBNAIL_SIZE = 640
const MAX_ACTIVE_JOBS = 2
sharp.concurrency(1)
sharp.cache({ memory: 32, files: 0, items: 10 })
const activeJobs = new Map()
const waitingJobs = []
let activeJobCount = 0

function isPathInside(root, target) {
  const relative = path.relative(path.resolve(root), path.resolve(target))
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
}

function getThumbnailPath(mediaId) {
  return path.join(resolveUploadRoot(), THUMBNAIL_DIRECTORY, `${mediaId}.webp`)
}

function withLimitedConcurrency(task) {
  return new Promise((resolve, reject) => {
    const run = async () => {
      activeJobCount += 1
      try {
        resolve(await task())
      } catch (error) {
        reject(error)
      } finally {
        activeJobCount -= 1
        const next = waitingJobs.shift()
        if (next) next()
      }
    }

    if (activeJobCount < MAX_ACTIVE_JOBS) run()
    else waitingJobs.push(run)
  })
}

async function generateThumbnail(media) {
  const sourcePath = path.resolve(media.storagePath)
  const allowedRoots = [
    resolveUploadRoot(),
    resolveLegacyUploadRoot(),
    path.resolve(resolveUploadRoot(), 'work-journal'),
    getVaultStorageRoot()
  ]
  if (!allowedRoots.some((root) => isPathInside(root, sourcePath))) {
    const error = new Error('媒体文件存储路径无效，已阻止生成缩略图')
    error.statusCode = 409
    error.code = 'MEDIA_THUMBNAIL_PATH_INVALID'
    throw error
  }

  let sourceStats
  try {
    sourceStats = await fs.stat(sourcePath)
    if (!sourceStats.isFile()) throw new Error('not_file')
  } catch {
    const error = new Error('图片文件不存在，无法生成缩略图')
    error.statusCode = 404
    error.code = 'MEDIA_THUMBNAIL_SOURCE_MISSING'
    throw error
  }

  const cachedPath = getThumbnailPath(media._id.toString())
  try {
    const cachedStats = await fs.stat(cachedPath)
    if (cachedStats.isFile() && cachedStats.mtimeMs >= sourceStats.mtimeMs) return cachedPath
  } catch {
    // The first request creates the derivative; a missing cache is expected.
  }

  await fs.mkdir(path.dirname(cachedPath), { recursive: true })
  const temporaryPath = `${cachedPath}.${randomUUID()}.tmp`
  try {
    await sharp(sourcePath, { failOn: 'none', limitInputPixels: 80_000_000 })
      .rotate()
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78, effort: 3 })
      .timeout({ seconds: 30 })
      .toFile(temporaryPath)
    await fs.rename(temporaryPath, cachedPath)
    return cachedPath
  } catch (error) {
    await fs.unlink(temporaryPath).catch(() => {})
    const thumbnailError = new Error('图片缩略图生成失败')
    thumbnailError.statusCode = 422
    thumbnailError.code = 'MEDIA_THUMBNAIL_GENERATION_FAILED'
    thumbnailError.cause = error
    throw thumbnailError
  }
}

/**
 * 为已通过媒体访问校验的图片生成或读取 WebP 缩略图。
 * @param {object} media 已授权的媒体数据库记录。
 * @returns {Promise<string>} 缓存缩略图的绝对路径。
 * @throws {Error} 图片不存在、存储路径越界或当前图片格式无法转换时抛出带状态码的业务错误。
 */
export async function getMediaThumbnailFile(media) {
  const mediaId = media._id.toString()
  if (activeJobs.has(mediaId)) return activeJobs.get(mediaId)

  const job = withLimitedConcurrency(() => generateThumbnail(media))
  activeJobs.set(mediaId, job)
  try {
    return await job
  } finally {
    activeJobs.delete(mediaId)
  }
}

/**
 * 删除媒体永久删除后对应的派生缩略图。
 * @param {string|object} mediaId 媒体记录 ID 或 Mongoose ObjectId。
 * @returns {Promise<boolean>} 找到并删除缩略图时返回 true，否则返回 false。
 * @throws {Error} 文件存在但无法清理时透传文件系统错误。
 */
export async function removeMediaThumbnail(mediaId) {
  if (!mediaId) return false
  const activeJob = activeJobs.get(mediaId.toString())
  if (activeJob) await activeJob.catch(() => {})
  try {
    await fs.unlink(getThumbnailPath(mediaId.toString()))
    return true
  } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}
