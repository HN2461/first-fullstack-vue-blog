import { LoginSession, LOGIN_SESSION_ONLINE_WINDOW_MS, LOGIN_SESSION_STATUS } from '#modules/auth/models/LoginSession.js'
import { User } from '#modules/user/models/User.js'

function getRequestIp(req) {
  const forwardedFor = req?.headers?.['x-forwarded-for']
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim()
  }

  return req?.ip || req?.socket?.remoteAddress || ''
}

function parseUserAgent(userAgent = '') {
  const value = String(userAgent || '')
  const device = /mobile|android|iphone|ipad|ipod/i.test(value)
    ? (/ipad|tablet/i.test(value) ? '平板设备' : '移动设备')
    : '桌面设备'

  let browser = '未知浏览器'
  if (/edg\//i.test(value)) browser = 'Microsoft Edge'
  else if (/opr\//i.test(value)) browser = 'Opera'
  else if (/chrome\//i.test(value)) browser = 'Google Chrome'
  else if (/firefox\//i.test(value)) browser = 'Mozilla Firefox'
  else if (/safari\//i.test(value) && !/chrome\//i.test(value)) browser = 'Safari'
  else if (/msie|trident\//i.test(value)) browser = 'Internet Explorer'

  return { device, browser }
}

export function getLoginSessionRequestMeta(req) {
  const userAgent = String(req?.get?.('user-agent') || req?.headers?.['user-agent'] || '')
  const { device, browser } = parseUserAgent(userAgent)

  return {
    ip: getRequestIp(req),
    userAgent,
    device,
    browser
  }
}

/**
 * 创建一次成功认证对应的登录会话。
 * @param {{user: import('mongoose').Document, sessionId: string, req?: import('express').Request}} input - 用户、JWT 会话编号和请求元数据。
 * @returns {Promise<import('mongoose').Document>} 已保存的登录会话。
 */
export async function createLoginSession({ user, sessionId, req }) {
  const meta = getLoginSessionRequestMeta(req)
  return LoginSession.create({
    user: user._id,
    sessionId,
    tokenVersion: user.tokenVersion || 0,
    loginAt: new Date(),
    lastSeenAt: new Date(),
    ...meta
  })
}

/**
 * 更新当前会话的心跳时间。
 * @param {{userId: string|object, sessionId: string}} input - 用户 ID 与 JWT 会话编号。
 * @returns {Promise<boolean>} 是否找到并更新了有效会话。
 */
export async function touchLoginSession({ userId, sessionId }) {
  if (!userId || !sessionId) return false

  const result = await LoginSession.updateOne(
    {
      user: userId,
      sessionId,
      status: LOGIN_SESSION_STATUS.ACTIVE,
      logoutAt: null
    },
    { $set: { lastSeenAt: new Date() } }
  )

  return result.modifiedCount > 0 || result.matchedCount > 0
}

/**
 * 将当前会话标记为主动退出。
 * @param {{userId: string|object, sessionId: string}} input - 用户 ID 与 JWT 会话编号。
 * @returns {Promise<boolean>} 是否成功结束会话。
 */
export async function logoutLoginSession({ userId, sessionId }) {
  if (!userId || !sessionId) return false

  const result = await LoginSession.updateOne(
    { user: userId, sessionId, status: LOGIN_SESSION_STATUS.ACTIVE },
    {
      $set: {
        status: LOGIN_SESSION_STATUS.LOGGED_OUT,
        logoutAt: new Date(),
        lastSeenAt: new Date()
      }
    }
  )

  return result.modifiedCount > 0
}

function buildSessionMatch(options = {}, userIds = null) {
  const match = {}
  const status = options.status && options.status !== 'all' ? options.status : 'all'
  const now = Date.now()
  const onlineCutoff = new Date(now - LOGIN_SESSION_ONLINE_WINDOW_MS)

  const scopedUserIds = userIds || options.userIds
  if (Array.isArray(scopedUserIds)) {
    match.user = { $in: scopedUserIds }
  }

  if (options.from) {
    match.loginAt = { ...(match.loginAt || {}), $gte: new Date(options.from) }
  }
  if (options.to) {
    match.loginAt = { ...(match.loginAt || {}), $lte: new Date(options.to) }
  }

  if (status === 'online') {
    match.status = LOGIN_SESSION_STATUS.ACTIVE
    match.logoutAt = null
    match.lastSeenAt = { $gte: onlineCutoff }
  }

  return match
}

function addUserLookup(pipeline) {
  pipeline.push(
    {
      $lookup: {
        from: User.collection.name,
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' }
  )
}

function addKeywordFilter(pipeline, keyword) {
  if (!keyword) return
  const regex = new RegExp(keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  pipeline.push({
    $match: {
      $or: [
        { 'user.username': regex },
        { 'user.email': regex },
        { 'user.remarkName': regex }
      ]
    }
  })
}

function projectSession() {
  return {
    $project: {
      _id: 0,
      id: { $toString: '$_id' },
      sessionId: 1,
      tokenVersion: 1,
      userTokenVersion: '$user.tokenVersion',
      loginAt: 1,
      lastSeenAt: 1,
      logoutAt: 1,
      status: 1,
      ip: 1,
      device: 1,
      browser: 1,
      userAgent: 1,
      user: {
        id: { $toString: '$user._id' },
        username: '$user.username',
        email: '$user.email',
        avatar: '$user.avatar',
        remarkName: '$user.remarkName',
        role: '$user.role',
        status: '$user.status'
      }
    }
  }
}

function sessionResponseItem(item, now = Date.now()) {
  // 聚合查询只投影安全用户字段，状态判断依赖账号是否仍然有效。
  const userVersionMatches = Number(item.tokenVersion || 0) === Number(item.userTokenVersion || 0)
  const isOnline = item.status === LOGIN_SESSION_STATUS.ACTIVE && !item.logoutAt &&
    new Date(item.lastSeenAt).getTime() >= now - LOGIN_SESSION_ONLINE_WINDOW_MS &&
    item.user?.status === 'active' && userVersionMatches

  const { sessionId, tokenVersion, userTokenVersion, ...safeItem } = item
  return {
    ...safeItem,
    status: isOnline ? 'online' : (item.logoutAt ? 'logged_out' : 'offline'),
    current: false
  }
}

async function listSessions(options = {}) {
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const skip = (page - 1) * pageSize
  const match = buildSessionMatch(options)
  const pipeline = [{ $match: match }]
  addUserLookup(pipeline)
  addKeywordFilter(pipeline, options.keyword)

  if (options.status === 'online') {
    pipeline.push({
      $match: {
        'user.status': 'active',
        $expr: { $eq: ['$tokenVersion', '$user.tokenVersion'] }
      }
    })
  } else if (options.status === 'offline') {
    const onlineCutoff = new Date(Date.now() - LOGIN_SESSION_ONLINE_WINDOW_MS)
    pipeline.push({
      $match: {
        $or: [
          { status: { $ne: LOGIN_SESSION_STATUS.ACTIVE } },
          { logoutAt: { $ne: null } },
          { lastSeenAt: { $lt: onlineCutoff } },
          { 'user.status': { $ne: 'active' } },
          { $expr: { $ne: ['$tokenVersion', '$user.tokenVersion'] } }
        ]
      }
    })
  }

  pipeline.push(
    { $sort: { loginAt: -1 } },
    {
      $facet: {
        items: [
          { $skip: skip },
          { $limit: pageSize },
          projectSession()
        ],
        total: [{ $count: 'value' }]
      }
    }
  )

  const [result, onlineCount] = await Promise.all([
    LoginSession.aggregate(pipeline),
    countOnlineSessions()
  ])
  const pageResult = result[0] || { items: [], total: [] }
  const now = Date.now()

  return {
    items: (pageResult.items || []).map((item) => ({
      ...sessionResponseItem(item, now),
      current: Boolean(options.currentSessionId && item.sessionId === options.currentSessionId)
    })),
    total: pageResult.total?.[0]?.value || 0,
    page,
    pageSize,
    onlineCount
  }
}

async function countOnlineSessions() {
  const cutoff = new Date(Date.now() - LOGIN_SESSION_ONLINE_WINDOW_MS)
  const result = await LoginSession.aggregate([
    {
      $match: {
        status: LOGIN_SESSION_STATUS.ACTIVE,
        logoutAt: null,
        lastSeenAt: { $gte: cutoff }
      }
    },
    ...[
      {
        $lookup: {
          from: User.collection.name,
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $match: {
          'user.status': 'active',
          $expr: { $eq: ['$tokenVersion', '$user.tokenVersion'] }
        }
      },
      { $count: 'value' }
    ]
  ])

  return result[0]?.value || 0
}

/**
 * 查询管理员可见的登录会话，并按最近心跳计算在线状态。
 * @param {{page?: number, pageSize?: number, keyword?: string, status?: string, from?: string, to?: string}} options - 分页和筛选条件。
 * @returns {Promise<{items: object[], total: number, onlineCount: number, page: number, pageSize: number}>} 会话列表和在线数量。
 */
export function listLoginSessions(options = {}) {
  return listSessions(options)
}

/**
 * 查询当前用户自己的登录会话记录。
 * @param {string|object} userId - 当前用户 ID。
 * @param {{pageSize?: number, currentSessionId?: string}} options - 查询上限和当前会话编号。
 * @returns {Promise<object>} 当前用户登录记录，历史账号无记录时返回兼容空状态。
 */
export async function listMyLoginSessions(userId, options = {}) {
  const result = await listSessions({
    ...options,
    page: 1,
    pageSize: Math.min(50, Math.max(1, Number(options.pageSize) || 20)),
    status: 'all',
    userIds: [userId]
  })

  if (!result.total) {
    // 兼容尚未产生会话记录的历史账号，保留旧接口的空状态结构。
    return { items: [], total: 0, source: 'pending_integration' }
  }

  return { ...result, source: 'login_sessions' }
}
