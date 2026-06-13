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

export async function listCategories() {
  const categories = await Category.find()
    .sort({ sortOrder: 1, createdAt: -1 })

  return categories.map((category) => category.toSafeJSON())
}
