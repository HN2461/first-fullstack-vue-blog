import mongoose from 'mongoose'
import path from 'node:path'
import { Media } from '#modules/media/models/Media.js'
import { MediaReference } from '#modules/media/models/MediaReference.js'
import { saveResourceBindings, assertResourceBinding } from '#modules/media/services/resourceBinding.service.js'
import { resourceDescriptor } from '#modules/media/services/resourceFile.service.js'
import { removeResourceFile, resolveResourcePath } from '#modules/media/services/resourceStorage.service.js'
import { resourceError } from '#modules/media/constants/resourceScenes.js'
import { resolveUploadRoot } from '#utils/uploadPath.js'

/**
 * 仅接受服务端登记的附件 ID，绑定与消息保存串行执行，不信任客户端路径和元数据。
 * @param {object} message 待保存的消息。
 * @param {string|null} mediaId 服务端上传返回的文件 ID。
 * @param {Function} save 消息保存回调。
 * @returns {Promise<*>} 保存结果。
 * @throws {Error} ID、上传者、场景或所属讨论不匹配时拒绝。
 */
export async function saveDiscussionAttachment(message, mediaId, save) {
  return saveResourceBindings({
    targetType: 'discussion-message', targetId: message._id, field: 'attachment', ownerId: message.senderId,
    mediaIds: mediaId ? [mediaId] : [],
    validate: async (media) => {
      assertResourceBinding(media, { ownerId: message.senderId, scenes: ['discussion-attachment'], targetId: message.threadId })
      const existing = await MediaReference.exists({ mediaId: media._id, targetType: 'discussion-message', targetId: { $ne: String(message._id) } })
      if (existing) throw resourceError(409, 'DISCUSSION_ATTACHMENT_ALREADY_BOUND', '附件已经发送，请重新上传')
      message.attachments = [{ ...resourceDescriptor(media), mediaId: media._id, storagePath: media.storagePath }]
      message.contentType = media.mimeType.startsWith('image/') ? 'image' : 'file'
    }
  }, save)
}

/**
 * 安全删除讨论消息文件，历史路径只能位于讨论专属目录，越界数据保持原文件。
 * @param {Array<object>} messages 从数据库加载的消息及附件。
 * @returns {Promise<number>} 实际删除的文件数。
 * @throws {Error} 文件系统失败时抛出，路径异常不会删除其他区域。
 */
export async function removeDiscussionResources(messages) {
  let removed = 0
  for (const message of messages) {
    await saveResourceBindings({ targetType: 'discussion-message', targetId: message._id, field: 'attachment', mediaIds: [] }, async () => {})
    for (const item of message.attachments || []) {
      if (item.mediaId) {
        const media = await Media.findOne({ _id: item.mediaId, scene: 'discussion-attachment' })
        if (!media || await MediaReference.exists({ mediaId: media._id })) continue
        // 已解绑文件保持待清理状态；统一清理服务负责幂等物理删除与引用复查。
        continue
      }
      const root = path.resolve(resolveUploadRoot(), 'discussions')
      const target = path.resolve(item.storagePath || '')
      const relative = path.relative(root, target)
      if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) continue
      if (await removeResourceFile({ storagePath: target })) removed += 1
    }
  }
  return removed
}

/**
 * 为迁移前消息提供鉴权读取路径，仅取服务端消息内的附件，不允许客户端指定磁盘路径。
 * @param {object} message 已授权消息。
 * @param {number} index 附件位置。
 * @returns {Promise<{filePath:string, attachment:object}>} 文件描述。
 * @throws {Error} 索引无效、越界或文件缺失时返回 404。
 */
export async function resolveLegacyDiscussionAttachment(message, index) {
  const attachment = message.attachments?.[index]
  if (!attachment) throw resourceError(404, 'MEDIA_NOT_FOUND', '附件不存在')
  if (attachment.mediaId && mongoose.isObjectIdOrHexString(attachment.mediaId)) {
    const media = await Media.findOne({ _id: attachment.mediaId, deletedAt: null, scene: 'discussion-attachment' })
    if (!media) throw resourceError(404, 'MEDIA_NOT_FOUND', '附件不存在')
    return { filePath: await resolveResourcePath(media), attachment: media }
  }
  const root = path.resolve(resolveUploadRoot(), 'discussions')
  const target = path.resolve(attachment.storagePath || '')
  const relative = path.relative(root, target)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw resourceError(404, 'MEDIA_NOT_FOUND', '附件不存在')
  return { filePath: await resolveResourcePath({ storagePath: target }), attachment }
}
