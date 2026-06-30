import mongoose from 'mongoose'
import { DISCUSSION_CONTENT_TYPES, DISCUSSION_THREAD_TYPES } from '#modules/discussion/constants/discussion.constants.js'

export function createDiscussionError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

export function assertObjectId(id, code = 'NOT_FOUND', message = '数据不存在') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createDiscussionError(404, code, message)
  }
}

export function normalizeId(id) {
  return (id?._id || id?.id || id)?.toString()
}

export function buildDirectKey(memberIds) {
  return [...memberIds].map(String).sort().join(':')
}

export function buildPreview(content = '') {
  return content.replace(/\s+/g, ' ').trim().slice(0, 120)
}

export function buildMessagePreview(message) {
  if (message?.revokedAt) return '内容已撤销'
  if (message?.content) return buildPreview(message.content)
  if (message?.contentType === DISCUSSION_CONTENT_TYPES.IMAGE) return '[图片]'
  if (message?.attachments?.length) return `[附件] ${message.attachments[0].originalName || ''}`.trim()
  return ''
}

export function resolveThreadTitle(thread, members, currentUserId) {
  if (thread.type === DISCUSSION_THREAD_TYPES.GROUP) {
    return thread.title || '专题讨论'
  }

  const other = members.find((member) => member.userId !== String(currentUserId))
  return other?.username || other?.email || '双人讨论'
}
