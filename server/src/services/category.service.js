import crypto from 'node:crypto'
import { Category } from '../models/Category.js'
import { Article } from '../models/Article.js'

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function asciiSlugPart(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function generateAsciiSlug(parts, fallbackInput, maxLength = 70) {
  const normalized = parts
    .flatMap((part) => String(part || '').split('/'))
    .map(asciiSlugPart)
    .filter(Boolean)
    .join('-')
    .replace(/-+/g, '-')
    .slice(0, maxLength)
    .replace(/^-+|-+$/g, '')

  const hash = crypto.createHash('sha256').update(String(fallbackInput || '')).digest('hex').slice(0, 8)
  const fallback = `cat-${hash}`
  const base = normalized || fallback
  const trimmed = base
    .slice(0, Math.max(1, maxLength - hash.length - 1))
    .replace(/^-+|-+$/g, '')

  return `${trimmed || 'cat'}-${hash}`
}

async function ensureUniqueSlug(baseSlug, excludeId = null) {
  let candidate = baseSlug
  let index = 1

  while (true) {
    const query = { slug: candidate }
    if (excludeId) {
      query._id = { $ne: excludeId }
    }

    const exists = await Category.exists(query)
    if (!exists) {
      return candidate
    }

    index += 1
    candidate = `${baseSlug}-${index}`
  }
}

function buildTree(items) {
  const map = new Map(
    items.map((item) => [
      String(item._id),
      {
        ...item.toSafeJSON(),
        children: []
      }
    ])
  )

  const roots = []

  for (const item of items) {
    const node = map.get(String(item._id))
    const parentId = item.parent ? String(item.parent) : null
    const parent = parentId ? map.get(parentId) : null

    if (parent) {
      parent.children.push(node)
      continue
    }

    roots.push(node)
  }

  const sortNodes = (nodes) => {
    return nodes
      .sort((left, right) => {
        const diff = (left.sortOrder || 0) - (right.sortOrder || 0)
        return diff || String(left.name).localeCompare(String(right.name), 'zh-Hans-CN')
      })
      .map((node) => ({
        ...node,
        children: sortNodes(node.children)
      }))
  }

  return sortNodes(roots)
}

async function collectDescendantIds(categoryId) {
  const categories = await Category.find({}, '_id parent').lean()
  const childMap = new Map()

  for (const category of categories) {
    const parentId = category.parent ? String(category.parent) : null
    if (!childMap.has(parentId)) {
      childMap.set(parentId, [])
    }
    childMap.get(parentId).push(String(category._id))
  }

  const resolved = new Set([String(categoryId)])
  const queue = [String(categoryId)]

  while (queue.length > 0) {
    const current = queue.shift()
    const children = childMap.get(current) || []
    for (const childId of children) {
      if (resolved.has(childId)) continue
      resolved.add(childId)
      queue.push(childId)
    }
  }

  return [...resolved]
}

export async function createCategory(input) {
  const rawSlug = String(input.slug || '').trim().toLowerCase()
  const baseSlug = rawSlug || generateAsciiSlug([input.name], input.name, 70)
  const slug = await ensureUniqueSlug(baseSlug)
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

  if (input.slug !== undefined) {
    const rawSlug = String(input.slug || '').trim().toLowerCase()
    const baseSlug = rawSlug || generateAsciiSlug([input.name || category.name], input.name || category.name, 70)
    category.slug = await ensureUniqueSlug(baseSlug, id)
  }

  if (input.name !== undefined) category.name = input.name.trim()
  if (input.description !== undefined) category.description = input.description
  if (input.parent !== undefined) category.parent = input.parent || null
  if (input.sortOrder !== undefined) category.sortOrder = input.sortOrder
  if (input.status !== undefined) category.status = input.status

  await category.save()
  return category.toSafeJSON()
}

export async function listCategoryTree() {
  const categories = await Category.find({}).sort({ sortOrder: 1, createdAt: 1 }).lean()
  return buildTree(categories.map((item) => ({
    ...item,
    toSafeJSON() {
      return {
        id: item._id.toString(),
        name: item.name,
        slug: item.slug,
        description: item.description,
        parent: item.parent ? item.parent.toString() : null,
        sortOrder: item.sortOrder,
        status: item.status,
        articleCount: item.articleCount,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    }
  })))
}

export async function listCategoryArticles(categoryId, options = {}) {
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const skip = (page - 1) * pageSize
  const includeDescendants = String(options.includeDescendants ?? '1') !== '0'

  const categoryIds = includeDescendants
    ? await collectDescendantIds(categoryId)
    : [String(categoryId)]

  const query = {
    deletedAt: null,
    category: { $in: categoryIds }
  }

  const [items, total] = await Promise.all([
    Article.find(query)
      .populate('category')
      .populate('tags')
      .populate('createdBy', 'username avatar role')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Article.countDocuments(query)
  ])

  return {
    items: items.map((article) => article.toSafeJSON()),
    total,
    page,
    pageSize
  }
}

export async function moveArticleCategory(articleId, targetCategoryId) {
  const article = await Article.findOne({ _id: articleId, deletedAt: null })
  if (!article) {
    throw createHttpError(404, 'ARTICLE_NOT_FOUND', '文章不存在')
  }

  const targetCategory = await Category.findById(targetCategoryId)
  if (!targetCategory) {
    throw createHttpError(404, 'CATEGORY_NOT_FOUND', '目标分类不存在')
  }

  article.category = targetCategory._id
  await article.save()

  return article.toSafeJSON()
}

export async function moveCategoryBranch(categoryId, targetParentId) {
  const category = await Category.findById(categoryId)
  if (!category) {
    throw createHttpError(404, 'CATEGORY_NOT_FOUND', '分类不存在')
  }

  if (String(category._id) === String(targetParentId)) {
    throw createHttpError(400, 'CATEGORY_MOVE_INVALID', '不能把分类移动到自身下')
  }

  if (targetParentId) {
    const targetParent = await Category.findById(targetParentId)
    if (!targetParent) {
      throw createHttpError(404, 'CATEGORY_NOT_FOUND', '目标父级分类不存在')
    }

    const descendantIds = await collectDescendantIds(category._id)
    if (descendantIds.includes(String(targetParent._id))) {
      throw createHttpError(400, 'CATEGORY_MOVE_INVALID', '不能把分类移动到自己的子级下')
    }
  }

  category.parent = targetParentId || null
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
