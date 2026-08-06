import { TEA_DEMO_ROLES } from '#modules/teaDemo/constants/teaDemo.constants.js'
import { TeaDemoUser } from '#modules/teaDemo/models/TeaDemoUser.js'
import { verifyTeaDemoAccessToken } from '#modules/teaDemo/utils/teaDemoToken.js'

function authError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

export async function requireTeaDemoAuth(req, res, next) {
  try {
    const header = req.get('Authorization') || ''
    const bearerToken = header.startsWith('Bearer ') ? header.slice(7) : ''

    if (!bearerToken) {
      throw authError(401, 'UNAUTHORIZED', '请先登录')
    }

    const payload = verifyTeaDemoAccessToken(bearerToken)
    const user = await TeaDemoUser.findById(payload.sub)

    if (!user || user.status === 'disabled' || (payload.tv ?? 0) !== (user.tokenVersion || 0) || payload.scope !== 'tea-demo') {
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

export function requireTeaDemoPermissions(...permissions) {
  return function teaDemoPermissionMiddleware(req, res, next) {
    try {
      const user = req.user
      const safeUser = user?.toSafeJSON ? user.toSafeJSON() : null

      if (!safeUser) {
        throw authError(401, 'UNAUTHORIZED', '请先登录')
      }

      const requiredPermissions = permissions.flat().filter(Boolean)
      const hasPermission = safeUser.role === 'admin' || requiredPermissions.every((permission) => safeUser.permissions.includes(permission))

      if (!hasPermission) {
        throw authError(403, 'FORBIDDEN', '没有该接口的权限')
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

export function requireTeaDemoRole(role) {
  return function teaDemoRoleMiddleware(req, res, next) {
    try {
      const user = req.user
      const safeUser = user?.toSafeJSON ? user.toSafeJSON() : null

      if (!safeUser) {
        throw authError(401, 'UNAUTHORIZED', '请先登录')
      }

      if (safeUser.role !== role) {
        throw authError(403, 'FORBIDDEN', '没有该接口的权限')
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

export const requireTeaDemoAdmin = requireTeaDemoRole(TEA_DEMO_ROLES.ADMIN)
