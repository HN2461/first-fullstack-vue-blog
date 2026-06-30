import { BUILTIN_ROLE_CODES, USER_STATUS } from '#constants/domain'
import { DISCUSSION_ROUTE_PATH } from '#modules/discussion/constants/discussion.constants.js'
import { Menu } from '#modules/rbac/models/Menu.js'
import { Role } from '#modules/rbac/models/Role.js'
import { User } from '#modules/user/models/User.js'

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildUserLite(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    avatar: user.avatar || ''
  }
}

export async function listDiscussionUsers(currentUserId, keyword = '') {
  const discussionMenu = await Menu.findOne({ routePath: DISCUSSION_ROUTE_PATH, enabled: true }).select('_id')
  if (!discussionMenu) return []

  const roles = await Role.find({
    status: 'active',
    $or: [
      { isSuperAdmin: true },
      { code: BUILTIN_ROLE_CODES.SUPER_ADMIN },
      { menuIds: discussionMenu._id }
    ]
  }).select('_id')
  const roleIds = roles.map((role) => role._id)
  const conditions = [
    { _id: { $ne: currentUserId } },
    { status: { $ne: USER_STATUS.DISABLED } },
    {
      $or: [
        { roles: { $in: roleIds } },
        { role: 'super_admin' }
      ]
    }
  ]
  const text = String(keyword || '').trim()

  if (text) {
    const regex = new RegExp(escapeRegExp(text), 'i')
    conditions.push({ $or: [{ username: regex }, { email: regex }] })
  }

  const users = await User.find({ $and: conditions })
    .select('username email avatar')
    .sort({ username: 1, email: 1 })
    .limit(30)

  return users.map(buildUserLite)
}
