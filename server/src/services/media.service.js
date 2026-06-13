import path from 'node:path'
import { env } from '../config/env.js'
import { Media } from '../models/Media.js'

export async function createMediaFromFile(file, user) {
  const kind = file.mimetype.startsWith('image/') ? 'image' : 'attachment'
  const normalizedPath = file.path.replace(/\\/g, '/')
  const uploadsIndex = normalizedPath.lastIndexOf('uploads/')
  const relativePath = uploadsIndex >= 0 ? normalizedPath.slice(uploadsIndex) : normalizedPath
  const media = await Media.create({
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    url: `/${relativePath}`,
    storagePath: normalizedPath,
    kind,
    uploader: user._id
  })

  return media.toSafeJSON()
}

export async function listMedia(options = {}) {
  const { kind } = options
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const query = kind ? { kind } : {}
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
