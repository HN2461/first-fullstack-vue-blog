import { Article } from '../models/Article.js'
import { Category } from '../models/Category.js'
import { Comment } from '../models/Comment.js'
import { Media } from '../models/Media.js'
import { Tag } from '../models/Tag.js'
import { User } from '../models/User.js'

export async function getAdminStats() {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    articleCount,
    publishedCount,
    draftCount,
    userCount,
    commentCount,
    pendingCommentCount,
    mediaCount,
    categoryCount,
    tagCount,
    // 上周数据（用于计算趋势）
    lastWeekArticleCount,
    lastWeekUserCount,
    lastWeekPublishedCount
  ] = await Promise.all([
    Article.countDocuments({ deletedAt: null }),
    Article.countDocuments({ deletedAt: null, status: 'published' }),
    Article.countDocuments({ deletedAt: null, status: 'draft' }),
    User.countDocuments(),
    Comment.countDocuments(),
    Comment.countDocuments({ status: 'pending' }),
    Media.countDocuments(),
    Category.countDocuments(),
    Tag.countDocuments(),
    // 上周同期数据
    Article.countDocuments({ deletedAt: null, createdAt: { $lt: oneWeekAgo } }),
    User.countDocuments({ createdAt: { $lt: oneWeekAgo } }),
    Article.countDocuments({ deletedAt: null, status: 'published', publishedAt: { $lt: oneWeekAgo } })
  ])

  // 计算趋势百分比
  const calcTrend = (current, lastWeek) => {
    if (lastWeek === 0) return current > 0 ? 100 : 0
    return Math.round(((current - lastWeek) / lastWeek) * 100)
  }

  return {
    articleCount,
    publishedCount,
    draftCount,
    userCount,
    commentCount,
    pendingCommentCount,
    mediaCount,
    categoryCount,
    tagCount,
    // 趋势数据
    articleTrend: calcTrend(articleCount, lastWeekArticleCount),
    publishedTrend: calcTrend(publishedCount, lastWeekPublishedCount),
    userTrend: calcTrend(userCount, lastWeekUserCount)
  }
}
