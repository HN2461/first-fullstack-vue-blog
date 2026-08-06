const rateLimitStore = new Map()

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function resolveClientAddress(req) {
  const forwardedFor = String(req.get('X-Forwarded-For') || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return forwardedFor.at(-1) || req.ip || req.socket?.remoteAddress || 'unknown'
}

function cleanupExpiredEntries(currentTime) {
  if (rateLimitStore.size < 1000) return

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= currentTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * 为公开认证接口提供轻量限流，避免挑战值、注册和登录接口被高频滥用。
 * @param {{ name: string, limit: number, windowMs: number }} options 限流名称、次数与时间窗口。
 * @returns {import('express').RequestHandler} Express 中间件；超限时返回 429。
 */
export function createTeaDemoRateLimit(options) {
  return function teaDemoRateLimit(req, res, next) {
    const currentTime = Date.now()
    cleanupExpiredEntries(currentTime)

    const key = `${options.name}:${resolveClientAddress(req)}`
    const existing = rateLimitStore.get(key)
    const record = !existing || existing.resetAt <= currentTime
      ? { count: 0, resetAt: currentTime + options.windowMs }
      : existing

    record.count += 1
    rateLimitStore.set(key, record)

    res.set('X-RateLimit-Limit', String(options.limit))
    res.set('X-RateLimit-Remaining', String(Math.max(0, options.limit - record.count)))
    res.set('X-RateLimit-Reset', String(Math.ceil(record.resetAt / 1000)))

    if (record.count > options.limit) {
      res.set('Retry-After', String(Math.max(1, Math.ceil((record.resetAt - currentTime) / 1000))))
      next(createHttpError(429, 'RATE_LIMITED', '请求过于频繁，请稍后再试'))
      return
    }

    next()
  }
}

export const teaDemoChallengeRateLimit = createTeaDemoRateLimit({
  name: 'challenge',
  limit: 60,
  windowMs: 60 * 1000
})

export const teaDemoLoginRateLimit = createTeaDemoRateLimit({
  name: 'login',
  limit: 30,
  windowMs: 15 * 60 * 1000
})

export const teaDemoRegisterRateLimit = createTeaDemoRateLimit({
  name: 'register',
  limit: 10,
  windowMs: 60 * 60 * 1000
})
