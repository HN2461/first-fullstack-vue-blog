import crypto from 'node:crypto'
import { env } from '#config/env'
import { MediaShareRateLimit } from '../models/MediaShareRateLimit.js'
import { MediaShareSession } from '../models/MediaShareSession.js'

const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000
const RATE_BUCKETS = [
  { type: 'share-ip', windowMs: 15 * 60 * 1000, threshold: 5, lockMs: 30 * 60 * 1000 },
  { type: 'ip', windowMs: 15 * 60 * 1000, threshold: 20, lockMs: 60 * 60 * 1000 },
  { type: 'share', windowMs: 5 * 60 * 1000, threshold: 80, lockMs: 10 * 60 * 1000 }
]

function createSecurityError(message, code, retryAfter = 0) {
  const error = new Error(message)
  error.statusCode = 429
  error.code = code
  error.retryAfter = retryAfter
  return error
}

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
  return `media_share_${publicId}`
}

function getClientIpHash(req) {
  return hashValue(req.ip || req.socket?.remoteAddress || 'unknown')
}

function getRateKey(type, shareId, ipHash) {
  if (type === 'share-ip') return `share:${shareId}:ip:${ipHash}`
  if (type === 'ip') return `ip:${ipHash}`
  return `share:${shareId}:global`
}

function getRateDefinitions(shareId, ipHash) {
  return RATE_BUCKETS.map((item) => ({
    ...item,
    key: getRateKey(item.type, shareId, ipHash)
  }))
}

export async function assertPasswordAttemptAllowed(share, req) {
  const now = new Date()
  const definitions = getRateDefinitions(share._id.toString(), getClientIpHash(req))
  const bucket = await MediaShareRateLimit.findOne({
    key: { $in: definitions.map((item) => item.key) },
    lockedUntil: { $gt: now }
  }).sort({ lockedUntil: -1 })

  if (!bucket) return
  const retryAfter = Math.max(1, Math.ceil((bucket.lockedUntil.getTime() - now.getTime()) / 1000))
  throw createSecurityError('提取码尝试次数过多，请稍后再试', 'SHARE_PASSWORD_RATE_LIMITED', retryAfter)
}

async function recordBucketFailure(definition) {
  const now = new Date()
  let bucket = await MediaShareRateLimit.findOne({ key: definition.key })

  if (!bucket) {
    try {
      bucket = await MediaShareRateLimit.create({
        key: definition.key,
        failures: 0,
        windowStartedAt: now,
        expiresAt: new Date(now.getTime() + Math.max(definition.windowMs, definition.lockMs) * 2)
      })
    } catch (error) {
      if (error.code !== 11000) throw error
      bucket = await MediaShareRateLimit.findOne({ key: definition.key })
    }
  }

  if (now.getTime() - bucket.windowStartedAt.getTime() >= definition.windowMs) {
    bucket.failures = 0
    bucket.windowStartedAt = now
    bucket.lockedUntil = null
  }

  bucket.failures += 1
  bucket.expiresAt = new Date(now.getTime() + Math.max(definition.windowMs, definition.lockMs) * 2)
  if (bucket.failures >= definition.threshold) {
    bucket.lockedUntil = new Date(now.getTime() + definition.lockMs)
  }
  await bucket.save()
}

export async function recordPasswordFailure(share, req) {
  const ipHash = getClientIpHash(req)
  const definitions = getRateDefinitions(share._id.toString(), ipHash)
  for (const definition of definitions) {
    await recordBucketFailure(definition)
  }
}

export async function clearPasswordFailure(share, req) {
  const ipHash = getClientIpHash(req)
  await MediaShareRateLimit.deleteOne({
    key: getRateKey('share-ip', share._id.toString(), ipHash)
  })
}

export async function findValidShareSession(share, req) {
  const token = parseCookies(req)[getCookieName(share.publicId)]
  if (!token) return null

  const session = await MediaShareSession.findOne({
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

export async function createShareSession(share, mode, req, res) {
  const token = crypto.randomBytes(32).toString('base64url')
  const now = Date.now()
  const naturalExpiry = now + SESSION_MAX_AGE_MS
  const expiresAt = share.expiresAt
    ? new Date(Math.min(naturalExpiry, share.expiresAt.getTime()))
    : new Date(naturalExpiry)

  const session = await MediaShareSession.create({
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
    path: `/api/public/media-shares/${share.publicId}`,
    maxAge: Math.max(1000, expiresAt.getTime() - now)
  })
  return session
}

export async function invalidateShareSessions(shareId) {
  await MediaShareSession.deleteMany({ share: shareId })
}
