import { Router } from 'express'
import { requireAdmin, requireAnyMenuAccess, requireAuth } from '#middlewares/auth.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import { parseArticleShareBody, articleShareCreateSchema, articleShareUpdateSchema } from '../validators/articleShare.validator.js'
import { createArticleShare, getArticleShareDetail, listArticleShares, revokeArticleShare, updateArticleShare } from '../services/articleShare.service.js'

export const articleShareAdminRouter = Router()
// 文章管理权限作为兼容兜底，避免菜单快照尚未同步时管理员无法创建分享。
articleShareAdminRouter.use(requireAuth, requireAdmin, requireAnyMenuAccess(['/console/manage/article-shares', '/console/manage/articles']))
articleShareAdminRouter.get('/', asyncHandler(async (req, res) => res.json(ok(await listArticleShares({ actor: req.user, ...req.query })))))
articleShareAdminRouter.get('/:id', asyncHandler(async (req, res) => res.json(ok(await getArticleShareDetail(req.params.id, req.user)))))
articleShareAdminRouter.post('/', asyncHandler(async (req, res) => {
  const input = parseArticleShareBody(articleShareCreateSchema, req.body)
  const result = await createArticleShare(input, req.user)
  res.status(201).json(ok(result, '共享阅读链接已创建'))
}))
articleShareAdminRouter.patch('/:id', asyncHandler(async (req, res) => {
  const input = parseArticleShareBody(articleShareUpdateSchema, req.body)
  res.json(ok(await updateArticleShare(req.params.id, input, req.user), '共享阅读配置已更新'))
}))
articleShareAdminRouter.post('/:id/revoke', asyncHandler(async (req, res) => {
  res.json(ok(await revokeArticleShare(req.params.id, req.user), '共享阅读链接已撤销'))
}))
