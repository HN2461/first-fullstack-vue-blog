import { Category } from '../models/Category.js'

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

export async function createCategory(input) {
  const slug = input.slug.trim().toLowerCase()
  const exists = await Category.exists({ slug })

  if (exists) {
    throw createHttpError(409, 'CATEGORY_SLUG_EXISTS', '分类 slug 已存在')
  }

  const category = await Category.create({
    name: input.name.trim(),
    slug,
    description: input.description || '',
    parent: input.parent || null,
    sortOrder: input.sortOrder || 0,
    status: input.status || 'active'
  })

  return category.toSafeJSON()
}

export async function listCategories(options = {}) {
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 50))
  const skip = (page - 1) * pageSize

  const [categories, total] = await Promise.all([
    Category.find()
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Category.countDocuments()
  ])

  return {
    items: categories.map((category) => category.toSafeJSON()),
    total,
    page,
    pageSize
  }
}

export async function updateCategory(id, input) {
  const category = await Category.findById(id)
  if (!category) {
    throw createHttpError(404, 'CATEGORY_NOT_FOUND', '分类不存在')
  }

  if (input.slug) {
    const slug = input.slug.trim().toLowerCase()
    const exists = await Category.exists({ slug, _id: { $ne: id } })
    if (exists) {
      throw createHttpError(409, 'CATEGORY_SLUG_EXISTS', '分类 slug 已存在')
    }
    category.slug = slug
  }

  if (input.name !== undefined) category.name = input.name.trim()
  if (input.description !== undefined) category.description = input.description
  if (input.parent !== undefined) category.parent = input.parent || null
  if (input.sortOrder !== undefined) category.sortOrder = input.sortOrder
  if (input.status !== undefined) category.status = input.status

  await category.save()
  return category.toSafeJSON()
}

export async function deleteCategory(id) {
  const category = await Category.findById(id)
  if (!category) {
    throw createHttpError(404, 'CATEGORY_NOT_FOUND', '分类不存在')
  }

  await Category.findByIdAndDelete(id)
  return { id, deleted: true }
}
