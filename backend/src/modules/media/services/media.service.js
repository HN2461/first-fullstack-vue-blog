import { MediaCategory } from '../models/MediaCategory.js'
import { createResource } from './resourceFile.service.js'
import { resolveResourcePath, removeResourceFile, describeResourcePath } from './resourceStorage.service.js'
import { withResourceLocks } from './resourceLock.service.js'
import { MediaReference } from '../models/MediaReference.js'
import { authorizeResourceRead } from './resourceAccess.service.js'
import { getMediaWorkspaceConditions } from './mediaWorkspaceQuery.service.js'
import fs from 'node:fs/promises'
import path from 'node:path'
import mongoose from 'mongoose'
import { USER_ROLES } from '#constants/domain'
import { Media } from '#modules/media/models/Media.js'
import { WorkLog } from '#modules/workJournal/models/WorkLog.js'
import { resolveLegacyUploadRoot, resolveUploadRoot } from '#utils/uploadPath.js'
import { assertManualMediaCategory, resolveManualMediaCategory, isSystemMediaCategory, assertMediaCategoryExists, ensureDefaultMediaCategory } from './mediaCategory.service.js'
import { getVaultStorageRoot } from './mediaVault.service.js'
import { attachMediaReferenceSummaries, findMediaReferences, getMediaReferenceDetail } from './mediaReference.service.js'
import { findBlockingMediaShares } from '#modules/mediaShare/services/mediaShareReference.service.js'
import { getMediaThumbnailFile, removeMediaThumbnail } from './mediaThumbnail.service.js'

function normalizeMediaCategory(value) {
  const category = String(value || '').trim()
  return category || '默认素材'
}

function canManageAllMedia(actor) {
  return actor?.role === USER_ROLES.SUPER_ADMIN || actor?.isSuperAdmin === true
}

function getMediaAccessQuery(actor) {
  const query = !actor || canManageAllMedia(actor)
    ? {}
    : { uploader: actor._id || actor.id }
  if (!actor || actor?.mediaVaultUnlocked !== true) {
    query.accessScope = { $ne: 'vault' }
  } else if (canManageAllMedia(actor)) {
    query.$or = [
      { accessScope: { $ne: 'vault' } },
      { accessScope: 'vault', uploader: actor._id || actor.id }
    ]
  }
  return query
}

function getMediaListAccessQuery(actor) {
  if (!actor || actor?.mediaVaultUnlocked === true) return getMediaAccessQuery(actor)

  const ownerId = actor._id || actor.id
  if (!ownerId) return getMediaAccessQuery(actor)

  if (canManageAllMedia(actor)) {
    return {
      $or: [
        { accessScope: { $ne: 'vault' } },
        { accessScope: 'vault', uploader: ownerId }
      ]
    }
  }

  return {
    uploader: ownerId,
    accessScope: { $in: ['public', 'private', 'vault'] }
  }
}

function maskLockedVaultMedia(items = [], actor) {
  if (actor?.mediaVaultUnlocked === true) return items
  return items.map((item) => {
    if (item.accessScope !== 'vault') return item
    return {
      ...item,
      originalName: '密码箱文件',
      filename: '',
      mimeType: 'application/octet-stream',
      size: 0,
      url: '',
      storagePath: '',
      kind: 'attachment',
      category: '密码箱',
      fileClass: 'other',
      usage: {
        usageStatus: 'protected',
        usageStatusLabel: '已隐藏',
        referenceCount: 0,
        countByType: {}
      }
    }
  })
}

function normalizeRenamedOriginalName(value, fallbackName = '') {
  const nextName = String(value || '').trim().replace(/\s+/g, ' ')
  if (!nextName) {
    const error = new Error('资源名称不能为空')
    error.statusCode = 400
    error.code = 'MEDIA_RENAME_NAME_REQUIRED'
    throw error
  }

  const nextExt = path.extname(nextName)
  if (nextExt) {
    return nextName
  }

  const fallbackExt = path.extname(String(fallbackName || '').trim())
  return fallbackExt ? `${nextName}${fallbackExt}` : nextName
}

/**
 * 兼容现有文档导入等调用，底层复用统一校验、存储和登记。
 * @param {object} file 服务器接收的文件。
 * @param {object} user 当前用户。
 * @param {object} metadata 分类信息。
 * @returns {Promise<object>} 已登记的媒体信息。
 * @throws {Error} 分类、格式或存储失败时抛出。
 */
export async function createMediaFromFile(file, user, metadata = {}) {
  const media = await createResource(file, user, { scene: 'admin-library', retained: true, ...metadata })
  return media.toSafeJSON()
}

/**
 * 普通上传与分片完成共同使用统一文件服务，固定 ID 保证分片完成幂等。
 * @param {Array<object>} files 待入库临时文件。
 * @param {object} user 上传用户。
 * @param {object} metadata 分类和预分配 ID。
 * @returns {Promise<{items:Array,total:number}>} 登记结果。
 * @throws {Error} 任一文件失败时补偿本批登记和文件，原临时文件由上传入口清理。
 */
export async function createMediaFromFiles(files, user, metadata = {}) {
  const category = await resolveManualMediaCategory(metadata.category, user, metadata.categoryId)
  const created = []
  try {
    for (const [index, file] of files.entries()) {
      created.push(await createResource(file, user, {
        scene: 'admin-library', retained: true, category: category.name, categoryId: category._id,
        accessScope: category.accessMode === 'vault' ? 'vault' : 'public', mediaId: metadata.mediaIds?.[index]
      }))
    }
    // 普通 multipart 的临时文件已经复制入库，不再继续保留；分片原始内容由会话服务管理。
    await Promise.all(files.map((file) => fs.unlink(file.path).catch((error) => { if (error.code !== 'ENOENT') throw error })))
    return { items: created.map((media) => media.toSafeJSON()), total: created.length }
  } catch (error) {
    await Promise.allSettled(created.map(async (media) => {
      await removeResourceFile(media)
      await Media.deleteOne({ _id: media._id })
    }))
    throw error
  }
}

function buildMediaListQuery(options = {}) {
  const { kind, fileClass, keyword, usageStatus } = options
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const query = options.deleted === 'true' || options.scope === 'trash'
    ? { deletedAt: { $exists: true, $ne: null } }
    : { deletedAt: null }
  Object.assign(query, getMediaListAccessQuery(options.actor))
  if (options.resourcePicker) {
    query.accessScope = 'public'
    query.lifecycleStatus = { $nin: ['pending', 'deleting'] }
    query.scene = { $nin: ['feedback-image', 'work-journal-evidence', 'discussion-attachment', 'resume-photo', 'user-avatar'] }
  }
  for (const field of ['scene', 'lifecycleStatus', 'accessScope']) {
    if (!options.resourcePicker && options[field]) query[field] = options[field]
  }

  // 页签只是同一资源库的查询视图，使用交集条件，不能覆盖账号及密码箱的可见范围。
  const workspaceConditions = getMediaWorkspaceConditions(options.workspace, options.actor?._id || options.actor?.id)
  if (workspaceConditions.length) query.$and = [...(query.$and || []), ...workspaceConditions]

  if (kind) {
    query.kind = kind
  }

  if (fileClass) {
    query.fileClass = fileClass
  }

  if (options.categoryId) {
    if (options.category) {
      const legacyCategoryQuery = {
        categoryId: null,
        category: normalizeMediaCategory(options.category)
      }
      if (options.categoryOwner && mongoose.isObjectIdOrHexString(options.categoryOwner)) {
        legacyCategoryQuery.uploader = options.categoryOwner
      }
      query.$and = query.$and || []
      query.$and.push({
        $or: [
          { categoryId: options.categoryId },
          legacyCategoryQuery
        ]
      })
    } else {
      query.categoryId = options.categoryId
    }
  } else if (options.category) {
    query.category = normalizeMediaCategory(options.category)
    // 同名历史分类按上传人区分；该条件只能缩小账号原有的可见范围。
    if (options.categoryOwner && mongoose.isObjectIdOrHexString(options.categoryOwner)) {
      query.$and = [...(query.$and || []), { uploader: options.categoryOwner }]
    }
  }

  if (Array.isArray(options.excludeCategories) && options.excludeCategories.length > 0) {
    const excludedCategories = options.excludeCategories.map((item) => normalizeMediaCategory(item))

    if (query.category) {
      if (excludedCategories.includes(query.category)) {
        return { query: null, page, pageSize, usageStatus }
      }
    } else {
      query.category = { $nin: excludedCategories }
    }
  }

  if (keyword) {
    // 搜索的是文件名和分类文字；方括号等文件名字符不能被当作正则表达式。
    const search = String(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    query.$and = query.$and || []
    query.$and.push({ $or: [
      { originalName: { $regex: search, $options: 'i' } },
      { filename: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ] })
  }

  return { query, page, pageSize, usageStatus }
}

const mediaAggregateObjectIdFields = new Set(['categoryId', 'uploader'])

function castMediaAggregateObjectIds(value, field = '') {
  if (Array.isArray(value)) {
    return value.map((item) => castMediaAggregateObjectIds(item, field))
  }
  if (mediaAggregateObjectIdFields.has(field) && mongoose.isObjectIdOrHexString(value)) {
    return new mongoose.Types.ObjectId(value.toString())
  }
  if (!value || typeof value !== 'object') {
    return value
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    castMediaAggregateObjectIds(item, key.startsWith('$') ? field : key)
  ]))
}

/**
 * 按当前媒体访问范围及列表筛选条件聚合资源类型数量。
 * @param {object} options 兼容媒体列表查询条件，并通过 actor 限定可见资源。
 * @returns {Promise<{byFileClass: object, vaultRecordsPresent: boolean}>} 类型计数和当前筛选范围内的密码箱标记。
 * @throws {Error} 数据库聚合失败时透传 Mongoose 错误；排除条件冲突时返回零计数。
 */
export async function getMediaStatistics(options = {}) {
  const { query } = buildMediaListQuery(options)
  if (!query) {
    return {
      byFileClass: { image: 0, code: 0, document: 0, archive: 0, other: 0 },
      vaultRecordsPresent: false
    }
  }

  const [groups, vaultCount] = await Promise.all([
    Media.aggregate([
      { $match: castMediaAggregateObjectIds(query) },
      { $group: { _id: { $ifNull: ['$fileClass', 'other'] }, count: { $sum: 1 } } }
    ]),
    Media.exists({ ...query, accessScope: 'vault' })
  ])
  const byFileClass = { image: 0, code: 0, document: 0, archive: 0, other: 0 }
  groups.forEach(({ _id, count }) => {
    byFileClass[_id] = count
  })

  return { byFileClass, vaultRecordsPresent: Boolean(vaultCount) }
}

export async function listMedia(options = {}) {
  await ensureDefaultMediaCategory()
  const { query, page, pageSize, usageStatus } = buildMediaListQuery(options)
  if (!query) return { items: [], total: 0, page, pageSize }

  if (usageStatus === 'referenced' || usageStatus === 'unreferenced') {
    const candidates = await Media.find(query).populate('uploader', 'username email role').sort({ createdAt: -1 })
    const enrichedCandidates = await attachMediaReferenceSummaries(candidates)
    const filtered = enrichedCandidates.filter((item) => item.usage?.usageStatus === usageStatus)
    const skip = (page - 1) * pageSize

    return {
      items: maskLockedVaultMedia(filtered.slice(skip, skip + pageSize), options.actor),
      total: filtered.length,
      page,
      pageSize
    }
  }

  const skip = (page - 1) * pageSize

  const [media, total] = await Promise.all([
    Media.find(query)
      .populate('uploader', 'username email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Media.countDocuments(query)
  ])

  const items = maskLockedVaultMedia(await attachMediaReferenceSummaries(media), options.actor)

  return {
    items,
    total,
    page,
    pageSize
  }
}

export async function getMediaReferences(id, actor = null) {
  const media = await Media.findOne({ _id: id, ...getMediaAccessQuery(actor) })
  if (!media) {
    const error = new Error('媒体文件不存在')
    error.statusCode = 404
    error.code = 'MEDIA_NOT_FOUND'
    throw error
  }

  return getMediaReferenceDetail(media)
}

/**
 * 校验访问范围后取得媒体图片的 WebP 缩略图。
 * @param {string|object} id 媒体 ID。
 * @param {object|null} actor 当前登录用户及其密码箱会话状态。
 * @returns {Promise<{media: object, filePath: string, size: number}>} 授权媒体记录、缩略图路径和字节数。
 * @throws {Error} 媒体不存在、不可见或不是图片时抛出对应 HTTP 业务错误。
 */
export async function getMediaThumbnail(id, actor = null) {
  const media = await Media.findOne({ _id: id, deletedAt: null, ...getMediaAccessQuery(actor) }).lean()
  if (!media) {
    const error = new Error('媒体文件不存在')
    error.statusCode = 404
    error.code = 'MEDIA_NOT_FOUND'
    throw error
  }
  if (media.kind !== 'image' || !String(media.mimeType || '').startsWith('image/')) {
    const error = new Error('该资源不是可预览的图片')
    error.statusCode = 415
    error.code = 'MEDIA_THUMBNAIL_UNSUPPORTED'
    throw error
  }

  if (media.accessScope === 'private') await authorizeResourceRead(media, actor)

  const filePath = await getMediaThumbnailFile(media)
  const stats = await fs.stat(filePath)
  return { media, filePath, size: stats.size }
}

export async function getMediaDeleteRisk(ids = [], actor = null) {
  const mediaList = await Media.find({ _id: { $in: ids }, deletedAt: null, ...getMediaAccessQuery(actor) })
    .populate('uploader', 'username email role')
  const items = []

  for (const media of mediaList) {
    const references = await findMediaReferences(media)
    items.push({
      media: media.toSafeJSON(),
      referenceCount: references.length,
      usageStatus: references.length > 0 ? 'referenced' : 'unreferenced',
      references: references.slice(0, 5)
    })
  }

  return {
    items,
    total: items.length,
    referencedCount: items.filter((item) => item.referenceCount > 0).length,
    unreferencedCount: items.filter((item) => item.referenceCount === 0).length
  }
}

export async function renameMedia(id, originalName, actor = null) {
  const media = await Media.findOne({ _id: id, deletedAt: null, ...getMediaAccessQuery(actor) })
  if (!media) {
    const error = new Error('媒体文件不存在')
    error.statusCode = 404
    error.code = 'MEDIA_NOT_FOUND'
    throw error
  }

  media.originalName = normalizeRenamedOriginalName(originalName, media.originalName)
  await media.save()

  return media.toSafeJSON()
}

function getActorId(actor) {
  return actor?._id || actor?.id || actor
}

function isSameOwner(actor, owner) {
  return String(getActorId(actor) || '') === String(owner || '')
}

function assertActorCanUseCategory(category, actor, owner) {
  if (!isSameOwner(actor, owner)) {
    const error = new Error('不能手动调整其他用户资源的分类')
    error.statusCode = 403
    error.code = 'MEDIA_CATEGORY_OWNER_FORBIDDEN'
    throw error
  }
}

export function moveMediaCategory(id, categoryName, actor = null, categoryId = '') {
  return withResourceLocks([id], () => moveMediaCategoryLocked(id, categoryName, actor, categoryId))
}

async function moveMediaCategoryLocked(id, categoryName, actor = null, categoryId = '') {
  const media = await Media.findOne({ _id: id, deletedAt: null, ...getMediaAccessQuery(actor) })
  if (!media) {
    const error = new Error('媒体文件不存在')
    error.statusCode = 404
    error.code = 'MEDIA_NOT_FOUND'
    throw error
  }

  if (media.feedback) {
    throw Object.assign(new Error('反馈截图由意见反馈模块维护，不能迁移分类'), { statusCode: 409, code: 'FEEDBACK_MEDIA_PROTECTED' })
  }
  if (isSystemMediaCategory(media.category) || (media.categoryId && await MediaCategory.exists({ _id: media.categoryId, system: true }))) {
    throw Object.assign(new Error('系统分类中的文件由所属业务维护，不能手动迁移'), { statusCode: 403, code: 'MEDIA_SYSTEM_CATEGORY_READONLY' })
  }
  if (media.workJournalLog || (media.scene && media.scene !== 'admin-library')) {
    throw Object.assign(new Error('此文件由所属业务维护，不能调整业务分类或访问范围'), { statusCode: 409, code: 'RESOURCE_BUSINESS_PROTECTED' })
  }
  const category = await assertMediaCategoryExists(categoryName, media.uploader, categoryId)
  assertManualMediaCategory(category)
  assertActorCanUseCategory(category, actor, media.uploader)
  const nextAccessScope = category.accessMode === 'vault' ? 'vault' : (media.accessScope === 'private' ? 'private' : 'public')
  if (nextAccessScope === 'vault' && actor?.mediaVaultUnlocked !== true) {
    const error = new Error('请先解锁密码箱后再迁移资源')
    error.statusCode = 403
    error.code = 'MEDIA_VAULT_UNLOCK_REQUIRED'
    throw error
  }
  if (media.accessScope === 'vault' && nextAccessScope !== 'vault' && actor?.mediaVaultUnlocked !== true) {
    const error = new Error('请先解锁密码箱后再迁出资源')
    error.statusCode = 403
    error.code = 'MEDIA_VAULT_UNLOCK_REQUIRED'
    throw error
  }
  if (media.accessScope === 'private' && nextAccessScope === 'vault') {
    const error = new Error('工作日志私有凭证不能迁移到密码箱')
    error.statusCode = 409
    error.code = 'MEDIA_PRIVATE_CATEGORY_CONFLICT'
    throw error
  }
  if (media.accessScope !== nextAccessScope) {
    // 文件被业务使用时不能改成密码箱，避免原来的公开内容与读取策略失配。
    await assertMediaHasNoBusinessReferences(media)
    const currentPath = path.resolve(media.storagePath)
    const targetDir = nextAccessScope === 'vault'
      ? path.join(getVaultStorageRoot(), String(media.uploader), String(new Date().getFullYear()), String(new Date().getMonth() + 1).padStart(2, '0'))
      : getUploadSubdir()
    const targetPath = path.join(targetDir, media.filename)
    const currentRoots = getAllowedUploadRoots(media.accessScope === 'private', media.accessScope === 'vault')
    if (!currentRoots.some((root) => isPathInside(root, currentPath))) {
      const error = new Error('资源存储路径无效，已阻止迁移')
      error.statusCode = 409
      error.code = 'MEDIA_STORAGE_PATH_INVALID'
      throw error
    }
    await fs.mkdir(targetDir, { recursive: true })
    await fs.rename(currentPath, targetPath)
    media.storagePath = targetPath.replace(/\\/g, '/')
    if (media.storageKey) Object.assign(media, describeResourcePath(targetPath))
    media.url = nextAccessScope === 'vault' ? `/api/admin/media-downloads/content/${media._id}`
      : media.storageKey ? `/api/resources/${media._id}/content` : `/${media.storagePath.slice(media.storagePath.lastIndexOf('uploads/'))}`
  }
  media.category = category.name
  media.categoryId = category._id
  media.accessScope = nextAccessScope
  await media.save()

  return media.toSafeJSON()
}

export async function moveMediaCategories(ids = [], categoryName, actor = null, categoryId = '') {
  const uniqueIds = [...new Set(ids.map((id) => String(id || '').trim()).filter(Boolean))]
  if (uniqueIds.length === 0) {
    const error = new Error('请选择要迁移的媒体文件')
    error.statusCode = 400
    error.code = 'MEDIA_IDS_REQUIRED'
    throw error
  }

  const query = {
    _id: { $in: uniqueIds },
    deletedAt: null,
    ...getMediaAccessQuery(actor)
  }
  const matchedCount = await Media.countDocuments(query)
  if (matchedCount !== uniqueIds.length) {
    const error = new Error('部分媒体文件不存在、已移入回收站或无权操作，未执行分类迁移')
    error.statusCode = 404
    error.code = 'MEDIA_BATCH_NOT_FOUND'
    throw error
  }

  const mediaList = await Media.find(query).select('uploader category categoryId accessScope scene feedback workJournalLog')
  const ownerIds = [...new Set(mediaList.map((item) => item.uploader.toString()))]
  const requestedCategory = await assertMediaCategoryExists(categoryName, ownerIds[0], categoryId)
  assertManualMediaCategory(requestedCategory)
  // 预检整批资源，禁止先移动部分普通素材再因系统文件失败。
  const systemIds = await MediaCategory.distinct('_id', { system: true })
  const systemIdSet = new Set(systemIds.map(String))
  if (mediaList.some((item) => isSystemMediaCategory(item.category) || systemIdSet.has(String(item.categoryId)) || item.feedback || item.workJournalLog ||
    (item.scene && item.scene !== 'admin-library'))) {
    throw Object.assign(new Error('选择中包含由所属业务维护的文件，未执行分类迁移'), { statusCode: 403, code: 'MEDIA_SYSTEM_CATEGORY_READONLY' })
  }
  ownerIds.forEach((ownerId) => assertActorCanUseCategory(requestedCategory, actor, ownerId))
  if (!requestedCategory.system && ownerIds.length > 1) {
    const error = new Error('跨用户资源只能迁移到系统分类')
    error.statusCode = 400
    error.code = 'MEDIA_CATEGORY_CROSS_OWNER'
    throw error
  }

  let changedCount = 0
  for (const media of mediaList) {
    const previousCategory = media.category || ''
    const previousCategoryId = media.categoryId?.toString?.() || ''
    const previousAccessScope = media.accessScope || 'public'
    const expectedAccessScope = requestedCategory.accessMode === 'vault'
      ? 'vault'
      : previousAccessScope === 'private'
        ? 'private'
        : 'public'
    await moveMediaCategory(media._id, requestedCategory.name, actor, requestedCategory._id)
    if (
      previousCategory !== requestedCategory.name ||
      previousCategoryId !== requestedCategory._id.toString() ||
      previousAccessScope !== expectedAccessScope
    ) {
      changedCount += 1
    }
  }
  return {
    movedCount: matchedCount,
    changedCount,
    category: requestedCategory.name,
    categoryId: requestedCategory._id.toString()
  }
}

export function getUploadSubdir() {
  const date = new Date()
  return path.join(
    resolveUploadRoot(),
    String(date.getFullYear()),
    String(date.getMonth() + 1).padStart(2, '0')
  )
}

function getUploadsRoot() {
  return resolveUploadRoot()
}

function getLegacyUploadsRoot() {
  return resolveLegacyUploadRoot()
}

function getAllowedUploadRoots(includePrivate = false, includeVault = false) {
  const roots = [getUploadsRoot()]
  const legacyRoot = getLegacyUploadsRoot()

  if (legacyRoot !== roots[0]) {
    roots.push(legacyRoot)
  }
  if (includePrivate) roots.push(path.resolve(resolveUploadRoot(), 'work-journal'))
  if (includeVault) roots.push(getVaultStorageRoot())

  return roots
}

export async function getMediaContent(id, actor) {
  const media = await Media.findOne({ _id: id, deletedAt: null, ...getMediaAccessQuery(actor) }).lean()
  if (!media || media.accessScope !== 'vault') {
    const error = new Error('媒体文件不存在')
    error.statusCode = 404
    error.code = 'MEDIA_NOT_FOUND'
    throw error
  }
  const filePath = path.resolve(media.storagePath)
  if (!isPathInside(getVaultStorageRoot(), filePath)) {
    const error = new Error('密码箱文件路径无效')
    error.statusCode = 409
    error.code = 'MEDIA_VAULT_PATH_INVALID'
    throw error
  }
  try {
    const stats = await fs.stat(filePath)
    if (!stats.isFile()) throw new Error('not_file')
    return { media, filePath, size: stats.size }
  } catch (error) {
    if (error.code === 'ENOENT' || error.message === 'not_file') {
      const missing = new Error('媒体文件不存在')
      missing.statusCode = 404
      missing.code = 'MEDIA_FILE_MISSING'
      throw missing
    }
    throw error
  }
}

function isPathInside(parent, target) {
  const relative = path.relative(parent, target)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

function collectCandidateStoragePaths(storagePath, fileUrl = '') {
  const candidates = []
  const addCandidate = (value) => {
    const normalized = String(value || '').trim()
    if (!normalized) {
      return
    }

    const resolved = path.resolve(normalized)
    if (!candidates.includes(resolved)) {
      candidates.push(resolved)
    }
  }

  addCandidate(storagePath)

  const normalizedUrl = String(fileUrl || '').trim()
  if (normalizedUrl.startsWith('/uploads/')) {
    const relativeUploadPath = normalizedUrl.replace(/^\/+/, '').replace(/\//g, path.sep)
    for (const uploadsRoot of getAllowedUploadRoots()) {
      addCandidate(path.join(uploadsRoot, relativeUploadPath.replace(new RegExp(`^uploads\\${path.sep}?`), '')))
    }
  }

  return candidates
}

async function removeStoredFile(storagePath, fileUrl = '', media = null) {
  if (media?.storageKey) return removeResourceFile(media)
  const allowedUploadRoots = getAllowedUploadRoots(media?.accessScope === 'private', media?.accessScope === 'vault')
  const candidates = collectCandidateStoragePaths(storagePath, fileUrl)
  let sawUnsafePath = false

  for (const targetPath of candidates) {
    if (!allowedUploadRoots.some((uploadsRoot) => isPathInside(uploadsRoot, targetPath))) {
      sawUnsafePath = true
      continue
    }

    try {
      await fs.unlink(targetPath)
      return true
    } catch (error) {
      if (error.code === 'ENOENT') {
        continue
      }
      throw error
    }
  }

  if (sawUnsafePath && candidates.length > 0) {
    return false
  }

  return false
}

export function deleteMedia(id, user) {
  return withResourceLocks([id], () => deleteMediaLocked(id, user))
}

async function deleteMediaLocked(id, user) {
  const media = await Media.findOne({ _id: id, deletedAt: null, ...getMediaAccessQuery(user) })
  if (!media) {
    const error = new Error('媒体文件不存在')
    error.statusCode = 404
    error.code = 'MEDIA_NOT_FOUND'
    throw error
  }

  await assertMediaHasNoBusinessReferences(media)

  media.deletedAt = new Date()
  media.deletedBy = user?._id || null
  await media.save()

  return { id, deleted: true, mode: 'soft' }
}

async function assertMediaHasNoBusinessReferences(media) {
  const activeShares = await findBlockingMediaShares(media._id)
  if (activeShares.length > 0) {
    const error = new Error(`该资源仍被 ${activeShares.length} 个有效资源分享引用，不能删除`)
    error.statusCode = 409
    error.code = 'MEDIA_ACTIVE_SHARE_REFERENCE'
    throw error
  }

  const references = (await findMediaReferences(media))
    .filter((reference) => reference.type !== 'resourceShare')
  if (references.length === 0) return

  const error = new Error(`该资源仍被 ${references.length} 处业务引用，不能删除`)
  error.statusCode = 409
  error.code = 'MEDIA_REFERENCED'
  error.details = {
    referenceCount: references.length,
    references: references.slice(0, 10)
  }
  throw error
}

export async function batchDeleteMedia(ids, user) {
  if (!Array.isArray(ids) || ids.length === 0) {
    const error = new Error('请选择要删除的媒体文件')
    error.statusCode = 400
    error.code = 'MEDIA_IDS_REQUIRED'
    throw error
  }

  const mediaList = await Media.find({ _id: { $in: ids }, deletedAt: null, ...getMediaAccessQuery(user) })
  for (const media of mediaList) {
    await assertMediaHasNoBusinessReferences(media)
  }

  let deletedCount = 0
  for (const id of ids) {
    await deleteMedia(id, user)
    deletedCount += 1
  }

  return { deletedCount }
}

export async function restoreMedia(id, actor = null) {
  const media = await Media.findOne({ _id: id, deletedAt: { $exists: true, $ne: null }, ...getMediaAccessQuery(actor) })
  if (!media) {
    const error = new Error('回收站中未找到该媒体文件')
    error.statusCode = 404
    error.code = 'MEDIA_NOT_FOUND'
    throw error
  }

  media.deletedAt = null
  media.deletedBy = null
  await media.save()

  return media.toSafeJSON()
}

export async function batchRestoreMedia(ids, actor = null) {
  if (!Array.isArray(ids) || ids.length === 0) {
    const error = new Error('请选择要恢复的媒体文件')
    error.statusCode = 400
    error.code = 'MEDIA_IDS_REQUIRED'
    throw error
  }

  let restoredCount = 0
  for (const id of ids) {
    await restoreMedia(id, actor)
    restoredCount += 1
  }

  return { restoredCount }
}

export function permanentDeleteMedia(id, actor = null, options = {}) {
  return withResourceLocks([id], () => permanentDeleteMediaLocked(id, actor, options))
}

async function permanentDeleteMediaLocked(id, actor = null, { skipBusinessReferenceCheck = false } = {}) {
  const media = await Media.findOne({ _id: id, ...getMediaAccessQuery(actor) })
  if (!media) {
    const error = new Error('媒体文件不存在')
    error.statusCode = 404
    error.code = 'MEDIA_NOT_FOUND'
    throw error
  }

  const blockingShares = await findBlockingMediaShares(media._id)
  if (blockingShares.length > 0) {
    const error = new Error(`该资源仍被 ${blockingShares.length} 个未撤销分享引用，请先撤销相关分享`)
    error.statusCode = 409
    error.code = 'MEDIA_ACTIVE_SHARE_REFERENCE'
    error.details = {
      shares: blockingShares.map((share) => ({
        id: share._id.toString(),
        name: share.name,
        publicId: share.publicId
      }))
    }
    throw error
  }

  if (!skipBusinessReferenceCheck) {
    await assertMediaHasNoBusinessReferences(media)
  }

  if (media.accessScope === 'private' && !media.storageKey) {
    const privateRoot = path.resolve(resolveUploadRoot(), 'work-journal')
    const privatePath = path.resolve(media.storagePath)
    const relative = path.relative(privateRoot, privatePath)
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
      const error = new Error('工作日志图片存储路径无效，已阻止删除')
      error.statusCode = 409
      error.code = 'MEDIA_PRIVATE_PATH_INVALID'
      throw error
    }
  }

  const fileRemoved = await removeStoredFile(media.storagePath, media.url, media)
  await removeMediaThumbnail(id)

  if (media.workJournalEvidence) {
    await WorkLog.updateOne(
      { _id: media.workJournalLog, 'evidence._id': media.workJournalEvidence },
      { $pull: { evidence: { _id: media.workJournalEvidence } } }
    )
  }

  await MediaReference.deleteMany({ mediaId: id })
  await Media.findByIdAndDelete(id)
  return { id, deleted: true, mode: 'permanent', fileRemoved }
}

export async function permanentlyDeleteWorkJournalMedia(id, actor) {
  const media = await Media.findOne({ _id: id, accessScope: 'private', category: '工作日志', ...getMediaAccessQuery(actor) })
  if (!media) return { deleted: false, fileRemoved: false }
  const blockingShares = await findBlockingMediaShares(media._id)
  if (blockingShares.length > 0) {
    const error = new Error('该工作日志图片仍被未撤销分享引用，请先撤销相关分享')
    error.statusCode = 409
    error.code = 'MEDIA_ACTIVE_SHARE_REFERENCE'
    throw error
  }

  if (media.accessScope === 'private' && !media.storageKey) {
    const privateRoot = path.resolve(resolveUploadRoot(), 'work-journal')
    const privatePath = path.resolve(media.storagePath)
    const relative = path.relative(privateRoot, privatePath)
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
      const error = new Error('工作日志图片存储路径无效，已阻止删除')
      error.statusCode = 409
      error.code = 'MEDIA_PRIVATE_PATH_INVALID'
      throw error
    }
  }
  // 工作日志删除流程负责先移除或级联删除凭证关系，再由此专用入口清理私有文件。
  await MediaReference.deleteMany({ mediaId: media._id, targetType: 'work-log' })
  return permanentDeleteMedia(media._id, actor, { skipBusinessReferenceCheck: true })
}

export async function batchPermanentDeleteMedia(ids, actor = null) {
  if (!Array.isArray(ids) || ids.length === 0) {
    const error = new Error('请选择要彻底删除的媒体文件')
    error.statusCode = 400
    error.code = 'MEDIA_IDS_REQUIRED'
    throw error
  }

  const mediaList = await Media.find({ _id: { $in: ids }, ...getMediaAccessQuery(actor) })
  for (const media of mediaList) {
    const blockingShares = await findBlockingMediaShares(media._id)
    if (blockingShares.length > 0) {
      const error = new Error('所选资源中仍有资源被未撤销分享引用，请先撤销相关分享')
      error.statusCode = 409
      error.code = 'MEDIA_ACTIVE_SHARE_REFERENCE'
      throw error
    }
    await assertMediaHasNoBusinessReferences(media)
  }

  let deletedCount = 0
  let removedFileCount = 0
  for (const id of ids) {
    const result = await permanentDeleteMedia(id, actor)
    deletedCount += 1
    if (result.fileRemoved) {
      removedFileCount += 1
    }
  }

  return { deletedCount, removedFileCount }
}

export async function emptyMediaTrash(actor = null) {
  const mediaList = await Media.find({ deletedAt: { $exists: true, $ne: null }, ...getMediaAccessQuery(actor) })
  for (const media of mediaList) {
    await assertMediaHasNoBusinessReferences(media)
    if ((await findBlockingMediaShares(media._id)).length > 0) {
      const error = new Error('回收站中仍有资源被未撤销分享引用，请先撤销相关分享')
      error.statusCode = 409
      error.code = 'MEDIA_ACTIVE_SHARE_REFERENCE'
      throw error
    }
  }
  let removedFileCount = 0

  let deletedCount = 0
  for (const media of mediaList) {
    const result = await permanentDeleteMedia(media._id, actor)
    deletedCount += 1
    if (result.fileRemoved) removedFileCount += 1
  }

  return {
    deletedCount,
    removedFileCount
  }
}
