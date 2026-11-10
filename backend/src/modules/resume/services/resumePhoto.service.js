import { findOwnedResume } from './resume.service.js'
import { receiveResourceFile } from '#modules/media/handlers/resourceUpload.handler.js'
import { createResource } from '#modules/media/services/resourceFile.service.js'
import { saveResourceBindings } from '#modules/media/services/resourceBinding.service.js'

export const handleResumePhotoUpload = receiveResourceFile('resume-photo', 'photo')

/**
 * 保存简历私有照片；替换只解除旧引用，避免删除简历副本仍在使用的照片。
 * @param {string} resumeId 已授权的简历 ID。
 * @param {string} userId 当前用户 ID。
 * @param {object} file 接收的照片，后端验证真实 JPG 内容。
 * @returns {Promise<object>} 更新后的简历。
 * @throws {Error} 无归属权限、文件无效或保存失败时拒绝。
 */
export async function saveResumePhoto(resumeId, userId, file) {
  const resume = await findOwnedResume(resumeId, userId)
  const media = await createResource(file, userId, { scene: 'resume-photo', targetId: resumeId })
  return saveResourceBindings({ targetType: 'resume', targetId: resumeId, field: 'photo', ownerId: userId, mediaIds: [media._id] }, async () => {
    resume.sections = { ...resume.sections, profile: { ...resume.sections?.profile, photoUrl: media.url, photoMediaId: String(media._id) } }
    resume.version = (resume.version || 1) + 1
    resume.markModified('sections')
    await resume.save()
    return resume.toSafeJSON()
  })
}
