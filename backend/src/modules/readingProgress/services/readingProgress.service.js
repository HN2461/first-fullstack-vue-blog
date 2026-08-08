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
