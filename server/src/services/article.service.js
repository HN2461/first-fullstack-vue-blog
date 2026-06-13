import { ARTICLE_STATUS } from '@blog/shared'
import { Article } from '../models/Article.js'

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function calculateWordCount(content) {
  const cleaned = String(content || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_\-[\]()`]/g, ' ')
    .trim()

  if (!cleaned) {
    return 0
  }

  const chineseChars = cleaned.match(/[\u4e00-\u9fa5]/g)?.length || 0
  const latinWords = cleaned
    .replace(/[\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length

  return chineseChars + latinWords
}

function calculateReadingMinutes(wordCount) {
  return Math.max(1, Math.ceil(wordCount / 400))
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

export async function createArticle(input, user) {
  const slug = input.slug.trim().toLowerCase()
  await assertUniqueSlug(slug)

  const wordCount = calculateWordCount(input.contentMarkdown)
  const article = await Article.create({
    title: input.title.trim(),
    slug,
    summary: input.summary || '',
    contentMarkdown: input.contentMarkdown || '',
    cover: input.cover || '',
    category: input.category || null,
    tags: input.tags || [],
    status: input.status || ARTICLE_STATUS.DRAFT,
    isRecommended: !!input.isRecommended,
    wordCount,
    readingMinutes: calculateReadingMinutes(wordCount),
    createdBy: user._id,
    updatedBy: user._id,
    publishedAt: input.status === ARTICLE_STATUS.PUBLISHED ? new Date() : null
  })

  return article.toSafeJSON()
}

export async function updateArticle(id, input, user) {
  const article = await Article.findById(id)

  if (!article || article.deletedAt) {
    throw createHttpError(404, 'ARTICLE_NOT_FOUND', '文章不存在')
  }

  const slug = input.slug.trim().toLowerCase()
  await assertUniqueSlug(slug, article._id)

  const wordCount = calculateWordCount(input.contentMarkdown)
  article.title = input.title.trim()
  article.slug = slug
  article.summary = input.summary || ''
  article.contentMarkdown = input.contentMarkdown || ''
  article.cover = input.cover || ''
  article.category = input.category || null
  article.tags = input.tags || []
  article.isRecommended = !!input.isRecommended
  article.wordCount = wordCount
  article.readingMinutes = calculateReadingMinutes(wordCount)
  article.updatedBy = user._id

  await article.save()
  return article.toSafeJSON()
}

export async function publishArticle(id, user) {
  const article = await Article.findById(id)

  if (!article || article.deletedAt) {
    throw createHttpError(404, 'ARTICLE_NOT_FOUND', '文章不存在')
  }

  article.status = ARTICLE_STATUS.PUBLISHED
  article.publishedAt = article.publishedAt || new Date()
  article.updatedBy = user._id
  await article.save()

  return article.toSafeJSON()
}

export async function listArticles(options = {}) {
  const { status, category, keyword } = options
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 10))

  // 构建查询条件
  const query = { deletedAt: null }

  if (status && status !== 'all') {
    query.status = status
  }

  if (category) {
    query.category = category
  }

  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { summary: { $regex: keyword, $options: 'i' } }
    ]
  }

  // 计算分页
  const skip = (page - 1) * pageSize

  // 并行查询总数和列表
  // 排序：优先按 publishedAt（写作/发布时间）倒序，让迁移来的文章按原始写作顺序排列
  // updatedAt 作为兜底排序，保证同一天发布的文章也有确定顺序
  const [total, articles] = await Promise.all([
    Article.countDocuments(query),
    Article.find(query)
      .populate('category')
      .populate('tags')
      .sort({ publishedAt: -1, createdAt: -1, updatedAt: -1 })
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
  article.deletedAt = new Date()
  article.updatedBy = user._id
  await article.save()

  return { id, deleted: true }
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

  return article.toSafeJSON()
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

// 清空回收站（彻底删除所有已删除的文章）
export async function emptyTrash() {
  const result = await Article.deleteMany({ deletedAt: { $ne: null } })
  return { deletedCount: result.deletedCount }
}
