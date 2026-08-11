import { Router } from 'express'
import { requireAdmin, requireAuth, requireMenuAccess } from '#middlewares/auth.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import { parseMediaShareBody, mediaShareCreateSchema, mediaShareUpdateSchema } from '../validators/mediaShare.validator.js'
import { createMediaShare, listMediaShares, revokeMediaShare, updateMediaShare } from '../services/mediaShare.service.js'

export const mediaShareAdminRouter = Router()

mediaShareAdminRouter.use(requireAuth, requireAdmin, requireMenuAccess('/console/manage/media'))

mediaShareAdminRouter.get('/', asyncHandler(async (req, res) => {
  res.json(ok(await listMediaShares({ actor: req.user, page: req.query.page, pageSize: req.query.pageSize })))
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
