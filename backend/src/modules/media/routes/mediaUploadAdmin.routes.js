import express, { Router } from 'express'
import { requireAdmin, requireAuth, requireMenuAccess } from '#middlewares/auth.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import { ok } from '#utils/apiResponse.js'
import { attachMediaVaultAccess } from '../services/mediaVault.service.js'
import { acquireMediaUpload } from '../services/mediaUploadGuard.service.js'
import {
  appendMediaUploadChunk,
  completeMediaUploadSession,
  createMediaUploadSession,
  deleteMediaUploadSession,
  getMediaUploadSession,
  MEDIA_UPLOAD_CHUNK_SIZE
} from '../services/mediaUploadSession.service.js'
import { parseMediaPayload } from '../validators/media.validator.js'
import { mediaUploadIdSchema, mediaUploadOffsetSchema, mediaUploadSessionSchema } from '../validators/mediaUpload.validator.js'

export const mediaUploadAdminRouter = Router()

mediaUploadAdminRouter.use(requireAuth, requireAdmin, requireMenuAccess('/console/manage/media'))
mediaUploadAdminRouter.use((req, _res, next) => {
  attachMediaVaultAccess(req).then(() => next()).catch(next)
})

mediaUploadAdminRouter.post('/', asyncHandler(async (req, res) => {
  const input = parseMediaPayload(mediaUploadSessionSchema, req.body)
  res.status(201).json(ok(await createMediaUploadSession(input, req.user)))
}))

mediaUploadAdminRouter.get('/:id', asyncHandler(async (req, res) => {
  const id = parseMediaPayload(mediaUploadIdSchema, req.params.id)
  res.setHeader('Cache-Control', 'no-store')
  res.json(ok(await getMediaUploadSession(id, req.user)))
}))

// 在缓冲分片之前执行并发和空间保护；每个请求最多使用 2MB 内存。
mediaUploadAdminRouter.put('/:id/chunk', asyncHandler(async (req, res, next) => {
  parseMediaPayload(mediaUploadIdSchema, req.params.id)
  const length = Number(req.headers['content-length'])
  if (!Number.isSafeInteger(length) || length <= 0 || length > MEDIA_UPLOAD_CHUNK_SIZE) {
    req.resume()
    throw Object.assign(new Error('上传分片大小不正确'), { statusCode: 413, code: 'MEDIA_UPLOAD_CHUNK_SIZE_INVALID' })
  }
  const release = await acquireMediaUpload(length)
  if (req.destroyed) {
    release()
    return
  }
  res.once('finish', release)
  res.once('close', release)
  next()
}), express.raw({ type: 'application/octet-stream', limit: MEDIA_UPLOAD_CHUNK_SIZE }), asyncHandler(async (req, res) => {
  const id = parseMediaPayload(mediaUploadIdSchema, req.params.id)
  const offset = parseMediaPayload(mediaUploadOffsetSchema, req.headers['x-upload-offset'])
  const result = await appendMediaUploadChunk(id, req.user, offset, req.body, req.headers['x-upload-checksum'])
  res.json(ok(result))
}))

mediaUploadAdminRouter.post('/:id/complete', asyncHandler(async (req, res) => {
  const id = parseMediaPayload(mediaUploadIdSchema, req.params.id)
  res.json(ok(await completeMediaUploadSession(id, req.user), '文件已上传到媒体库'))
}))

mediaUploadAdminRouter.delete('/:id', asyncHandler(async (req, res) => {
  const id = parseMediaPayload(mediaUploadIdSchema, req.params.id)
  await deleteMediaUploadSession(id, req.user)
  res.json(ok(null, '临时上传任务已清理'))
}))
