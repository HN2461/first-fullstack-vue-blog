import { Router } from 'express'
import { ok } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middlewares/auth.js'
import { User } from '../models/User.js'
import { Article } from '../models/Article.js'
import { Comment } from '../models/Comment.js'
import bcrypt from 'bcryptjs'
import multer, { MulterError } from 'multer'
import path from 'path'
import fs from 'node:fs'
import { env } from '../config/env.js'
import { createPermissionRequest, listPermissionRequests } from '../services/rbac.service.js'
import { decryptCredential } from '../utils/authSecurity.js'
import { notificationSettingsSchema, parseBody, passwordUpdateSchema, profileUpdateSchema } from '../validators/profile.validator.js'
import { permissionRequestQuerySchema, permissionRequestSchema } from '../validators/rbac.validator.js'

const router = Router()

// 头像和媒体文件使用同一个上传根目录，避免部署时出现两套上传路径。
const avatarDir = path.join(env.rootDir, env.uploadDir, 'avatars')
fs.mkdirSync(avatarDir, { recursive: true })

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${req.user._id}-${Date.now()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      const error = new Error('仅支持 JPG/PNG/GIF/WebP 格式')
      error.statusCode = 400
      error.code = 'INVALID_AVATAR_TYPE'
      cb(error)
    }
  }
})

function handleAvatarUpload(req, res, next) {
  upload.single('avatar')(req, res, (error) => {
    if (error) {
      if (error instanceof MulterError) {
        error.statusCode = 400
        error.code = error.code || 'UPLOAD_ERROR'
        if (error.code === 'LIMIT_FILE_SIZE') {
          error.message = '图片大小不能超过 5MB'
        }
      }
      next(error)
      return
    }

    next()
  })
}

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
 * 更新个人信息（昵称、简介、个人网站、所在地）
 */
router.put('/', requireAuth, asyncHandler(async (req, res) => {
  const updates = parseBody(profileUpdateSchema, req.body)

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
router.post('/avatar', requireAuth, handleAvatarUpload, asyncHandler(async (req, res) => {
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

  res.json(ok(user.toSafeJSON(), '头像上传成功'))
}))

/**
 * GET /api/profile/notifications
 * 获取当前用户通知偏好
 */
router.get('/notifications', requireAuth, asyncHandler(async (req, res) => {
  res.json(ok(req.user.toSafeJSON().notificationSettings))
}))

/**
 * PUT /api/profile/notifications
 * 更新当前用户通知偏好
 */
router.put('/notifications', requireAuth, asyncHandler(async (req, res) => {
  const input = parseBody(notificationSettingsSchema, req.body)
  const current = req.user.toSafeJSON().notificationSettings
  const notificationSettings = {
    ...current,
    ...input
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { notificationSettings } },
    { new: true }
  )

  res.json(ok(user.toSafeJSON().notificationSettings, '通知设置已保存'))
}))

/**
 * GET /api/profile/login-records
 * 登录记录暂未接入真实审计数据，先返回明确空状态，避免前端展示模拟记录。
 */
router.get('/login-records', requireAuth, asyncHandler(async (req, res) => {
  res.json(ok({
    items: [],
    total: 0,
    source: 'pending_integration'
  }))
}))

router.get('/permission-requests', requireAuth, asyncHandler(async (req, res) => {
  const input = parseBody(permissionRequestQuerySchema, req.query)
  res.json(ok(await listPermissionRequests({
    ...input,
    userId: req.user._id.toString()
  })))
}))

router.post('/permission-requests', requireAuth, asyncHandler(async (req, res) => {
  const input = parseBody(permissionRequestSchema, req.body)
  const request = await createPermissionRequest(req.user, input)
  res.status(201).json(ok(request, '权限申请已提交'))
}))

/**
 * PUT /api/profile/password
 * 修改密码
 */
router.put('/password', requireAuth, asyncHandler(async (req, res) => {
  const input = req.body.credential
    ? decryptCredential(req.body.credential, 'change-password')
    : parseBody(passwordUpdateSchema, req.body)
  const { oldPassword, newPassword } = parseBody(passwordUpdateSchema, input)

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
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      passwordHash,
      passwordChangedAt: new Date(),
      failedLoginCount: 0,
      lockedUntil: null
    },
    $inc: { tokenVersion: 1 }
  })

  res.json(ok(null, '密码修改成功'))
}))

export default router
