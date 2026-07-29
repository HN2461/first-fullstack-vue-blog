import { ARTICLE_STATUS } from '#constants/domain'
import { Category } from '#modules/content/models/Category.js'
import { Article } from '#modules/content/models/Article.js'
import { getNextArticleSortOrder, normalizeArticleSortOrder } from './articleOrder.service.js'
import {
  assertArticlePublishable,
  calculateReadingMinutes,
  calculateWordCount,
  getArticleContentText,
  getPublishBlockers,
  normalizeArticleDocument,
  normalizeArticleResources
} from './articleContent.service.js'

export { getPublishBlockers } from './articleContent.service.js'

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

export async function adjustCategoryArticleCount(categoryId, delta) {
  if (!categoryId || !Number.isFinite(delta) || delta === 0) {
    return
  }

  await Category.updateOne(
    { _id: categoryId },
    { $inc: { articleCount: delta } }
  )
}

function slugifyArticleTitle(title) {
  const asciiSlug = String(title || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')

  if (asciiSlug) {
    return asciiSlug
  }

  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
  return `article-${timestamp}`
}

export function buildArticleSlug(title) {
  return slugifyArticleTitle(title)
}

async function assertUniqueSlug(slug, excludeId = null) {
  const query = { slug }

  if (excludeId) {
    query._id = { $ne: excludeId }
  }

  const exists = await Article.exists(query)

  if (exists) {
    throw createHttpError(409, 'ARTICLE_SLUG_EXISTS', '文章 slug 已存在')
  }
}

async function ensureUniqueGeneratedSlug(baseSlug, excludeId = null) {
  let candidate = baseSlug
  let index = 1

  while (true) {
    const query = { slug: candidate }

    if (excludeId) {
      query._id = { $ne: excludeId }
    }

    const exists = await Article.exists(query)
    if (!exists) {
      return candidate
    }

    index += 1
    candidate = `${baseSlug}-${index}`
  }
}

async function resolveCreateSlug(input) {
  const requestedSlug = String(input.slug || '').trim().toLowerCase()

  if (requestedSlug) {
    await assertUniqueSlug(requestedSlug)
    return requestedSlug
  }

  return ensureUniqueGeneratedSlug(slugifyArticleTitle(input.title))
}

async function collectCategoryBranchIds(categoryId) {
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

  return Array.from(resolved)
}

async function resolveUpdateSlug(input, article) {
  const requestedSlug = String(input.slug || '').trim().toLowerCase()

  if (requestedSlug) {
    await assertUniqueSlug(requestedSlug, article._id)
    return requestedSlug
  }

  if (article.slug) {
    return article.slug
  }

  return ensureUniqueGeneratedSlug(slugifyArticleTitle(input.title), article._id)
}

export async function createArticle(input, user) {
  const slug = await resolveCreateSlug(input)
  const contentMode = input.contentMode === 'document' ? 'document' : 'markdown'
  const wordCount = calculateWordCount(getArticleContentText({ ...input, contentMode }))
  const categoryId = input.category || null
  const article = await Article.create({
    title: input.title.trim(),
    slug,
    summary: input.summary || '',
    contentMode,
    contentMarkdown: input.contentMarkdown || '',
    document: contentMode === 'document' ? normalizeArticleDocument(input.document) : undefined,
    cover: input.cover || '',
    resources: normalizeArticleResources(input.resources),
    category: categoryId,
    tags: input.tags || [],
    status: input.status || ARTICLE_STATUS.DRAFT,
    isRecommended: !!input.isRecommended,
    wordCount,
    readingMinutes: calculateReadingMinutes(wordCount),
    sortOrder: input.sortOrder !== undefined
      ? normalizeArticleSortOrder(input.sortOrder)
      : await getNextArticleSortOrder(categoryId),
    source: input.source || 'manual',
    sourcePath: input.sourcePath || '',
    sourceHash: input.sourceHash || '',
    importedAt: input.importedAt || null,
    createdBy: user._id,
    updatedBy: user._id,
    publishedAt: input.status === ARTICLE_STATUS.PUBLISHED ? new Date() : null
  })

  if (article.category) {
    await adjustCategoryArticleCount(article.category, 1)
  }

  return article.toSafeJSON()
}

export async function updateArticle(id, input, user) {
  const article = await Article.findById(id)

  if (!article || article.deletedAt) {
    throw createHttpError(404, 'ARTICLE_NOT_FOUND', '文章不存在')
  }

  const slug = await resolveUpdateSlug(input, article)
  const previousCategoryId = article.category ? article.category.toString() : null
  const nextCategoryId = input.category || null

  const contentMode = input.contentMode || article.contentMode || 'markdown'
  const wordCount = calculateWordCount(contentMode === 'document'
    ? article.document?.extractedText
    : input.contentMarkdown)
  article.title = input.title.trim()
  article.slug = slug
  article.summary = input.summary || ''
  article.contentMode = contentMode
  if (contentMode === 'markdown') {
    article.contentMarkdown = input.contentMarkdown || ''
  }
  article.cover = input.cover || ''
  article.resources = normalizeArticleResources(input.resources)
  article.category = input.category || null
  article.tags = input.tags || []
  article.isRecommended = !!input.isRecommended
  article.wordCount = wordCount
  article.readingMinutes = calculateReadingMinutes(wordCount)
  if (input.sortOrder !== undefined) {
    article.sortOrder = normalizeArticleSortOrder(input.sortOrder)
  } else if (previousCategoryId !== nextCategoryId) {
    article.sortOrder = await getNextArticleSortOrder(nextCategoryId)
  }
  article.updatedBy = user._id

  if (article.status === ARTICLE_STATUS.PUBLISHED) {
    // 已发布文章保存修改后仍应保持可发布状态，避免公开内容被改成空正文或缺少必要元数据。
    assertArticlePublishable(article)
  }

  await article.save()

  if (previousCategoryId !== nextCategoryId) {
    if (previousCategoryId) {
      await adjustCategoryArticleCount(previousCategoryId, -1)
    }
    if (nextCategoryId) {
      await adjustCategoryArticleCount(nextCategoryId, 1)
    }
  }

  return article.toSafeJSON()
}

export async function updateArticleStatus(id, status, user) {
  const article = await Article.findById(id)

  if (!article || article.deletedAt) {
    throw createHttpError(404, 'ARTICLE_NOT_FOUND', '文章不存在')
  }

  if (!Object.values(ARTICLE_STATUS).includes(status)) {
    throw createHttpError(400, 'INVALID_ARTICLE_STATUS', '文章状态不正确')
  }

  if (status === ARTICLE_STATUS.PUBLISHED) {
    // 所有发布入口都必须经过同一套完整性校验，避免通用状态接口绕过发布规则。
    assertArticlePublishable(article)
  }

  article.status = status
  article.updatedBy = user._id

  if (status === ARTICLE_STATUS.PUBLISHED) {
    article.publishedAt = article.publishedAt || new Date()
  }

  await article.save()
  return article.toSafeJSON()
}

export async function batchUpdateArticleStatus(ids, status, user) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw createHttpError(400, 'ARTICLE_IDS_REQUIRED', '请选择要操作的文章')
  }

  let updatedCount = 0
  for (const id of ids) {
    if (status === ARTICLE_STATUS.PUBLISHED) {
      await publishArticle(id, user)
    } else {
      await updateArticleStatus(id, status, user)
    }
    updatedCount += 1
  }

  return { updatedCount, status }
}

export async function publishArticle(id, user) {
  const article = await Article.findById(id)

  if (!article || article.deletedAt) {
    throw createHttpError(404, 'ARTICLE_NOT_FOUND', '文章不存在')
  }

  assertArticlePublishable(article)

  return updateArticleStatus(id, ARTICLE_STATUS.PUBLISHED, user)
}

export async function listArticles(options = {}) {
  const { status, category, keyword } = options
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 10))
  const allowedSortFields = new Set(['updatedAt', 'publishedAt', 'createdAt', 'sortOrder'])
  const sortField = allowedSortFields.has(options.sortField) ? options.sortField : 'updatedAt'
  const sortOrder = options.sortOrder === 'asc' ? 1 : -1

  // 构建查询条件
  const query = { deletedAt: null }

  if (status && status !== 'all') {
    query.status = status
  }

  if (category) {
    query.category = { $in: await collectCategoryBranchIds(category) }
  }

  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { summary: { $regex: keyword, $options: 'i' } }
    ]
  }

  // 计算分页
  const skip = (page - 1) * pageSize

  // 默认仍按最近修改排序；工作台“最近发布”等场景可显式按发布时间查询。
  const sort = { [sortField]: sortOrder }
  if (sortField !== 'updatedAt') {
    sort.updatedAt = -1
  }
  if (sortField !== 'createdAt') {
    sort.createdAt = -1
  }

  const [total, articles] = await Promise.all([
    Article.countDocuments(query),
    Article.find(query)
      .populate('category')
      .populate('tags')
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
  ])

  return {
    items: articles.map((article) => article.toSafeJSON()),
    total,
    page: Number(page),
    pageSize: Number(pageSize)
  }
}

export async function getArticleById(id) {
  const article = await Article.findOne({ _id: id, deletedAt: null })
    .populate('category')
    .populate('tags')

  if (!article) {
    throw createHttpError(404, 'ARTICLE_NOT_FOUND', '文章不存在')
  }

  return article.toSafeJSON()
}

export async function deleteArticle(id, user) {
  const article = await Article.findOne({ _id: id, deletedAt: null })

  if (!article) {
    throw createHttpError(404, 'ARTICLE_NOT_FOUND', '文章不存在')
  }

  // 软删除：设置 deletedAt
  if (article.category) {
    await adjustCategoryArticleCount(article.category, -1)
  }
  article.deletedAt = new Date()
  article.updatedBy = user._id
  await article.save()

  return { id, deleted: true }
}

export async function batchDeleteArticles(ids, user) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw createHttpError(400, 'ARTICLE_IDS_REQUIRED', '请选择要删除的文章')
  }

  let deletedCount = 0
  for (const id of ids) {
    await deleteArticle(id, user)
    deletedCount += 1
  }

  return { deletedCount }
}

// 获取回收站列表（已删除的文章）
export async function listDeletedArticles(options = {}) {
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const query = { deletedAt: { $ne: null } }
  const skip = (page - 1) * pageSize

  const [articles, total] = await Promise.all([
    Article.find(query)
      .populate('category')
      .populate('tags')
      .sort({ deletedAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Article.countDocuments(query)
  ])

  return {
    items: articles.map((article) => article.toSafeJSON()),
    total,
    page,
    pageSize
  }
}

// 恢复文章（从回收站）
export async function restoreArticle(id, user) {
  const article = await Article.findOne({ _id: id, deletedAt: { $ne: null } })

  if (!article) {
    throw createHttpError(404, 'ARTICLE_NOT_FOUND', '文章不存在或未被删除')
  }

  article.deletedAt = null
  article.updatedBy = user._id
  await article.save()

  if (article.category) {
    await adjustCategoryArticleCount(article.category, 1)
  }

  return article.toSafeJSON()
}

export async function batchRestoreArticles(ids, user) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw createHttpError(400, 'ARTICLE_IDS_REQUIRED', '请选择要恢复的文章')
  }

  let restoredCount = 0
  for (const id of ids) {
    await restoreArticle(id, user)
    restoredCount += 1
  }

  return { restoredCount }
}

// 彻底删除文章（真删除）
export async function permanentDeleteArticle(id) {
  const article = await Article.findOne({ _id: id, deletedAt: { $ne: null } })

  if (!article) {
    throw createHttpError(404, 'ARTICLE_NOT_FOUND', '文章不存在或未被删除')
  }

  await Article.findByIdAndDelete(id)

  return { id, permanentDeleted: true }
}

export async function batchPermanentDeleteArticles(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw createHttpError(400, 'ARTICLE_IDS_REQUIRED', '请选择要彻底删除的文章')
  }

  let deletedCount = 0
  for (const id of ids) {
    await permanentDeleteArticle(id)
    deletedCount += 1
  }

  return { deletedCount }
}

// 清空回收站（彻底删除所有已删除的文章）
export async function emptyTrash() {
  const result = await Article.deleteMany({ deletedAt: { $ne: null } })
  return { deletedCount: result.deletedCount }
}
