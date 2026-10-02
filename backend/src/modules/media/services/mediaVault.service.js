import crypto from 'node:crypto'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import { MediaCategory } from '#modules/media/models/MediaCategory.js'
import { MediaVault } from '#modules/media/models/MediaVault.js'
import { MediaVaultSession } from '#modules/media/models/MediaVaultSession.js'
import { env } from '#config/env'
import { ensureUserVaultCategory } from './mediaCategory.service.js'
import { resolveUploadRoot } from '#utils/uploadPath.js'

export const MEDIA_VAULT_COOKIE = 'media-vault-session'
// 密码验证成功后建立固定时长会话。读取状态、翻页或操作文件都不会续期。
export const MEDIA_VAULT_SESSION_MS = 30 * 60 * 1000
export const MEDIA_VAULT_MAX_AGE_MS = MEDIA_VAULT_SESSION_MS
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MS = 10 * 60 * 1000

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function getOwnerId(owner) {
  return owner?._id || owner?.id || owner
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex')
}

function readCookie(req, name) {
  const header = String(req?.headers?.cookie || '')
  const match = header.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : ''
}

function setVaultCookie(res, token) {
  res.cookie(MEDIA_VAULT_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: MEDIA_VAULT_MAX_AGE_MS,
    path: '/'
  })
}

function clearVaultCookie(res) {
  res.clearCookie(MEDIA_VAULT_COOKIE, { httpOnly: true, sameSite: 'lax', secure: env.nodeEnv === 'production', path: '/' })
}

function getSessionExpiry(session, now = new Date()) {
  if (!session) {
    return {
      expiresAt: null,
      remainingSeconds: 0
    }
  }

  const storedExpiresAt = new Date(session.expiresAt)
  // 兼容旧版本曾经创建的最长 2 小时会话：统一按会话创建时间收敛为 30 分钟，
  // 防止服务升级后旧会话继续拥有更长的访问窗口。
  const createdAt = session.createdAt ? new Date(session.createdAt) : null
  const fixedExpiresAt = createdAt && !Number.isNaN(createdAt.getTime())
    ? new Date(createdAt.getTime() + MEDIA_VAULT_SESSION_MS)
    : storedExpiresAt
  const effectiveExpiresAt = storedExpiresAt < fixedExpiresAt ? storedExpiresAt : fixedExpiresAt

  return {
    expiresAt: effectiveExpiresAt.toISOString(),
    remainingSeconds: Math.max(0, Math.ceil((effectiveExpiresAt.getTime() - now.getTime()) / 1000))
  }
}

function safeStatus(vault, session = null) {
  return {
    configured: Boolean(vault?.passwordHash),
    unlocked: Boolean(session),
    enabled: vault?.enabled !== false,
    categoryId: vault?.category?.toString?.() || null,
    ...getSessionExpiry(session)
  }
}

export function getVaultStorageRoot() {
  return path.resolve(resolveUploadRoot(), '..', 'uploads-private', 'vault')
}

export async function ensureMediaVault(owner) {
  const ownerId = getOwnerId(owner)
  if (!ownerId) throw createHttpError(401, 'MEDIA_VAULT_OWNER_REQUIRED', '请先登录')
  const category = await ensureUserVaultCategory(ownerId)
  return MediaVault.findOneAndUpdate(
    { owner: ownerId },
    { $setOnInsert: { owner: ownerId, category: category._id } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
}

async function findValidSession(owner, req) {
  const token = readCookie(req, MEDIA_VAULT_COOKIE)
  if (!token) return null
  const ownerId = getOwnerId(owner)
  const session = await MediaVaultSession.findOne({ owner: ownerId, tokenHash: hashToken(token) })
  if (!session || getSessionExpiry(session).remainingSeconds <= 0) return null
  const vault = await MediaVault.findOne({ _id: session.vault, owner: ownerId })
  if (!vault || !vault.enabled || !vault.passwordHash || vault.passwordVersion !== session.passwordVersion) return null
  // 密码箱验证采用固定时长窗口。读取状态、翻页或查看文件不会重新开始计时，
  // 避免普通点击把即将到期的验证重新延长。
  return session
}

export async function hasMediaVaultAccess(owner, req) {
  return Boolean(await findValidSession(owner, req))
}

export async function attachMediaVaultAccess(req) {
  req.mediaVaultUnlocked = Boolean(await hasMediaVaultAccess(req.user, req))
  // 媒体服务以 req.user 作为 actor 查询资源；把状态挂到请求级用户对象，
  // 让列表、上传、移动、删除和下载在同一次请求中共享解锁结果。该属性不在 User schema 中，
  // 不会写回数据库，只在当前请求生命周期内有效。
  if (req.user) req.user.mediaVaultUnlocked = req.mediaVaultUnlocked
  if (req.rbacUser) req.rbacUser.mediaVaultUnlocked = req.mediaVaultUnlocked
  return req.mediaVaultUnlocked
}

async function issueSession(vault, owner, res) {
  const token = crypto.randomBytes(32).toString('base64url')
  const now = new Date()
  await MediaVaultSession.deleteMany({ owner: getOwnerId(owner), expiresAt: { $lte: now } })
  const session = await MediaVaultSession.create({
    vault: vault._id,
    owner: getOwnerId(owner),
    tokenHash: hashToken(token),
    passwordVersion: vault.passwordVersion,
    expiresAt: new Date(now.getTime() + MEDIA_VAULT_MAX_AGE_MS),
    lastSeenAt: now
  })
  setVaultCookie(res, token)
  return session
}

export async function getMediaVaultStatus(owner, req) {
  const vault = await ensureMediaVault(owner)
  const session = await findValidSession(owner, req)
  return safeStatus(vault, session)
}

export async function setupMediaVault(owner, password, res) {
  const vault = await ensureMediaVault(owner)
  if (vault.passwordHash) throw createHttpError(409, 'MEDIA_VAULT_ALREADY_CONFIGURED', '密码箱已经设置过密码，请使用解锁或修改密码')
  vault.passwordHash = await bcrypt.hash(password, 12)
  vault.passwordVersion += 1
  vault.failedAttempts = 0
  vault.lockedUntil = null
  await vault.save()
  const session = await issueSession(vault, owner, res)
  return safeStatus(vault, session)
}

export async function unlockMediaVault(owner, password, req, res) {
  const vault = await ensureMediaVault(owner)
  if (!vault.passwordHash) throw createHttpError(409, 'MEDIA_VAULT_NOT_CONFIGURED', '密码箱尚未设置密码')
  if (vault.lockedUntil && vault.lockedUntil > new Date()) {
    throw createHttpError(429, 'MEDIA_VAULT_LOCKED', '密码错误次数过多，请稍后再试')
  }
  const valid = await bcrypt.compare(password, vault.passwordHash)
  if (!valid) {
    vault.failedAttempts += 1
    if (vault.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      vault.lockedUntil = new Date(Date.now() + LOCKOUT_MS)
      vault.failedAttempts = 0
    }
    await vault.save()
    throw createHttpError(400, 'MEDIA_VAULT_PASSWORD_INVALID', '密码箱密码错误')
  }
  vault.failedAttempts = 0
  vault.lockedUntil = null
  await vault.save()
  const session = await issueSession(vault, owner, res)
  return safeStatus(vault, session)
}

export async function lockMediaVault(owner, req, res) {
  const token = readCookie(req, MEDIA_VAULT_COOKIE)
  if (token) await MediaVaultSession.deleteOne({ owner: getOwnerId(owner), tokenHash: hashToken(token) })
  clearVaultCookie(res)
  return safeStatus(await ensureMediaVault(owner))
}

export async function revokeMediaVaultSession(owner, req, res) {
  const token = readCookie(req, MEDIA_VAULT_COOKIE)
  if (token && getOwnerId(owner)) {
    await MediaVaultSession.deleteOne({ owner: getOwnerId(owner), tokenHash: hashToken(token) })
  }
  clearVaultCookie(res)
}

export async function changeMediaVaultPassword(owner, { oldPassword = '', newPassword }, req, res = null) {
  const vault = await ensureMediaVault(owner)
  if (vault.passwordHash) {
    if (!oldPassword || !(await bcrypt.compare(oldPassword, vault.passwordHash))) {
      throw createHttpError(400, 'MEDIA_VAULT_PASSWORD_INVALID', '当前密码箱密码错误')
    }
  }
  vault.passwordHash = await bcrypt.hash(newPassword, 12)
  vault.passwordVersion += 1
  vault.failedAttempts = 0
  vault.lockedUntil = null
  await vault.save()
  await MediaVaultSession.deleteMany({ owner: getOwnerId(owner) })
  const session = res ? await issueSession(vault, owner, res) : null
  // 修改密码后旧会话必须立即失效；只有显式传入响应对象时才建立新会话。
  return safeStatus(vault, session)
}

export function requireMediaVaultAccess(actor) {
  if (actor?.mediaVaultUnlocked === true) return
  throw createHttpError(403, 'MEDIA_VAULT_UNLOCK_REQUIRED', '请先解锁密码箱')
}
