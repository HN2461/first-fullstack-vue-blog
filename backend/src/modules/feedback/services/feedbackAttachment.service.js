import { Media } from '#modules/media/models/Media.js'
import { createResource } from '#modules/media/services/resourceFile.service.js'
import { removeResourceFile, resolveResourcePath } from '#modules/media/services/resourceStorage.service.js'
import { saveResourceBindings } from '#modules/media/services/resourceBinding.service.js'
import { MediaReference } from '#modules/media/models/MediaReference.js'

export const FEEDBACK_IMAGE_LIMIT = 5
export const FEEDBACK_IMAGE_BYTES = 5 * 1024 * 1024

/**
 * 通过统一文件服务保存反馈截图，真实图片校验、私有存储及登记复用媒体能力。
 * @param {Array<object>} files 本次图片文件。
 * @param {string} feedbackId 服务端反馈 ID。
 * @param {string} uploaderId 上传人 ID。
 * @returns {Promise<Array<object>>} 已登记的截图资源。
 * @throws {Error} 超量或格式不合法时拒绝，本次失败会补偿清理。
 */
export async function storeFeedbackAttachments(files, feedbackId, uploaderId) {
  if (files.length > FEEDBACK_IMAGE_LIMIT) throw Object.assign(new Error('每次最多添加 5 张图片'), { statusCode: 400 })
  const stored = []
  try {
    for (const file of files) {
      const media = await createResource(file, uploaderId, { scene: 'feedback-image', targetId: feedbackId, feedback: feedbackId })
      stored.push(media)
      // 业务提交失败时由 discard 回收，业务响应丢失时仍保留证据引用。
      await saveResourceBindings({ targetType: 'feedback', targetId: feedbackId, field: `image:${media._id}`, ownerId: uploaderId, mediaIds: [media._id] }, async () => {})
    }
    return stored
  } catch (error) {
    if (error.code === 'RESOURCE_IMAGE_INVALID') error.code = 'FEEDBACK_IMAGE_INVALID'
    await discardFeedbackAttachments(stored)
    throw error
  }
}

/**
 * 回收本次尚未提交成功的反馈附件，参数仅来自服务端创建结果。
 * @param {Array<object>} mediaItems 本次新建的资源记录。
 * @returns {Promise<void>} 清理完成。
 * @throws {Error} 补偿失败不覆盖原业务异常，剩余资源由对账发现。
 */
export async function discardFeedbackAttachments(mediaItems) {
  for (const media of mediaItems) {
    await MediaReference.deleteMany({ mediaId: media._id }).catch(() => {})
    await removeResourceFile(media).catch(() => {})
    await Media.deleteOne({ _id: media._id }).catch(() => {})
  }
}

/**
 * 读取已授权反馈截图，兼容旧目录与新私有存储并校验真实路径。
 * @param {object} media 已由反馈服务校验权限的媒体记录。
 * @returns {Promise<object>} 资源与路径。
 * @throws {Error} 文件缺失、软删除或路径非法时拒绝。
 */
export async function resolveFeedbackAttachment(media) {
  if (media.deletedAt) throw Object.assign(new Error('图片不存在'), { statusCode: 404 })
  return { media, filePath: await resolveResourcePath(media) }
}
