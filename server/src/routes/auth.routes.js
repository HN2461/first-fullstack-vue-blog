import { Router } from 'express'
import { ok } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { requireAuth } from '../middlewares/auth.js'
import { loginUser, registerUser } from '../services/auth.service.js'
import { loginSchema, parseBody, registerSchema } from '../validators/auth.validator.js'

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

authRouter.post('/logout', (req, res) => {
  res.json(ok(null, '退出成功'))
})

authRouter.get('/me', requireAuth, (req, res) => {
  res.json(ok(req.user.toSafeJSON()))
})
