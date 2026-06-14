import { MediaCategory } from '../models/MediaCategory.js'
import { Media } from '../models/Media.js'

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
  const defaultName = '默认素材'
  const exists = await MediaCategory.findOne({ name: defaultName })
  if (exists) {
    return exists
  }

  return MediaCategory.create({
    name: defaultName,
    description: '系统默认资源分类',
    sortOrder: 0
  })
}

export async function listMediaCategoryEntities() {
  await ensureDefaultMediaCategory()
  return MediaCategory.find().sort({ sortOrder: 1, createdAt: 1 })
}

export async function listMediaCategories() {
  const entities = await listMediaCategoryEntities()
  const counts = await Media.aggregate([
    {
      $group: {
        _id: { $ifNull: ['$category', '默认素材'] },
        count: { $sum: 1 }
      }
    }
  ])
  const countMap = new Map(counts.map((item) => [item._id, item.count]))

  return entities.map((item) => ({
    ...item.toSafeJSON(),
    count: countMap.get(item.name) || 0
  }))
}

export async function createMediaCategory(input) {
  const name = normalizeCategoryName(input.name)
  if (!name) {
    throw createHttpError(400, 'MEDIA_CATEGORY_NAME_REQUIRED', '分类名称不能为空')
  }

  const exists = await MediaCategory.exists({ name })
  if (exists) {
    throw createHttpError(409, 'MEDIA_CATEGORY_EXISTS', '资源分类已存在')
  }

  const category = await MediaCategory.create({
    name,
    description: String(input.description || '').trim(),
    sortOrder: Number.isFinite(Number(input.sortOrder)) ? Number(input.sortOrder) : 0
  })

  return category.toSafeJSON()
}

export async function updateMediaCategory(id, input) {
  const category = await MediaCategory.findById(id)
  if (!category) {
    throw createHttpError(404, 'MEDIA_CATEGORY_NOT_FOUND', '资源分类不存在')
  }

  if (input.name !== undefined) {
    const nextName = normalizeCategoryName(input.name)
    if (!nextName) {
      throw createHttpError(400, 'MEDIA_CATEGORY_NAME_REQUIRED', '分类名称不能为空')
    }

    const exists = await MediaCategory.exists({ name: nextName, _id: { $ne: id } })
    if (exists) {
      throw createHttpError(409, 'MEDIA_CATEGORY_EXISTS', '资源分类已存在')
    }

    if (category.name !== nextName) {
      await Media.updateMany({ category: category.name }, { $set: { category: nextName } })
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

export async function deleteMediaCategory(id) {
  const category = await MediaCategory.findById(id)
  if (!category) {
    throw createHttpError(404, 'MEDIA_CATEGORY_NOT_FOUND', '资源分类不存在')
  }

  if (category.name === '默认素材') {
    throw createHttpError(400, 'MEDIA_CATEGORY_RESERVED', '默认素材分类不可删除')
  }

  await Media.updateMany({ category: category.name }, { $set: { category: '默认素材' } })
  await MediaCategory.findByIdAndDelete(id)

  return { id, deleted: true }
}
