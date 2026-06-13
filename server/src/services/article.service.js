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

export async function listArticles() {
  const articles = await Article.find({ deletedAt: null })
    .populate('category')
    .populate('tags')
    .sort({ updatedAt: -1 })

  return articles.map((article) => article.toSafeJSON())
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
