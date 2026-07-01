import { DiscussionMember } from '#modules/discussion/models/DiscussionMember.js'
import { DiscussionMessage } from '#modules/discussion/models/DiscussionMessage.js'
import { createSystemNotification } from '#modules/notification/services/notification.service.js'
import { assertObjectId, createDiscussionError } from '#modules/discussion/services/discussionHelpers.js'
import { assertThreadMember } from '#modules/discussion/services/discussionMember.service.js'
import { removeDiscussionAttachmentFiles, updateThreadLastMessage } from '#modules/discussion/services/discussionCleanup.service.js'
import { emitDiscussionEvent, emitDiscussionUserEvent } from '#modules/discussion/realtime/discussionSocket.js'

function getMessageTextBytes(message) {
  return Buffer.byteLength(message.content || '', 'utf8')
}

function getMessageAttachmentBytes(message) {
  return (message.attachments || []).reduce((total, attachment) => total + (attachment.size || 0), 0)
}

function buildStorageSummary(messages = []) {
  const totals = messages.reduce((summary, message) => {
    const attachments = message.attachments || []
    summary.messageCount += 1
    summary.attachmentCount += attachments.length
    summary.textBytes += getMessageTextBytes(message)
    summary.attachmentBytes += getMessageAttachmentBytes(message)
    return summary
  }, {
    messageCount: 0,
    attachmentCount: 0,
    textBytes: 0,
    attachmentBytes: 0
  })

  return {
    ...totals,
    totalBytes: totals.textBytes + totals.attachmentBytes
  }
}

export async function getDiscussionThreadStorage(threadId, currentUser, safeUser = null) {
  assertObjectId(threadId, 'DISCUSSION_NOT_FOUND', '讨论不存在')
  const isSuperAdmin = safeUser?.isSuperAdmin || currentUser?.isSuperAdmin || currentUser?.role === 'super_admin'
  if (!isSuperAdmin) {
    await assertThreadMember(threadId, currentUser._id)
  }

  const messages = await DiscussionMessage.find({ threadId }).select('content attachments').lean()
  const thread = buildStorageSummary(messages)
  const result = { thread }

  if (isSuperAdmin) {
    const allMessages = await DiscussionMessage.find({}).select('content attachments').lean()
    result.global = buildStorageSummary(allMessages)
  }

  return result
}

export async function clearDiscussionThreadForUser(threadId, currentUserId) {
  assertObjectId(threadId, 'DISCUSSION_NOT_FOUND', '讨论不存在')
  await assertThreadMember(threadId, currentUserId)
  const now = new Date()

  await DiscussionMember.updateOne(
    { threadId, userId: currentUserId },
    { $set: { clearedBeforeAt: now, lastReadAt: now } }
  )

  return { threadId: String(threadId), clearedBeforeAt: now }
}

export async function purgeDiscussionThread(threadId, currentUser) {
  assertObjectId(threadId, 'DISCUSSION_NOT_FOUND', '讨论不存在')
  const messages = await DiscussionMessage.find({ threadId }).select('attachments')
  const memberIds = await DiscussionMember.distinct('userId', { threadId })
  const storage = buildStorageSummary(messages)
  const deletedFileCount = await removeDiscussionAttachmentFiles(messages)
  const result = await DiscussionMessage.deleteMany({ threadId })
  await updateThreadLastMessage(threadId)

  await Promise.all(memberIds.map((userId) => createSystemNotification({
    title: '项目讨论历史已清理',
    content: '因服务器存储空间不足，管理员已清理当前项目讨论的历史消息和附件。',
    level: 'warning',
    link: '/console/discussions',
    authorId: currentUser._id
  }, userId)))

  emitDiscussionEvent(threadId, 'discussion:history-purged', {
    threadId: String(threadId),
    scope: 'thread'
  })
  memberIds.forEach((userId) => {
    emitDiscussionUserEvent(userId, 'discussion:thread-updated', { threadId: String(threadId) })
  })

  return {
    threadId: String(threadId),
    deletedMessageCount: result.deletedCount || 0,
    deletedFileCount,
    storage
  }
}

export async function purgeAllDiscussionMessages(currentUser) {
  const messages = await DiscussionMessage.find({}).select('threadId attachments')
  const memberIds = await DiscussionMember.distinct('userId')
  if (!messages.length) {
    return {
      deletedMessageCount: 0,
      deletedFileCount: 0,
      storage: buildStorageSummary([])
    }
  }

  const threadIds = [...new Set(messages.map((message) => message.threadId?.toString()).filter(Boolean))]
  const storage = buildStorageSummary(messages)
  const deletedFileCount = await removeDiscussionAttachmentFiles(messages)
  const result = await DiscussionMessage.deleteMany({})

  await Promise.all(threadIds.map((threadId) => updateThreadLastMessage(threadId)))

  await Promise.all(memberIds.map((userId) => createSystemNotification({
    title: '项目讨论历史已统一清理',
    content: '因服务器存储空间不足，管理员已统一清理项目讨论模块的历史消息和附件。',
    level: 'warning',
    link: '/console/discussions',
    authorId: currentUser._id
  }, userId)))

  threadIds.forEach((threadId) => {
    emitDiscussionEvent(threadId, 'discussion:history-purged', {
      threadId,
      scope: 'all'
    })
  })

  return {
    deletedMessageCount: result.deletedCount || 0,
    deletedFileCount,
    storage
  }
}
