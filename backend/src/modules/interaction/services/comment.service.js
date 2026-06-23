import bcrypt from 'bcryptjs'
import { BUILTIN_ROLE_CODES, COMMENT_STATUS, USER_STATUS } from '#constants/domain'
import { Article } from '#modules/content/models/Article.js'
import { Comment } from '#modules/interaction/models/Comment.js'
import { PermissionRequest } from '#modules/rbac/models/PermissionRequest.js'
import { Role } from '#modules/rbac/models/Role.js'
import { User } from '#modules/user/models/User.js'
import { getVisitorRole } from '#modules/rbac/services/rbac.service.js'
import { getSettings } from '#modules/settings/services/setting.service.js'

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function detectRiskReasons(content) {
  const reasons = []

  if (/https?:\/\//i.test(content)) {
    reasons.push('contains_link')
  }

  return reasons
}

export async function createComment(input, user) {
  if (user.status === USER_STATUS.MUTED) {
    throw createHttpError(403, 'USER_MUTED', '账号已被禁言，不能发表评论')
  }

  const settings = await getSettings()
  // 评论开关是全站级运营配置，必须在写入评论和增加计数前统一拦截。
  if (settings.commentEnabled === false) {
    throw createHttpError(403, 'COMMENTS_DISABLED', '评论功能已关闭')
  }

  const article = await Article.findById(input.articleId)

  if (!article || article.deletedAt) {
    throw createHttpError(404, 'ARTICLE_NOT_FOUND', '文章不存在')
  }

  const riskReasons = detectRiskReasons(input.content)
  const status = riskReasons.length > 0 ? COMMENT_STATUS.PENDING : COMMENT_STATUS.VISIBLE
  const comment = await Comment.create({
    article: article._id,
    user: user._id,
    parent: input.parent || null,
    replyTo: input.replyTo || null,
    content: input.content.trim(),
    status,
    riskReasons
  })

  if (status === COMMENT_STATUS.VISIBLE) {
    article.commentCount += 1
    await article.save()
  }

  await comment.populate('user')
  return comment.toSafeJSON()
}

export async function listVisibleComments(articleId) {
  const comments = await Comment.find({
    article: articleId,
    status: COMMENT_STATUS.VISIBLE
  })
    .populate('user')
    .sort({ createdAt: 1 })

  return comments.map((comment) => comment.toSafeJSON())
}

export async function listAdminComments(options = {}) {
  const { status } = options
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const query = status ? { status } : {}
  const skip = (page - 1) * pageSize

  const [comments, total] = await Promise.all([
    Comment.find(query)
      .populate('article', 'title slug')
      .populate('user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Comment.countDocuments(query)
  ])

  return {
    items: comments.map((comment) => comment.toSafeJSON()),
    total,
    page,
    pageSize
  }
}

export async function reviewComment(id, action, admin) {
  const comment = await Comment.findById(id)

  if (!comment) {
    throw createHttpError(404, 'COMMENT_NOT_FOUND', '评论不存在')
  }

  const wasVisible = comment.status === COMMENT_STATUS.VISIBLE

  if (action === 'approve') {
    comment.status = COMMENT_STATUS.VISIBLE
  } else if (action === 'reject') {
    comment.status = COMMENT_STATUS.REJECTED
  } else if (action === 'hide') {
    comment.status = COMMENT_STATUS.HIDDEN
  } else {
    throw createHttpError(400, 'INVALID_ACTION', '审核动作不正确')
  }

  comment.reviewedBy = admin._id
  comment.reviewedAt = new Date()
  await comment.save()

  if (!wasVisible && comment.status === COMMENT_STATUS.VISIBLE) {
    await Article.updateOne({ _id: comment.article }, { $inc: { commentCount: 1 } })
  }

  if (wasVisible && comment.status !== COMMENT_STATUS.VISIBLE) {
    await Article.updateOne({ _id: comment.article }, { $inc: { commentCount: -1 } })
  }

  await comment.populate('user')
  return comment.toSafeJSON()
}

export async function batchReviewComments(ids, action, admin) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw createHttpError(400, 'COMMENT_IDS_REQUIRED', '请选择要审核的评论')
  }

  let updatedCount = 0
  for (const id of ids) {
    await reviewComment(id, action, admin)
    updatedCount += 1
  }

  return { updatedCount, action }
}

export async function reportComment(id) {
  const comment = await Comment.findById(id)

  if (!comment) {
    throw createHttpError(404, 'COMMENT_NOT_FOUND', '评论不存在')
  }

  comment.reportCount += 1

  if (!comment.riskReasons.includes('reported')) {
    comment.riskReasons.push('reported')
  }

  if (comment.status === COMMENT_STATUS.VISIBLE) {
    comment.status = COMMENT_STATUS.PENDING
    await Article.updateOne({ _id: comment.article }, { $inc: { commentCount: -1 } })
  }

  await comment.save()
  return comment.toSafeJSON()
}

const VALID_USER_STATUSES = new Set(Object.values(USER_STATUS))

export async function updateUserStatus(userId, status) {
  if (!VALID_USER_STATUSES.has(status)) {
    throw createHttpError(400, 'INVALID_STATUS', `无效的用户状态: ${status}`)
  }

  const user = await User.findById(userId)

  if (!user) {
    throw createHttpError(404, 'USER_NOT_FOUND', '用户不存在')
  }

  // 状态未变化时直接返回，避免无意义的写操作
  if (user.status === status) {
    return user.toSafeJSON()
  }

  user.status = status
  await user.save()
  return user.toSafeJSON()
}

export async function batchUpdateUserStatus(ids, status) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw createHttpError(400, 'USER_IDS_REQUIRED', '请选择要操作的用户')
  }

  let updatedCount = 0
  for (const id of ids) {
    await updateUserStatus(id, status)
    updatedCount += 1
  }

  return { updatedCount, status }
}

async function assertRoleIdsExist(roleIds = []) {
  const ids = [...new Set(roleIds)]
  const roles = await Role.find({ _id: { $in: ids } })
  if (roles.length !== ids.length) {
    throw createHttpError(400, 'ROLE_NOT_FOUND', '包含不存在的角色')
  }
  if (roles.some((role) => role.code === BUILTIN_ROLE_CODES.SUPER_ADMIN || role.isSuperAdmin)) {
    throw createHttpError(403, 'SUPER_ROLE_PROTECTED', '不能通过用户管理分配超级管理员角色')
  }
  return ids
}

export async function createAdminUser(input) {
  const email = input.email.trim().toLowerCase()
  const exists = await User.exists({ email })
  if (exists) {
    throw createHttpError(409, 'EMAIL_EXISTS', '该邮箱已注册')
  }

  let roleIds = await assertRoleIdsExist(input.roleIds || [])
  if (!roleIds.length) {
    const visitorRole = await getVisitorRole()
    roleIds = visitorRole ? [visitorRole._id] : []
  }

  const user = await User.create({
    username: input.username.trim(),
    email,
    passwordHash: await bcrypt.hash(input.password, 12),
    remarkName: input.remarkName || '',
    roles: roleIds,
    status: input.status || USER_STATUS.ACTIVE
  })

  await user.populate('roles')
  return user.toSafeJSON({ roles: user.roles })
}

export async function updateUserRoles(userId, roleIds) {
  const user = await User.findById(userId).populate('roles')
  if (!user) {
    throw createHttpError(404, 'USER_NOT_FOUND', '用户不存在')
  }
  const isSuperAdminUser = user.role === 'super_admin' || (user.roles || []).some((role) => role?.isSuperAdmin || role?.code === BUILTIN_ROLE_CODES.SUPER_ADMIN)
  if (isSuperAdminUser) {
    throw createHttpError(403, 'SUPER_ADMIN_USER_PROTECTED', '超级管理员账号角色不允许修改')
  }

  const ids = await assertRoleIdsExist(roleIds)
  user.roles = ids
  await user.save()
  await user.populate('roles')
  return user.toSafeJSON({ roles: user.roles })
}

export async function updateUserRemark(userId, remarkName = '') {
  const user = await User.findById(userId).populate('roles')
  if (!user) {
    throw createHttpError(404, 'USER_NOT_FOUND', '用户不存在')
  }

  user.remarkName = String(remarkName || '').trim()
  await user.save()
  return user.toSafeJSON({ roles: user.roles })
}

export async function batchUpdateUserRoles(userIds, roleIds) {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw createHttpError(400, 'USER_IDS_REQUIRED', '请选择要操作的用户')
  }

  const ids = await assertRoleIdsExist(roleIds)
  const users = await User.find({ _id: { $in: userIds } }).populate('roles')
  if (users.some((user) => user.role === 'super_admin' || (user.roles || []).some((role) => role?.isSuperAdmin || role?.code === BUILTIN_ROLE_CODES.SUPER_ADMIN))) {
    throw createHttpError(403, 'SUPER_ADMIN_USER_PROTECTED', '批量操作不能修改超级管理员账号角色')
  }
  const result = await User.updateMany(
    { _id: { $in: userIds } },
    { $set: { roles: ids } }
  )

  return { updatedCount: result.modifiedCount || 0 }
}

export async function batchResetUserPasswords(userIds, newPassword) {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw createHttpError(400, 'USER_IDS_REQUIRED', '请选择要重置密码的用户')
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  const result = await User.updateMany(
    { _id: { $in: userIds } },
    {
      $set: {
        passwordHash,
        failedLoginCount: 0,
        lockedUntil: null,
        passwordChangedAt: new Date()
      },
      $inc: { tokenVersion: 1 }
    }
  )

  return { updatedCount: result.modifiedCount || 0 }
}

export async function deleteAdminUser(userId, operatorId = null) {
  const user = await User.findById(userId).populate('roles')
  if (!user) {
    throw createHttpError(404, 'USER_NOT_FOUND', '用户不存在')
  }

  const isSuperAdminUser = user.role === 'super_admin' || (user.roles || []).some((role) => role?.isSuperAdmin || role?.code === BUILTIN_ROLE_CODES.SUPER_ADMIN)
  if (isSuperAdminUser) {
    throw createHttpError(403, 'SUPER_ADMIN_USER_PROTECTED', '超级管理员账号不允许删除')
  }

  if (operatorId && user._id.toString() === operatorId.toString()) {
    throw createHttpError(403, 'SELF_DELETE_FORBIDDEN', '当前登录账号不允许删除自己')
  }

  await Promise.all([
    PermissionRequest.deleteMany({ user: user._id }),
    Comment.updateMany({ user: user._id }, { $set: { status: COMMENT_STATUS.DELETED } })
  ])
  await User.deleteOne({ _id: user._id })
  return { deletedCount: 1 }
}

export async function batchDeleteAdminUsers(userIds, operatorId = null) {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw createHttpError(400, 'USER_IDS_REQUIRED', '请选择要删除的用户')
  }

  let deletedCount = 0
  for (const userId of userIds) {
    const result = await deleteAdminUser(userId, operatorId)
    deletedCount += result.deletedCount || 0
  }

  return { deletedCount }
}

export async function listUsers(options = {}) {
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const skip = (page - 1) * pageSize

  // 构建筛选条件
  const query = {}
  if (options.keyword) {
    const keyword = options.keyword.trim()
    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    query.$or = [
      { username: regex },
      { email: regex },
      { remarkName: regex },
      { bio: regex },
      { location: regex },
      { website: regex }
    ]
  }
  if (options.role && options.role !== 'all') {
    const role = await Role.findOne({ code: options.role })
    query.$or = [
      { role: options.role },
      ...(role ? [{ roles: role._id }] : [])
    ]
  }
  if (options.status && options.status !== 'all') {
    query.status = options.status
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .populate('roles')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    User.countDocuments(query)
  ])
  const requestMap = new Map()
  const latestRequests = await PermissionRequest.find({
    user: { $in: users.map((user) => user._id) }
  }).sort({ createdAt: -1 })

  for (const request of latestRequests) {
    const userId = request.user.toString()
    if (!requestMap.has(userId)) {
      requestMap.set(userId, request.status)
    }
  }

  return {
    items: users.map((user) => ({
      ...user.toSafeJSON({ roles: user.roles }),
      permissionRequestStatus: requestMap.get(user._id.toString()) || 'none'
    })),
    total,
    page,
    pageSize
  }
}
