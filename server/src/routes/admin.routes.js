import fs from 'node:fs'
import multer from 'multer'
import { Router } from 'express'
import { MulterError } from 'multer'
import { requireAdmin, requireAuth } from '../middlewares/auth.js'
import { createArticle, deleteArticle, emptyTrash, getArticleById, listArticles, listDeletedArticles, permanentDeleteArticle, publishArticle, restoreArticle, updateArticle, updateArticleStatus } from '../services/article.service.js'
import { createCategory, deleteCategory, listCategories, listCategoryArticles, listCategoryTree, moveArticleCategory, moveCategoryBranch, updateCategory } from '../services/category.service.js'
import { listAdminComments, listUsers, reviewComment, updateUserStatus } from '../services/comment.service.js'
import { createMediaCategory, deleteMediaCategory, listMediaCategories as listMediaCategoryEntities, updateMediaCategory } from '../services/mediaCategory.service.js'
import { createMediaFromFile, deleteMedia, getUploadSubdir, listMedia, listMediaCategories } from '../services/media.service.js'
import { batchDeleteAnnouncements, batchToggleAnnouncement, createAnnouncement, deleteAnnouncement, getAnnouncementById, listAnnouncements, updateAnnouncement } from '../services/notification.service.js'
import { getSettings, updateSettings } from '../services/setting.service.js'
import { getAdminStats } from '../services/stats.service.js'
import { createTag, deleteTag, listTags, updateTag } from '../services/tag.service.js'
import { ok } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { buildSafeStoredFilename } from '../utils/uploadFilename.js'
import { articleCategoryMoveSchema, articleSchema, categoryMoveSchema, categorySchema, parseBody, tagSchema } from '../validators/content.validator.js'

export const adminRouter = Router()

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = getUploadSubdir()
    fs.mkdirSync(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename(req, file, cb) {
    const safeName = buildSafeStoredFilename(file.originalname)
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
  res.json(ok(await listCategories(req.query)))
}))

adminRouter.get('/categories/tree', asyncHandler(async (req, res) => {
  res.json(ok(await listCategoryTree(req.query)))
}))

adminRouter.get('/categories/:id/articles', asyncHandler(async (req, res) => {
  res.json(ok(await listCategoryArticles(req.params.id, req.query)))
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

adminRouter.post('/categories/:id/move', asyncHandler(async (req, res) => {
  const input = parseBody(categoryMoveSchema, req.body)
  const category = await moveCategoryBranch(req.params.id, input.targetParentId)
  if (input.sortOrder !== undefined) {
    const updated = await updateCategory(req.params.id, {
      sortOrder: input.sortOrder
    })
    res.json(ok(updated, '分类位置已更新'))
    return
  }
  res.json(ok(category, '分类位置已更新'))
}))

adminRouter.post('/articles/:id/category', asyncHandler(async (req, res) => {
  const input = parseBody(articleCategoryMoveSchema, req.body)
  const article = await moveArticleCategory(req.params.id, input.targetCategoryId)
  res.json(ok(article, '文章分类已更新'))
}))

adminRouter.get('/tags', asyncHandler(async (req, res) => {
  res.json(ok(await listTags(req.query)))
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
  res.json(ok(await listArticles(req.query)))
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

adminRouter.patch('/articles/:id/status', asyncHandler(async (req, res) => {
  const article = await updateArticleStatus(req.params.id, req.body.status, req.user)
  res.json(ok(article, '文章状态已更新'))
}))

adminRouter.post('/articles/:id/publish', asyncHandler(async (req, res) => {
  const article = await publishArticle(req.params.id, req.user)
  res.json(ok(article, '文章已发布'))
}))

// 回收站相关路由（必须在通用 /articles/:id 前面，避免 :id 抢占 trash/permanent 路径）
adminRouter.get('/articles/trash/list', asyncHandler(async (req, res) => {
  res.json(ok(await listDeletedArticles(req.query)))
}))

adminRouter.post('/articles/:id/restore', asyncHandler(async (req, res) => {
  const article = await restoreArticle(req.params.id, req.user)
  res.json(ok(article, '文章已恢复'))
}))

adminRouter.delete('/articles/:id/permanent', asyncHandler(async (req, res) => {
  const result = await permanentDeleteArticle(req.params.id)
  res.json(ok(result, '文章已彻底删除'))
}))

adminRouter.delete('/articles/trash/empty', asyncHandler(async (req, res) => {
  const result = await emptyTrash()
  res.json(ok(result, `已清空 ${result.deletedCount} 条记录`))
}))

adminRouter.delete('/articles/:id', asyncHandler(async (req, res) => {
  const result = await deleteArticle(req.params.id, req.user)
  res.json(ok(result, '文章已移至回收站'))
}))

adminRouter.get('/comments', asyncHandler(async (req, res) => {
  res.json(ok(await listAdminComments(req.query)))
}))

adminRouter.post('/comments/:id/:action', asyncHandler(async (req, res) => {
  const comment = await reviewComment(req.params.id, req.params.action, req.user)
  res.json(ok(comment, '评论审核已更新'))
}))

adminRouter.get('/users', asyncHandler(async (req, res) => {
  res.json(ok(await listUsers(req.query)))
}))

adminRouter.patch('/users/:id/status', asyncHandler(async (req, res) => {
  const user = await updateUserStatus(req.params.id, req.body.status)
  res.json(ok(user, '用户状态已更新'))
}))

adminRouter.get('/stats', asyncHandler(async (req, res) => {
  res.json(ok(await getAdminStats()))
}))

adminRouter.get('/media', asyncHandler(async (req, res) => {
  res.json(ok(await listMedia(req.query)))
}))

adminRouter.get('/media/categories', asyncHandler(async (req, res) => {
  res.json(ok(await listMediaCategoryEntities()))
}))

adminRouter.post('/media/categories', asyncHandler(async (req, res) => {
  res.status(201).json(ok(await createMediaCategory(req.body), '资源分类已创建'))
}))

adminRouter.patch('/media/categories/:id', asyncHandler(async (req, res) => {
  res.json(ok(await updateMediaCategory(req.params.id, req.body), '资源分类已更新'))
}))

adminRouter.delete('/media/categories/:id', asyncHandler(async (req, res) => {
  res.json(ok(await deleteMediaCategory(req.params.id), '资源分类已删除'))
}))

adminRouter.post('/media', (req, res, next) => {
  upload.single('file')(req, res, async (error) => {
    if (error) {
      if (error instanceof MulterError) {
        error.statusCode = 400
        error.code = error.code || 'UPLOAD_ERROR'
        if (error.code === 'LIMIT_FILE_SIZE') {
          error.message = '文件大小不能超过 5MB'
        }
      }

      next(error)
      return
    }

    try {
      if (!req.file) {
        const fileError = new Error('请选择要上传的文件')
        fileError.statusCode = 400
        fileError.code = 'FILE_REQUIRED'
        throw fileError
      }

      const media = await createMediaFromFile(req.file, req.user, {
        category: req.body?.category
      })
      res.status(201).json(ok(media, '文件已上传'))
    } catch (handlerError) {
      next(handlerError)
    }
  })
})

adminRouter.delete('/media/:id', asyncHandler(async (req, res) => {
  const result = await deleteMedia(req.params.id)
  res.json(ok(result, '媒体文件已删除'))
}))

adminRouter.get('/announcements', asyncHandler(async (req, res) => {
  const result = await listAnnouncements(true, req.query)
  res.json(ok(result))
}))

adminRouter.post('/announcements', asyncHandler(async (req, res) => {
  const announcement = await createAnnouncement(req.body, req.user?._id)
  res.status(201).json(ok(announcement, '公告已创建'))
}))

adminRouter.patch('/announcements/:id', asyncHandler(async (req, res) => {
  const announcement = await updateAnnouncement(req.params.id, req.body)
  res.json(ok(announcement, '公告已更新'))
}))

adminRouter.get('/announcements/detail/:id', asyncHandler(async (req, res) => {
  res.json(ok(await getAnnouncementById(req.params.id)))
}))

adminRouter.post('/announcements/batch-toggle', asyncHandler(async (req, res) => {
  const { ids, isActive } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    const error = new Error('请选择要操作的公告')
    error.statusCode = 400
    throw error
  }
  const result = await batchToggleAnnouncement(ids, isActive)
  res.json(ok(result, `已${isActive ? '上架' : '下架'} ${result.modifiedCount} 条公告`))
}))

adminRouter.post('/announcements/batch-delete', asyncHandler(async (req, res) => {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    const error = new Error('请选择要删除的公告')
    error.statusCode = 400
    throw error
  }
  const result = await batchDeleteAnnouncements(ids)
  res.json(ok(result, `已删除 ${result.deletedCount} 条公告`))
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
