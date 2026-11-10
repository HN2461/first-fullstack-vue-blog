import mongoose from 'mongoose'
import { Media } from '../models/Media.js'
import { MediaReference } from '../models/MediaReference.js'
import { resourceError } from '../constants/resourceScenes.js'
import { withResourceLocks } from './resourceLock.service.js'
import { RESOURCE_PENDING_TTL } from './resourceFile.service.js'

/**
 * 在业务保存前登记保守引用，保存后同步正式引用，防止清理和保存交错误删文件。
 * @param {{targetType: string, targetId: string, field: string, mediaIds: Array, ownerId?: string, state?: string, validate?: Function}} binding 服务端业务关系。
 * @param {Function} save 仅执行当前业务的持久化操作。
 * @returns {Promise<*>} save 的返回值。
 * @throws {Error} 文件不存在、在回收站或校验失败时拒绝。保存结果不确定时保留 pending 引用，由对账处理。
 */
export async function saveResourceBindings(binding, save) {
  const { targetType, field, ownerId, validate, state = 'active' } = binding
  const targetId = String(binding.targetId)
  const target = { targetType, targetId, field }
  const ids = [...new Set((binding.mediaIds || []).filter(Boolean).map(String))]
  if (ids.some((id) => !mongoose.isObjectIdOrHexString(id))) throw resourceError(400, 'RESOURCE_ID_INVALID', '文件 ID 不正确')
  return withResourceLocks([`target:${targetType}:${targetId}:${field}`], async () => {
    const previous = await MediaReference.find(target).lean()
    return withResourceLocks([...ids, ...previous.map((ref) => String(ref.mediaId))], async () => {
      const media = await Media.find({ _id: { $in: ids }, deletedAt: null, lifecycleStatus: { $ne: 'deleting' } })
      if (media.length !== ids.length) throw resourceError(409, 'RESOURCE_UNAVAILABLE', '文件已删除或正在清理，请重新选择')
      for (const item of media) await validate?.(item)
      for (const mediaId of ids) {
        await MediaReference.updateOne({ ...target, mediaId }, {
          $setOnInsert: { state: 'pending', ownerId: ownerId || null }
        }, { upsert: true })
      }
      const result = await save()
      await MediaReference.updateMany({ ...target, mediaId: { $in: ids } }, { $set: { state, ownerId: ownerId || null } })
      await MediaReference.deleteMany({ ...target, mediaId: { $nin: ids } })
      if (ids.length) await Media.updateMany({ _id: { $in: ids }, lifecycleStatus: { $ne: 'retained' } }, {
        $set: { lifecycleStatus: 'attached', expiresAt: null, attachedAt: new Date() }
      })
      for (const old of previous) {
        if (!ids.includes(String(old.mediaId)) && !await MediaReference.exists({ mediaId: old.mediaId })) {
          await Media.updateOne({ _id: old.mediaId, lifecycleStatus: 'attached' }, {
            $set: { lifecycleStatus: 'pending', expiresAt: new Date(Date.now() + RESOURCE_PENDING_TTL) }
          })
        }
      }
      return result
    })
  })
}

/**
 * 校验用户可将文件用于指定场景，阻止跨用户、跨会话和私有资源公开复用。
 * @param {object} media 服务端资源。
 * @param {object} context 用户 ID、允许场景和可选目标 ID。
 * @returns {void} 验证通过。
 * @throws {Error} 文件来源、归属或目标不匹配时返回 403。
 */
export function assertResourceBinding(media, { ownerId, scenes, targetId, allowPublicReuse = false }) {
  if (String(media.uploader) !== String(ownerId) && !(allowPublicReuse && media.accessScope === 'public')) {
    throw resourceError(403, 'RESOURCE_OWNER_REQUIRED', '无权使用此文件')
  }
  if (scenes && !scenes.includes(media.scene) && !(allowPublicReuse && media.accessScope === 'public' && !media.scene)) {
    throw resourceError(403, 'RESOURCE_SCENE_MISMATCH', '文件不适用于当前业务')
  }
  if (targetId && media.sourceTargetId && String(media.sourceTargetId) !== String(targetId)) {
    throw resourceError(403, 'RESOURCE_TARGET_MISMATCH', '文件不属于当前业务对象')
  }
}
