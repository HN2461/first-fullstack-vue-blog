import { LoginSession, LOGIN_SESSION_ONLINE_WINDOW_MS, LOGIN_SESSION_STATUS } from '#modules/auth/models/LoginSession.js'
import { User } from '#modules/user/models/User.js'

function getRequestIp(req) {
  const forwardedFor = req?.headers?.['x-forwarded-for']
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim()
  }

  const ip = req?.ip || req?.socket?.remoteAddress || ''
  if (ip === '::1') return '127.0.0.1'
  if (ip.startsWith('::ffff:')) return ip.slice(7)
  return ip
}

function isDateOnly(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))
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
    const endAt = new Date(options.to)
    if (isDateOnly(options.to)) {
      // 日期筛选的结束日应覆盖到 23:59:59.999，避免漏掉当天晚些时候的登录记录。
      endAt.setUTCDate(endAt.getUTCDate() + 1)
      match.loginAt = { ...(match.loginAt || {}), $lt: endAt }
    } else {
      match.loginAt = { ...(match.loginAt || {}), $lte: endAt }
    }
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

  const metricsPromise = options.includeMetrics === false
    ? Promise.resolve({ onlineCount: 0, onlineUserCount: 0, recentLoginCount: 0 })
    : getSessionMetrics()
  const [result, metrics] = await Promise.all([
    LoginSession.aggregate(pipeline),
    metricsPromise
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
    ...metrics
  }
}

async function getSessionMetrics() {
  const cutoff = new Date(Date.now() - LOGIN_SESSION_ONLINE_WINDOW_MS)
  const recentCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [onlineResult, onlineUsersResult, recentLoginResult] = await Promise.all([
    LoginSession.aggregate([
      {
        $match: {
          status: LOGIN_SESSION_STATUS.ACTIVE,
          logoutAt: null,
          lastSeenAt: { $gte: cutoff }
        }
      },
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
    ]),
    LoginSession.aggregate([
      {
        $match: {
          status: LOGIN_SESSION_STATUS.ACTIVE,
          logoutAt: null,
          lastSeenAt: { $gte: cutoff }
        }
      },
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
      { $group: { _id: '$user._id' } },
      { $count: 'value' }
    ]),
    LoginSession.aggregate([
      { $match: { loginAt: { $gte: recentCutoff } } },
      { $count: 'value' }
    ])
  ])

  return {
    onlineCount: onlineResult[0]?.value || 0,
    onlineUserCount: onlineUsersResult[0]?.value || 0,
    recentLoginCount: recentLoginResult[0]?.value || 0
  }
}

/**
 * 查询管理员可见的登录会话，并按最近心跳计算在线状态。
 * @param {{page?: number, pageSize?: number, keyword?: string, status?: string, from?: string, to?: string}} options - 分页和筛选条件。
 * @returns {Promise<{items: object[], total: number, onlineCount: number, onlineUserCount: number, recentLoginCount: number, page: number, pageSize: number}>} 会话列表和实时指标。
 */
export function listLoginSessions(options = {}) {
  return listSessions(options)
}

/**
 * 结束指定的后台可见登录会话。
 * @param {string} sessionRecordId - 登录会话文档 ID。
 * @param {string} currentSessionId - 操作者当前 JWT 关联的会话编号。
 * @returns {Promise<{id: string, status: string}>} 已结束的会话摘要。
 * @throws {Error} 会话不存在、已经结束或尝试结束当前会话时抛出业务错误。
 */
export async function revokeLoginSession(sessionRecordId, currentSessionId = '') {
  const session = await LoginSession.findById(sessionRecordId).select('_id sessionId status logoutAt')
  if (!session) {
    const error = new Error('登录会话不存在')
    error.statusCode = 404
    error.code = 'LOGIN_SESSION_NOT_FOUND'
    throw error
  }

  if (session.sessionId === currentSessionId) {
    const error = new Error('不能结束当前管理员会话，请使用退出登录')
    error.statusCode = 409
    error.code = 'LOGIN_SESSION_CURRENT'
    throw error
  }

  if (session.status !== LOGIN_SESSION_STATUS.ACTIVE || session.logoutAt) {
    const error = new Error('该登录会话已经结束')
    error.statusCode = 409
    error.code = 'LOGIN_SESSION_ALREADY_ENDED'
    throw error
  }

  const now = new Date()
  session.status = LOGIN_SESSION_STATUS.LOGGED_OUT
  session.logoutAt = now
  session.lastSeenAt = now
  await session.save()

  return { id: session._id.toString(), status: 'logged_out' }
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
    includeMetrics: false,
    userIds: [userId]
  })

  if (!result.total) {
    // 兼容尚未产生会话记录的历史账号，保留旧接口的空状态结构。
    return { items: [], total: 0, source: 'pending_integration' }
  }

  return { ...result, source: 'login_sessions' }
}
