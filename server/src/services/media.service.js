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

export async function listMedia(kind = '') {
  const query = kind ? { kind } : {}
  const media = await Media.find(query).sort({ createdAt: -1 })
  return media.map((item) => item.toSafeJSON())
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
