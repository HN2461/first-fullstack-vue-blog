import fs from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Router } from 'express'
import { requireAdmin, requireAuth, requireMenuAccess } from '#middlewares/auth.js'
import {
  buildMediaDownloadHeaders,
  getBatchMediaDownload,
  getSingleMediaDownload
} from '#modules/media/services/mediaDownload.service.js'
import { getMediaContent } from '#modules/media/services/media.service.js'
import { attachMediaVaultAccess } from '#modules/media/services/mediaVault.service.js'
import {
  mediaBatchDownloadSchema,
  mediaIdSchema,
  parseMediaPayload
} from '#modules/media/validators/media.validator.js'
import { asyncHandler } from '#utils/asyncHandler.js'

export const mediaDownloadAdminRouter = Router()

mediaDownloadAdminRouter.use(
  requireAuth,
  requireAdmin,
  requireMenuAccess('/console/manage/media')
)
mediaDownloadAdminRouter.use((req, _res, next) => {
  attachMediaVaultAccess(req).then(() => next()).catch(next)
})

mediaDownloadAdminRouter.get('/content/:id', asyncHandler(async (req, res) => {
  const id = parseMediaPayload(mediaIdSchema, req.params.id)
  const content = await getMediaContent(id, req.user)
  res.set({
    'Content-Type': content.media.mimeType || 'application/octet-stream',
    'Content-Length': String(content.size),
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Disposition': 'inline'
  })
  await pipeline(fs.createReadStream(content.filePath), res)
}))

mediaDownloadAdminRouter.get('/:id', asyncHandler(async (req, res) => {
  const id = parseMediaPayload(mediaIdSchema, req.params.id)
  const download = await getSingleMediaDownload(id, req.user)
  res.set(buildMediaDownloadHeaders(download.fileName, download.mimeType, download.size))
  res.setHeader('Last-Modified', new Date(download.updatedAt).toUTCString())
  await pipeline(fs.createReadStream(download.filePath), res)
}))

mediaDownloadAdminRouter.post('/batch/archive', asyncHandler(async (req, res) => {
  const input = parseMediaPayload(mediaBatchDownloadSchema, req.body)
  const download = await getBatchMediaDownload(input, req.user)
  res.set(buildMediaDownloadHeaders(download.archiveName, 'application/zip'))
  await download.writeTo(res)
}))
