import { User } from '../models/User.js'
import { createResource } from '#modules/media/services/resourceFile.service.js'
import { saveResourceBindings } from '#modules/media/services/resourceBinding.service.js'

/**
 * 保存当前用户头像并替换引用，旧头像延期清理以保护其他业务仍在使用的文件。
 * @param {object} actor 已认证用户。
 * @param {object|null} file 上传文件，null 表示移除头像。
 * @returns {Promise<object>} 更新后的用户。
 * @throws {Error} 图片无效或数据库保存失败时抛出；失败的新文件保留为待绑定资源供清理。
 */
export async function saveAvatarResource(actor, file) {
  const media = file ? await createResource(file, actor, { scene: 'user-avatar', targetId: actor._id }) : null
  return saveResourceBindings({ targetType: 'user', targetId: actor._id, field: 'avatar', ownerId: actor._id, mediaIds: media ? [media._id] : [] }, () =>
    User.findByIdAndUpdate(actor._id, { $set: { avatar: media?.url || '', avatarMediaId: media?._id || null } }, { returnDocument: 'after' })
  )
}
