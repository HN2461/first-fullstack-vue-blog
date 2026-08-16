import { USER_ROLES } from '#constants/domain'
import { User } from '#modules/user/models/User.js'

/**
 * 选择文章导入和批处理使用的归属账号。
 * 文章属于站点内容资产时，优先归属超级管理员；只有历史数据库没有超级管理员时，才回退到普通管理员。
 * 返回值：可用于 Article.createdBy / updatedBy 的用户文档；没有可用账号时返回 null。
 */
export async function findPreferredArticleAuthor() {
  const superAdmin = await User.findOne({ role: USER_ROLES.SUPER_ADMIN }).sort({ createdAt: 1, _id: 1 })
  if (superAdmin) return superAdmin

  return User.findOne({ role: USER_ROLES.ADMIN }).sort({ createdAt: 1, _id: 1 })
}
