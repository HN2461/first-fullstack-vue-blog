import mongoose from 'mongoose'
import { ARTICLE_STATUS } from '#constants/domain'
import { Article } from '#modules/content/models/Article.js'
import { ArticleReadingProgress } from '../models/ArticleReadingProgress.js'

function createError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

async function findReadableArticle(articleId) {
  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    throw createError(404, 'ARTICLE_NOT_FOUND', '文章不存在')
  }

  const article = await Article.findOne({
    _id: articleId,
    status: ARTICLE_STATUS.PUBLISHED,
    deletedAt: null
  }).select('_id updatedAt').lean()

  if (!article) {
    throw createError(404, 'ARTICLE_NOT_FOUND', '文章不存在')
  }

  return article
}

/**
 * 获取当前用户在指定公开文章中的阅读进度。
 * @param {string} articleId 文章 ObjectId。
 * @param {mongoose.Types.ObjectId} userId 当前用户 ObjectId。
 * @returns {Promise<object|null>} 阅读进度；从未阅读时返回 null。
 * @throws {Error} 文章 ID 无效、文章未发布或已删除时返回 404。
 */
export async function getReadingProgress(articleId, userId) {
  await findReadableArticle(articleId)
  const progress = await ArticleReadingProgress.findOne({ articleId, userId })
  return progress?.toSafeJSON() || null
}

function buildStatusMatch(status) {
  if (status === 'unfinished') return { completedAt: null }
  if (status === 'completed') return { completedAt: { $ne: null } }
  return {}
}

function toReadingHistoryItem(row) {
  const article = row.article
  const category = article.category
    ? {
        id: article.category._id.toString(),
        name: article.category.name || '',
        slug: article.category.slug || ''
      }
    : null

  return {
    id: row._id.toString(),
    articleId: row.articleId.toString(),
    progressPercent: row.progressPercent,
    scrollRatio: row.scrollRatio,
    anchorSlug: row.anchorSlug || '',
    anchorOffset: row.anchorOffset || 0,
    articleUpdatedAt: row.articleUpdatedAt,
    lastReadAt: row.lastReadAt,
    completedAt: row.completedAt,
    article: {
      id: article._id.toString(),
      title: article.title,
      slug: article.slug,
      summary: article.summary || '',
      cover: article.cover || '',
      readingMinutes: article.readingMinutes || 1,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt,
      category
    }
  }
}

/**
 * 查询当前用户的文章阅读记录，并过滤已经下架或删除的文章。
 * @param {mongoose.Types.ObjectId} userId 当前用户 ObjectId。
 * @param {{status?: 'unfinished'|'completed'|'all', page?: number, pageSize?: number}} options 查询条件。
 * @returns {Promise<{items: object[], total: number, unfinishedCount: number, page: number, pageSize: number}>} 阅读记录分页结果。
 */
export async function listReadingProgress(userId, options = {}) {
  const status = options.status || 'all'
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(options.pageSize) || 10))
  const statusMatch = buildStatusMatch(status)

  const [result] = await ArticleReadingProgress.aggregate([
    { $match: { userId, progressPercent: { $gte: 5 } } },
    {
      $lookup: {
        from: 'articles',
        let: { articleId: '$articleId' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$articleId'] },
              status: ARTICLE_STATUS.PUBLISHED,
              deletedAt: null
            }
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category'
            }
          },
          { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              title: 1,
              slug: 1,
              summary: 1,
              cover: 1,
              readingMinutes: 1,
              updatedAt: 1,
              publishedAt: 1,
              'category._id': 1,
              'category.name': 1,
              'category.slug': 1
            }
          }
        ],
        as: 'article'
      }
    },
    { $unwind: '$article' },
    {
      $facet: {
        items: [
          { $match: statusMatch },
          { $sort: { lastReadAt: -1, _id: -1 } },
          { $skip: (page - 1) * pageSize },
          { $limit: pageSize }
        ],
        total: [
          { $match: statusMatch },
          { $count: 'value' }
        ],
        unfinishedCount: [
          { $match: { completedAt: null } },
          { $count: 'value' }
        ]
      }
    }
  ])

  return {
    items: (result?.items || []).map(toReadingHistoryItem),
    total: result?.total?.[0]?.value || 0,
    unfinishedCount: result?.unfinishedCount?.[0]?.value || 0,
    page,
    pageSize
  }
}

/**
 * 原子保存当前用户在指定公开文章中的阅读进度。
 * @param {string} articleId 文章 ObjectId。
 * @param {mongoose.Types.ObjectId} userId 当前用户 ObjectId。
 * @param {object} input 已校验的比例、锚点和偏移量。
 * @returns {Promise<object>} 保存后的阅读进度；95% 及以上标记为已读完。
 * @throws {Error} 文章不可读或输入超出模型边界时拒绝写入。
 */
export async function saveReadingProgress(articleId, userId, input) {
  const article = await findReadableArticle(articleId)
  const now = new Date()
  const progressPercent = Math.round(input.progressPercent * 100) / 100
  const scrollRatio = Math.round(input.scrollRatio * 10000) / 10000
  const completedAt = progressPercent >= 95 ? now : null

  const progress = await ArticleReadingProgress.findOneAndUpdate(
    { articleId, userId },
    {
      $set: {
        progressPercent,
        scrollRatio,
        anchorSlug: input.anchorSlug || '',
        anchorOffset: Math.round(input.anchorOffset || 0),
        articleUpdatedAt: article.updatedAt,
        lastReadAt: now,
        completedAt
      }
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  )

  return progress.toSafeJSON()
}

/**
 * 删除当前用户在指定公开文章中的阅读进度。
 * @param {string} articleId 文章 ObjectId。
 * @param {mongoose.Types.ObjectId} userId 当前用户 ObjectId。
 * @returns {Promise<object>} 删除结果；记录不存在时仍幂等返回成功。
 * @throws {Error} 文章 ID 无效、文章未发布或已删除时返回 404。
 */
export async function deleteReadingProgress(articleId, userId) {
  await findReadableArticle(articleId)
  await ArticleReadingProgress.deleteOne({ articleId, userId })
  return { articleId: String(articleId), deleted: true }
}
