import fs from 'node:fs'
import multer from 'multer'
import { Router } from 'express'
import { requireAdmin, requireAuth } from '../middlewares/auth.js'
import { createArticle, deleteArticle, getArticleById, listArticles, publishArticle, updateArticle } from '../services/article.service.js'
import { createCategory, deleteCategory, listCategories, updateCategory } from '../services/category.service.js'
import { listAdminComments, listUsers, reviewComment, updateUserStatus } from '../services/comment.service.js'
import { createMediaFromFile, deleteMedia, getUploadSubdir, listMedia } from '../services/media.service.js'
import { createAnnouncement, deleteAnnouncement, listAnnouncements, updateAnnouncement } from '../services/notification.service.js'
import { getSettings, updateSettings } from '../services/setting.service.js'
import { getAdminStats } from '../services/stats.service.js'
import { createTag, deleteTag, listTags, updateTag } from '../services/tag.service.js'
import { ok } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { articleSchema, categorySchema, parseBody, tagSchema } from '../validators/content.validator.js'

export const adminRouter = Router()

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = getUploadSubdir()
    fs.mkdirSync(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/[^\w.\-]+/g, '-')
    cb(null, `${Date.now()}-${safeName}`)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

adminRouter.use(requireAuth, requireAdmin)

adminRouter.get('/categories', asyncHandler(async (req, res) => {
  res.json(ok(await listCategories()))
}))

adminRouter.post('/categories', asyncHandler(async (req, res) => {
  const input = parseBody(categorySchema, req.body)
  const category = await createCategory(input)
  res.status(201).json(ok(category, '分类已创建'))
}))

adminRouter.patch('/categories/:id', asyncHandler(async (req, res) => {
  const category = await updateCategory(req.params.id, req.body)
  res.json(ok(category, '分类已更新'))
}))

adminRouter.delete('/categories/:id', asyncHandler(async (req, res) => {
  const result = await deleteCategory(req.params.id)
  res.json(ok(result, '分类已删除'))
}))

adminRouter.get('/tags', asyncHandler(async (req, res) => {
  res.json(ok(await listTags()))
}))

adminRouter.post('/tags', asyncHandler(async (req, res) => {
  const input = parseBody(tagSchema, req.body)
  const tag = await createTag(input)
  res.status(201).json(ok(tag, '标签已创建'))
}))

adminRouter.patch('/tags/:id', asyncHandler(async (req, res) => {
  const tag = await updateTag(req.params.id, req.body)
  res.json(ok(tag, '标签已更新'))
}))

adminRouter.delete('/tags/:id', asyncHandler(async (req, res) => {
  const result = await deleteTag(req.params.id)
  res.json(ok(result, '标签已删除'))
}))

adminRouter.get('/articles', asyncHandler(async (req, res) => {
  res.json(ok(await listArticles()))
}))

adminRouter.post('/articles', asyncHandler(async (req, res) => {
  const input = parseBody(articleSchema, req.body)
  const article = await createArticle(input, req.user)
  res.status(201).json(ok(article, '文章已创建'))
}))

adminRouter.get('/articles/:id', asyncHandler(async (req, res) => {
  res.json(ok(await getArticleById(req.params.id)))
}))

adminRouter.patch('/articles/:id', asyncHandler(async (req, res) => {
  const input = parseBody(articleSchema, req.body)
  const article = await updateArticle(req.params.id, input, req.user)
  res.json(ok(article, '文章已保存'))
}))

adminRouter.post('/articles/:id/publish', asyncHandler(async (req, res) => {
  const article = await publishArticle(req.params.id, req.user)
  res.json(ok(article, '文章已发布'))
}))

adminRouter.delete('/articles/:id', asyncHandler(async (req, res) => {
  const result = await deleteArticle(req.params.id, req.user)
  res.json(ok(result, '文章已删除'))
}))

adminRouter.get('/comments', asyncHandler(async (req, res) => {
  res.json(ok(await listAdminComments(req.query.status || '')))
}))

adminRouter.post('/comments/:id/:action', asyncHandler(async (req, res) => {
  const comment = await reviewComment(req.params.id, req.params.action, req.user)
  res.json(ok(comment, '评论审核已更新'))
}))

adminRouter.get('/users', asyncHandler(async (req, res) => {
  res.json(ok(await listUsers()))
}))

adminRouter.patch('/users/:id/status', asyncHandler(async (req, res) => {
  const user = await updateUserStatus(req.params.id, req.body.status)
  res.json(ok(user, '用户状态已更新'))
}))

adminRouter.get('/stats', asyncHandler(async (req, res) => {
  res.json(ok(await getAdminStats()))
}))

adminRouter.get('/media', asyncHandler(async (req, res) => {
  res.json(ok(await listMedia(req.query.kind || '')))
}))

adminRouter.post('/media', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error('请选择要上传的文件')
    error.statusCode = 400
    error.code = 'FILE_REQUIRED'
    throw error
  }

  const media = await createMediaFromFile(req.file, req.user)
  res.status(201).json(ok(media, '文件已上传'))
}))

adminRouter.delete('/media/:id', asyncHandler(async (req, res) => {
  const result = await deleteMedia(req.params.id)
  res.json(ok(result, '媒体文件已删除'))
}))

adminRouter.get('/announcements', asyncHandler(async (req, res) => {
  res.json(ok(await listAnnouncements(true)))
}))

adminRouter.post('/announcements', asyncHandler(async (req, res) => {
  const announcement = await createAnnouncement(req.body)
  res.status(201).json(ok(announcement, '公告已创建'))
}))

adminRouter.patch('/announcements/:id', asyncHandler(async (req, res) => {
  const announcement = await updateAnnouncement(req.params.id, req.body)
  res.json(ok(announcement, '公告已更新'))
}))

adminRouter.delete('/announcements/:id', asyncHandler(async (req, res) => {
  const result = await deleteAnnouncement(req.params.id)
  res.json(ok(result, '公告已删除'))
}))

adminRouter.get('/settings', asyncHandler(async (req, res) => {
  res.json(ok(await getSettings()))
}))

adminRouter.patch('/settings', asyncHandler(async (req, res) => {
  res.json(ok(await updateSettings(req.body, req.user), '设置已保存'))
}))
