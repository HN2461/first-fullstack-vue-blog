import { MediaReference } from '../models/MediaReference.js'
import { getResourceScene, resourceError } from '../constants/resourceScenes.js'
import { hydrateUserPermissions } from '#modules/rbac/services/rbac.service.js'
import { isRoutePathMatched } from '#utils/routeMatch.js'
import { Resume } from '#modules/resume/models/Resume.js'
import { DiscussionMember } from '#modules/discussion/models/DiscussionMember.js'
import { DiscussionThread } from '#modules/discussion/models/DiscussionThread.js'

async function canAccessMenu(actor, route) {
  const safe = await hydrateUserPermissions(actor)
  return safe?.isSuperAdmin || safe?.permissions?.menuPaths?.some((item) => isRoutePathMatched(route, item))
}

/**
 * 在接收文件前检查场景及目标权限，普通用户无需媒体后台权限。
 * @param {string} scene 场景编码。
 * @param {string} targetId 服务端解析的目标业务 ID，可为空。
 * @param {object} actor 当前已认证用户。
 * @returns {Promise<void>} 已授权。
 * @throws {Error} 场景不开放独立上传、无菜单权限或目标不归属时拒绝。
 */
export async function authorizeResourceUpload(scene, targetId, actor) {
  getResourceScene(scene)
  if (scene === 'user-avatar') return
  if (scene === 'resume-photo') {
    if (!await canAccessMenu(actor, '/console/resumes') || !await Resume.exists({ _id: targetId, ownerId: actor._id })) {
      throw resourceError(403, 'RESOURCE_TARGET_FORBIDDEN', '无权上传该简历的照片')
    }
    return
  }
  if (scene === 'discussion-attachment') {
    if (!await canAccessMenu(actor, '/console/discussions') || !await DiscussionMember.exists({ threadId: targetId, userId: actor._id }) ||
      !await DiscussionThread.exists({ _id: targetId, status: 'active' })) {
      throw resourceError(403, 'RESOURCE_TARGET_FORBIDDEN', '无权上传该讨论的附件')
    }
    return
  }
  const route = scene.startsWith('article-') ? '/console/manage/articles' : scene === 'admin-library' ? '/console/manage/media' : ''
  if (!route || !await canAccessMenu(actor, route)) throw resourceError(403, 'RESOURCE_SCENE_FORBIDDEN', '无权使用此上传场景，请在对应业务中提交文件')
}

/**
 * 读取私有资源前执行业务授权；管理媒体菜单不授予私人业务内容读取权。
 * @param {object} media 服务端资源记录。
 * @param {object} actor 当前已认证用户。
 * @returns {Promise<void>} 已授权。
 * @throws {Error} 业务归属、菜单或保留状态不允许读取时返回 403/404。
 */
export async function authorizeResourceRead(media, actor) {
  if (media.deletedAt || media.lifecycleStatus === 'deleting') throw resourceError(404, 'MEDIA_NOT_FOUND', '文件不存在')
  if (media.accessScope === 'public') return
  if (!actor) throw resourceError(401, 'UNAUTHORIZED', '请先登录')
  const ownerId = String(actor._id || actor.id)
  // 历史私有媒体尚未补录 scene 时也必须执行原业务权限，不能从通用下载或缩略图绕过。
  const scene = media.scene || (media.feedback ? 'feedback-image' : media.workJournalLog ? 'work-journal-evidence' : '')
  if (media.lifecycleStatus === 'pending' && !media.attachedAt && String(media.uploader) === ownerId && media.accessScope !== 'vault') {
    await authorizeResourceUpload(media.scene, media.sourceTargetId, actor)
    return
  }
  if (scene === 'resume-photo' && await canAccessMenu(actor, '/console/resumes')) {
    const refs = await MediaReference.find({ mediaId: media._id, targetType: 'resume' }).select('targetId').lean()
    if (await Resume.exists({ _id: { $in: refs.map((ref) => ref.targetId) }, ownerId })) return
  }
  if (scene === 'discussion-attachment' && await canAccessMenu(actor, '/console/discussions')) {
    const { DiscussionMessage } = await import('#modules/discussion/models/DiscussionMessage.js')
    const threads = await DiscussionMessage.distinct('threadId', { 'attachments.mediaId': media._id, revokedAt: null, hiddenFor: { $ne: actor._id } })
    if (await DiscussionMember.exists({ threadId: { $in: threads }, userId: actor._id })) return
  }
  if (scene === 'feedback-image') {
    if (!await canAccessMenu(actor, '/console/feedback') && !await canAccessMenu(actor, '/console/manage/feedback')) throw resourceError(403, 'RESOURCE_READ_FORBIDDEN', '无权读取此文件')
    const { getFeedbackAttachment } = await import('#modules/feedback/services/feedback.service.js')
    await getFeedbackAttachment(String(media._id), actor, await canAccessMenu(actor, '/console/manage/feedback'))
    return
  }
  if (scene === 'work-journal-evidence') {
    if (!await canAccessMenu(actor, '/console/work-journal/daily') && !await canAccessMenu(actor, '/console/work-journal/trash') && !await canAccessMenu(actor, '/console/manage/media')) throw resourceError(403, 'RESOURCE_READ_FORBIDDEN', '无权读取此文件')
    const { getWorkJournalMediaContent } = await import('#modules/workJournal/services/workJournal.service.js')
    await getWorkJournalMediaContent(String(media._id), actor, { canManageAll: await canAccessMenu(actor, '/console/manage/media') && actor.role === 'super_admin' })
    return
  }
  throw resourceError(403, 'RESOURCE_READ_FORBIDDEN', '无权读取此文件')
}
