import { USER_ROLES, USER_STATUS } from '#constants/domain'
import { User } from '#modules/user/models/User.js'
import { hydrateUserPermissions } from '#modules/rbac/services/rbac.service.js'
import { getAuthCookieToken } from '#utils/authSecurity.js'
import { verifyAccessToken } from '#utils/jwt.js'
import { isRoutePathMatched } from '#utils/routeMatch.js'

function authError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.get('Authorization') || ''
    const bearerToken = header.startsWith('Bearer ') ? header.slice(7) : ''
    const token = getAuthCookieToken(req) || bearerToken

    if (!token) {
      throw authError(401, 'UNAUTHORIZED', '请先登录')
    }

    const payload = verifyAccessToken(token)
    const user = await User.findById(payload.sub)

    if (!user || user.status === USER_STATUS.DISABLED || (payload.tv ?? 0) !== (user.tokenVersion || 0)) {
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

/**
 * 可选认证：尝试解析 token，成功则设置 req.user，失败也继续
 * 用于公开接口需要区分登录/未登录状态的场景
 */
export async function optionalAuth(req, res, next) {
  try {
    const header = req.get('Authorization') || ''
    const bearerToken = header.startsWith('Bearer ') ? header.slice(7) : ''
    const token = getAuthCookieToken(req) || bearerToken

    if (token) {
      const payload = verifyAccessToken(token)
      const user = await User.findById(payload.sub)

      if (user && user.status !== USER_STATUS.DISABLED && (payload.tv ?? 0) === (user.tokenVersion || 0)) {
        req.user = user
      }
    }
  } catch {
    // Token 无效或过期，不阻断请求
  }

  next()
}

export function requireAdmin(req, res, next) {
  ;(async () => {
    const safeUser = await hydrateUserPermissions(req.user)
    const hasAdminAccess = safeUser?.isSuperAdmin || safeUser?.permissions?.menuPaths?.some((path) => path.startsWith('/console/manage') || path === '/console')

    if (!hasAdminAccess && req.user?.role !== USER_ROLES.ADMIN && req.user?.role !== USER_ROLES.SUPER_ADMIN) {
      throw authError(403, 'FORBIDDEN', '没有后台访问权限')
    }

    req.rbacUser = safeUser
    next()
  })().catch(next)
}

export function requireSuperAdmin(req, res, next) {
  ;(async () => {
    const safeUser = req.rbacUser || await hydrateUserPermissions(req.user)

    if (!safeUser?.isSuperAdmin && req.user?.role !== USER_ROLES.SUPER_ADMIN) {
      throw authError(403, 'SUPER_ADMIN_REQUIRED', '仅超级管理员可执行该操作')
    }

    req.rbacUser = safeUser
    next()
  })().catch(next)
}

export function requireMenuAccess(routePath) {
  return function menuAccessMiddleware(req, res, next) {
    ;(async () => {
      const safeUser = req.rbacUser || await hydrateUserPermissions(req.user)
      const hasAccess = safeUser?.isSuperAdmin ||
        safeUser?.permissions?.menuPaths?.some((path) => isRoutePathMatched(routePath, path))

      if (!hasAccess) {
        throw authError(403, 'MENU_PERMISSION_REQUIRED', '没有该菜单的访问权限')
      }

      req.rbacUser = safeUser
      next()
    })().catch(next)
  }
}
