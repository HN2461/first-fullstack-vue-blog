import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.js'
import { createComment, reportComment } from '../services/comment.service.js'
import { addArticleReaction, removeArticleReaction } from '../services/reaction.service.js'
import { ok } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const interactionRouter = Router()

interactionRouter.use(requireAuth)

interactionRouter.post('/comments', asyncHandler(async (req, res) => {
  const comment = await createComment(req.body, req.user)
  res.status(201).json(ok(comment, '评论已提交'))
}))

interactionRouter.post('/comments/:id/report', asyncHandler(async (req, res) => {
  res.json(ok(await reportComment(req.params.id), '举报已提交'))
}))

interactionRouter.post('/articles/:id/like', asyncHandler(async (req, res) => {
  res.json(ok(await addArticleReaction(req.params.id, req.user, 'like'), '已点赞'))
}))

interactionRouter.delete('/articles/:id/like', asyncHandler(async (req, res) => {
  res.json(ok(await removeArticleReaction(req.params.id, req.user, 'like'), '已取消点赞'))
}))

interactionRouter.post('/articles/:id/favorite', asyncHandler(async (req, res) => {
  res.json(ok(await addArticleReaction(req.params.id, req.user, 'favorite'), '已收藏'))
}))

interactionRouter.delete('/articles/:id/favorite', asyncHandler(async (req, res) => {
  res.json(ok(await removeArticleReaction(req.params.id, req.user, 'favorite'), '已取消收藏'))
}))
