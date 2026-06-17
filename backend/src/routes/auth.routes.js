import { Router } from 'express'
import { ok } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middlewares/auth.js'
import { loginUser, registerUser, resetPassword } from '../services/auth.service.js'
import { loginSchema, parseBody, registerSchema, resetPasswordSchema } from '../validators/auth.validator.js'

export const authRouter = Router()

authRouter.post('/register', asyncHandler(async (req, res) => {
  const input = parseBody(registerSchema, req.body)
  const result = await registerUser(input)
  res.status(201).json(ok(result, '注册成功'))
}))

authRouter.post('/login', asyncHandler(async (req, res) => {
  const input = parseBody(loginSchema, req.body)
  const result = await loginUser(input)
  res.json(ok(result, '登录成功'))
}))

authRouter.post('/reset-password', asyncHandler(async (req, res) => {
  const input = parseBody(resetPasswordSchema, req.body)
  await resetPassword(input)
  res.json(ok(null, '密码重置成功，请使用新密码登录'))
}))

authRouter.post('/logout', (req, res) => {
  res.json(ok(null, '退出成功'))
})

authRouter.get('/me', requireAuth, (req, res) => {
  res.json(ok(req.user.toSafeJSON()))
})
