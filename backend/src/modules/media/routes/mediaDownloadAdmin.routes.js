import fs from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Router } from 'express'
import { requireAdmin, requireAuth, requireMenuAccess } from '#middlewares/auth.js'
import {
  buildMediaDownloadHeaders,
  getBatchMediaDownload,
  getSingleMediaDownload
} from '#modules/media/services/mediaDownload.service.js'
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
