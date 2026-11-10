import { Router } from 'express'
import mongoose from 'mongoose'
import { requireAuth } from '#middlewares/auth.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import { ok } from '#utils/apiResponse.js'
import { Media } from '../models/Media.js'
import { resourceError } from '../constants/resourceScenes.js'
import { authorizeResourceRead, authorizeResourceUpload } from '../services/resourceAccess.service.js'
import { resourceDescriptor, createResource } from '../services/resourceFile.service.js'
import { resolveResourcePath } from '../services/resourceStorage.service.js'
import { receiveResourceFile } from '../handlers/resourceUpload.handler.js'
import { RESOURCE_SCENES } from '../constants/resourceScenes.js'
import { listMedia } from '../services/media.service.js'
import { MediaReference } from '../models/MediaReference.js'
import { withResourceLocks } from '../services/resourceLock.service.js'

export const resourceRouter = Router()

resourceRouter.get('/:id/content', asyncHandler(async (req, res, next) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) throw resourceError(404, 'MEDIA_NOT_FOUND', '文件不存在')
  req.resource = await Media.findOne({ _id: req.params.id, deletedAt: null, lifecycleStatus: { $ne: 'deleting' } })
  if (!req.resource) throw resourceError(404, 'MEDIA_NOT_FOUND', '文件不存在')
  if (req.resource.accessScope === 'public') next()
  else requireAuth(req, res, next)
}), asyncHandler(async (req, res) => {
  const media = req.resource
  await authorizeResourceRead(media, req.user)
  const filePath = await resolveResourcePath(media)
  const inline = /^image\/(jpeg|png|gif|webp|avif)$/.test(media.mimeType) || media.mimeType === 'application/pdf' || /^(audio|video)\//.test(media.mimeType)
  res.set({
    'Content-Type': inline ? media.mimeType : 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; sandbox",
    'Cache-Control': media.accessScope === 'public' ? 'public, max-age=300' : 'private, no-store',
    'Content-Disposition': `${inline && req.query.download !== '1' ? 'inline' : 'attachment'}; filename="file"; filename*=UTF-8''${encodeURIComponent(media.originalName)}`
  })
  res.sendFile(filePath, { dotfiles: 'allow' })
}))

resourceRouter.use(requireAuth)

resourceRouter.get('/', asyncHandler(async (req, res) => {
  const scene = String(req.query.scene || 'article-resource')
  if (!['article-cover', 'article-content', 'article-resource', 'admin-library'].includes(scene)) throw resourceError(403, 'RESOURCE_PICKER_FORBIDDEN', '此场景不允许从素材库复用文件')
  await authorizeResourceUpload(scene, '', req.user)
  const result = await listMedia({ ...req.query, deleted: 'false', scope: 'all', actor: req.user, resourcePicker: true, kind: scene === 'article-cover' || scene === 'article-content' ? 'image' : undefined })
  res.json(ok({ ...result, items: result.items.map((item) => resourceDescriptor(item)) }))
}))

resourceRouter.delete('/:id/pending', asyncHandler(async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) throw resourceError(404, 'MEDIA_NOT_FOUND', '文件不存在')
  await withResourceLocks([req.params.id], async () => {
    const media = await Media.findOne({ _id: req.params.id, uploader: req.user._id, lifecycleStatus: 'pending' })
    if (!media || await MediaReference.exists({ mediaId: media._id })) throw resourceError(409, 'RESOURCE_ALREADY_BOUND', '文件已经保存到业务中，不能按临时文件移除')
    // 只调整待绑定过期时间，真正删除仍走统一清理和历史引用复查。
    media.expiresAt = new Date()
    await media.save()
  })
  res.json(ok(null, '已放弃待保存文件'))
}))
// 不开放客户端自定义场景；新增业务先登记服务端策略及授权适配器。
for (const scene of Object.keys(RESOURCE_SCENES)) {
  resourceRouter.post(`/upload/${scene}`, asyncHandler(async (req, _res, next) => {
    const targetId = String(req.query.targetId || '')
    if (targetId && !mongoose.isObjectIdOrHexString(targetId)) throw resourceError(400, 'RESOURCE_TARGET_INVALID', '业务对象 ID 不正确')
    await authorizeResourceUpload(scene, targetId, req.user)
    next()
  }), receiveResourceFile(scene), asyncHandler(async (req, res) => {
    const media = await createResource(req.file, req.user, { scene, targetId: req.query.targetId, retained: scene === 'admin-library' })
    res.status(201).json(ok(resourceDescriptor(media), '文件已上传'))
  }))
}
