import fs from 'node:fs'
import archiver from 'archiver'
import { MediaSharePackage } from '../models/MediaSharePackage.js'
import { getPublicShareContent, getPublicShareDownloadEntries } from './mediaShare.service.js'

function getSafeDownloadName(value) {
  const normalized = String(value || 'download').replace(/[\\\r\n"/]/g, '_').trim()
  return normalized || 'download'
}

function getArchiveName(value) {
  const safeName = getSafeDownloadName(value).replace(/\.zip$/i, '')
  return `${safeName || 'resource-package'}.zip`
}

function getUniqueArchiveEntryName(value, usedNames) {
  const safeName = getSafeDownloadName(value)
  if (!usedNames.has(safeName)) {
    usedNames.add(safeName)
    return safeName
  }

  const extensionIndex = safeName.lastIndexOf('.')
  const baseName = extensionIndex > 0 ? safeName.slice(0, extensionIndex) : safeName
  const extension = extensionIndex > 0 ? safeName.slice(extensionIndex) : ''
  let suffix = 2
  let candidate = `${baseName}-${suffix}${extension}`
  while (usedNames.has(candidate)) {
    suffix += 1
    candidate = `${baseName}-${suffix}${extension}`
  }
  usedNames.add(candidate)
  return candidate
}

function parseRange(rangeHeader, size) {
  if (!rangeHeader || !rangeHeader.startsWith('bytes=') || size <= 0) return null
  const [rawStart, rawEnd] = rangeHeader.slice(6).split('-', 2)
  let start = rawStart ? Number(rawStart) : NaN
  let end = rawEnd ? Number(rawEnd) : NaN
  if (Number.isNaN(start)) {
    const suffixLength = Number(rawEnd)
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) return null
    start = Math.max(0, size - suffixLength)
    end = size - 1
  } else {
    end = Number.isNaN(end) ? size - 1 : Math.min(size - 1, end)
  }
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start > end || start >= size) return null
  return { start, end }
}

function streamFile(res, filePath, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, options)
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

    stream.once('error', fail)
    res.once('finish', finish)
    res.once('close', finish)
    stream.pipe(res)
  })
}

export async function streamPublicMediaShareContent({ publicId, entryId, req, res, disposition = 'inline' }) {
  const result = await getPublicShareContent(publicId, entryId, req)
  const { share, entry, media, filePath } = result
  const fileSize = result.filePath.size
  const range = parseRange(req.headers.range, fileSize)
  const isAttachment = disposition === 'attachment'
  const fileName = getSafeDownloadName(entry.originalName)

  res.setHeader('Content-Type', media.mimeType || entry.mimeType || 'application/octet-stream')
  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Content-Disposition', `${isAttachment ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(fileName)}`)

  if (req.headers.range && !range) {
    res.status(416)
    res.setHeader('Content-Range', `bytes */${fileSize}`)
    res.end()
    return
  }

  if (isAttachment) {
    await MediaSharePackage.updateOne(
      { _id: share._id },
      { $inc: { downloadCount: 1 }, $set: { lastDownloadAt: new Date() } }
    )
  }

  if (!range) {
    res.setHeader('Content-Length', fileSize)
    await streamFile(res, filePath.path)
    return
  }

  const contentLength = range.end - range.start + 1
  res.status(206)
  res.setHeader('Content-Length', contentLength)
  res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${fileSize}`)
  await streamFile(res, filePath.path, { start: range.start, end: range.end })
}

export async function streamPublicMediaShareArchive({ publicId, req, res }) {
  const { share, entries } = await getPublicShareDownloadEntries(publicId, req)
  const archiveName = getArchiveName(share.name)
  const usedNames = new Set()

  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(archiveName)}`)

  await MediaSharePackage.updateOne(
    { _id: share._id },
    { $inc: { downloadCount: 1 }, $set: { lastDownloadAt: new Date() } }
  )

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

    archive.once('error', fail)
    res.once('finish', finish)
    res.once('close', finish)
    archive.pipe(res)
    entries.forEach(({ entry, filePath }) => {
      archive.file(filePath.path, { name: getUniqueArchiveEntryName(entry.originalName, usedNames) })
    })
    archive.finalize().catch(fail)
  })
}
