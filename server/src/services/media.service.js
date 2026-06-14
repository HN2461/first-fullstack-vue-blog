import path from 'node:path'
import { env } from '../config/env.js'
import { Media } from '../models/Media.js'
import { decodeUploadFilename } from '../utils/uploadFilename.js'
import { ensureDefaultMediaCategory } from './mediaCategory.service.js'

function normalizeMediaCategory(value) {
  const category = String(value || '').trim()
  return category || '默认素材'
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

export async function listMedia(options = {}) {
  await ensureDefaultMediaCategory()
  const { kind, fileClass, keyword } = options
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const query = {}

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

export async function listMediaCategories() {
  await ensureDefaultMediaCategory()
  const rows = await Media.aggregate([
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
    env.rootDir,
    env.uploadDir,
    String(date.getFullYear()),
    String(date.getMonth() + 1).padStart(2, '0')
  )
}

export async function deleteMedia(id) {
  const media = await Media.findById(id)
  if (!media) {
    const error = new Error('媒体文件不存在')
    error.statusCode = 404
    error.code = 'MEDIA_NOT_FOUND'
    throw error
  }

  // 删除物理文件（可选，这里只删除数据库记录）
  // fs.unlinkSync(media.storagePath)

  await Media.findByIdAndDelete(id)
  return { id, deleted: true }
}
