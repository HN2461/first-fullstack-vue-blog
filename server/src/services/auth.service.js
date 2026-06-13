import bcrypt from 'bcryptjs'
import { USER_STATUS } from '@blog/shared'
import { User } from '../models/User.js'
import { signAccessToken } from '../utils/jwt.js'

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

export async function registerUser(input) {
  const email = input.email.trim().toLowerCase()
  const exists = await User.exists({ email })

  if (exists) {
    throw createHttpError(409, 'EMAIL_EXISTS', '该邮箱已注册')
  }

  const passwordHash = await bcrypt.hash(input.password, 12)
  const user = await User.create({
    username: input.username.trim(),
    email,
    passwordHash
  })

  return {
    token: signAccessToken(user),
    user: user.toSafeJSON()
  }
}

export async function loginUser(input) {
  const email = input.email.trim().toLowerCase()
  const user = await User.findOne({ email })

  if (!user) {
    throw createHttpError(401, 'INVALID_CREDENTIALS', '邮箱或密码不正确')
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash)

  if (!passwordMatches) {
    throw createHttpError(401, 'INVALID_CREDENTIALS', '邮箱或密码不正确')
  }

  if (user.status === USER_STATUS.DISABLED) {
    throw createHttpError(403, 'USER_DISABLED', '账号已被禁用')
  }

  return {
    token: signAccessToken(user),
    user: user.toSafeJSON()
  }
}
