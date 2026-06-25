import fs from 'node:fs/promises'
import path from 'node:path'
import { env } from '#config/env'
import { Media } from '#modules/media/models/Media.js'
import { decodeUploadFilename } from '#utils/uploadFilename.js'
import { resolveLegacyUploadRoot, resolveUploadRoot } from '#utils/uploadPath.js'
import { ensureDefaultMediaCategory } from './mediaCategory.service.js'

function normalizeMediaCategory(value) {
  const category = String(value || '').trim()
  return category || '默认素材'
}

function normalizeRenamedOriginalName(value, fallbackName = '') {
  const nextName = String(value || '').trim().replace(/\s+/g, ' ')
  if (!nextName) {
    const error = new Error('资源名称不能为空')
    error.statusCode = 400
    error.code = 'MEDIA_RENAME_NAME_REQUIRED'
    throw error
  }

  const nextExt = path.extname(nextName)
  if (nextExt) {
    return nextName
  }

  const fallbackExt = path.extname(String(fallbackName || '').trim())
  return fallbackExt ? `${nextName}${fallbackExt}` : nextName
}

function inferFileClass(file) {
  if (file.mimetype.startsWith('image/')) {
    return 'image'
  }

  const ext = path.extname(file.originalname || '').toLowerCase()
  const codeExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.vue', '.java', '.py', '.go', '.rb', '.php', '.sql', '.json', '.yml', '.yaml', '.xml', '.html', '.css', '.scss', '.less', '.md', '.txt', '.sh', '.ps1', '.bat', '.c', '.cpp', '.h', '.hpp', '.cs', '.kt', '.swift', '.rs'])
  const documentExtensions = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.csv'])
  const archiveExtensions = new Set(['.zip', '.rar', '.7z', '.tar', '.gz'])

  if (codeExtensions.has(ext)) {
    return 'code'
  }

  if (documentExtensions.has(ext)) {
    return 'document'
  }

  if (archiveExtensions.has(ext)) {
    return 'archive'
  }

  return 'other'
}

export async function createMediaFromFile(file, user, metadata = {}) {
  await ensureDefaultMediaCategory()
  const kind = file.mimetype.startsWith('image/') ? 'image' : 'attachment'
  const normalizedPath = file.path.replace(/\\/g, '/')
  const uploadsIndex = normalizedPath.lastIndexOf('uploads/')
  const relativePath = uploadsIndex >= 0 ? normalizedPath.slice(uploadsIndex) : normalizedPath
  const originalName = decodeUploadFilename(file.originalname)
  const media = await Media.create({
    filename: file.filename,
    originalName,
    mimeType: file.mimetype,
    size: file.size,
    url: `/${relativePath}`,
    storagePath: normalizedPath,
    kind,
    category: normalizeMediaCategory(metadata.category),
    fileClass: inferFileClass(file),
    uploader: user._id
  })

  return media.toSafeJSON()
}

export async function createMediaFromFiles(files, user, metadata = {}) {
  const items = []

  for (const file of files) {
    items.push(await createMediaFromFile(file, user, metadata))
  }

  return {
    items,
    total: items.length
  }
}

export async function listMedia(options = {}) {
  await ensureDefaultMediaCategory()
  const { kind, fileClass, keyword } = options
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const query = options.deleted === 'true' || options.scope === 'trash'
    ? { deletedAt: { $exists: true, $ne: null } }
    : { deletedAt: null }

  if (kind) {
    query.kind = kind
  }

  if (fileClass) {
    query.fileClass = fileClass
  }

  if (options.category) {
    query.category = normalizeMediaCategory(options.category)
  }

  if (Array.isArray(options.excludeCategories) && options.excludeCategories.length > 0) {
    const excludedCategories = options.excludeCategories.map((item) => normalizeMediaCategory(item))

    if (query.category) {
      if (excludedCategories.includes(query.category)) {
        return {
          items: [],
          total: 0,
          page,
          pageSize
        }
      }
    } else {
      query.category = { $nin: excludedCategories }
    }
  }

  if (keyword) {
    query.$or = [
      { originalName: { $regex: keyword, $options: 'i' } },
      { filename: { $regex: keyword, $options: 'i' } },
      { category: { $regex: keyword, $options: 'i' } }
    ]
  }

  const skip = (page - 1) * pageSize

  const [media, total] = await Promise.all([
    Media.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Media.countDocuments(query)
  ])

  return {
    items: media.map((item) => item.toSafeJSON()),
    total,
    page,
    pageSize
  }
}

export async function renameMedia(id, originalName) {
  const media = await Media.findOne({ _id: id, deletedAt: null })
  if (!media) {
    const error = new Error('媒体文件不存在')
    error.statusCode = 404
    error.code = 'MEDIA_NOT_FOUND'
    throw error
  }

  media.originalName = normalizeRenamedOriginalName(originalName, media.originalName)
  await media.save()

  return media.toSafeJSON()
}

export async function listMediaCategories() {
  await ensureDefaultMediaCategory()
  const rows = await Media.aggregate([
    {
      $match: {
        deletedAt: null
      }
    },
    {
      $group: {
        _id: { $ifNull: ['$category', '默认素材'] },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        count: 1
      }
    },
    { $sort: { count: -1, name: 1 } }
  ])

  return rows.map((item) => ({
    name: item.name || '默认素材',
    count: item.count || 0
  }))
}

export function getUploadSubdir() {
  const date = new Date()
  return path.join(
    resolveUploadRoot(),
    String(date.getFullYear()),
    String(date.getMonth() + 1).padStart(2, '0')
  )
}

function getUploadsRoot() {
  return resolveUploadRoot()
}

function getLegacyUploadsRoot() {
  return resolveLegacyUploadRoot()
}

function getAllowedUploadRoots() {
  const roots = [getUploadsRoot()]
  const legacyRoot = getLegacyUploadsRoot()

  if (legacyRoot !== roots[0]) {
    roots.push(legacyRoot)
  }

  return roots
}

function isPathInside(parent, target) {
  const relative = path.relative(parent, target)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

function collectCandidateStoragePaths(storagePath, fileUrl = '') {
  const candidates = []
  const addCandidate = (value) => {
    const normalized = String(value || '').trim()
    if (!normalized) {
      return
    }

    const resolved = path.resolve(normalized)
    if (!candidates.includes(resolved)) {
      candidates.push(resolved)
    }
  }

  addCandidate(storagePath)

  const normalizedUrl = String(fileUrl || '').trim()
  if (normalizedUrl.startsWith('/uploads/')) {
    const relativeUploadPath = normalizedUrl.replace(/^\/+/, '').replace(/\//g, path.sep)
    for (const uploadsRoot of getAllowedUploadRoots()) {
      addCandidate(path.join(uploadsRoot, relativeUploadPath.replace(new RegExp(`^uploads\\${path.sep}?`), '')))
    }
  }

  return candidates
}

async function removeStoredFile(storagePath, fileUrl = '') {
  const allowedUploadRoots = getAllowedUploadRoots()
  const candidates = collectCandidateStoragePaths(storagePath, fileUrl)
  let sawUnsafePath = false

  for (const targetPath of candidates) {
    if (!allowedUploadRoots.some((uploadsRoot) => isPathInside(uploadsRoot, targetPath))) {
      sawUnsafePath = true
      continue
    }

    try {
      await fs.unlink(targetPath)
      return true
    } catch (error) {
      if (error.code === 'ENOENT') {
        continue
      }
      throw error
    }
  }

  if (sawUnsafePath && candidates.length > 0) {
    return false
  }

  return false
}

export async function deleteMedia(id, user) {
  const media = await Media.findOne({ _id: id, deletedAt: null })
  if (!media) {
    const error = new Error('媒体文件不存在')
    error.statusCode = 404
    error.code = 'MEDIA_NOT_FOUND'
    throw error
  }

  media.deletedAt = new Date()
  media.deletedBy = user?._id || null
  await media.save()

  return { id, deleted: true, mode: 'soft' }
}

export async function batchDeleteMedia(ids, user) {
  if (!Array.isArray(ids) || ids.length === 0) {
    const error = new Error('请选择要删除的媒体文件')
    error.statusCode = 400
    error.code = 'MEDIA_IDS_REQUIRED'
    throw error
  }

  let deletedCount = 0
  for (const id of ids) {
    await deleteMedia(id, user)
    deletedCount += 1
  }

  return { deletedCount }
}

export async function restoreMedia(id) {
  const media = await Media.findOne({ _id: id, deletedAt: { $exists: true, $ne: null } })
  if (!media) {
    const error = new Error('回收站中未找到该媒体文件')
    error.statusCode = 404
    error.code = 'MEDIA_NOT_FOUND'
    throw error
  }

  media.deletedAt = null
  media.deletedBy = null
  await media.save()

  return media.toSafeJSON()
}

export async function batchRestoreMedia(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    const error = new Error('请选择要恢复的媒体文件')
    error.statusCode = 400
    error.code = 'MEDIA_IDS_REQUIRED'
    throw error
  }

  let restoredCount = 0
  for (const id of ids) {
    await restoreMedia(id)
    restoredCount += 1
  }

  return { restoredCount }
}

export async function permanentDeleteMedia(id) {
  const media = await Media.findById(id)
  if (!media) {
    const error = new Error('媒体文件不存在')
    error.statusCode = 404
    error.code = 'MEDIA_NOT_FOUND'
    throw error
  }

  const fileRemoved = await removeStoredFile(media.storagePath, media.url)

  await Media.findByIdAndDelete(id)
  return { id, deleted: true, mode: 'permanent', fileRemoved }
}

export async function batchPermanentDeleteMedia(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    const error = new Error('请选择要彻底删除的媒体文件')
    error.statusCode = 400
    error.code = 'MEDIA_IDS_REQUIRED'
    throw error
  }

  let deletedCount = 0
  let removedFileCount = 0
  for (const id of ids) {
    const result = await permanentDeleteMedia(id)
    deletedCount += 1
    if (result.fileRemoved) {
      removedFileCount += 1
    }
  }

  return { deletedCount, removedFileCount }
}

export async function emptyMediaTrash() {
  const mediaList = await Media.find({ deletedAt: { $exists: true, $ne: null } })
  let removedFileCount = 0

  for (const media of mediaList) {
    if (await removeStoredFile(media.storagePath, media.url)) {
      removedFileCount += 1
    }
  }

  const result = await Media.deleteMany({
    _id: { $in: mediaList.map((media) => media._id) }
  })

  return {
    deletedCount: result.deletedCount || 0,
    removedFileCount
  }
}
