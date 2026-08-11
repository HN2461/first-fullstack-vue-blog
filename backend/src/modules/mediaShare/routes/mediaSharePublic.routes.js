import { Router } from 'express'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import { parseMediaShareBody, mediaSharePasswordSchema } from '../validators/mediaShare.validator.js'
import { getPublicMediaShare, claimPublicMediaShare, verifyPublicMediaShare } from '../services/mediaShare.service.js'
import { streamPublicMediaShareArchive, streamPublicMediaShareContent } from '../services/mediaShareFile.service.js'

export const mediaSharePublicRouter = Router()

mediaSharePublicRouter.get('/:publicId', asyncHandler(async (req, res) => {
  res.json(ok(await getPublicMediaShare(req.params.publicId, req)))
}))

mediaSharePublicRouter.post('/:publicId/claim', asyncHandler(async (req, res) => {
  res.json(ok(await claimPublicMediaShare(req.params.publicId, req, res)))
}))

mediaSharePublicRouter.post('/:publicId/verify-password', asyncHandler(async (req, res) => {
  const input = parseMediaShareBody(mediaSharePasswordSchema, req.body)
  res.json(ok(await verifyPublicMediaShare(req.params.publicId, input.code, req, res)))
}))

mediaSharePublicRouter.get('/:publicId/download', asyncHandler(async (req, res) => {
  await streamPublicMediaShareArchive({ publicId: req.params.publicId, req, res })
}))

mediaSharePublicRouter.get('/:publicId/entries/:entryId/content', asyncHandler(async (req, res) => {
  await streamPublicMediaShareContent({
    publicId: req.params.publicId,
    entryId: req.params.entryId,
    req,
    res,
    disposition: req.query.disposition === 'attachment' ? 'attachment' : 'inline'
  })
}))
