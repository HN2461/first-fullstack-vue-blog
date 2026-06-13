import { Router } from 'express'
import { ok } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middlewares/auth.js'
import { loginUser, registerUser } from '../services/auth.service.js'
import { loginSchema, parseBody, registerSchema } from '../validators/auth.validator.js'

export const authRouter = Router()

// 验证码存储（与 captcha.routes.js 共享，生产环境建议使用 Redis）
// 注意：这里需要从 captcha.routes.js 导入，但由于是简单实现，我们直接从全局获取
// 实际项目中应该使用共享的存储层

authRouter.post('/register', asyncHandler(async (req, res) => {
  const input = parseBody(registerSchema, req.body)
  const result = await registerUser(input)
  res.status(201).json(ok(result, '注册成功'))
}))

authRouter.post('/login', asyncHandler(async (req, res) => {
  const input = parseBody(loginSchema, req.body)

  // 验证验证码
  const { captchaId, captchaText, ...loginData } = input

  // 从验证码路由的存储中获取验证码
  // 注意：这是简化实现，生产环境应使用 Redis 等共享存储
  const captchaStore = global.captchaStore || new Map()
  const storedCaptcha = captchaStore.get(captchaId)

  if (!storedCaptcha) {
    const error = new Error('验证码已过期，请重新获取')
    error.statusCode = 400
    error.code = 'CAPTCHA_EXPIRED'
    throw error
  }

  // 删除已使用的验证码
  captchaStore.delete(captchaId)

  // 比对验证码（不区分大小写）
  if (storedCaptcha.text !== captchaText.toLowerCase()) {
    const error = new Error('验证码错误')
    error.statusCode = 400
    error.code = 'CAPTCHA_INVALID'
    throw error
  }

  const result = await loginUser(loginData)
  res.json(ok(result, '登录成功'))
}))

authRouter.post('/logout', (req, res) => {
  res.json(ok(null, '退出成功'))
})

authRouter.get('/me', requireAuth, (req, res) => {
  res.json(ok(req.user.toSafeJSON()))
})
