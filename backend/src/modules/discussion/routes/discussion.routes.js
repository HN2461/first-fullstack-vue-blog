import { Router } from 'express'
import { DISCUSSION_ROUTE_PATH } from '#modules/discussion/constants/discussion.constants.js'
import fs from 'node:fs'
import path from 'node:path'
import multer, { MulterError } from 'multer'
import { createDiscussionMessage, createDiscussionThread, deleteDiscussionMessage, getDiscussionConfig, getDiscussionThread, hideDiscussionMessageForUser, listDiscussionMessages, listDiscussionThreads, markDiscussionRead, revokeDiscussionMessage } from '#modules/discussion/services/discussion.service.js'
import { clearDiscussionThreadForUser, getDiscussionThreadStorage, purgeAllDiscussionMessages, purgeDiscussionThread } from '#modules/discussion/services/discussionStorage.service.js'
import { listDiscussionUsers } from '#modules/discussion/services/discussionUser.service.js'
import { DISCUSSION_CONFIG } from '#modules/discussion/constants/discussion.constants.js'
import { discussionCreateSchema, discussionMessageCreateSchema, parseBody } from '#modules/discussion/validators/discussion.validator.js'
import { requireAuth, requireMenuAccess, requireSuperAdmin } from '#middlewares/auth.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import { buildSafeStoredFilename, decodeUploadFilename } from '#utils/uploadFilename.js'
import { resolveUploadRoot } from '#utils/uploadPath.js'

export const discussionRouter = Router()

function getDiscussionUploadDir() {
  const date = new Date()
  return path.join(
    resolveUploadRoot(),
    'discussions',
    String(date.getFullYear()),
    String(date.getMonth() + 1).padStart(2, '0')
  )
}

const attachmentStorage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = getDiscussionUploadDir()
    fs.mkdirSync(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename(req, file, cb) {
    const safeName = buildSafeStoredFilename(file.originalname)
    cb(null, `${Date.now()}-${safeName}`)
  }
})

const attachmentUpload = multer({
  storage: attachmentStorage,
  limits: {
    fileSize: DISCUSSION_CONFIG.attachmentMaxFileSizeMB * 1024 * 1024
  }
})

function handleAttachmentUpload(req, res, next) {
  attachmentUpload.single('file')(req, res, (error) => {
    if (error instanceof MulterError) {
      error.statusCode = 400
      error.code = error.code || 'DISCUSSION_ATTACHMENT_UPLOAD_ERROR'
      if (error.code === 'LIMIT_FILE_SIZE') {
        error.message = `单文件大小不能超过 ${DISCUSSION_CONFIG.attachmentMaxFileSizeMB}MB`
      }
    }
    next(error)
  })
}

function buildAttachmentFromFile(file) {
  const normalizedPath = file.path.replace(/\\/g, '/')
  const uploadsIndex = normalizedPath.lastIndexOf('uploads/')
  const relativePath = uploadsIndex >= 0 ? normalizedPath.slice(uploadsIndex) : normalizedPath
  return {
    filename: file.filename,
    originalName: decodeUploadFilename(file.originalname),
    mimeType: file.mimetype,
    size: file.size,
    url: `/${relativePath}`,
    storagePath: normalizedPath
  }
}

discussionRouter.use(requireAuth)
discussionRouter.use(requireMenuAccess(DISCUSSION_ROUTE_PATH))

discussionRouter.get('/config', asyncHandler(async (req, res) => {
  res.json(ok(getDiscussionConfig()))
}))

discussionRouter.get('/users', asyncHandler(async (req, res) => {
  res.json(ok(await listDiscussionUsers(req.user._id, req.query.keyword)))
}))

discussionRouter.get('/', asyncHandler(async (req, res) => {
  res.json(ok(await listDiscussionThreads(req.user._id)))
}))

discussionRouter.post('/', asyncHandler(async (req, res) => {
  const input = parseBody(discussionCreateSchema, req.body)
  res.status(201).json(ok(await createDiscussionThread(input, req.user), '讨论已创建'))
}))

discussionRouter.post('/admin/purge-all', requireSuperAdmin, asyncHandler(async (req, res) => {
  res.json(ok(await purgeAllDiscussionMessages(req.user), '讨论历史已清理'))
}))

discussionRouter.get('/:threadId', asyncHandler(async (req, res) => {
  res.json(ok(await getDiscussionThread(req.params.threadId, req.user._id)))
}))

discussionRouter.get('/:threadId/storage', asyncHandler(async (req, res) => {
  res.json(ok(await getDiscussionThreadStorage(req.params.threadId, req.user, req.rbacUser)))
}))

discussionRouter.get('/:threadId/messages', asyncHandler(async (req, res) => {
  res.json(ok(await listDiscussionMessages(req.params.threadId, req.user._id, req.query)))
}))

discussionRouter.post('/:threadId/messages', asyncHandler(async (req, res) => {
  const input = parseBody(discussionMessageCreateSchema, req.body)
  res.status(201).json(ok(await createDiscussionMessage(req.params.threadId, input, req.user._id), '讨论内容已发送'))
}))

discussionRouter.post('/:threadId/attachments', handleAttachmentUpload, asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error('请选择要上传的文件')
    error.statusCode = 400
    error.code = 'DISCUSSION_ATTACHMENT_REQUIRED'
    throw error
  }
  await getDiscussionThread(req.params.threadId, req.user._id)
  res.status(201).json(ok(buildAttachmentFromFile(req.file), '附件已上传'))
}))

discussionRouter.delete('/:threadId/messages/:messageId', asyncHandler(async (req, res) => {
  res.json(ok(await deleteDiscussionMessage(req.params.threadId, req.params.messageId, req.user), '讨论内容已删除'))
}))

discussionRouter.post('/:threadId/messages/:messageId/hide', asyncHandler(async (req, res) => {
  res.json(ok(await hideDiscussionMessageForUser(req.params.threadId, req.params.messageId, req.user._id), '已从本地记录移除'))
}))

discussionRouter.post('/:threadId/messages/:messageId/revoke', asyncHandler(async (req, res) => {
  res.json(ok(await revokeDiscussionMessage(req.params.threadId, req.params.messageId, req.user._id), '讨论内容已撤销'))
}))

discussionRouter.post('/:threadId/clear-my-view', asyncHandler(async (req, res) => {
  res.json(ok(await clearDiscussionThreadForUser(req.params.threadId, req.user._id), '当前会话记录已从你的视图清除'))
}))

discussionRouter.post('/:threadId/admin/purge', requireSuperAdmin, asyncHandler(async (req, res) => {
  res.json(ok(await purgeDiscussionThread(req.params.threadId, req.user), '当前会话历史已清理'))
}))

discussionRouter.post('/:threadId/read', asyncHandler(async (req, res) => {
  res.json(ok(await markDiscussionRead(req.params.threadId, req.user._id)))
}))
