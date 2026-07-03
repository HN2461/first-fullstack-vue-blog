import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

export function normalizeArticleSortOrder(value, fallback = 0) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return fallback
  }

  return Math.max(0, Math.trunc(numeric))
}

export function getDirectoryArticleSort() {
  return {
    sortOrder: 1,
    publishedAt: -1,
    createdAt: -1,
    _id: 1
  }
}

export async function getNextArticleSortOrder(categoryId) {
  const query = {
    deletedAt: null,
    category: categoryId || null
  }
  const latest = await Article.findOne(query).sort({ sortOrder: -1 }).select('sortOrder').lean()
  return normalizeArticleSortOrder(latest?.sortOrder, 0) + 10
}

export async function reorderCategoryArticles(categoryId, items = []) {
  const category = await Category.findById(categoryId)
  if (!category) {
    throw createHttpError(404, 'CATEGORY_NOT_FOUND', '分类不存在')
  }

  const normalizedItems = items.map((item) => ({
    id: String(item.id),
    sortOrder: normalizeArticleSortOrder(item.sortOrder)
  }))
  const articleIds = normalizedItems.map((item) => item.id)
  const articles = await Article.find({
    _id: { $in: articleIds },
    deletedAt: null
  }).select('_id category title').lean()
  const articleMap = new Map(articles.map((article) => [String(article._id), article]))

  for (const item of normalizedItems) {
    const article = articleMap.get(item.id)
    if (!article) {
      throw createHttpError(404, 'ARTICLE_NOT_FOUND', '文章不存在或已删除')
    }

    if (String(article.category || '') !== String(category._id)) {
      throw createHttpError(400, 'ARTICLE_CATEGORY_MISMATCH', `文章「${article.title}」不属于当前分类`)
    }
  }

  const operations = normalizedItems.map((item) => ({
    updateOne: {
      filter: { _id: item.id, deletedAt: null, category: category._id },
      update: { $set: { sortOrder: item.sortOrder } }
    }
  }))

  if (operations.length > 0) {
    // 目录排序是结构元数据，避免刷新文章最近编辑时间导致后台列表被排序动作扰乱。
    await Article.bulkWrite(operations, { ordered: false, timestamps: false })
  }

  return {
    updatedCount: operations.length,
    category: category.toSafeJSON()
  }
}
