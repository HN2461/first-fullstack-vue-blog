import mongoose from 'mongoose'
import { USER_ROLES } from '#constants/domain'
import { MediaCategory } from '#modules/media/models/MediaCategory.js'
import { Media } from '#modules/media/models/Media.js'
import { User } from '#modules/user/models/User.js'
import { getMediaWorkspaceConditions } from './mediaWorkspaceQuery.service.js'

import { SYSTEM_MEDIA_CATEGORIES, isSystemMediaCategory } from '../constants/mediaCategories.js'
export { SYSTEM_MEDIA_CATEGORIES, isSystemMediaCategory } from '../constants/mediaCategories.js'

function getActorId(actor) {
  if (mongoose.isObjectIdOrHexString(actor)) return actor
  return actor?._id || actor?.id || null
}

function canManageAllMediaCategories(actor) {
  return actor?.role === USER_ROLES.SUPER_ADMIN || actor?.isSuperAdmin === true
}

function getLegacyCategoryKey(owner, name) {
  return JSON.stringify([owner || 'system', name])
}

function getLegacyCategoryId(owner, name) {
  return `legacy:${owner || 'system'}:${encodeURIComponent(name)}`
}

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function normalizeCategoryName(name) {
  return String(name || '').trim()
}

export async function ensureUserVaultCategory(owner) {
  const ownerId = getActorId(owner)
  if (!ownerId) throw createHttpError(401, 'MEDIA_CATEGORY_OWNER_REQUIRED', '请先登录后再使用密码箱')
  const existing = await MediaCategory.findOne({
    owner: ownerId,
    $or: [{ builtinKey: 'vault' }, { name: '密码箱' }]
  })
  return MediaCategory.findOneAndUpdate(
    existing ? { _id: existing._id } : { owner: ownerId, builtinKey: 'vault' },
    {
      $set: {
        name: '密码箱',
        owner: ownerId,
        system: false,
        builtinKey: 'vault',
        accessMode: 'vault',
        description: '需要密码验证后才能访问的私有资源空间',
        sortOrder: 0
      }
    },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  )
}

export async function ensureDefaultMediaCategory() {
  const [defaultCategory] = await Promise.all(SYSTEM_MEDIA_CATEGORIES.map(async (item) => {
    return MediaCategory.findOneAndUpdate(
      { name: item.name, owner: null },
      { $set: { ...item, owner: null, system: true } },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    )
  }))

  return defaultCategory
}

export async function listMediaCategoryEntities(actor, options = {}) {
  await ensureDefaultMediaCategory()
  const actorId = getActorId(actor)
  // 密码箱是每个账号固定拥有的内置入口。首次打开资源管理页时就创建分类，
  // 这样用户可以直接看到密码箱并完成首次设置，而不需要先调用密码箱状态接口。
  if (actorId) await ensureUserVaultCategory(actorId)
  const includeAllOwners = options.scope === 'all' && canManageAllMediaCategories(actor)
  const ownerFilters = includeAllOwners
    ? [{ system: false }]
    : actorId
      ? [{ system: false, owner: actorId }]
      : []
  const categoryQuery = {
    $and: [{
      $or: [
        { system: true },
        ...ownerFilters
      ]
    }]
  }
  if (actorId) {
    categoryQuery.$and.push({
      $or: [
        { accessMode: { $ne: 'vault' } },
        // 密码箱入口始终可见；未解锁时仍隐藏文件详情，避免用户无法完成首次设置或解锁。
        { accessMode: 'vault', owner: actorId }
      ]
    })
  }
  const query = MediaCategory.find(categoryQuery)
  if (includeAllOwners) query.populate('owner', 'username email')
  return query.sort({ system: -1, sortOrder: 1, createdAt: 1 })
}

export async function assertMediaCategoryExists(name, actor, categoryId = '') {
  const normalizedName = normalizeCategoryName(name)
  if (!normalizedName && !categoryId) {
    throw createHttpError(400, 'MEDIA_CATEGORY_NAME_REQUIRED', '目标资源分类不能为空')
  }

  await ensureDefaultMediaCategory()
  const actorId = getActorId(actor)
  const category = categoryId
    ? await MediaCategory.findOne({
        _id: categoryId,
        $or: [
          { system: true },
          { system: false, owner: actorId }
        ]
      })
    : await MediaCategory.findOne(isSystemMediaCategory(normalizedName)
        ? { name: normalizedName, system: true }
        : { name: normalizedName, system: false, owner: actorId })
  if (!category) {
    throw createHttpError(404, 'MEDIA_CATEGORY_NOT_FOUND', '目标资源分类不存在，请先在分类管理中创建')
  }

  return category
}

/**
 * 校验资源后台的手动写入目标，系统分类只由所属业务写入。
 * @param {object} category 已解析的分类实体。
 * @returns {void} 普通分类或本人密码箱可继续操作。
 * @throws {Error} 系统分类返回 403，包含默认素材等历史系统库存。
 */
export function assertManualMediaCategory(category) {
  if (category.system || isSystemMediaCategory(category.name)) {
    throw createHttpError(403, 'MEDIA_SYSTEM_CATEGORY_READONLY', '系统分类由所属业务维护，请到对应业务上传或修改')
  }
}

/**
 * 为未指定分类的素材上传提供个人收件分类，避免新素材写入历史系统分类。
 * @param {string} name 显式分类名称，可为空。
 * @param {object} actor 已认证的上传人。
 * @param {string} categoryId 显式分类编号，可为空。
 * @returns {Promise<object>} 允许手动上传的分类实体。
 * @throws {Error} 无账号、无归属权限或显式选择系统分类时拒绝。
 */
export async function resolveManualMediaCategory(name, actor, categoryId = '') {
  if (name || categoryId) {
    const category = await assertMediaCategoryExists(name, actor, categoryId)
    assertManualMediaCategory(category)
    return category
  }
  const owner = getActorId(actor)
  if (!owner) throw createHttpError(401, 'MEDIA_CATEGORY_OWNER_REQUIRED', '请先登录')
  return MediaCategory.findOneAndUpdate(
    { owner, name: '未分类' },
    { $setOnInsert: { system: false, description: '尚未整理到其他自建分类的素材' } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  )
}

export async function listMediaCategories(actor, options = {}) {
  const actorId = getActorId(actor)
  const includeAllOwners = options.scope === 'all' && canManageAllMediaCategories(actor)
  const entities = await listMediaCategoryEntities(actor, options)
  const mediaMatch = includeAllOwners || !actorId ? {} : { uploader: actorId }
  // 密码箱的资源详情在未解锁时仍由媒体列表脱敏返回，因此分类数量也应保持一致。
  // 只统计当前账号自己的密码箱，避免超级管理员查看全部分类时泄露其他账号的资源数量。
  const vaultMatch = actorId
    ? { $or: [{ accessScope: { $ne: 'vault' } }, { accessScope: 'vault', uploader: actorId }] }
    : { accessScope: { $ne: 'vault' } }
  const workspaceConditions = getMediaWorkspaceConditions(options.workspace, actorId)
  const counts = await Media.aggregate([
    { $match: { ...mediaMatch, deletedAt: null, ...vaultMatch,
      ...(workspaceConditions.length ? { $and: workspaceConditions } : {}) } },
    {
      $group: {
        _id: {
          categoryId: '$categoryId',
          name: { $ifNull: ['$category', '默认素材'] },
          owner: '$uploader'
        },
        count: { $sum: 1 }
      }
    }
  ])
  const countById = new Map()
  const legacyCountByOwnerName = new Map()
  // 系统分类可以被多个账号共用，聚合按上传人分组后的各项必须累加。
  for (const item of counts) {
    if (item._id.categoryId) {
      const key = String(item._id.categoryId)
      countById.set(key, (countById.get(key) || 0) + item.count)
    } else {
      const key = getLegacyCategoryKey(isSystemMediaCategory(item._id.name) ? 'system' : item._id.owner, item._id.name)
      legacyCountByOwnerName.set(key, (legacyCountByOwnerName.get(key) || 0) + item.count)
    }
  }

  const legacyOwnerIds = [...legacyCountByOwnerName.keys()]
    .map((key) => JSON.parse(key)[0])
    .filter((owner) => owner !== 'system' && mongoose.isObjectIdOrHexString(owner))
  const legacyOwners = legacyOwnerIds.length
    ? await User.find({ _id: { $in: legacyOwnerIds } }).select('username email').lean()
    : []
  const legacyOwnerNameById = new Map(legacyOwners.map((owner) => [
    owner._id.toString(),
    owner.username || owner.email || ''
  ]))

  const result = entities.map((item) => {
    const safeCategory = item.toSafeJSON()
    const categoryOwner = item.owner?._id?.toString?.() || safeCategory.owner || null
    return {
      ...safeCategory,
      owner: categoryOwner,
      ownerName: item.owner?.username || item.owner?.email || '',
      count: (countById.get(item._id.toString()) || 0) + (
        legacyCountByOwnerName.get(getLegacyCategoryKey(item.system ? 'system' : categoryOwner, item.name)) || 0
      )
    }
  })

  for (const [ownerName, count] of legacyCountByOwnerName) {
    const [ownerId, name] = JSON.parse(ownerName)
    if (!result.some((item) => (
      item.name === name && String(item.owner || 'system') === ownerId
    ))) {
      result.push({
        id: getLegacyCategoryId(ownerId === 'system' ? null : ownerId, name),
        name,
        owner: ownerId === 'system' ? null : ownerId,
        ownerName: legacyOwnerNameById.get(ownerId) || '',
        system: isSystemMediaCategory(name),
        virtual: true,
        description: '当前账号历史资源使用的分类，尚未完成分类关联。',
        sortOrder: 999,
        count
      })
    }
  }

  return result
}

export async function createMediaCategory(input, actor) {
  const name = normalizeCategoryName(input.name)
  if (!name) {
    throw createHttpError(400, 'MEDIA_CATEGORY_NAME_REQUIRED', '分类名称不能为空')
  }
  if (isSystemMediaCategory(name) || name === '密码箱') {
    throw createHttpError(409, 'MEDIA_CATEGORY_RESERVED', '该名称属于系统资源分类')
  }

  const owner = getActorId(actor)
  if (!owner) {
    throw createHttpError(401, 'MEDIA_CATEGORY_OWNER_REQUIRED', '请先登录后再创建资源分类')
  }

  const exists = await MediaCategory.exists({ name, owner, system: false })
  if (exists) {
    throw createHttpError(409, 'MEDIA_CATEGORY_EXISTS', '资源分类已存在')
  }

  const category = await MediaCategory.create({
    name,
    owner,
    system: false,
    description: String(input.description || '').trim(),
    sortOrder: Number.isFinite(Number(input.sortOrder)) ? Number(input.sortOrder) : 0
  })

  return category.toSafeJSON()
}

export async function updateMediaCategory(id, input, actor) {
  const owner = getActorId(actor)
  const category = await MediaCategory.findOne({ _id: id, owner, system: false })
  if (!category) {
    throw createHttpError(404, 'MEDIA_CATEGORY_NOT_FOUND', '资源分类不存在')
  }
  if (category.accessMode === 'vault' || category.builtinKey === 'vault') {
    throw createHttpError(403, 'MEDIA_VAULT_CATEGORY_IMMUTABLE', '密码箱是内置分类，不能修改')
  }

  if (input.name !== undefined) {
    const nextName = normalizeCategoryName(input.name)
    if (!nextName) {
      throw createHttpError(400, 'MEDIA_CATEGORY_NAME_REQUIRED', '分类名称不能为空')
    }

    if (isSystemMediaCategory(nextName)) {
      throw createHttpError(409, 'MEDIA_CATEGORY_RESERVED', '该名称属于系统资源分类')
    }

    const exists = await MediaCategory.exists({ name: nextName, owner, system: false, _id: { $ne: id } })
    if (exists) {
      throw createHttpError(409, 'MEDIA_CATEGORY_EXISTS', '资源分类已存在')
    }

    if (category.name !== nextName) {
      await Media.updateMany({
        uploader: owner,
        $or: [
          { categoryId: category._id },
          { categoryId: null, category: category.name }
        ]
      }, {
        $set: { category: nextName, categoryId: category._id }
      })
    }

    category.name = nextName
  }

  if (input.description !== undefined) {
    category.description = String(input.description || '').trim()
  }

  if (input.sortOrder !== undefined) {
    category.sortOrder = Number.isFinite(Number(input.sortOrder)) ? Number(input.sortOrder) : 0
  }

  await category.save()
  return category.toSafeJSON()
}

export async function deleteMediaCategory(id, actor) {
  const owner = getActorId(actor)
  const category = await MediaCategory.findOne({ _id: id, owner, system: false })
  if (!category) {
    throw createHttpError(404, 'MEDIA_CATEGORY_NOT_FOUND', '资源分类不存在')
  }
  if (category.accessMode === 'vault' || category.builtinKey === 'vault') {
    throw createHttpError(403, 'MEDIA_VAULT_CATEGORY_IMMUTABLE', '密码箱是内置分类，不能删除')
  }

  const resources = { uploader: owner, $or: [{ categoryId: category._id }, { categoryId: null, category: category.name }] }
  const hasResources = await Media.exists(resources)
  if (category.name === '未分类' && hasResources) {
    throw createHttpError(409, 'MEDIA_DEFAULT_CATEGORY_NOT_EMPTY', '请先移走未分类中的文件，再删除这个分类')
  }
  if (!hasResources) {
    await MediaCategory.findByIdAndDelete(id)
    return { id, deleted: true }
  }
  const defaultCategory = await resolveManualMediaCategory('', actor)
  await Media.updateMany({
    uploader: owner,
    $or: [
      { categoryId: category._id },
      { categoryId: null, category: category.name }
    ]
  }, {
    $set: { category: defaultCategory.name, categoryId: defaultCategory._id }
  })
  await MediaCategory.findByIdAndDelete(id)

  return { id, deleted: true }
}
