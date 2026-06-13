import { Tag } from '../models/Tag.js'

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

export async function createTag(input) {
  const slug = input.slug.trim().toLowerCase()
  const exists = await Tag.exists({ slug })

  if (exists) {
    throw createHttpError(409, 'TAG_SLUG_EXISTS', '标签 slug 已存在')
  }

  const tag = await Tag.create({
    name: input.name.trim(),
    slug,
    description: input.description || '',
    color: input.color || '#2852b8',
    sortOrder: input.sortOrder || 0,
    status: input.status || 'active'
  })

  return tag.toSafeJSON()
}

export async function listTags(options = {}) {
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 50))
  const skip = (page - 1) * pageSize

  const [tags, total] = await Promise.all([
    Tag.find()
      .sort({ articleCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Tag.countDocuments()
  ])

  return {
    items: tags.map((tag) => tag.toSafeJSON()),
    total,
    page,
    pageSize
  }
}

export async function updateTag(id, input) {
  const tag = await Tag.findById(id)
  if (!tag) {
    throw createHttpError(404, 'TAG_NOT_FOUND', '标签不存在')
  }

  if (input.slug) {
    const slug = input.slug.trim().toLowerCase()
    const exists = await Tag.exists({ slug, _id: { $ne: id } })
    if (exists) {
      throw createHttpError(409, 'TAG_SLUG_EXISTS', '标签 slug 已存在')
    }
    tag.slug = slug
  }

  if (input.name !== undefined) tag.name = input.name.trim()
  if (input.description !== undefined) tag.description = input.description
  if (input.color !== undefined) tag.color = input.color
  if (input.sortOrder !== undefined) tag.sortOrder = input.sortOrder
  if (input.status !== undefined) tag.status = input.status

  await tag.save()
  return tag.toSafeJSON()
}

export async function deleteTag(id) {
  const tag = await Tag.findById(id)
  if (!tag) {
    throw createHttpError(404, 'TAG_NOT_FOUND', '标签不存在')
  }

  await Tag.findByIdAndDelete(id)
  return { id, deleted: true }
}
