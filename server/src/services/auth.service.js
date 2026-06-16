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

export async function resetPassword(input) {
  const email = input.email.trim().toLowerCase()
  const user = await User.findOne({ email })

  if (!user) {
    throw createHttpError(404, 'USER_NOT_FOUND', '该邮箱未注册')
  }

  if (user.status === USER_STATUS.DISABLED) {
    throw createHttpError(403, 'USER_DISABLED', '账号已被禁用，无法重置密码')
  }

  const sameAsCurrent = await bcrypt.compare(input.newPassword, user.passwordHash)
  if (sameAsCurrent) {
    throw createHttpError(400, 'PASSWORD_UNCHANGED', '新密码不能与当前密码相同')
  }

  user.passwordHash = await bcrypt.hash(input.newPassword, 12)
  await user.save()

  return user.toSafeJSON()
}
