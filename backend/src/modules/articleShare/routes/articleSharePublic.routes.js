import { Router } from 'express'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import { parseArticleShareBody, articleSharePasswordSchema } from '../validators/articleShare.validator.js'
import { claimPublicArticleShare, getPublicArticleShare, getPublicSharedArticle, verifyPublicArticleShare } from '../services/articleShare.service.js'

export const articleSharePublicRouter = Router()
articleSharePublicRouter.get('/:publicId', asyncHandler(async (req, res) => res.json(ok(await getPublicArticleShare(req.params.publicId, req)))))
articleSharePublicRouter.post('/:publicId/claim', asyncHandler(async (req, res) => res.json(ok(await claimPublicArticleShare(req.params.publicId, req, res)))))
articleSharePublicRouter.post('/:publicId/verify-password', asyncHandler(async (req, res) => res.json(ok(await verifyPublicArticleShare(req.params.publicId, parseArticleShareBody(articleSharePasswordSchema, req.body).code, req, res)))))
articleSharePublicRouter.get('/:publicId/articles/:articleSlug', asyncHandler(async (req, res) => res.json(ok(await getPublicSharedArticle(req.params.publicId, req.params.articleSlug, req)))))
