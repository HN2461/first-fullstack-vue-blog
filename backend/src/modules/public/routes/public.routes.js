import { Router } from 'express'
import { listVisibleComments } from '#modules/interaction/services/comment.service.js'
import { getPopupAnnouncements, listActiveAnnouncements, getUnreadCount, markAllAsRead, markAsRead } from '#modules/notification/services/notification.service.js'
import { getKnowledgeMenuData, getPublicArticleBySlug, getPublicHomeData, listPublicArticles } from '#modules/public/services/public.service.js'
import { getSearchSuggestions, searchArticles } from '#modules/search/services/search.service.js'
import { getSettings } from '#modules/settings/services/setting.service.js'
import { optionalAuth, requireAuth } from '#middlewares/auth.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'

export const publicRouter = Router()

publicRouter.get('/home', asyncHandler(async (req, res) => {
  res.json(ok(await getPublicHomeData()))
}))

publicRouter.get('/knowledge-menu', asyncHandler(async (req, res) => {
  res.json(ok(await getKnowledgeMenuData()))
}))

publicRouter.get('/site/profile', asyncHandler(async (req, res) => {
  res.json(ok(await getSettings()))
}))

publicRouter.use(optionalAuth)

publicRouter.get('/announcements', asyncHandler(async (req, res) => {
  const userId = req.user?._id || null
  const result = await listActiveAnnouncements(userId, req.query)
  res.json(ok(result))
}))

publicRouter.get('/announcements/unread-count', asyncHandler(async (req, res) => {
  const userId = req.user?._id
  const count = await getUnreadCount(userId)
  res.json(ok({ count }))
}))

publicRouter.get('/announcements/popups', asyncHandler(async (req, res) => {
  const userId = req.user?._id
  if (!userId) {
    res.json(ok({ items: [] }))
    return
  }
  const items = await getPopupAnnouncements(userId)
  res.json(ok({ items }))
}))

publicRouter.post('/announcements/:id/read', requireAuth, asyncHandler(async (req, res) => {
  const result = await markAsRead(req.params.id, req.user._id)
  res.json(ok(result))
}))

publicRouter.post('/announcements/read-all', requireAuth, asyncHandler(async (req, res) => {
  const result = await markAllAsRead(req.user._id)
  res.json(ok(result, `已标记 ${result.modifiedCount} 条公告为已读`))
}))

publicRouter.get('/articles', asyncHandler(async (req, res) => {
  res.json(ok(await listPublicArticles(req.query)))
}))

publicRouter.get('/search/suggest', asyncHandler(async (req, res) => {
  res.json(ok(await getSearchSuggestions(req.query)))
}))

publicRouter.get('/search', asyncHandler(async (req, res) => {
  res.json(ok(await searchArticles(req.query)))
}))

publicRouter.get('/articles/:slug', asyncHandler(async (req, res) => {
  res.json(ok(await getPublicArticleBySlug(req.params.slug, req.user?._id || null)))
}))

publicRouter.get('/articles/:id/comments', asyncHandler(async (req, res) => {
  res.json(ok(await listVisibleComments(req.params.id)))
}))
