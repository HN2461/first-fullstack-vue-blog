import fs from 'node:fs/promises'
import path from 'node:path'
import { Media } from '#modules/media/models/Media.js'
import { resolveUploadRoot } from '#utils/uploadPath.js'
import { ensureDefaultMediaCategory } from './mediaCategory.service.js'
import { findMediaReferences, summarizeMediaReferences } from './mediaReference.service.js'
import { buildUrlFromRelativePath, getDisplayName, getTestUploadReason, inferFileClass, inferInventorySource, inferMimeType, isPathInside, normalizeDiskPath } from '../utils/mediaInventory.util.js'

const DEFAULT_UNTRACKED_CATEGORY = '历史未登记资源'

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

async function walkFiles(rootDir, currentDir = rootDir, items = []) {
  let entries = []
  try {
    entries = await fs.readdir(currentDir, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') {
      return items
    }
    throw error
  }

  for (const entry of entries) {
    const targetPath = path.join(currentDir, entry.name)
    if (entry.isDirectory()) {
      await walkFiles(rootDir, targetPath, items)
    } else if (entry.isFile()) {
      const stats = await fs.stat(targetPath)
      const relativePath = path.relative(rootDir, targetPath).replace(/\\/g, '/')
      const mimeType = inferMimeType(entry.name)
      const suspectedTestReason = getTestUploadReason(relativePath, entry.name)
      items.push({
        id: relativePath,
        relativePath,
        filename: entry.name,
        originalName: getDisplayName(entry.name),
        url: buildUrlFromRelativePath(relativePath),
        storagePath: targetPath.replace(/\\/g, '/'),
        mimeType,
        kind: mimeType.startsWith('image/') ? 'image' : 'attachment',
        fileClass: inferFileClass(entry.name, mimeType),
        size: stats.size,
        mtime: stats.mtime,
        registered: false,
        suspectedTest: Boolean(suspectedTestReason),
        suspectedTestReason
      })
    }
  }

  return items
}

async function attachInventoryUsages(files = [], { includeAllReferences = false } = {}) {
  return Promise.all(files.map(async (item) => {
    const references = await findMediaReferences({ url: item.url })
    const usage = summarizeMediaReferences(references)
    const source = inferInventorySource(item.relativePath)
    const protectedReason = source.protectedReason || (references.length > 0
      ? `仍被 ${references.length} 处业务引用`
      : '')

    const { storagePath, ...safeItem } = item
    return {
      ...safeItem,
      source,
      usage,
      references: includeAllReferences ? references : references.slice(0, 5),
      protected: Boolean(protectedReason),
      protectedReason
    }
  }))
}

async function getRegisteredPathSet(uploadRoot) {
  const mediaList = await Media.find().select('storagePath url')
  const registeredPaths = new Set()

  for (const media of mediaList) {
    if (media.storagePath) {
      registeredPaths.add(normalizeDiskPath(media.storagePath))
    }

    if (media.url?.startsWith('/uploads/')) {
      const relativePath = media.url.replace(/^\/uploads\/?/, '').replace(/\//g, path.sep)
      registeredPaths.add(normalizeDiskPath(path.join(uploadRoot, relativePath)))
    }
  }

  return registeredPaths
}

async function scanUnregisteredMediaFiles(options = {}) {
  const uploadRoot = resolveUploadRoot()
  const registeredPaths = await getRegisteredPathSet(uploadRoot)
  const allFiles = await walkFiles(uploadRoot)
  const keyword = String(options.keyword || '').trim().toLowerCase()
  const fileClass = String(options.fileClass || '').trim()
  const suspectOnly = options.suspectOnly === true || options.suspectOnly === 'true'

  const files = allFiles
    .filter((item) => !registeredPaths.has(normalizeDiskPath(item.storagePath)))
    .filter((item) => !suspectOnly || item.suspectedTest)
    .filter((item) => !fileClass || item.fileClass === fileClass)
    .filter((item) => {
      if (!keyword) {
        return true
      }
      return [item.originalName, item.filename, item.relativePath, item.url]
        .some((value) => String(value || '').toLowerCase().includes(keyword))
    })
    .sort((left, right) => new Date(right.mtime).getTime() - new Date(left.mtime).getTime())

  return attachInventoryUsages(files)
}

export async function listUnregisteredMediaFiles(options = {}) {
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const files = await scanUnregisteredMediaFiles(options)
  const skip = (page - 1) * pageSize

  return {
    items: files.slice(skip, skip + pageSize),
    total: files.length,
    page,
    pageSize,
    registerableCount: files.filter((item) => item.source?.registerable !== false).length,
    protectedCount: files.filter((item) => item.protected).length,
    totalSize: files.reduce((sum, item) => sum + item.size, 0)
  }
}

function normalizeRegisterItems(input = {}) {
  if (Array.isArray(input.items)) {
    return input.items
  }
  if (Array.isArray(input.paths)) {
    return input.paths.map((relativePath) => ({ relativePath }))
  }
  return []
}

function resolveUnregisteredFilePath(relativePath) {
  const uploadRoot = resolveUploadRoot()
  const normalizedRelativePath = String(relativePath || '').trim().replace(/^\/?uploads\/?/, '')
  if (!normalizedRelativePath) {
    throw createHttpError(400, 'MEDIA_INVENTORY_PATH_REQUIRED', '请选择要登记的资源')
  }

  const targetPath = path.resolve(uploadRoot, normalizedRelativePath)
  if (!isPathInside(uploadRoot, targetPath)) {
    throw createHttpError(400, 'MEDIA_INVENTORY_PATH_INVALID', '资源路径不在上传目录内')
  }

  return {
    uploadRoot,
    targetPath,
    relativePath: path.relative(uploadRoot, targetPath).replace(/\\/g, '/')
  }
}

export async function getUnregisteredMediaFileDetail(relativePath) {
  const { targetPath, relativePath: normalizedRelativePath } = resolveUnregisteredFilePath(relativePath)
  let stats
  try {
    stats = await fs.stat(targetPath)
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw createHttpError(404, 'MEDIA_INVENTORY_NOT_FOUND', '未找到该未登记资源')
    }
    throw error
  }

  if (!stats.isFile()) {
    throw createHttpError(400, 'MEDIA_INVENTORY_NOT_FILE', '只能查看文件资源')
  }

  const url = buildUrlFromRelativePath(normalizedRelativePath)
  const existing = await Media.exists({
    $or: [
      { storagePath: targetPath.replace(/\\/g, '/') },
      { url }
    ]
  })
  if (existing) {
    throw createHttpError(409, 'MEDIA_INVENTORY_ALREADY_REGISTERED', '该资源已登记到媒体资产库')
  }

  const filename = path.basename(targetPath)
  const mimeType = inferMimeType(filename)
  const suspectedTestReason = getTestUploadReason(normalizedRelativePath, filename)
  const [detail] = await attachInventoryUsages([{
    id: normalizedRelativePath,
    relativePath: normalizedRelativePath,
    filename,
    originalName: getDisplayName(filename),
    url,
    storagePath: targetPath.replace(/\\/g, '/'),
    mimeType,
    kind: mimeType.startsWith('image/') ? 'image' : 'attachment',
    fileClass: inferFileClass(filename, mimeType),
    size: stats.size,
    mtime: stats.mtime,
    registered: false,
    suspectedTest: Boolean(suspectedTestReason),
    suspectedTestReason
  }], { includeAllReferences: true })

  return detail
}

async function createMediaFromDiskFile(item, user, category) {
  const { targetPath, relativePath } = resolveUnregisteredFilePath(item.relativePath || item.id || item.url)
  const stats = await fs.stat(targetPath)
  if (!stats.isFile()) {
    throw createHttpError(400, 'MEDIA_INVENTORY_NOT_FILE', '只能登记文件资源')
  }

  const url = buildUrlFromRelativePath(relativePath)
  const exists = await Media.findOne({
    $or: [
      { storagePath: targetPath.replace(/\\/g, '/') },
      { url }
    ]
  })
  if (exists) {
    return { media: exists.toSafeJSON(), skipped: true, reason: 'already_registered' }
  }

  const filename = path.basename(targetPath)
  const mimeType = inferMimeType(filename)
  const source = inferInventorySource(relativePath)
  if (source.registerable === false) {
    return {
      media: null,
      skipped: true,
      reason: `${source.type}_resource`,
      relativePath,
      message: source.protectedReason
    }
  }

  const categoryEntity = await assertMediaCategoryExists(category, user)
  const media = await Media.create({
    filename,
    originalName: getDisplayName(filename),
    mimeType,
    size: stats.size,
    url,
    storagePath: targetPath.replace(/\\/g, '/'),
    kind: mimeType.startsWith('image/') ? 'image' : 'attachment',
    category,
    categoryId: categoryEntity._id,
    fileClass: inferFileClass(filename, mimeType),
    uploader: user._id
  })

  return { media: media.toSafeJSON(), skipped: false }
}

export async function registerUntrackedMedia(input = {}, user) {
  await ensureDefaultMediaCategory()
  const category = String(input.category || DEFAULT_UNTRACKED_CATEGORY).trim() || DEFAULT_UNTRACKED_CATEGORY
  const items = input.mode === 'all'
    ? await scanUnregisteredMediaFiles(input)
    : normalizeRegisterItems(input)

  if (items.length === 0) {
    throw createHttpError(400, 'MEDIA_INVENTORY_ITEMS_REQUIRED', '请选择要登记的资源')
  }

  const results = []
  for (const item of items) {
    results.push(await createMediaFromDiskFile(item, user, category))
  }

  return {
    items: results.filter((item) => item.media).map((item) => item.media),
    total: results.length,
    createdCount: results.filter((item) => !item.skipped).length,
    skippedCount: results.filter((item) => item.skipped).length,
    skipped: results.filter((item) => item.skipped).map((item) => ({
      relativePath: item.relativePath || item.media?.url || '',
      reason: item.reason || 'skipped',
      message: item.message || ''
    }))
  }
}

export async function clearSuspectedUntrackedMedia(options = {}) {
  const files = await scanUnregisteredMediaFiles({ ...options, suspectOnly: true })
  let deletedCount = 0
  let skippedCount = 0
  let deletedSize = 0
  const skipped = []

  for (const file of files) {
    if (file.protected || file.usage?.referenceCount > 0) {
      skippedCount += 1
      skipped.push({
        relativePath: file.relativePath,
        reason: file.protectedReason || '资源仍被业务引用'
      })
      continue
    }

    const { targetPath } = resolveUnregisteredFilePath(file.relativePath)
    try {
      await fs.unlink(targetPath)
      deletedCount += 1
      deletedSize += file.size || 0
    } catch (error) {
      if (error.code === 'ENOENT') {
        skippedCount += 1
        skipped.push({ relativePath: file.relativePath, reason: '文件已不存在' })
        continue
      }
      throw error
    }
  }

  return {
    deletedCount,
    skippedCount,
    deletedSize,
    skipped
  }
}
