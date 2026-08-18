import crypto from 'node:crypto'
import { env } from '#config/env'
import { ArticleShareSession } from '../models/ArticleShareSession.js'
import { MediaShareRateLimit } from '#modules/mediaShare/models/MediaShareRateLimit.js'

const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000
const PASSWORD_RATE_WINDOW_MS = 15 * 60 * 1000
const PASSWORD_RATE_LOCK_MS = 30 * 60 * 1000
const PASSWORD_RATE_THRESHOLD = 8

function hashValue(value) {
  return crypto.createHmac('sha256', env.jwtSecret).update(String(value || '')).digest('hex')
}

function parseCookies(req) {
  return String(req.headers.cookie || '').split(';').reduce((result, item) => {
    const separatorIndex = item.indexOf('=')
    if (separatorIndex < 1) return result
    const key = item.slice(0, separatorIndex).trim()
    const value = item.slice(separatorIndex + 1).trim()
    try {
      result[key] = decodeURIComponent(value)
    } catch {
      result[key] = value
    }
    return result
  }, {})
}

function getCookieName(publicId) {
  return `article_share_${publicId}`
}

function getClientIpHash(req) {
  return hashValue(req.ip || req.socket?.remoteAddress || 'unknown')
}

function getPasswordRateKeys(share, req) {
  const shareId = share._id.toString()
  const ipHash = getClientIpHash(req)
  return [`article-share:${shareId}:ip:${ipHash}`, `article-share:${shareId}:global`]
}

function createRateLimitError(retryAfter) {
  const error = new Error('提取码尝试次数过多，请稍后再试')
  error.statusCode = 429
  error.code = 'ARTICLE_SHARE_PASSWORD_RATE_LIMITED'
  error.retryAfter = retryAfter
  return error
}

export async function assertArticleSharePasswordAttemptAllowed(share, req) {
  const now = new Date()
  const bucket = await MediaShareRateLimit.findOne({
    key: { $in: getPasswordRateKeys(share, req) },
    lockedUntil: { $gt: now }
  }).sort({ lockedUntil: -1 })
  if (!bucket) return
  throw createRateLimitError(Math.max(1, Math.ceil((bucket.lockedUntil.getTime() - now.getTime()) / 1000)))
}

export async function recordArticleSharePasswordFailure(share, req) {
  const now = new Date()
  const windowBoundary = new Date(now.getTime() - PASSWORD_RATE_WINDOW_MS)
  const expiresAt = new Date(now.getTime() + PASSWORD_RATE_LOCK_MS * 2)
  for (const key of getPasswordRateKeys(share, req)) {
    const bucket = await MediaShareRateLimit.findOne({ key })
    if (!bucket || bucket.windowStartedAt <= windowBoundary) {
      try {
        await MediaShareRateLimit.updateOne(
          { key },
          { $set: { failures: 1, windowStartedAt: now, lockedUntil: null, expiresAt } },
          { upsert: true }
        )
      } catch (error) {
        if (error.code !== 11000) throw error
        await MediaShareRateLimit.updateOne({ key }, { $set: { failures: 1, windowStartedAt: now, lockedUntil: null, expiresAt } })
      }
      continue
    }
    const failures = (bucket.failures || 0) + 1
    await MediaShareRateLimit.updateOne({ key }, {
      $set: {
        failures,
        expiresAt,
        lockedUntil: failures >= PASSWORD_RATE_THRESHOLD
          ? new Date(now.getTime() + PASSWORD_RATE_LOCK_MS)
          : bucket.lockedUntil
      }
    })
  }
}

export async function clearArticleSharePasswordFailures(share, req) {
  await MediaShareRateLimit.deleteOne({ key: getPasswordRateKeys(share, req)[0] })
}

export async function findValidArticleShareSession(share, req) {
  const token = parseCookies(req)[getCookieName(share.publicId)]
  if (!token) return null

  const session = await ArticleShareSession.findOne({
    share: share._id,
    tokenHash: hashValue(token),
    accessVersion: share.accessVersion,
    expiresAt: { $gt: new Date() }
  })
  if (!session) return null

  session.lastSeenAt = new Date()
  await session.save()
  return session
}

export async function createArticleShareSession(share, mode, req, res) {
  const token = crypto.randomBytes(32).toString('base64url')
  const now = Date.now()
  const naturalExpiry = now + SESSION_MAX_AGE_MS
  const expiresAt = share.expiresAt
    ? new Date(Math.min(naturalExpiry, share.expiresAt.getTime()))
    : new Date(naturalExpiry)

  const session = await ArticleShareSession.create({
    share: share._id,
    tokenHash: hashValue(token),
    accessVersion: share.accessVersion,
    mode,
    ipHash: getClientIpHash(req),
    expiresAt,
    lastSeenAt: new Date()
  })

  res.cookie(getCookieName(share.publicId), token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: `/api/public/article-shares/${share.publicId}`,
    maxAge: Math.max(1000, expiresAt.getTime() - now)
  })
  return session
}

export function invalidateArticleShareSessions(shareId) {
  return ArticleShareSession.deleteMany({ share: shareId })
}
