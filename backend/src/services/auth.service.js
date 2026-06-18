import bcrypt from 'bcryptjs'
import { USER_STATUS } from '#constants/domain'
import { User } from '../models/User.js'
import { signAccessToken } from '../utils/jwt.js'
import { createPermissionRequest, getAdminBaseRole, getVisitorRole, hydrateUserPermissions } from './rbac.service.js'

const MAX_FAILED_LOGIN_COUNT = 5
const LOGIN_LOCK_MS = 15 * 60 * 1000

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function isLocked(user) {
  return user.lockedUntil && user.lockedUntil.getTime() > Date.now()
}

async function registerFailedLogin(user) {
  user.failedLoginCount = (user.failedLoginCount || 0) + 1

  if (user.failedLoginCount >= MAX_FAILED_LOGIN_COUNT) {
    user.lockedUntil = new Date(Date.now() + LOGIN_LOCK_MS)
  }

  await user.save()
}

async function registerSuccessfulLogin(user) {
  user.failedLoginCount = 0
  user.lockedUntil = null
  user.lastLoginAt = new Date()
  await user.save()
}

export async function registerUser(input) {
  const email = input.email.trim().toLowerCase()
  const exists = await User.exists({ email })

  if (exists) {
    throw createHttpError(409, 'EMAIL_EXISTS', '该邮箱已注册')
  }

  const passwordHash = await bcrypt.hash(input.password, 12)
  const visitorRole = await getVisitorRole()
  const user = await User.create({
    username: input.username.trim(),
    email,
    passwordHash,
    roles: visitorRole ? [visitorRole._id] : []
  })

  if (input.permissionRequestReason) {
    const targetRole = await getAdminBaseRole()
    if (targetRole) {
      await createPermissionRequest(user, {
        targetRoleId: targetRole._id.toString(),
        reason: input.permissionRequestReason
      })
    }
  }

  return {
    token: signAccessToken(user),
    user: await hydrateUserPermissions(user)
  }
}

export async function loginUser(input) {
  const email = input.email.trim().toLowerCase()
  const user = await User.findOne({ email })

  if (!user) {
    throw createHttpError(401, 'INVALID_CREDENTIALS', '邮箱或密码不正确')
  }

  if (user.status === USER_STATUS.DISABLED) {
    throw createHttpError(403, 'USER_DISABLED', '账号已被禁用')
  }

  if (isLocked(user)) {
    throw createHttpError(423, 'ACCOUNT_LOCKED', '登录失败次数过多，请稍后再试')
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash)

  if (!passwordMatches) {
    await registerFailedLogin(user)
    throw createHttpError(401, 'INVALID_CREDENTIALS', '邮箱或密码不正确')
  }

  await registerSuccessfulLogin(user)

  return {
    token: signAccessToken(user),
    user: await hydrateUserPermissions(user)
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
  user.tokenVersion = (user.tokenVersion || 0) + 1
  user.failedLoginCount = 0
  user.lockedUntil = null
  user.passwordChangedAt = new Date()
  await user.save()

  return user.toSafeJSON()
}

export async function resetPasswordByAdmin(input) {
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
  user.tokenVersion = (user.tokenVersion || 0) + 1
  user.failedLoginCount = 0
  user.lockedUntil = null
  user.passwordChangedAt = new Date()
  await user.save()

  return user.toSafeJSON()
}
