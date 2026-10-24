import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { Media } from '#modules/media/models/Media.js'
import { resolveLegacyUploadRoot, resolveUploadRoot } from '#utils/uploadPath.js'
import { getVaultStorageRoot } from './mediaVault.service.js'

const THUMBNAIL_DIRECTORY = '.generated-thumbnails'
const THUMBNAIL_SIZE = 640
const MAX_ACTIVE_JOBS = 2
const CACHE_SCAN_BATCH_SIZE = 500
const SOURCE_STAT_BATCH_SIZE = 64
const STALE_TEMPORARY_AGE_MS = 24 * 60 * 60 * 1000
sharp.concurrency(1)
sharp.cache({ memory: 32, files: 0, items: 10 })
const activeJobs = new Map()
const waitingJobs = []
let activeJobCount = 0
let cacheMaintenancePending = 0
let cacheMaintenanceTail = Promise.resolve()

function isPathInside(root, target) {
  const relative = path.relative(path.resolve(root), path.resolve(target))
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
}

function getThumbnailPath(mediaId) {
  return path.join(getThumbnailCacheDirectory(), `${mediaId}.webp`)
}

function getThumbnailCacheDirectory() {
  return path.join(resolveUploadRoot(), THUMBNAIL_DIRECTORY)
}

async function waitForCacheMaintenance() {
  while (cacheMaintenancePending > 0) {
    const currentMaintenance = cacheMaintenanceTail
    await currentMaintenance
  }
}

async function withCacheMaintenance(task) {
  const previousMaintenance = cacheMaintenanceTail
  let releaseMaintenance
  cacheMaintenanceTail = new Promise((resolve) => {
    releaseMaintenance = resolve
  })
  cacheMaintenancePending += 1

  await previousMaintenance
  try {
    await Promise.all([...activeJobs.values()].map((job) => job.catch(() => {})))
    return await task()
  } finally {
    cacheMaintenancePending -= 1
    releaseMaintenance()
  }
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

  const cacheDirectory = getThumbnailCacheDirectory()
  await fs.mkdir(cacheDirectory, { recursive: true })
  const cacheDirectoryStats = await fs.lstat(cacheDirectory)
  if (!cacheDirectoryStats.isDirectory() || cacheDirectoryStats.isSymbolicLink()) {
    const error = new Error('图片缩略图缓存目录无效，已阻止写入')
    error.statusCode = 409
    error.code = 'MEDIA_THUMBNAIL_CACHE_PATH_INVALID'
    throw error
  }

  const cachedPath = getThumbnailPath(media._id.toString())
  try {
    const cachedStats = await fs.lstat(cachedPath)
    if (cachedStats.isFile() && !cachedStats.isSymbolicLink() && cachedStats.mtimeMs >= sourceStats.mtimeMs) return cachedPath
  } catch {
    // The first request creates the derivative; a missing cache is expected.
  }

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
  if (cacheMaintenancePending > 0) await waitForCacheMaintenance()
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
  if (cacheMaintenancePending > 0) await waitForCacheMaintenance()
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

function matchesThumbnailFilename(filename) {
  return /^([a-f\d]{24})\.webp$/i.exec(filename)
}

function matchesTemporaryFilename(filename) {
  return /^([a-f\d]{24})\.webp\.([a-f\d-]{36})\.tmp$/i.exec(filename)
}

async function readThumbnailCacheFiles() {
  const cacheDirectory = getThumbnailCacheDirectory()
  let directoryStats
  try {
    directoryStats = await fs.lstat(cacheDirectory)
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }

  if (!directoryStats.isDirectory() || directoryStats.isSymbolicLink()) {
    const error = new Error('图片缩略图缓存目录无效，已阻止扫描')
    error.statusCode = 409
    error.code = 'MEDIA_THUMBNAIL_CACHE_PATH_INVALID'
    throw error
  }

  const entries = await fs.readdir(cacheDirectory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (!entry.isFile()) continue
    const thumbnailMatch = matchesThumbnailFilename(entry.name)
    const temporaryMatch = matchesTemporaryFilename(entry.name)
    if (!thumbnailMatch && !temporaryMatch) continue

    const filePath = path.join(cacheDirectory, entry.name)
    const stats = await fs.stat(filePath)
    if (!stats.isFile()) continue
    files.push({
      id: entry.name,
      filePath,
      fileName: entry.name,
      mediaId: thumbnailMatch?.[1]?.toLowerCase() || temporaryMatch?.[1]?.toLowerCase() || '',
      type: thumbnailMatch ? 'thumbnail' : 'temporary',
      size: stats.size,
      mtime: stats.mtime
    })
  }
  return files
}

async function findMediaForCacheFiles(files = []) {
  const ids = [...new Set(files
    .filter((file) => file.type === 'thumbnail')
    .map((file) => file.mediaId)
    .filter(Boolean))]
  const mediaById = new Map()

  for (let index = 0; index < ids.length; index += CACHE_SCAN_BATCH_SIZE) {
    const batch = ids.slice(index, index + CACHE_SCAN_BATCH_SIZE)
    const mediaList = await Media.find({ _id: { $in: batch } })
      .select('originalName filename size kind mimeType storagePath deletedAt')
      .lean()
    for (const media of mediaList) mediaById.set(String(media._id).toLowerCase(), media)
  }

  const mediaEntries = [...mediaById.entries()]
  for (let index = 0; index < mediaEntries.length; index += SOURCE_STAT_BATCH_SIZE) {
    const batch = mediaEntries.slice(index, index + SOURCE_STAT_BATCH_SIZE)
    const statuses = await Promise.all(batch.map(async ([id, media]) => {
      if (!media.storagePath) return [id, 'missing']
      try {
        const stats = await fs.stat(path.resolve(media.storagePath))
        return [id, stats.isFile() ? 'available' : 'missing']
      } catch (error) {
        return [id, error.code === 'ENOENT' ? 'missing' : 'unavailable']
      }
    }))
    for (const [id, sourceStatus] of statuses) {
      const media = mediaById.get(id)
      mediaById.set(id, { ...media, sourceStatus })
    }
  }
  return mediaById
}

function mapCacheFile(file, mediaById, now = Date.now()) {
  const media = mediaById.get(file.mediaId)
  const isImage = Boolean(media && (media.kind === 'image' || String(media.mimeType || '').startsWith('image/')))
  const missingSource = isImage && media.sourceStatus === 'missing'
  const isOrphan = file.type === 'thumbnail' && (!isImage || missingSource)
  const isStaleTemporary = file.type === 'temporary' && now - file.mtime.getTime() >= STALE_TEMPORARY_AGE_MS
  const status = file.type === 'temporary'
    ? (isStaleTemporary ? 'staleTemporary' : 'temporary')
    : (missingSource ? 'missingSource' : (isOrphan ? 'orphan' : (media.deletedAt ? 'trash' : (media.sourceStatus === 'unavailable' ? 'sourceUnavailable' : 'active'))))

  return {
    id: file.id,
    mediaId: file.mediaId,
    type: file.type,
    originalName: file.type === 'temporary'
      ? '缩略图生成临时文件'
      : (media?.originalName || media?.filename || '没有对应的图片资源记录'),
    originalSize: media?.size || 0,
    cacheSize: file.size,
    updatedAt: file.mtime,
    status,
    isOrphan: isOrphan || isStaleTemporary,
    inTrash: Boolean(media?.deletedAt)
  }
}

/**
 * 汇总磁盘上的图片预览小图，并按页返回对应资源名称和缓存大小。
 * @param {{page?: number, pageSize?: number}} options 页码与每页条数。
 * @returns {Promise<object>} 缓存总量、孤儿数量、回收站数量和当前页条目。
 * @throws {Error} 缓存目录无法安全读取时抛出带状态码的业务错误。
 */
export async function getMediaThumbnailCacheOverview(options = {}) {
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const files = await readThumbnailCacheFiles()
  const mediaById = await findMediaForCacheFiles(files)
  const now = Date.now()
  const items = files.map((file) => mapCacheFile(file, mediaById, now))
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
  const thumbnailItems = items.filter((item) => item.type === 'thumbnail')
  const orphanItems = thumbnailItems.filter((item) => item.isOrphan)
  const trashItems = thumbnailItems.filter((item) => item.inTrash)
  const temporaryItems = items.filter((item) => item.type === 'temporary')
  const staleTemporaryItems = temporaryItems.filter((item) => item.isOrphan)
  const skip = (page - 1) * pageSize

  return {
    items: items.slice(skip, skip + pageSize),
    total: items.length,
    page,
    pageSize,
    thumbnailCount: thumbnailItems.length,
    thumbnailBytes: thumbnailItems.reduce((sum, item) => sum + item.cacheSize, 0),
    orphanCount: orphanItems.length,
    orphanBytes: orphanItems.reduce((sum, item) => sum + item.cacheSize, 0),
    trashCount: trashItems.length,
    trashBytes: trashItems.reduce((sum, item) => sum + item.cacheSize, 0),
    temporaryCount: temporaryItems.length,
    temporaryBytes: temporaryItems.reduce((sum, item) => sum + item.cacheSize, 0),
    staleTemporaryCount: staleTemporaryItems.length,
    staleTemporaryBytes: staleTemporaryItems.reduce((sum, item) => sum + item.cacheSize, 0),
    totalBytes: items.reduce((sum, item) => sum + item.cacheSize, 0),
    scannedAt: new Date().toISOString()
  }
}

/**
 * 清理无对应图片记录的小图，或清空可重新生成的小图缓存；不删除原图和媒体记录。
 * @param {'orphans'|'all'} scope orphans 只清理孤儿小图；all 清理所有小图。
 * @returns {Promise<{deletedCount: number, reclaimedBytes: number, thumbnailCount: number, temporaryCount: number}>} 清理数量和释放空间。
 * @throws {Error} 缓存目录不可安全访问或范围不支持时抛出带状态码的业务错误。
 */
export async function clearMediaThumbnailCache(scope = 'orphans') {
  if (!['orphans', 'all'].includes(scope)) {
    const error = new Error('不支持的缩略图缓存清理范围')
    error.statusCode = 400
    error.code = 'MEDIA_THUMBNAIL_CACHE_SCOPE_INVALID'
    throw error
  }

  return withCacheMaintenance(async () => {
    const files = await readThumbnailCacheFiles()
    const mediaById = await findMediaForCacheFiles(files)
    const now = Date.now()
    const candidates = files.filter((file) => {
      if (file.type === 'thumbnail') {
        return scope === 'all' || mapCacheFile(file, mediaById, now).isOrphan
      }
      return scope === 'all' || now - file.mtime.getTime() >= STALE_TEMPORARY_AGE_MS
    })

    let deletedCount = 0
    let reclaimedBytes = 0
    let thumbnailCount = 0
    let temporaryCount = 0
    for (const file of candidates) {
      try {
        await fs.unlink(file.filePath)
        deletedCount += 1
        reclaimedBytes += file.size
        if (file.type === 'thumbnail') thumbnailCount += 1
        else temporaryCount += 1
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
    }

    return { deletedCount, reclaimedBytes, thumbnailCount, temporaryCount }
  })
}
