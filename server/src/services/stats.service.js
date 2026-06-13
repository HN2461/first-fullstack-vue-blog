import { Article } from '../models/Article.js'
import { Category } from '../models/Category.js'
import { Comment } from '../models/Comment.js'
import { Media } from '../models/Media.js'
import { Tag } from '../models/Tag.js'
import { User } from '../models/User.js'

export async function getAdminStats() {
  const [
    articleCount,
    publishedCount,
    draftCount,
    userCount,
    commentCount,
    pendingCommentCount,
    mediaCount,
    categoryCount,
    tagCount
  ] = await Promise.all([
    Article.countDocuments({ deletedAt: null }),
    Article.countDocuments({ deletedAt: null, status: 'published' }),
    Article.countDocuments({ deletedAt: null, status: 'draft' }),
    User.countDocuments(),
    Comment.countDocuments(),
    Comment.countDocuments({ status: 'pending' }),
    Media.countDocuments(),
    Category.countDocuments(),
    Tag.countDocuments()
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
    tagCount
  }
}
