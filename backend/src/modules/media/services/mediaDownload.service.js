import fs from 'node:fs'
import path from 'node:path'
import archiver from 'archiver'
import { USER_ROLES } from '#constants/domain'
import { Media } from '#modules/media/models/Media.js'
import { resolveLegacyUploadRoot, resolveUploadRoot } from '#utils/uploadPath.js'

const DEFAULT_ARCHIVE_PREFIX = '媒体资源'

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function canManageAllMedia(actor) {
  return actor?.role === USER_ROLES.SUPER_ADMIN || actor?.isSuperAdmin === true
}

function getMediaAccessQuery(actor) {
  if (!actor || canManageAllMedia(actor)) {
    return {}
  }

  return { uploader: actor._id || actor.id }
}

function isPathInside(parent, target) {
  const relative = path.relative(parent, target)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

function getAllowedUploadRoots() {
  return [...new Set([resolveUploadRoot(), resolveLegacyUploadRoot()].map((item) => path.resolve(item)))]
}

function collectCandidatePaths(media) {
  const candidates = []
  const addCandidate = (value) => {
    const normalized = String(value || '').trim()
    if (!normalized) return
    const resolved = path.resolve(normalized)
    if (!candidates.includes(resolved)) candidates.push(resolved)
  }

  addCandidate(media.storagePath)
  const normalizedUrl = String(media.url || '').trim()
  if (normalizedUrl.startsWith('/uploads/')) {
    const relativePath = normalizedUrl.replace(/^\/uploads\//, '').replace(/\//g, path.sep)
    getAllowedUploadRoots().forEach((root) => addCandidate(path.join(root, relativePath)))
  }

  return candidates
}

function resolveManagedFilePath(media) {
  const allowedRoots = getAllowedUploadRoots()
  const targetPath = collectCandidatePaths(media).find((candidate) => (
    allowedRoots.some((root) => isPathInside(root, candidate)) &&
    fs.existsSync(candidate) &&
    fs.statSync(candidate).isFile()
  ))

  if (!targetPath) {
    throw createHttpError(404, 'MEDIA_DOWNLOAD_FILE_MISSING', `资源「${media.originalName}」的服务器文件不存在或不可访问`)
  }

  return targetPath
}

function formatDateCompact(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`
}

function sanitizeNameSegment(value, fallback = '资源') {
  const normalized = String(value || '')
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .slice(0, 120)

  return normalized || fallback
}

function getActualExtension(media, filePath) {
  return path.extname(String(media.filename || '')) || path.extname(filePath) || path.extname(String(media.originalName || ''))
}

function getDisplayBaseName(media) {
  const originalName = String(media.originalName || '').trim()
  const extension = path.extname(originalName)
  return sanitizeNameSegment(extension ? originalName.slice(0, -extension.length) : originalName, '资源')
}

function getUniqueName(fileName, usedNames) {
  const key = fileName.toLocaleLowerCase('zh-CN')
  if (!usedNames.has(key)) {
    usedNames.add(key)
    return fileName
  }

  const extension = path.extname(fileName)
  const baseName = extension ? fileName.slice(0, -extension.length) : fileName
  let suffix = 2
  let candidate = `${baseName}-${suffix}${extension}`
  while (usedNames.has(candidate.toLocaleLowerCase('zh-CN'))) {
    suffix += 1
    candidate = `${baseName}-${suffix}${extension}`
  }
  usedNames.add(candidate.toLocaleLowerCase('zh-CN'))
  return candidate
}

function buildEntryNames(items, options = {}) {
  const namingMode = options.namingMode || 'original'
  const prefix = sanitizeNameSegment(options.prefix, DEFAULT_ARCHIVE_PREFIX)
  const numberWidth = Math.max(2, String(items.length).length)
  const usedNames = new Set()

  return items.map((item, index) => {
    const sequence = String(index + 1).padStart(numberWidth, '0')
    const baseName = namingMode === 'prefix'
      ? `${prefix}-${sequence}`
      : namingMode === 'sequence'
        ? sequence
        : getDisplayBaseName(item.media)
    const fileName = `${sanitizeNameSegment(baseName)}${getActualExtension(item.media, item.filePath)}`
    return getUniqueName(fileName, usedNames)
  })
}

function buildArchiveName(value) {
  const requestedName = String(value || '').trim().replace(/\.zip$/i, '')
  const baseName = sanitizeNameSegment(requestedName, `${DEFAULT_ARCHIVE_PREFIX}-${formatDateCompact()}`)
  return `${baseName}.zip`
}

function buildContentDisposition(fileName) {
  const fallback = String(fileName || 'download')
    .replace(/[^\x20-\x7e]+/g, '_')
    .replace(/["\\]/g, '_')
  return `attachment; filename="${fallback || 'download'}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
}

async function resolveDownloadItems(ids, actor) {
  const uniqueIds = [...new Set(ids.map((id) => String(id || '').trim()).filter(Boolean))]
  const mediaList = await Media.find({
    _id: { $in: uniqueIds },
    deletedAt: null,
    ...getMediaAccessQuery(actor)
  }).lean()

  if (mediaList.length !== uniqueIds.length) {
    throw createHttpError(404, 'MEDIA_DOWNLOAD_NOT_FOUND', '部分媒体文件不存在、已移入回收站或无权下载')
  }

  const mediaMap = new Map(mediaList.map((media) => [media._id.toString(), media]))
  return uniqueIds.map((id) => {
    const media = mediaMap.get(id)
    return {
      media,
      filePath: resolveManagedFilePath(media)
    }
  })
}

export async function getSingleMediaDownload(id, actor) {
  const [item] = await resolveDownloadItems([id], actor)
  const [fileName] = buildEntryNames([item], { namingMode: 'original' })
  const stat = fs.statSync(item.filePath)

  return {
    filePath: item.filePath,
    fileName,
    size: stat.size,
    mimeType: item.media.mimeType || 'application/octet-stream',
    updatedAt: item.media.updatedAt || item.media.createdAt || new Date()
  }
}

export async function getBatchMediaDownload(input, actor) {
  const items = await resolveDownloadItems(input.ids, actor)
  const entryNames = buildEntryNames(items, input)
  const archiveName = buildArchiveName(input.archiveName)

  return {
    archiveName,
    total: items.length,
    async writeTo(writable) {
      await new Promise((resolve, reject) => {
        const archive = archiver('zip', { zlib: { level: 6 } })
        let settled = false
        const finish = () => {
          if (settled) return
          settled = true
          resolve()
        }
        const fail = (error) => {
          if (settled) return
          settled = true
          reject(error)
        }

        archive.once('warning', (error) => {
          if (error.code !== 'ENOENT') fail(error)
        })
        archive.once('error', fail)
        writable.once('finish', finish)
        writable.once('close', finish)
        archive.pipe(writable)
        items.forEach((item, index) => {
          archive.file(item.filePath, {
            name: entryNames[index],
            date: item.media.updatedAt || item.media.createdAt || new Date()
          })
        })
        archive.finalize().catch(fail)
      })
    }
  }
}

export function buildMediaDownloadHeaders(fileName, contentType, contentLength) {
  const headers = {
    'Content-Type': contentType,
    'Content-Disposition': buildContentDisposition(fileName),
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff'
  }
  if (Number.isFinite(contentLength)) {
    headers['Content-Length'] = contentLength
  }
  return headers
}
