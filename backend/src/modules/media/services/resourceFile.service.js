import crypto from 'node:crypto'
import mongoose from 'mongoose'
import { Media } from '../models/Media.js'
import { inferMediaFileClass } from '../constants/mediaUpload.constants.js'
import { getResourceScene, resourceError } from '../constants/resourceScenes.js'
import { assertMediaCategoryExists, resolveManualMediaCategory } from './mediaCategory.service.js'
import { validateResourceFile } from './resourceValidation.service.js'
import { removeResourceFile, writeResourceFile } from './resourceStorage.service.js'
import { invalidateMediaStorageUsageCache } from './mediaStorage.service.js'
import { getSettings } from '#modules/settings/services/setting.service.js'
import { isMediaExtensionAllowed } from '../constants/mediaUpload.constants.js'

export const RESOURCE_PENDING_TTL = 24 * 60 * 60 * 1000

/**
 * 将上传文件校验、存储并登记为资源，各业务无需自行写盘或构造磁盘路径。
 * @param {object} file 接收的文件内容或服务器临时文件。
 * @param {object|string} actor 上传人或用户 ID。
 * @param {object} options 服务端场景、目标业务及受信任元数据；调用方先执行业务授权。
 * @returns {Promise<import('mongoose').Document>} 已登记资源，默认等待业务绑定。
 * @throws {Error} 策略、校验或保存失败时抛出；数据库失败会回收本次写入的文件。
 */
export async function createResource(file, actor, options = {}) {
  const { scene, targetId = '', retained = false, categoryId, category: categoryName, mediaId, accessScope, ...business } = options
  const policy = { ...getResourceScene(scene) }
  if (scene.startsWith('article-') || scene === 'admin-library') {
    const settings = await getSettings()
    policy.maxBytes = Math.min(policy.maxBytes, (Number(settings.mediaMaxFileSizeMB) || 20) * 1024 * 1024)
    if (!isMediaExtensionAllowed(file?.originalname, settings.mediaAllowedExtensions)) {
      throw resourceError(400, 'MEDIA_UPLOAD_EXTENSION_NOT_ALLOWED', '当前上传设置不允许该文件类型')
    }
  }
  const validated = await validateResourceFile(file, policy)
  const owner = actor?._id || actor?.id || actor
  const category = scene === 'admin-library'
    ? await resolveManualMediaCategory(categoryName, actor, categoryId)
    : await assertMediaCategoryExists(categoryName || policy.category, actor, categoryId)
  const scope = accessScope || policy.accessScope
  const id = mediaId || new mongoose.Types.ObjectId()
  const stored = await writeResourceFile(file.buffer || file.path, {
    scene, accessScope: scope, filename: `${crypto.randomUUID()}${validated.extension}`
  })
  try {
    const media = await Media.create({
      ...stored, ...validated,
      _id: id,
      scene,
      sourceTargetId: String(targetId),
      uploader: owner,
      category: category.name,
      categoryId: category._id,
      accessScope: scope,
      kind: validated.mimeType.startsWith('image/') ? 'image' : 'attachment',
      fileClass: inferMediaFileClass(validated.originalName, validated.mimeType),
      url: scope === 'vault' ? `/api/admin/media-downloads/content/${id}` : `/api/resources/${id}/content`,
      lifecycleStatus: retained ? 'retained' : 'pending',
      expiresAt: retained ? null : new Date(Date.now() + RESOURCE_PENDING_TTL),
      // 这些字段只来自服务端适配器，不能把 req.body 直接传给此函数。
      feedback: business.feedback || null,
      workJournalLog: business.workJournalLog || null,
      workJournalEvidence: business.workJournalEvidence || null
    })
    invalidateMediaStorageUsageCache()
    return media
  } catch (error) {
    await removeResourceFile(stored).catch(() => {})
    throw error
  }
}

/**
 * 返回可给业务页面使用的资源描述，磁盘路径和存储键保留在服务端。
 * @param {object} media 已登记文件。
 * @returns {object} 文件 ID、展示信息和受控访问地址。
 * @throws {Error} 无有效记录时返回 404。
 */
export function resourceDescriptor(media) {
  if (!media) throw resourceError(404, 'MEDIA_NOT_FOUND', '文件不存在')
  const result = media.toSafeJSON ? media.toSafeJSON() : { ...media, id: String(media._id || media.id) }
  const { storagePath, storageKey, provider, ...safe } = result
  return { ...safe, mediaId: String(media._id || media.id) }
}
