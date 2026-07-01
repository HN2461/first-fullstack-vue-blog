import mongoose from 'mongoose'
import { USER_STATUS } from '#constants/domain'
import { DISCUSSION_CONFIG, DISCUSSION_CONTENT_TYPES, DISCUSSION_MEMBER_ROLES, DISCUSSION_THREAD_TYPES } from '#modules/discussion/constants/discussion.constants.js'
import { assertObjectId, buildDirectKey, buildMessagePreview, createDiscussionError, normalizeId, resolveThreadTitle } from '#modules/discussion/services/discussionHelpers.js'
import { DiscussionMember } from '#modules/discussion/models/DiscussionMember.js'
import { DiscussionMessage } from '#modules/discussion/models/DiscussionMessage.js'
import { DiscussionThread } from '#modules/discussion/models/DiscussionThread.js'
import { cleanupUserDiscussionMessages, removeDiscussionAttachmentFiles, updateThreadLastMessage } from '#modules/discussion/services/discussionCleanup.service.js'
import { assertThreadMember, getThreadMembers } from '#modules/discussion/services/discussionMember.service.js'
export { listDiscussionThreads } from '#modules/discussion/services/discussionThreadList.service.js'
import { emitDiscussionEvent, emitDiscussionUserEvent, joinDiscussionUsersToThread } from '#modules/discussion/realtime/discussionSocket.js'
import { User } from '#modules/user/models/User.js'

export function getDiscussionConfig() {
  return DISCUSSION_CONFIG
}

export async function createDiscussionThread(input, currentUser) {
  const currentUserId = normalizeId(currentUser)
  const memberIds = [...new Set([currentUserId, ...(input.memberIds || []).map(String)])]

  if (input.type === DISCUSSION_THREAD_TYPES.DIRECT && memberIds.length !== 2) {
    throw createDiscussionError(400, 'DIRECT_MEMBER_COUNT_INVALID', '双人讨论只能选择 1 位成员')
  }

  if (input.type === DISCUSSION_THREAD_TYPES.GROUP && memberIds.length < 3) {
    throw createDiscussionError(400, 'GROUP_MEMBER_COUNT_INVALID', '小组讨论至少需要 3 位成员')
  }

  if (memberIds.length > DISCUSSION_CONFIG.groupMemberLimit) {
    throw createDiscussionError(400, 'GROUP_MEMBER_LIMIT_EXCEEDED', `小组讨论最多 ${DISCUSSION_CONFIG.groupMemberLimit} 人`)
  }

  const userCount = await User.countDocuments({
    _id: { $in: memberIds },
    status: { $ne: USER_STATUS.DISABLED }
  })
  if (userCount !== memberIds.length) {
    throw createDiscussionError(400, 'DISCUSSION_MEMBER_INVALID', '包含不可用成员')
  }

  if (input.type === DISCUSSION_THREAD_TYPES.DIRECT) {
    const directKey = buildDirectKey(memberIds)
    const existing = await DiscussionThread.findOne({ type: DISCUSSION_THREAD_TYPES.DIRECT, directKey })
    if (existing) {
      return getDiscussionThread(existing._id, currentUserId)
    }
  }

  const thread = await DiscussionThread.create({
    type: input.type,
    title: input.type === DISCUSSION_THREAD_TYPES.GROUP ? input.title?.trim() || '专题讨论' : '',
    directKey: input.type === DISCUSSION_THREAD_TYPES.DIRECT ? buildDirectKey(memberIds) : '',
    ownerId: currentUserId,
    createdBy: currentUserId
  })

  await DiscussionMember.insertMany(memberIds.map((userId) => ({
    threadId: thread._id,
    userId,
    role: userId === currentUserId ? DISCUSSION_MEMBER_ROLES.OWNER : DISCUSSION_MEMBER_ROLES.MEMBER,
    lastReadAt: userId === currentUserId ? new Date() : null
  })))

  const safeThread = await getDiscussionThread(thread._id, currentUserId)
  joinDiscussionUsersToThread(thread._id, memberIds)
  emitDiscussionEvent(thread._id, 'discussion:thread-created', { threadId: thread._id.toString() })
  memberIds.forEach((userId) => {
    emitDiscussionUserEvent(userId, 'discussion:thread-created', { threadId: thread._id.toString() })
  })
  return safeThread
}

export async function getDiscussionThread(threadId, currentUserId) {
  assertObjectId(threadId, 'DISCUSSION_NOT_FOUND', '讨论不存在')
  await assertThreadMember(threadId, currentUserId)
  const thread = await DiscussionThread.findById(threadId)
  if (!thread) {
    throw createDiscussionError(404, 'DISCUSSION_NOT_FOUND', '讨论不存在')
  }

  const members = (await getThreadMembers(threadId)).map((item) => item.toSafeJSON())
  return thread.toSafeJSON({
    title: resolveThreadTitle(thread, members, currentUserId),
    members
  })
}

export async function listDiscussionMessages(threadId, currentUserId, query = {}) {
  assertObjectId(threadId, 'DISCUSSION_NOT_FOUND', '讨论不存在')
  const member = await assertThreadMember(threadId, currentUserId)

  const limit = Math.min(80, Math.max(1, parseInt(query.limit, 10) || 50))
  const filter = { threadId }
  filter.hiddenFor = { $ne: currentUserId }
  if (member.clearedBeforeAt) {
    filter.createdAt = { $gt: member.clearedBeforeAt }
  }
  if (query.after && mongoose.Types.ObjectId.isValid(query.after)) {
    filter._id = { $gt: new mongoose.Types.ObjectId(query.after) }
  }

  const messages = await DiscussionMessage.find(filter)
    .populate('senderId', 'username email avatar')
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)

  return {
    items: messages.reverse().map((item) => item.toSafeJSON())
  }
}

export async function createDiscussionMessage(threadId, input, currentUserId) {
  assertObjectId(threadId, 'DISCUSSION_NOT_FOUND', '讨论不存在')
  await assertThreadMember(threadId, currentUserId)
  const thread = await DiscussionThread.findById(threadId)
  if (!thread || thread.status !== 'active') {
    throw createDiscussionError(404, 'DISCUSSION_NOT_FOUND', '讨论不存在')
  }

  const message = await DiscussionMessage.create({
    threadId,
    senderId: currentUserId,
    content: input.content.trim(),
    contentType: input.attachment?.mimeType?.startsWith('image/')
      ? DISCUSSION_CONTENT_TYPES.IMAGE
      : input.attachment
        ? DISCUSSION_CONTENT_TYPES.FILE
        : DISCUSSION_CONTENT_TYPES.TEXT,
    attachments: input.attachment ? [input.attachment] : []
  })
  await DiscussionThread.updateOne(
    { _id: threadId },
    {
      $set: {
        lastMessageId: message._id,
        lastMessagePreview: buildMessagePreview(message),
        lastMessageAt: message.createdAt
      }
    }
  )
  await DiscussionMember.updateOne(
    { threadId, userId: currentUserId },
    { $set: { lastReadAt: new Date() } }
  )
  await cleanupUserDiscussionMessages(currentUserId)

  await message.populate('senderId', 'username email avatar')
  const safeMessage = message.toSafeJSON()
  emitDiscussionEvent(threadId, 'discussion:message-created', {
    threadId: String(threadId),
    message: safeMessage
  })
  return safeMessage
}

export async function deleteDiscussionMessage(threadId, messageId, currentUser) {
  assertObjectId(threadId, 'DISCUSSION_NOT_FOUND', '讨论不存在')
  assertObjectId(messageId, 'DISCUSSION_MESSAGE_NOT_FOUND', '讨论内容不存在')
  const currentUserId = normalizeId(currentUser)
  await assertThreadMember(threadId, currentUserId)

  const message = await DiscussionMessage.findOne({ _id: messageId, threadId })
  if (!message) {
    throw createDiscussionError(404, 'DISCUSSION_MESSAGE_NOT_FOUND', '讨论内容不存在')
  }

  const canDelete = message.senderId.toString() === currentUserId || currentUser?.isSuperAdmin || currentUser?.role === 'super_admin'
  if (!canDelete) {
    throw createDiscussionError(403, 'DISCUSSION_MESSAGE_DELETE_FORBIDDEN', '只能删除自己发送的内容')
  }

  await DiscussionMessage.deleteOne({ _id: message._id })
  await removeDiscussionAttachmentFiles([message])
  await updateThreadLastMessage(threadId)
  emitDiscussionEvent(threadId, 'discussion:message-deleted', {
    threadId: String(threadId),
    messageId: String(messageId)
  })
  return { id: messageId, deleted: true }
}

export async function hideDiscussionMessageForUser(threadId, messageId, currentUserId) {
  assertObjectId(threadId, 'DISCUSSION_NOT_FOUND', '讨论不存在')
  assertObjectId(messageId, 'DISCUSSION_MESSAGE_NOT_FOUND', '讨论内容不存在')
  await assertThreadMember(threadId, currentUserId)

  const message = await DiscussionMessage.findOne({ _id: messageId, threadId })
  if (!message) {
    throw createDiscussionError(404, 'DISCUSSION_MESSAGE_NOT_FOUND', '讨论内容不存在')
  }

  await DiscussionMessage.updateOne(
    { _id: message._id },
    { $addToSet: { hiddenFor: currentUserId } }
  )
  return { id: messageId, hidden: true }
}

export async function revokeDiscussionMessage(threadId, messageId, currentUserId) {
  assertObjectId(threadId, 'DISCUSSION_NOT_FOUND', '讨论不存在')
  assertObjectId(messageId, 'DISCUSSION_MESSAGE_NOT_FOUND', '讨论内容不存在')
  await assertThreadMember(threadId, currentUserId)

  const message = await DiscussionMessage.findOne({ _id: messageId, threadId })
  if (!message) {
    throw createDiscussionError(404, 'DISCUSSION_MESSAGE_NOT_FOUND', '讨论内容不存在')
  }
  if (message.senderId.toString() !== String(currentUserId)) {
    throw createDiscussionError(403, 'DISCUSSION_MESSAGE_REVOKE_FORBIDDEN', '只能撤销自己发送的内容')
  }
  if (message.revokedAt) {
    return message.toSafeJSON()
  }

  const expiresAt = new Date(message.createdAt).getTime() + DISCUSSION_CONFIG.revokeWindowSeconds * 1000
  if (Date.now() > expiresAt) {
    throw createDiscussionError(400, 'DISCUSSION_MESSAGE_REVOKE_EXPIRED', '撤销时限已过')
  }

  const attachmentsToRemove = [...(message.attachments || [])]
  message.revokedAt = new Date()
  message.revokedBy = currentUserId
  message.content = ''
  message.attachments = []
  await message.save()
  await removeDiscussionAttachmentFiles([{ attachments: attachmentsToRemove }])
  await updateThreadLastMessage(threadId)
  await message.populate('senderId', 'username email avatar')
  const safeMessage = message.toSafeJSON()
  emitDiscussionEvent(threadId, 'discussion:message-revoked', {
    threadId: String(threadId),
    message: safeMessage
  })
  return safeMessage
}

export async function markDiscussionRead(threadId, currentUserId) {
  assertObjectId(threadId, 'DISCUSSION_NOT_FOUND', '讨论不存在')
  await assertThreadMember(threadId, currentUserId)
  await DiscussionMember.updateOne(
    { threadId, userId: currentUserId },
    { $set: { lastReadAt: new Date() } }
  )
  return { read: true }
}
