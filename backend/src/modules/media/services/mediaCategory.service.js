import { MediaCategory } from '#modules/media/models/MediaCategory.js'
import { Media } from '#modules/media/models/Media.js'

export const SYSTEM_MEDIA_CATEGORIES = Object.freeze([
  {
    name: '默认素材',
    description: '系统默认资源分类',
    sortOrder: 0
  },
  {
    name: '文章封面',
    description: '文章封面专用资源分类',
    sortOrder: 1
  },
  {
    name: '文章正文图片',
    description: '文章正文中已保存引用的图片资源',
    sortOrder: 2
  },
  {
    name: '文章正文临时图片',
    description: '编辑器粘贴或插入但尚未绑定文章的正文图片',
    sortOrder: 3
  },
  {
    name: '文章原始文档',
    description: '通过文档导入创建的原始附件，供文章下载和内容转换使用',
    sortOrder: 4
  },
  {
    name: '文章快照原始文档',
    description: '本地文章快照同步生成的原始附件，保留文章来源与阅读关联',
    sortOrder: 5
  },
  {
    name: '历史未登记资源',
    description: '服务器上传目录中扫描并补登记的历史资源',
    sortOrder: 6
  }
])

export function isSystemMediaCategory(name) {
  return SYSTEM_MEDIA_CATEGORIES.some((item) => item.name === name)
}

function getActorId(actor) {
  return actor?._id || actor?.id || null
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

export async function ensureDefaultMediaCategory() {
  const [defaultCategory] = await Promise.all(SYSTEM_MEDIA_CATEGORIES.map(async (item) => {
    const exists = await MediaCategory.findOne({ name: item.name, system: true })
    if (exists) {
      if (exists.owner || exists.description !== item.description || exists.sortOrder !== item.sortOrder) {
        exists.owner = null
        exists.description = item.description
        exists.sortOrder = item.sortOrder
        await exists.save()
      }
      return exists
    }

    return MediaCategory.create({ ...item, owner: null, system: true })
  }))

  return defaultCategory
}

export async function listMediaCategoryEntities(actor) {
  await ensureDefaultMediaCategory()
  const actorId = getActorId(actor)
  return MediaCategory.find({
    $or: [
      { system: true },
      ...(actorId ? [{ system: false, owner: actorId }] : [])
    ]
  }).sort({ system: -1, sortOrder: 1, createdAt: 1 })
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

export async function listMediaCategories(actor) {
  const actorId = getActorId(actor)
  const entities = await listMediaCategoryEntities(actor)
  const counts = await Media.aggregate([
    ...(actorId ? [{ $match: { uploader: actorId, deletedAt: null } }] : []),
    {
      $group: {
        _id: {
          categoryId: '$categoryId',
          name: { $ifNull: ['$category', '默认素材'] }
        },
        count: { $sum: 1 }
      }
    }
  ])
  const countById = new Map(counts
    .filter((item) => item._id.categoryId)
    .map((item) => [item._id.categoryId.toString(), item.count]))
  const legacyCountByName = new Map(counts
    .filter((item) => !item._id.categoryId)
    .map((item) => [item._id.name, item.count]))

  return entities.map((item) => ({
    ...item.toSafeJSON(),
    count: (countById.get(item._id.toString()) || 0) + (legacyCountByName.get(item.name) || 0)
  }))
}

export async function createMediaCategory(input, actor) {
  const name = normalizeCategoryName(input.name)
  if (!name) {
    throw createHttpError(400, 'MEDIA_CATEGORY_NAME_REQUIRED', '分类名称不能为空')
  }
  if (isSystemMediaCategory(name)) {
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

  const defaultCategory = await assertMediaCategoryExists('默认素材', actor)
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
