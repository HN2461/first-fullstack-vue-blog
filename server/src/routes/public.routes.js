import { Router } from 'express'
import { listVisibleComments } from '../services/comment.service.js'
import { listAnnouncements } from '../services/notification.service.js'
import { getPublicArticleBySlug, getPublicHomeData, listPublicArticles } from '../services/public.service.js'
import { getSettings } from '../services/setting.service.js'
import { ok } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const publicRouter = Router()

publicRouter.get('/home', asyncHandler(async (req, res) => {
  res.json(ok(await getPublicHomeData()))
}))

publicRouter.get('/site/profile', asyncHandler(async (req, res) => {
  res.json(ok(await getSettings()))
}))

publicRouter.get('/announcements', asyncHandler(async (req, res) => {
  res.json(ok(await listAnnouncements(false)))
}))

publicRouter.get('/articles', asyncHandler(async (req, res) => {
  res.json(ok(await listPublicArticles(req.query)))
}))

publicRouter.get('/search', asyncHandler(async (req, res) => {
  res.json(ok(await listPublicArticles(req.query)))
}))

publicRouter.get('/articles/:slug', asyncHandler(async (req, res) => {
  res.json(ok(await getPublicArticleBySlug(req.params.slug)))
}))

publicRouter.get('/articles/:id/comments', asyncHandler(async (req, res) => {
  res.json(ok(await listVisibleComments(req.params.id)))
}))
