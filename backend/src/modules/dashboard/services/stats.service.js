import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'
import { Comment } from '#modules/interaction/models/Comment.js'
import { Media } from '#modules/media/models/Media.js'
import { Tag } from '#modules/content/models/Tag.js'
import { User } from '#modules/user/models/User.js'
import { getSettings } from '#modules/settings/services/setting.service.js'
import { getReleaseInfo } from '#modules/dashboard/services/releaseInfo.service.js'

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
    articleCreatedLast7Days,
    articlePublishedLast7Days,
    userCreatedLast7Days
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
    Article.countDocuments({ deletedAt: null, createdAt: { $gte: oneWeekAgo, $lte: now } }),
    Article.countDocuments({ deletedAt: null, status: 'published', publishedAt: { $gte: oneWeekAgo, $lte: now } }),
    User.countDocuments({ createdAt: { $gte: oneWeekAgo, $lte: now } })
  ])

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
    articleCreatedLast7Days,
    articlePublishedLast7Days,
    userCreatedLast7Days
  }
}

/**
 * 返回管理工作台需要展示的最小站点信息。
 *
 * 工作台只需要站点名称、作者和版本，不应直接读取完整系统设置；
 * 完整设置包含账号找回、媒体限制和入口效果等超级管理员专属配置。
 */
export async function getAdminDashboardContext() {
  const [settings, releaseInfo] = await Promise.all([
    getSettings(),
    getReleaseInfo()
  ])

  return {
    siteTitle: settings.siteTitle,
    authorName: settings.authorName,
    systemVersion: settings.systemVersion,
    releaseInfo
  }
}
