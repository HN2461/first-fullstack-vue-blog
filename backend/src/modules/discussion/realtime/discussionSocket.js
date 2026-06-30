import { Server } from 'socket.io'
import { env } from '#config/env'
import { USER_STATUS } from '#constants/domain'
import { getAuthCookieName } from '#utils/authSecurity.js'
import { verifyAccessToken } from '#utils/jwt.js'
import { hydrateUserPermissions } from '#modules/rbac/services/rbac.service.js'
import { DiscussionMember } from '#modules/discussion/models/DiscussionMember.js'
import { DISCUSSION_ROUTE_PATH } from '#modules/discussion/constants/discussion.constants.js'
import { User } from '#modules/user/models/User.js'
import { isRoutePathMatched } from '#utils/routeMatch.js'

let ioInstance = null

function getCookieValue(cookieHeader = '', name = '') {
  const cookies = String(cookieHeader || '').split(';').map((item) => item.trim())
  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf('=')
    if (separatorIndex === -1) continue
    if (cookie.slice(0, separatorIndex) === name) {
      return decodeURIComponent(cookie.slice(separatorIndex + 1))
    }
  }
  return ''
}

function getHandshakeToken(socket) {
  const authToken = socket.handshake.auth?.token || ''
  if (authToken) return authToken

  const header = socket.handshake.headers?.authorization || ''
  if (header.startsWith('Bearer ')) {
    return header.slice(7)
  }

  return getCookieValue(socket.handshake.headers?.cookie, getAuthCookieName())
}

async function authorizeSocket(socket, next) {
  try {
    const token = getHandshakeToken(socket)
    if (!token) throw new Error('请先登录')

    const payload = verifyAccessToken(token)
    const user = await User.findById(payload.sub)
    if (!user || user.status === USER_STATUS.DISABLED || (payload.tv ?? 0) !== (user.tokenVersion || 0)) {
      throw new Error('登录状态已失效')
    }

    const safeUser = await hydrateUserPermissions(user)
    const hasAccess = safeUser?.isSuperAdmin ||
      safeUser?.permissions?.menuPaths?.some((path) => isRoutePathMatched(DISCUSSION_ROUTE_PATH, path))
    if (!hasAccess) throw new Error('没有讨论模块访问权限')

    socket.data.user = user
    socket.data.safeUser = safeUser
    next()
  } catch (error) {
    next(error)
  }
}

async function joinDiscussionRooms(socket) {
  const userId = socket.data.user?._id
  if (!userId) return

  socket.join(`user:${userId}`)
  const memberships = await DiscussionMember.find({ userId }).select('threadId')
  memberships.forEach((item) => {
    socket.join(`discussion:${item.threadId}`)
  })
}

export function initDiscussionSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: env.clientOrigin,
      credentials: true
    }
  })

  const namespace = ioInstance.of('/discussions')
  namespace.use(authorizeSocket)
  namespace.on('connection', (socket) => {
    joinDiscussionRooms(socket).catch(() => socket.disconnect(true))
    socket.on('discussion:join', async (threadId, ack) => {
      const member = await DiscussionMember.findOne({ threadId, userId: socket.data.user._id }).select('_id')
      if (member) {
        socket.join(`discussion:${threadId}`)
        ack?.({ ok: true })
        return
      }
      ack?.({ ok: false })
    })
  })

  return ioInstance
}

export function emitDiscussionEvent(threadId, event, payload) {
  if (!ioInstance || !threadId) return
  ioInstance.of('/discussions').to(`discussion:${threadId}`).emit(event, payload)
}

export function emitDiscussionUserEvent(userId, event, payload) {
  if (!ioInstance || !userId) return
  ioInstance.of('/discussions').to(`user:${userId}`).emit(event, payload)
}
