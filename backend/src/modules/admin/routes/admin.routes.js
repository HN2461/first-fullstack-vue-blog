import fs from 'node:fs'
import multer from 'multer'
import { Router } from 'express'
import { MulterError } from 'multer'
import { requireAdmin, requireAuth, requireMenuAccess, requireSuperAdmin } from '#middlewares/auth.js'
import { batchDeleteArticles, batchPermanentDeleteArticles, batchRestoreArticles, batchUpdateArticleStatus, createArticle, deleteArticle, emptyTrash, getArticleById, listArticles, listDeletedArticles, permanentDeleteArticle, publishArticle, restoreArticle, updateArticle, updateArticleStatus } from '#modules/content/services/article.service.js'
import { batchDeleteCategories, batchUpdateCategoryStatus, createCategory, deleteCategory, listCategories, listCategoryArticles, listCategoryTree, moveArticleCategory, moveArticlesCategory, moveCategoryBranch, updateCategory } from '#modules/content/services/category.service.js'
import { batchDeleteAdminUsers, batchResetUserPasswords, batchReviewComments, batchUpdateUserRoles, batchUpdateUserStatus, createAdminUser, deleteAdminUser, listAdminComments, listUsers, reviewComment, updateUserRoles, updateUserStatus } from '#modules/interaction/services/comment.service.js'
import { createMediaCategory, deleteMediaCategory, listMediaCategories as listMediaCategoryEntities, updateMediaCategory } from '#modules/media/services/mediaCategory.service.js'
import { batchDeleteMedia, batchPermanentDeleteMedia, batchRestoreMedia, createMediaFromFiles, deleteMedia, emptyMediaTrash, getUploadSubdir, listMedia, listMediaCategories, permanentDeleteMedia, restoreMedia } from '#modules/media/services/media.service.js'
import { getMonitorOverview } from '#modules/operations/services/monitor.service.js'
import { batchDeleteAnnouncements, batchToggleAnnouncement, createAnnouncement, deleteAnnouncement, getAnnouncementById, listAnnouncements, updateAnnouncement } from '#modules/notification/services/notification.service.js'
import { getSettings, updateSettings } from '#modules/settings/services/setting.service.js'
import { getAdminStats } from '#modules/dashboard/services/stats.service.js'
import { batchDeleteTags, batchUpdateTagStatus, createTag, deleteTag, listTags, updateTag } from '#modules/content/services/tag.service.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import { decryptCredential } from '#utils/authSecurity.js'
import { buildSafeStoredFilename } from '#utils/uploadFilename.js'
import { articleCategoryBatchMoveSchema, articleCategoryMoveSchema, articleSchema, articleStatusBatchSchema, categoryMoveSchema, categorySchema, categoryUpdateSchema, commentReviewBatchSchema, idBatchSchema, parseBody, statusBatchSchema, tagSchema } from '#modules/content/validators/content.validator.js'
import { userBatchResetPasswordSchema, userCreateSchema, userRoleAssignSchema } from '#modules/rbac/validators/rbac.validator.js'
import { settingSchema } from '#modules/settings/validators/setting.validator.js'

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

const ABSOLUTE_MAX_MEDIA_FILES = 20
const ABSOLUTE_MAX_MEDIA_FILE_SIZE_MB = 200

const upload = multer({
  storage,
  limits: {
    fileSize: ABSOLUTE_MAX_MEDIA_FILE_SIZE_MB * 1024 * 1024
  }
})

function getUploadedFiles(req) {
  if (Array.isArray(req.files)) {
    return req.files
  }

  return [
    ...(req.files?.files || []),
    ...(req.files?.file || [])
  ]
}

async function cleanupUploadedFiles(files = []) {
  await Promise.all(files.map(async (file) => {
    if (!file?.path) return

    try {
      await fs.promises.unlink(file.path)
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }
  }))
}

async function getMediaUploadRules() {
  const settings = await getSettings()
  return {
    maxFiles: Number(settings.mediaMaxFilesPerUpload) || 5,
    maxFileSizeMB: Number(settings.mediaMaxFileSizeMB) || 20
  }
}

function createUploadValidationError(message, code) {
  const error = new Error(message)
  error.statusCode = 400
  error.code = code
  return error
}

adminRouter.use(requireAuth, requireAdmin)

const canAccessArticles = requireMenuAccess('/console/manage/articles')
const canAccessCategories = requireMenuAccess('/console/manage/categories')
const canAccessComments = requireMenuAccess('/console/manage/comments')
const canAccessMedia = requireMenuAccess('/console/manage/media')
const canAccessMonitor = requireMenuAccess('/console/manage/monitor')
const canAccessNotifications = requireMenuAccess('/console/manage/notifications')
const canAccessSettings = requireMenuAccess('/console/manage/settings')
const canAccessTags = requireMenuAccess('/console/manage/tags')
const canAccessTrash = requireMenuAccess('/console/manage/trash')
const canAccessUsers = requireMenuAccess('/console/manage/users')

adminRouter.use('/articles/trash', canAccessTrash)
adminRouter.use('/articles', canAccessArticles)
adminRouter.use('/categories', canAccessCategories)
adminRouter.use('/comments', canAccessComments)
adminRouter.use('/media/trash', canAccessTrash)
adminRouter.use('/media', canAccessMedia)
adminRouter.use('/monitor', canAccessMonitor)
adminRouter.use('/announcements', canAccessNotifications)
adminRouter.use('/settings', canAccessSettings)
adminRouter.use('/stats', requireMenuAccess('/console'))
adminRouter.use('/tags', canAccessTags)
adminRouter.use('/users', canAccessUsers)

adminRouter.get('/categories', asyncHandler(async (req, res) => {
  res.json(ok(await listCategories(req.query)))
}))

adminRouter.get('/categories/tree', asyncHandler(async (req, res) => {
  res.json(ok(await listCategoryTree(req.query)))
}))

adminRouter.post('/categories', asyncHandler(async (req, res) => {
  const input = parseBody(categorySchema, req.body)
  const category = await createCategory(input)
  res.status(201).json(ok(category, '分类已创建'))
}))

adminRouter.post('/categories/batch/status', asyncHandler(async (req, res) => {
  const input = parseBody(statusBatchSchema, req.body)
  const result = await batchUpdateCategoryStatus(input.ids, input.status)
  res.json(ok(result, `已更新 ${result.updatedCount} 个分类`))
}))

adminRouter.post('/categories/batch/delete', asyncHandler(async (req, res) => {
  const input = parseBody(idBatchSchema, req.body)
  const result = await batchDeleteCategories(input.ids)
  res.json(ok(result, `已删除 ${result.deletedCount} 个分类`))
}))

adminRouter.get('/categories/:id/articles', asyncHandler(async (req, res) => {
  res.json(ok(await listCategoryArticles(req.params.id, req.query)))
}))

adminRouter.patch('/categories/:id', asyncHandler(async (req, res) => {
  const input = parseBody(categoryUpdateSchema, req.body)
  const category = await updateCategory(req.params.id, input)
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

adminRouter.post('/articles/category/batch', asyncHandler(async (req, res) => {
  const input = parseBody(articleCategoryBatchMoveSchema, req.body)
  const result = await moveArticlesCategory(input.articleIds, input.targetCategoryId)
  res.json(ok(result, `已迁移 ${result.movedCount} 篇文章`))
}))

adminRouter.get('/tags', asyncHandler(async (req, res) => {
  res.json(ok(await listTags(req.query)))
}))

adminRouter.post('/tags', asyncHandler(async (req, res) => {
  const input = parseBody(tagSchema, req.body)
  const tag = await createTag(input)
  res.status(201).json(ok(tag, '标签已创建'))
}))

adminRouter.post('/tags/batch/status', asyncHandler(async (req, res) => {
  const input = parseBody(statusBatchSchema, req.body)
  const result = await batchUpdateTagStatus(input.ids, input.status)
  res.json(ok(result, `已更新 ${result.updatedCount} 个标签`))
}))

adminRouter.post('/tags/batch/delete', asyncHandler(async (req, res) => {
  const input = parseBody(idBatchSchema, req.body)
  const result = await batchDeleteTags(input.ids)
  res.json(ok(result, `已删除 ${result.deletedCount} 个标签`))
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

adminRouter.post('/articles/batch/status', asyncHandler(async (req, res) => {
  const input = parseBody(articleStatusBatchSchema, req.body)
  const result = await batchUpdateArticleStatus(input.ids, input.status, req.user)
  res.json(ok(result, `已更新 ${result.updatedCount} 篇文章`))
}))

adminRouter.post('/articles/batch/delete', asyncHandler(async (req, res) => {
  const input = parseBody(idBatchSchema, req.body)
  const result = await batchDeleteArticles(input.ids, req.user)
  res.json(ok(result, `已移入回收站 ${result.deletedCount} 篇文章`))
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

adminRouter.post('/articles/trash/batch/restore', asyncHandler(async (req, res) => {
  const input = parseBody(idBatchSchema, req.body)
  const result = await batchRestoreArticles(input.ids, req.user)
  res.json(ok(result, `已恢复 ${result.restoredCount} 篇文章`))
}))

adminRouter.post('/articles/trash/batch/permanent', asyncHandler(async (req, res) => {
  const input = parseBody(idBatchSchema, req.body)
  const result = await batchPermanentDeleteArticles(input.ids)
  res.json(ok(result, `已彻底删除 ${result.deletedCount} 篇文章`))
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

adminRouter.post('/comments/batch/review', asyncHandler(async (req, res) => {
  const input = parseBody(commentReviewBatchSchema, req.body)
  const result = await batchReviewComments(input.ids, input.action, req.user)
  res.json(ok(result, `已处理 ${result.updatedCount} 条评论`))
}))

adminRouter.get('/users', asyncHandler(async (req, res) => {
  res.json(ok(await listUsers(req.query)))
}))

adminRouter.post('/users', requireSuperAdmin, asyncHandler(async (req, res) => {
  const { credential: encryptedCredential, ...body } = req.body
  const { password } = decryptCredential(encryptedCredential, 'admin-create-user')
  const input = parseBody(userCreateSchema, {
    ...body,
    password
  })
  const user = await createAdminUser(input)
  res.status(201).json(ok(user, '用户已创建'))
}))

adminRouter.post('/users/batch/status', asyncHandler(async (req, res) => {
  const input = parseBody(statusBatchSchema, req.body)
  const result = await batchUpdateUserStatus(input.ids, input.status)
  res.json(ok(result, `已更新 ${result.updatedCount} 个用户`))
}))

adminRouter.post('/users/batch/roles', requireSuperAdmin, asyncHandler(async (req, res) => {
  const input = parseBody(idBatchSchema.extend(userRoleAssignSchema.shape), req.body)
  const result = await batchUpdateUserRoles(input.ids, input.roleIds)
  res.json(ok(result, `已更新 ${result.updatedCount} 个用户角色`))
}))

adminRouter.post('/users/batch/reset-password', requireSuperAdmin, asyncHandler(async (req, res) => {
  const input = parseBody(userBatchResetPasswordSchema, req.body)
  const credential = decryptCredential(input.credential, 'admin-reset-password')
  const result = await batchResetUserPasswords(input.userIds, credential.newPassword)
  res.json(ok(result, `已重置 ${result.updatedCount} 个用户密码`))
}))

adminRouter.post('/users/batch/delete', requireSuperAdmin, asyncHandler(async (req, res) => {
  const input = parseBody(idBatchSchema, req.body)
  const result = await batchDeleteAdminUsers(input.ids, req.user._id)
  res.json(ok(result, `已删除 ${result.deletedCount} 个用户`))
}))

adminRouter.patch('/users/:id/status', asyncHandler(async (req, res) => {
  const user = await updateUserStatus(req.params.id, req.body.status)
  res.json(ok(user, '用户状态已更新'))
}))

adminRouter.patch('/users/:id/roles', requireSuperAdmin, asyncHandler(async (req, res) => {
  const input = parseBody(userRoleAssignSchema, req.body)
  const user = await updateUserRoles(req.params.id, input.roleIds)
  res.json(ok(user, '用户角色已更新'))
}))

adminRouter.delete('/users/:id', requireSuperAdmin, asyncHandler(async (req, res) => {
  const result = await deleteAdminUser(req.params.id, req.user._id)
  res.json(ok(result, '用户已删除'))
}))

adminRouter.get('/stats', asyncHandler(async (req, res) => {
  res.json(ok(await getAdminStats()))
}))

adminRouter.get('/monitor/overview', asyncHandler(async (req, res) => {
  res.json(ok(await getMonitorOverview()))
}))

adminRouter.get('/media', asyncHandler(async (req, res) => {
  res.json(ok(await listMedia(req.query)))
}))

adminRouter.get('/media/trash', asyncHandler(async (req, res) => {
  res.json(ok(await listMedia({ ...req.query, scope: 'trash' })))
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
  upload.fields([
    { name: 'files', maxCount: ABSOLUTE_MAX_MEDIA_FILES },
    { name: 'file', maxCount: 1 }
  ])(req, res, async (error) => {
    if (error) {
      if (error instanceof MulterError) {
        error.statusCode = 400
        error.code = error.code || 'UPLOAD_ERROR'
        if (error.code === 'LIMIT_FILE_SIZE') {
          error.message = `文件大小不能超过 ${ABSOLUTE_MAX_MEDIA_FILE_SIZE_MB}MB`
        } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
          error.message = `单次最多上传 ${ABSOLUTE_MAX_MEDIA_FILES} 个文件`
        }
      }

      next(error)
      return
    }

    try {
      const files = getUploadedFiles(req)
      if (files.length === 0) {
        const fileError = new Error('请选择要上传的文件')
        fileError.statusCode = 400
        fileError.code = 'FILE_REQUIRED'
        throw fileError
      }

      const rules = await getMediaUploadRules()
      if (files.length > rules.maxFiles) {
        await cleanupUploadedFiles(files)
        throw createUploadValidationError(`单次最多上传 ${rules.maxFiles} 个文件`, 'MEDIA_UPLOAD_COUNT_LIMIT')
      }

      const oversized = files.find((file) => file.size > rules.maxFileSizeMB * 1024 * 1024)
      if (oversized) {
        await cleanupUploadedFiles(files)
        throw createUploadValidationError(`单文件大小不能超过 ${rules.maxFileSizeMB}MB`, 'MEDIA_UPLOAD_SIZE_LIMIT')
      }

      const result = await createMediaFromFiles(files, req.user, {
        category: req.body?.category
      })
      res.status(201).json(ok(result.total === 1 ? result.items[0] : result, `已上传 ${result.total} 个文件`))
    } catch (handlerError) {
      next(handlerError)
    }
  })
})

adminRouter.post('/media/batch/delete', asyncHandler(async (req, res) => {
  const input = parseBody(idBatchSchema, req.body)
  const result = await batchDeleteMedia(input.ids, req.user)
  res.json(ok(result, `已移入回收站 ${result.deletedCount} 个媒体文件`))
}))

adminRouter.post('/media/trash/batch/restore', asyncHandler(async (req, res) => {
  const input = parseBody(idBatchSchema, req.body)
  const result = await batchRestoreMedia(input.ids)
  res.json(ok(result, `已恢复 ${result.restoredCount} 个媒体文件`))
}))

adminRouter.post('/media/trash/batch/permanent', asyncHandler(async (req, res) => {
  const input = parseBody(idBatchSchema, req.body)
  const result = await batchPermanentDeleteMedia(input.ids)
  res.json(ok(result, `已彻底删除 ${result.deletedCount} 个媒体文件`))
}))

adminRouter.post('/media/:id/restore', asyncHandler(async (req, res) => {
  res.json(ok(await restoreMedia(req.params.id), '媒体文件已恢复'))
}))

adminRouter.delete('/media/:id/permanent', asyncHandler(async (req, res) => {
  res.json(ok(await permanentDeleteMedia(req.params.id), '媒体文件已彻底删除'))
}))

adminRouter.delete('/media/trash/empty', asyncHandler(async (req, res) => {
  const result = await emptyMediaTrash()
  res.json(ok(result, `已清空 ${result.deletedCount} 个回收站文件`))
}))

adminRouter.delete('/media/:id', asyncHandler(async (req, res) => {
  const result = await deleteMedia(req.params.id, req.user)
  res.json(ok(result, '媒体文件已移入回收站'))
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
  const input = parseBody(settingSchema, req.body)
  res.json(ok(await updateSettings(input, req.user), '设置已保存'))
}))
