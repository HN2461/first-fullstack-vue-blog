import crypto from 'node:crypto'
import { env } from '#config/env'

const CHALLENGE_TTL_MS = 2 * 60 * 1000
const MAX_CHALLENGES = 1000
const AUTH_COOKIE_NAME = 'blog_session'
const keyPair = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
})

if (!global.authChallengeStore) {
  global.authChallengeStore = new Map()
}

const challengeStore = global.authChallengeStore

function now() {
  return Date.now()
}

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function cleanupChallenges() {
  const current = now()
  for (const [challengeId, record] of challengeStore.entries()) {
    if (record.expiresAt <= current) {
      challengeStore.delete(challengeId)
    }
  }

  if (challengeStore.size <= MAX_CHALLENGES) return

  const removable = [...challengeStore.entries()]
    .sort((a, b) => a[1].expiresAt - b[1].expiresAt)
    .slice(0, challengeStore.size - MAX_CHALLENGES)

  for (const [challengeId] of removable) {
    challengeStore.delete(challengeId)
  }
}

export function issueCredentialChallenge(purpose) {
  cleanupChallenges()

  const challengeId = crypto.randomUUID()
  const nonce = crypto.randomBytes(24).toString('base64url')
  const expiresAt = now() + CHALLENGE_TTL_MS

  challengeStore.set(challengeId, {
    purpose,
    nonce,
    expiresAt
  })

  return {
    challengeId,
    nonce,
    expiresAt: new Date(expiresAt).toISOString(),
    publicKey: keyPair.publicKey
  }
}

export function decryptCredential(encryptedCredential, expectedPurpose) {
  if (!encryptedCredential || typeof encryptedCredential !== 'object') {
    throw createHttpError(400, 'ENCRYPTED_CREDENTIAL_REQUIRED', '缺少安全凭据')
  }

  const { challengeId, payload } = encryptedCredential
  if (!challengeId || !payload) {
    throw createHttpError(400, 'ENCRYPTED_CREDENTIAL_REQUIRED', '安全凭据不完整')
  }

  const challenge = challengeStore.get(challengeId)
  challengeStore.delete(challengeId)

  if (!challenge || challenge.expiresAt <= now()) {
    throw createHttpError(400, 'AUTH_CHALLENGE_EXPIRED', '安全校验已过期，请重新提交')
  }

  if (challenge.purpose !== expectedPurpose) {
    throw createHttpError(400, 'AUTH_CHALLENGE_MISMATCH', '安全校验场景不匹配')
  }

  let decrypted
  try {
    decrypted = crypto.privateDecrypt(
      {
        key: keyPair.privateKey,
        oaepHash: 'sha256',
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
      },
      Buffer.from(payload, 'base64')
    )
  } catch {
    throw createHttpError(400, 'INVALID_ENCRYPTED_CREDENTIAL', '安全凭据无法解析')
  }

  let credential
  try {
    credential = JSON.parse(decrypted.toString('utf8'))
  } catch {
    throw createHttpError(400, 'INVALID_ENCRYPTED_CREDENTIAL', '安全凭据格式不正确')
  }

  if (
    credential.challengeId !== challengeId ||
    credential.nonce !== challenge.nonce ||
    credential.purpose !== expectedPurpose
  ) {
    throw createHttpError(400, 'INVALID_ENCRYPTED_CREDENTIAL', '安全凭据校验失败')
  }

  return credential
}

export function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'strict' : 'lax',
    path: '/',
    maxAge: env.sessionCookieMaxAgeMs
  })
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'strict' : 'lax',
    path: '/'
  })
}

export function getAuthCookieToken(req) {
  const cookieHeader = req.get('Cookie') || ''
  const cookies = cookieHeader.split(';').map((item) => item.trim())

  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf('=')
    if (separatorIndex === -1) continue

    const name = cookie.slice(0, separatorIndex)
    if (name !== AUTH_COOKIE_NAME) continue

    return decodeURIComponent(cookie.slice(separatorIndex + 1))
  }

  return ''
}

export function getAuthCookieName() {
  return AUTH_COOKIE_NAME
}
