import { DISCUSSION_CONFIG } from '#modules/discussion/constants/discussion.constants.js'
import { DiscussionMessage } from '#modules/discussion/models/DiscussionMessage.js'
import { DiscussionThread } from '#modules/discussion/models/DiscussionThread.js'
import fs from 'node:fs/promises'

function buildPreview(content = '') {
  return content.replace(/\s+/g, ' ').trim().slice(0, 120)
}

function buildMessagePreview(message) {
  if (message?.revokedAt) return '内容已撤销'
  if (message?.content) return buildPreview(message.content)
  if (message?.contentType === 'image') return '[图片]'
  if (message?.attachments?.length) return `[附件] ${message.attachments[0].originalName || ''}`.trim()
  return ''
}

export async function updateThreadLastMessage(threadId) {
  const lastMessage = await DiscussionMessage.findOne({ threadId })
    .sort({ createdAt: -1, _id: -1 })
    .select('_id content contentType attachments revokedAt createdAt')

  await DiscussionThread.updateOne(
    { _id: threadId },
    {
      $set: {
        lastMessageId: lastMessage?._id || null,
        lastMessagePreview: lastMessage ? buildMessagePreview(lastMessage) : '',
        lastMessageAt: lastMessage?.createdAt || null
      }
    }
  )
}

async function refreshLastMessagesForDeleted(deletedMessages = []) {
  const threadIds = [...new Set(deletedMessages.map((item) => item.threadId?.toString()).filter(Boolean))]
  await Promise.all(threadIds.map((threadId) => updateThreadLastMessage(threadId)))
}

export async function removeDiscussionAttachmentFiles(messages = []) {
  let deletedFileCount = 0
  for (const message of messages) {
    for (const attachment of message.attachments || []) {
      if (!attachment.storagePath) continue
      try {
        await fs.unlink(attachment.storagePath)
        deletedFileCount += 1
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error
        }
      }
    }
  }
  return deletedFileCount
}

export async function cleanupUserDiscussionMessages(userId, options = {}) {
  const limit = Number(options.limit || DISCUSSION_CONFIG.messageLimitPerUser)
  if (!limit || limit < 1) return { deletedCount: 0 }

  const messages = await DiscussionMessage.find({ senderId: userId })
    .sort({ createdAt: -1, _id: -1 })
    .select('_id threadId attachments')
    .skip(limit)
    .lean()
  if (!messages.length) return { deletedCount: 0 }

  const ids = messages.map((item) => item._id)
  const result = await DiscussionMessage.deleteMany({ _id: { $in: ids } })
  await removeDiscussionAttachmentFiles(messages)
  await refreshLastMessagesForDeleted(messages)
  return { deletedCount: result.deletedCount || 0 }
}

export async function cleanupAllDiscussionMessages(options = {}) {
  const users = await DiscussionMessage.distinct('senderId')
  let deletedCount = 0
  for (const userId of users) {
    const result = await cleanupUserDiscussionMessages(userId, options)
    deletedCount += result.deletedCount
  }
  return { checkedUsers: users.length, deletedCount }
}
