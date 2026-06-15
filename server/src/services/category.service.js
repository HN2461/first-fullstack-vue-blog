import crypto from 'node:crypto'
import { Category } from '../models/Category.js'
import { Article } from '../models/Article.js'
import { adjustCategoryArticleCount } from './article.service.js'

export const SYSTEM_UNCATEGORIZED_CATEGORY = Object.freeze({
  name: '默认分类',
  slug: 'uncategorized',
  description: '系统兜底分类，删除分类时内容自动转入这里',
  sortOrder: -9999,
  status: 'active',
  isSystem: true
})

const LEGACY_UNCATEGORIZED_NAME = '未分类'

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

function isReservedCategoryIdentity({ name, slug } = {}) {
  const normalizedName = String(name || '').trim()
  const normalizedSlug = String(slug || '').trim().toLowerCase()
  return normalizedName === SYSTEM_UNCATEGORIZED_CATEGORY.name ||
    normalizedName === LEGACY_UNCATEGORIZED_NAME ||
    normalizedSlug === SYSTEM_UNCATEGORIZED_CATEGORY.slug
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
        const systemDiff = Number(!!right.isSystem) - Number(!!left.isSystem)
        if (systemDiff) return systemDiff
        const diff = (left.sortOrder || 0) - (right.sortOrder || 0)
        return diff || String(left.name).localeCompare(String(right.name), 'zh-Hans-CN')
      })
      .map((node) => {
        const children = sortNodes(node.children)
        const directArticleCount = Number(node.articleCount) || 0
        const unassignedArticleCount = Number(node.unassignedArticleCount) || 0
        const branchArticleCount = children.reduce((sum, child) => sum + (Number(child.branchArticleCount) || 0), directArticleCount + unassignedArticleCount)

        return {
          ...node,
          directArticleCount,
          branchArticleCount,
          children
        }
      })
  }

  return sortNodes(roots)
}

async function getLiveCategoryArticleCounts() {
  const rows = await Article.aggregate([
    { $match: { deletedAt: null } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ])

  const directCountMap = new Map()
  let unassignedCount = 0

  for (const row of rows) {
    if (!row._id) {
      unassignedCount += row.count
      continue
    }

    directCountMap.set(String(row._id), row.count)
  }

  return {
    directCountMap,
    unassignedCount
  }
}

async function ensureUncategorizedCategory() {
  const existing = await Category.findOne({ slug: SYSTEM_UNCATEGORIZED_CATEGORY.slug })

  if (existing) {
    let touched = false
    if (existing.name !== SYSTEM_UNCATEGORIZED_CATEGORY.name) {
      existing.name = SYSTEM_UNCATEGORIZED_CATEGORY.name
      touched = true
    }
    if (existing.description !== SYSTEM_UNCATEGORIZED_CATEGORY.description) {
      existing.description = SYSTEM_UNCATEGORIZED_CATEGORY.description
      touched = true
    }
    if (existing.sortOrder !== SYSTEM_UNCATEGORIZED_CATEGORY.sortOrder) {
      existing.sortOrder = SYSTEM_UNCATEGORIZED_CATEGORY.sortOrder
      touched = true
    }
    if (existing.status !== SYSTEM_UNCATEGORIZED_CATEGORY.status) {
      existing.status = SYSTEM_UNCATEGORIZED_CATEGORY.status
      touched = true
    }
    if (existing.isSystem !== true) {
      existing.isSystem = true
      touched = true
    }

    if (touched) {
      await existing.save()
    }

    return existing
  }

  return Category.create(SYSTEM_UNCATEGORIZED_CATEGORY)
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

async function assertParentExists(parentId) {
  if (!parentId) {
    return
  }

  const parent = await Category.findById(parentId)
  if (!parent) {
    throw createHttpError(404, 'CATEGORY_NOT_FOUND', '父级分类不存在')
  }
}

async function assertParentIsEditable(parentId) {
  if (!parentId) {
    return
  }

  const parent = await Category.findById(parentId)
  if (parent?.isSystem) {
    throw createHttpError(400, 'CATEGORY_RESERVED', '系统保留分类不能作为父级分类')
  }
}

async function assertValidParentForCategory(categoryId, parentId) {
  if (!parentId) {
    return
  }

  if (String(categoryId) === String(parentId)) {
    throw createHttpError(400, 'CATEGORY_MOVE_INVALID', '不能把分类移动到自身下')
  }

  await assertParentExists(parentId)
  await assertParentIsEditable(parentId)

  const descendantIds = await collectDescendantIds(categoryId)
  if (descendantIds.includes(String(parentId))) {
    throw createHttpError(400, 'CATEGORY_MOVE_INVALID', '不能把分类移动到自己的子级下')
  }
}

export async function createCategory(input) {
  if (isReservedCategoryIdentity(input)) {
    throw createHttpError(400, 'CATEGORY_RESERVED', '默认分类为系统保留分类，不能重复创建')
  }

  await assertParentExists(input.parent)
  await assertParentIsEditable(input.parent)

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
    status: input.status || 'active',
    isSystem: false
  })

  return category.toSafeJSON()
}

export async function listCategories(options = {}) {
  await ensureUncategorizedCategory()
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 50))
  const skip = (page - 1) * pageSize

  const [categories, total] = await Promise.all([
    Category.find()
      .sort({ isSystem: -1, sortOrder: 1, createdAt: -1 })
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

  if (category.isSystem) {
    throw createHttpError(400, 'CATEGORY_RESERVED', '系统保留分类不允许修改')
  }

  if (input.slug !== undefined) {
    const rawSlug = String(input.slug || '').trim().toLowerCase()
    if (isReservedCategoryIdentity({ slug: rawSlug })) {
      throw createHttpError(400, 'CATEGORY_RESERVED', '默认分类为系统保留分类，不能重复使用')
    }
    const baseSlug = rawSlug || generateAsciiSlug([input.name || category.name], input.name || category.name, 70)
    category.slug = await ensureUniqueSlug(baseSlug, id)
  }

  if (input.parent !== undefined) {
    await assertValidParentForCategory(category._id, input.parent)
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
  const uncategorized = await ensureUncategorizedCategory()
  const [categories, counts] = await Promise.all([
    Category.find({}).sort({ isSystem: -1, sortOrder: 1, createdAt: 1 }).lean(),
    getLiveCategoryArticleCounts()
  ])

  return buildTree(categories.map((item) => ({
    ...item,
    toSafeJSON() {
      const directArticleCount = counts.directCountMap.get(item._id.toString()) || 0
      return {
        id: item._id.toString(),
        name: item.name,
        slug: item.slug,
        description: item.description,
        parent: item.parent ? item.parent.toString() : null,
        sortOrder: item.sortOrder,
        status: item.status,
        isSystem: item.isSystem,
        articleCount: directArticleCount,
        directArticleCount,
        unassignedArticleCount: String(item._id) === String(uncategorized._id) ? counts.unassignedCount : 0,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    }
  })))
}

export async function listCategoryArticles(categoryId, options = {}) {
  const uncategorized = await ensureUncategorizedCategory()
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const skip = (page - 1) * pageSize
  const includeDescendants = String(options.includeDescendants ?? '1') !== '0'
  const isUncategorizedCategory = String(categoryId) === String(uncategorized._id)

  const categoryIds = includeDescendants
    ? await collectDescendantIds(categoryId)
    : [String(categoryId)]

  const query = {
    deletedAt: null,
    category: isUncategorizedCategory
      ? { $in: [...categoryIds, null] }
      : { $in: categoryIds }
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

  const previousCategoryId = article.category ? article.category.toString() : null
  article.category = targetCategory._id
  await article.save()

  if (previousCategoryId && previousCategoryId !== String(targetCategory._id)) {
    await adjustCategoryArticleCount(previousCategoryId, -1)
  }
  if (previousCategoryId !== String(targetCategory._id)) {
    await adjustCategoryArticleCount(targetCategory._id, 1)
  }

  return article.toSafeJSON()
}

export async function moveArticlesCategory(articleIds, targetCategoryId) {
  if (!Array.isArray(articleIds) || articleIds.length === 0) {
    throw createHttpError(400, 'ARTICLE_IDS_REQUIRED', '请选择要迁移的文章')
  }

  const targetCategory = await Category.findById(targetCategoryId)
  if (!targetCategory) {
    throw createHttpError(404, 'CATEGORY_NOT_FOUND', '目标分类不存在')
  }

  const articles = await Article.find({
    _id: { $in: articleIds },
    deletedAt: null
  })

  let movedCount = 0
  for (const article of articles) {
    const previousCategoryId = article.category ? article.category.toString() : null
    const nextCategoryId = targetCategory._id.toString()
    if (previousCategoryId === nextCategoryId) {
      continue
    }

    article.category = targetCategory._id
    await article.save()

    if (previousCategoryId) {
      await adjustCategoryArticleCount(previousCategoryId, -1)
    }
    await adjustCategoryArticleCount(targetCategory._id, 1)
    movedCount += 1
  }

  return {
    movedCount,
    targetCategory: targetCategory.toSafeJSON()
  }
}

export async function moveCategoryBranch(categoryId, targetParentId) {
  const category = await Category.findById(categoryId)
  if (!category) {
    throw createHttpError(404, 'CATEGORY_NOT_FOUND', '分类不存在')
  }

  if (category.isSystem) {
    throw createHttpError(400, 'CATEGORY_RESERVED', '系统保留分类不允许移动')
  }

  if (String(category._id) === String(targetParentId)) {
    throw createHttpError(400, 'CATEGORY_MOVE_INVALID', '不能把分类移动到自身下')
  }

  if (targetParentId) {
    await assertValidParentForCategory(category._id, targetParentId)
  }

  category.parent = targetParentId || null
  await category.save()
  return category.toSafeJSON()
}

export async function deleteCategory(id) {
  const uncategorized = await ensureUncategorizedCategory()
  const category = await Category.findById(id)
  if (!category) {
    throw createHttpError(404, 'CATEGORY_NOT_FOUND', '分类不存在')
  }

  if (category.isSystem) {
    throw createHttpError(400, 'CATEGORY_RESERVED', '系统保留分类不允许删除')
  }

  const descendantIds = await collectDescendantIds(category._id)
  const directChildren = await Category.find({ parent: category._id }).select('_id')
  const rootArticleCount = await Article.countDocuments({ deletedAt: null, category: category._id })
  const rootCategoryId = String(category._id)

  await Promise.all([
    ...directChildren.map((child) => Category.updateOne({ _id: child._id }, { $set: { parent: uncategorized._id } })),
    Article.updateMany({ deletedAt: null, category: category._id }, { $set: { category: uncategorized._id } })
  ])

  if (rootArticleCount > 0) {
    await adjustCategoryArticleCount(uncategorized._id, rootArticleCount)
  }

  await Category.findByIdAndDelete(id)

  return {
    id: rootCategoryId,
    deleted: true,
    movedTo: uncategorized.toSafeJSON(),
    descendantIds
  }
}

export async function ensureCategorySystemState() {
  await ensureUncategorizedCategory()
}
