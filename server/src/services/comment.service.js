import { COMMENT_STATUS, USER_STATUS } from '@blog/shared'
import { Article } from '../models/Article.js'
import { Comment } from '../models/Comment.js'
import { User } from '../models/User.js'

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

export async function updateUserStatus(userId, status) {
  const user = await User.findById(userId)

  if (!user) {
    throw createHttpError(404, 'USER_NOT_FOUND', '用户不存在')
  }

  user.status = status
  await user.save()
  return user.toSafeJSON()
}

export async function listUsers(options = {}) {
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const skip = (page - 1) * pageSize

  const [users, total] = await Promise.all([
    User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    User.countDocuments()
  ])

  return {
    items: users.map((user) => user.toSafeJSON()),
    total,
    page,
    pageSize
  }
}
