import { Router } from 'express'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import { requireAuth } from '#middlewares/auth.js'
import { User } from '#modules/user/models/User.js'
import { Article } from '#modules/content/models/Article.js'
import { Comment } from '#modules/interaction/models/Comment.js'
import bcrypt from 'bcryptjs'
import multer, { MulterError } from 'multer'
import path from 'path'
import fs from 'node:fs'
import { env } from '#config/env'
import { resolveUploadRoot } from '#utils/uploadPath.js'
import {
  createPermissionRequest,
  hydrateUserPermissions,
  listPermissionRequestRoles,
  listPermissionRequests
} from '#modules/rbac/services/rbac.service.js'
import { decryptCredential } from '#utils/authSecurity.js'
import { festivalEffectActionSchema, notificationSettingsSchema, parseBody, passwordUpdateSchema, profileUpdateSchema, quickActionsSchema } from '#modules/user/validators/profile.validator.js'
import { permissionRequestQuerySchema, permissionRequestSchema } from '#modules/rbac/validators/rbac.validator.js'

const router = Router()

// 头像和媒体文件使用同一个上传根目录，避免部署时出现两套上传路径。
const avatarDir = path.join(resolveUploadRoot(), 'avatars')
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
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  res.json(ok(await hydrateUserPermissions(req.user)))
}))

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
 * 更新个人信息、个人入场动效和网站欢迎屏蔽偏好。
 */
router.put('/', requireAuth, asyncHandler(async (req, res) => {
  const updates = parseBody(profileUpdateSchema, req.body)

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true }
  )

  res.json(ok(await hydrateUserPermissions(user), '个人信息更新成功'))
}))

/**
 * GET /api/profile/festival-effect
 * 返回节日特效所需的可信服务器日期和当前用户生日配置。
 */
router.get('/festival-effect', requireAuth, asyncHandler(async (req, res) => {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const safeUser = req.user.toSafeJSON()
  const birthMonthDay = safeUser.birthday ? safeUser.birthday.slice(5) : ''
  const isBirthdayToday = Boolean(birthMonthDay && birthMonthDay === today.slice(5))

  res.json(ok({
    serverTime: now.toISOString(),
    serverDate: today,
    birthday: safeUser.birthday,
    closeBirthEffect: safeUser.closeBirthEffect,
    lastBirthEffectDate: safeUser.lastBirthEffectDate,
    isBirthdayToday,
    shouldShowBirthEffect: isBirthdayToday && !safeUser.closeBirthEffect && safeUser.lastBirthEffectDate !== today
  }))
}))

/**
 * PUT /api/profile/festival-effect
 * 记录生日弹窗已触发或永久关闭，使用服务器日期避免重复骚扰。
 */
router.put('/festival-effect', requireAuth, asyncHandler(async (req, res) => {
  const input = parseBody(festivalEffectActionSchema, req.body)
  const today = new Date().toISOString().slice(0, 10)
  const updates = input.action === 'close-birth-effect'
    ? { closeBirthEffect: true, lastBirthEffectDate: today }
    : { lastBirthEffectDate: today }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true }
  )

  res.json(ok(await hydrateUserPermissions(user), '节日特效状态已保存'))
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

  res.json(ok(await hydrateUserPermissions(user), '头像上传成功'))
}))

/**
 * DELETE /api/profile/avatar
 * 删除当前用户头像，仅清空头像引用；历史上传文件作为运行数据保留，避免误删共享或备份文件。
 */
router.delete('/avatar', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar: '' } },
    { new: true }
  )

  res.json(ok(await hydrateUserPermissions(user), '头像已删除'))
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
 * PUT /api/profile/quick-actions
 * 保存当前用户的工作台快捷功能排序。只保留用户当前仍有权限访问的后台菜单路径，避免跨设备后出现无效入口。
 */
router.put('/quick-actions', requireAuth, asyncHandler(async (req, res) => {
  const input = parseBody(quickActionsSchema, req.body)
  const safeUser = await hydrateUserPermissions(req.user)
  const allowedPaths = new Set([
    '/console/articles',
    '/console/memos',
    ...((safeUser.permissions?.flatMenus || [])
      .map((menu) => menu.routePath)
      .filter((routePath) => routePath && routePath !== '/console'))
  ])
  const routes = [...new Set(input.routes)].filter((routePath) => allowedPaths.has(routePath))

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { quickActions: routes } },
    { new: true }
  )

  res.json(ok((await hydrateUserPermissions(user)).quickActions || [], '快捷功能已保存'))
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

router.get('/permission-request-roles', requireAuth, asyncHandler(async (req, res) => {
  res.json(ok(await listPermissionRequestRoles(req.user)))
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
