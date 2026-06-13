import { USER_ROLES, USER_STATUS } from '@blog/shared'
import { User } from '../models/User.js'
import { verifyAccessToken } from '../utils/jwt.js'

function authError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.get('Authorization') || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''

    if (!token) {
      throw authError(401, 'UNAUTHORIZED', '请先登录')
    }

    const payload = verifyAccessToken(token)
    const user = await User.findById(payload.sub)

    if (!user || user.status === USER_STATUS.DISABLED) {
      throw authError(401, 'UNAUTHORIZED', '登录状态已失效')
    }

    req.user = user
    next()
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401
      error.code = 'UNAUTHORIZED'
      error.message = '登录状态已失效'
    }
    next(error)
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
    const error = authError(403, 'FORBIDDEN', '没有后台访问权限')
    next(error)
    return
  }

  next()
}
