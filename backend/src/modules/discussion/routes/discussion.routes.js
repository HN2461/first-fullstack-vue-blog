import { receiveResourceFile } from '#modules/media/handlers/resourceUpload.handler.js'
import { createResource, resourceDescriptor } from '#modules/media/services/resourceFile.service.js'
import { DiscussionMessage } from '#modules/discussion/models/DiscussionMessage.js'
import { resolveLegacyDiscussionAttachment } from '#modules/discussion/services/discussionAttachment.service.js'
import { Router } from 'express'
import { DISCUSSION_ROUTE_PATH } from '#modules/discussion/constants/discussion.constants.js'
import { createDiscussionMessage, createDiscussionThread, deleteDiscussionMessage, getDiscussionConfig, getDiscussionThread, hideDiscussionMessageForUser, listDiscussionMessages, listDiscussionThreads, markDiscussionRead, revokeDiscussionMessage } from '#modules/discussion/services/discussion.service.js'
import { clearDiscussionThreadForUser, getDiscussionThreadStorage, purgeAllDiscussionMessages, purgeDiscussionThread } from '#modules/discussion/services/discussionStorage.service.js'
import { listDiscussionUsers } from '#modules/discussion/services/discussionUser.service.js'
import { DISCUSSION_CONFIG } from '#modules/discussion/constants/discussion.constants.js'
import { discussionCreateSchema, discussionMessageCreateSchema, parseBody } from '#modules/discussion/validators/discussion.validator.js'
import { requireAuth, requireMenuAccess, requireSuperAdmin } from '#middlewares/auth.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'

export const discussionRouter = Router()

const handleAttachmentUpload = receiveResourceFile('discussion-attachment')

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

discussionRouter.post('/:threadId/attachments', asyncHandler(async (req, res, next) => {
  await getDiscussionThread(req.params.threadId, req.user._id)
  next()
}), handleAttachmentUpload, asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error('请选择要上传的文件')
    error.statusCode = 400
    error.code = 'DISCUSSION_ATTACHMENT_REQUIRED'
    throw error
  }
  const media = await createResource(req.file, req.user, { scene: 'discussion-attachment', targetId: req.params.threadId })
  res.status(201).json(ok(resourceDescriptor(media), '附件已上传'))
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

// 旧消息继续通过所属会话鉴权读取，禁止用原静态地址访问私人附件。
discussionRouter.get('/:threadId/messages/:messageId/attachments/:index', asyncHandler(async (req, res) => {
  await getDiscussionThread(req.params.threadId, req.user._id)
  const message = await DiscussionMessage.findOne({ _id: req.params.messageId, threadId: req.params.threadId, revokedAt: null, hiddenFor: { $ne: req.user._id } })
  if (!message) return res.sendStatus(404)
  const { filePath, attachment } = await resolveLegacyDiscussionAttachment(message, Number(req.params.index))
  const inline = /^image\/(jpeg|png|gif|webp|avif)$/.test(attachment.mimeType)
  res.set({ 'Content-Type': inline ? attachment.mimeType : 'application/octet-stream', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Disposition': inline ? 'inline' : 'attachment' })
  res.sendFile(filePath, { dotfiles: 'allow' })
}))
