import { Router } from 'express'
import { requireAdmin, requireAuth, requireMenuAccess } from '#middlewares/auth.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import { parseMediaShareBody, mediaShareCreateSchema, mediaShareUpdateSchema } from '../validators/mediaShare.validator.js'
import {
  createMediaShare,
  deleteRevokedMediaShare,
  getMediaShareDetail,
  listMediaShares,
  resetMediaShareCode,
  revealMediaShareCode,
  revokeMediaShare,
  updateMediaShare
} from '../services/mediaShare.service.js'

export const mediaShareAdminRouter = Router()

mediaShareAdminRouter.use(requireAuth, requireAdmin, requireMenuAccess('/console/manage/media-shares'))

mediaShareAdminRouter.get('/', asyncHandler(async (req, res) => {
  res.json(ok(await listMediaShares({ actor: req.user, ...req.query })))
}))

mediaShareAdminRouter.get('/:id', asyncHandler(async (req, res) => {
  res.json(ok(await getMediaShareDetail(req.params.id, req.user)))
}))

mediaShareAdminRouter.post('/', asyncHandler(async (req, res) => {
  const input = parseMediaShareBody(mediaShareCreateSchema, req.body)
  const result = await createMediaShare(input, req.user)
  res.status(201).json(ok(result, '资源分享已创建'))
}))

mediaShareAdminRouter.patch('/:id', asyncHandler(async (req, res) => {
  const input = parseMediaShareBody(mediaShareUpdateSchema, req.body)
  res.json(ok(await updateMediaShare(req.params.id, input, req.user), '分享配置已更新'))
}))

mediaShareAdminRouter.post('/:id/revoke', asyncHandler(async (req, res) => {
  res.json(ok(await revokeMediaShare(req.params.id, req.user), '资源分享已撤销'))
}))

mediaShareAdminRouter.get('/:id/extraction-code', asyncHandler(async (req, res) => {
  res.json(ok(await revealMediaShareCode(req.params.id, req.user)))
}))

mediaShareAdminRouter.post('/:id/extraction-code/reset', asyncHandler(async (req, res) => {
  res.json(ok(await resetMediaShareCode(req.params.id, req.user), '提取码已重新生成'))
}))

mediaShareAdminRouter.delete('/:id', asyncHandler(async (req, res) => {
  res.json(ok(await deleteRevokedMediaShare(req.params.id, req.user), '分享记录已删除'))
}))
