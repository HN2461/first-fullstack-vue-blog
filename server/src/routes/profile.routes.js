import { Router } from 'express'
import { ok } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middlewares/auth.js'
import { User } from '../models/User.js'
import { Article } from '../models/Article.js'
import { Comment } from '../models/Comment.js'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import path from 'path'
import { env } from '../config/env.js'

const router = Router()

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(env.rootDir, 'uploads/avatars'))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${req.user._id}-${Date.now()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('仅支持 JPG/PNG/GIF/WebP 格式'))
    }
  }
})

/**
 * GET /api/profile
 * 获取当前用户详细信息
 */
router.get('/', requireAuth, (req, res) => {
  res.json(ok(req.user.toSafeJSON()))
})

/**
 * GET /api/profile/stats
 * 获取当前用户的统计数据
 */
router.get('/stats', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user._id

  // 并行查询文章数和评论数
  const [articleCount, commentCount, totalLikes] = await Promise.all([
    // 用户创建的文章数（未删除）
    Article.countDocuments({ createdBy: userId, deletedAt: null }),
    // 用户发布的评论数
    Comment.countDocuments({ user: userId }),
    // 用户文章获得的总点赞数
    Article.aggregate([
      { $match: { createdBy: userId, deletedAt: null } },
      { $group: { _id: null, total: { $sum: '$likeCount' } } }
    ]).then(result => result[0]?.total || 0)
  ])

  res.json(ok({
    articles: articleCount,
    comments: commentCount,
    likes: totalLikes
  }))
}))

/**
 * PUT /api/profile
 * 更新个人信息（昵称、简介）
 */
router.put('/', requireAuth, asyncHandler(async (req, res) => {
  const { username, bio } = req.body

  const updates = {}
  if (username !== undefined) {
    if (username.length < 2 || username.length > 32) {
      const error = new Error('昵称长度需在 2-32 个字符之间')
      error.statusCode = 400
      throw error
    }
    updates.username = username.trim()
  }
  if (bio !== undefined) {
    if (bio.length > 240) {
      const error = new Error('简介不能超过 240 个字符')
      error.statusCode = 400
      throw error
    }
    updates.bio = bio.trim()
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true }
  )

  res.json(ok(user.toSafeJSON(), '个人信息更新成功'))
}))

/**
 * POST /api/profile/avatar
 * 上传头像
 */
router.post('/avatar', requireAuth, upload.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error('请选择要上传的图片')
    error.statusCode = 400
    throw error
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar: avatarUrl } },
    { new: true }
  )

  res.json(ok({ avatar: avatarUrl }, '头像上传成功'))
}))

/**
 * PUT /api/profile/password
 * 修改密码
 */
router.put('/password', requireAuth, asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body

  if (!oldPassword || !newPassword) {
    const error = new Error('请输入原密码和新密码')
    error.statusCode = 400
    throw error
  }

  if (newPassword.length < 8) {
    const error = new Error('新密码至少需要 8 个字符')
    error.statusCode = 400
    throw error
  }

  // 验证原密码
  const user = await User.findById(req.user._id)
  const isValid = await bcrypt.compare(oldPassword, user.passwordHash)
  if (!isValid) {
    const error = new Error('原密码错误')
    error.statusCode = 400
    throw error
  }

  // 更新密码
  const passwordHash = await bcrypt.hash(newPassword, 12)
  await User.findByIdAndUpdate(req.user._id, { $set: { passwordHash } })

  res.json(ok(null, '密码修改成功'))
}))

export default router
