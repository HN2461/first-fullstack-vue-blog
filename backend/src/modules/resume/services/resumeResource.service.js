import { saveResourceBindings, assertResourceBinding } from '#modules/media/services/resourceBinding.service.js'
import { resolveResourcePath } from '#modules/media/services/resourceStorage.service.js'
import { resourceError } from '#modules/media/constants/resourceScenes.js'
import { resolveUploadRoot } from '#utils/uploadPath.js'
import path from 'node:path'
import { Resume } from '../models/Resume.js'
import { findResourceByUrl, getResourcePath, getResourceId } from '#modules/media/services/resourceIdentity.service.js'

/**
 * 保存简历时同步照片引用，受管 ID 不允许越权或跨用途替换。
 * @param {object} resume 当前服务端简历。
 * @param {Function} save 保存简历的回调。
 * @returns {Promise<*>} 保存结果。
 * @throws {Error} 照片 ID、归属或 URL 不匹配时拒绝。
 */
export async function saveResumeResource(resume, save) {
  const profile = resume.sections?.profile || {}
  const source = String(profile.photoUrl || '')
  const pathname = getResourcePath(source)
  const media = await findResourceByUrl(source)
  let id = null
  if (media) {
    validateResumePhotoResource(media, resume.ownerId)
    id = media._id
    profile.photoMediaId = String(media._id)
    profile.photoUrl = media.url
  } else {
    profile.photoMediaId = null
    if (getResourceId(source)) throw resourceError(404, 'MEDIA_NOT_FOUND', '照片不存在')
    if (pathname.startsWith('/uploads/resumes/')) {
      if (!await Resume.exists({ ownerId: resume.ownerId, 'sections.profile.photoUrl': { $in: [source, pathname] } })) {
        throw resourceError(403, 'RESOURCE_OWNER_REQUIRED', '只能继续使用本人简历中的历史照片，请上传新照片')
      }
    } else if (pathname.startsWith('/uploads/')) {
      throw resourceError(403, 'RESOURCE_READ_FORBIDDEN', '请选择已登记的公开图片，或重新上传照片')
    }
  }
  resume.markModified('sections')
  return saveResourceBindings({ targetType: 'resume', targetId: resume._id, field: 'photo', ownerId: resume.ownerId, mediaIds: id ? [id] : [], validate: (item) => validateResumePhotoResource(item, resume.ownerId) }, save)
}

/**
 * 为历史简历照片提供鉴权后的路径，避免旧目录继续公开暴露。
 * @param {object} resume 已确认当前用户拥有的简历。
 * @returns {Promise<string>} 仅该简历实际引用的照片文件路径。
 * @throws {Error} 无照片、路径非法或文件缺失时拒绝。
 */
export async function resolveResumePhoto(resume) {
  const profile = resume.sections?.profile || {}
  const media = await findResourceByUrl(profile.photoUrl)
  if (media) {
    validateResumePhotoResource(media, resume.ownerId)
    if (media.deletedAt || media.lifecycleStatus === 'deleting') throw resourceError(404, 'MEDIA_NOT_FOUND', '照片不存在')
    return resolveResourcePath(media)
  }
  const pathname = getResourcePath(profile.photoUrl)
  if (!pathname.startsWith('/uploads/resumes/')) throw resourceError(404, 'MEDIA_NOT_FOUND', '照片不存在')
  const filePath = path.resolve(resolveUploadRoot(), pathname.slice('/uploads/'.length))
  return resolveResourcePath({ storagePath: filePath })
}

function validateResumePhotoResource(media, ownerId) {
  if (media.kind !== 'image' || !/^image\/(jpeg|png|gif|webp|avif)$/.test(media.mimeType)) {
    throw resourceError(400, 'RESUME_PHOTO_IMAGE_REQUIRED', '简历照片必须是 JPG、PNG、GIF、WebP 或 AVIF 图片')
  }
  // 已公开素材可以被明确选用；私人照片始终要求属于本人且来自简历场景。
  if (media.accessScope === 'public') {
    if (media.lifecycleStatus === 'pending' && String(media.uploader) !== String(ownerId)) {
      throw resourceError(403, 'RESOURCE_OWNER_REQUIRED', '不能使用其他用户尚未保存的图片')
    }
    return
  }
  assertResourceBinding(media, { ownerId, scenes: ['resume-photo'] })
}
