import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'
import { Comment } from '#modules/interaction/models/Comment.js'
import { Media } from '#modules/media/models/Media.js'
import { Tag } from '#modules/content/models/Tag.js'
import { User } from '#modules/user/models/User.js'
import { getSettings } from '#modules/settings/services/setting.service.js'

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

/**
 * 返回管理工作台需要展示的最小站点信息。
 *
 * 工作台只需要站点名称、作者和版本，不应直接读取完整系统设置；
 * 完整设置包含账号找回、媒体限制和入口效果等超级管理员专属配置。
 */
export async function getAdminDashboardContext() {
  const settings = await getSettings()

  return {
    siteTitle: settings.siteTitle,
    authorName: settings.authorName,
    systemVersion: settings.systemVersion
  }
}
