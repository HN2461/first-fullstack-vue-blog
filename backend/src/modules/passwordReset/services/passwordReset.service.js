import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { env } from '#config/env'
import { USER_ROLES, USER_STATUS } from '#constants/domain'
import { User } from '#modules/user/models/User.js'
import { PasswordResetRecord } from '#modules/passwordReset/models/PasswordResetRecord.js'
import { PasswordResetRateLimit } from '#modules/passwordReset/models/PasswordResetRateLimit.js'

const INSPECT_WINDOW_MS = 10 * 60 * 1000
const CONSUME_FAILURE_WINDOW_MS = 15 * 60 * 1000

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex')
}

function maskEmail(email) {
  const [name = '', domain = ''] = String(email || '').split('@')
  const visible = name.slice(0, Math.min(2, name.length))
  return `${visible}${'*'.repeat(Math.max(2, name.length - visible.length))}@${domain}`
}

function getRecordStatus(record, now = new Date()) {
  if (record.usedAt) return 'used'
  if (record.revokedAt) return 'revoked'
  if (record.expiresAt && record.expiresAt <= now) return 'expired'
  return 'active'
}

function serializeOperator(value) {
  if (!value || typeof value !== 'object') return null
  return {
    id: value._id?.toString?.() || value.toString?.() || '',
    username: value.username || '',
    email: value.email || ''
  }
}

function serializeRecord(record) {
  return {
    id: record._id.toString(),
    mode: record.mode,
    status: getRecordStatus(record),
    expiresAt: record.expiresAt,
    usedAt: record.usedAt,
    revokedAt: record.revokedAt,
    createdBy: serializeOperator(record.createdBy),
    revokedBy: serializeOperator(record.revokedBy),
    note: record.note || '',
    createdAt: record.createdAt
  }
}

function isSuperAdminUser(user) {
  return user?.role === USER_ROLES.SUPER_ADMIN || (user?.roles || []).some((role) => role?.isSuperAdmin || role?.code === 'super-admin')
}

async function assertRateLimit(action, key, maxAttempts, windowMs) {
  const now = new Date()
  const compositeKey = hashToken(key).slice(0, 48)
  const cutoff = new Date(now.getTime() - windowMs)
  const expiresAt = new Date(now.getTime() + windowMs * 2)
  let record

  try {
    record = await PasswordResetRateLimit.findOneAndUpdate(
      { action, key: compositeKey },
      [{
        $set: {
          action,
          key: compositeKey,
          count: {
            $cond: [
              { $or: [{ $eq: [{ $type: '$windowStartedAt' }, 'missing'] }, { $lte: ['$windowStartedAt', cutoff] }] },
              1,
              { $add: [{ $ifNull: ['$count', 0] }, 1] }
            ]
          },
          windowStartedAt: {
            $cond: [
              { $or: [{ $eq: [{ $type: '$windowStartedAt' }, 'missing'] }, { $lte: ['$windowStartedAt', cutoff] }] },
              now,
              '$windowStartedAt'
            ]
          },
          expiresAt
        }
      }],
      { upsert: true, new: true }
    )
  } catch (error) {
    if (error?.code !== 11000) throw error
    record = await PasswordResetRateLimit.findOneAndUpdate(
      { action, key: compositeKey },
      { $inc: { count: 1 }, $set: { expiresAt } },
      { new: true }
    )
  }

  if (record.count > maxAttempts) {
    throw createHttpError(429, 'PASSWORD_RESET_RATE_LIMITED', '请求过于频繁，请稍后再试')
  }
}

function invalidLinkError() {
  return createHttpError(400, 'PASSWORD_RESET_LINK_INVALID', '重置链接无效或已失效')
}

async function findUsableRecord(token) {
  const record = await PasswordResetRecord.findOne({ mode: 'link', tokenHash: hashToken(token) }).populate('targetUser')
  if (!record || !record.targetUser || getRecordStatus(record) !== 'active' || record.targetUser.status === USER_STATUS.DISABLED) {
    throw invalidLinkError()
  }
  return record
}

export async function createPasswordResetLink(userId, operator, input, ip = '') {
  const targetUser = await User.findById(userId).populate('roles')
  if (!targetUser) throw createHttpError(404, 'USER_NOT_FOUND', '用户不存在')
  if (isSuperAdminUser(targetUser)) {
    throw createHttpError(403, 'SUPER_ADMIN_LINK_FORBIDDEN', '超级管理员账号不支持生成重置链接')
  }
  if (targetUser.status === USER_STATUS.DISABLED) {
    throw createHttpError(403, 'USER_DISABLED', '账号已被禁用，无法生成重置链接')
  }

  const now = new Date()
  await PasswordResetRecord.updateMany(
    { targetUser: targetUser._id, mode: 'link', usedAt: null, revokedAt: null, expiresAt: { $gt: now } },
    { $set: { revokedAt: now, revokedBy: operator._id } }
  )

  const token = crypto.randomBytes(32).toString('base64url')
  const expiresAt = new Date(now.getTime() + input.expiresInMinutes * 60 * 1000)
  const record = await PasswordResetRecord.create({
    targetUser: targetUser._id,
    mode: 'link',
    tokenHash: hashToken(token),
    expiresAt,
    createdBy: operator._id,
    createdIp: ip,
    note: input.note || ''
  })

  const resetBaseUrl = `${env.clientOrigin.replace(/\/$/, '')}/reset-password`
  return {
    record: serializeRecord(record),
    resetUrl: `${resetBaseUrl}#token=${token}`
  }
}

export async function listPasswordResetRecords(userId) {
  const exists = await User.exists({ _id: userId })
  if (!exists) throw createHttpError(404, 'USER_NOT_FOUND', '用户不存在')

  const records = await PasswordResetRecord.find({ targetUser: userId })
    .populate('createdBy', 'username email')
    .populate('revokedBy', 'username email')
    .sort({ createdAt: -1 })
    .limit(100)
  return records.map(serializeRecord)
}

export async function revokePasswordResetLink(recordId, operator) {
  const now = new Date()
  const record = await PasswordResetRecord.findOneAndUpdate(
    { _id: recordId, mode: 'link', usedAt: null, revokedAt: null, expiresAt: { $gt: now } },
    { $set: { revokedAt: now, revokedBy: operator._id } },
    { new: true }
  ).populate('createdBy', 'username email').populate('revokedBy', 'username email')
  if (!record) throw createHttpError(409, 'PASSWORD_RESET_LINK_NOT_ACTIVE', '重置链接已失效，无法撤销')
  return serializeRecord(record)
}

export async function deletePasswordResetRecord(recordId) {
  const now = new Date()
  const record = await PasswordResetRecord.findOneAndDelete(
    {
      _id: recordId,
      $or: [
        { usedAt: { $ne: null } },
        { revokedAt: { $ne: null } },
        { expiresAt: { $lte: now } }
      ]
    }
  )

  if (record) return { id: record._id.toString() }

  const exists = await PasswordResetRecord.exists({ _id: recordId })
  if (!exists) throw createHttpError(404, 'PASSWORD_RESET_RECORD_NOT_FOUND', '密码重置记录不存在')
  throw createHttpError(409, 'PASSWORD_RESET_RECORD_ACTIVE', '有效链接不能删除，请先撤销链接')
}

export async function inspectPasswordResetLink(token, ip = '') {
  await assertRateLimit('inspect', ip || 'unknown', 30, INSPECT_WINDOW_MS)
  const record = await PasswordResetRecord.findOne({ mode: 'link', tokenHash: hashToken(token) }).populate('targetUser')
  if (!record || !record.targetUser || record.targetUser.status === USER_STATUS.DISABLED) {
    throw invalidLinkError()
  }

  const status = getRecordStatus(record)
  if (status !== 'active') {
    return { status }
  }

  return {
    status,
    maskedEmail: maskEmail(record.targetUser.email),
    expiresAt: record.expiresAt
  }
}

export async function consumePasswordResetLink(token, newPassword, ip = '') {
  let record
  try {
    record = await findUsableRecord(token)
  } catch (error) {
    await assertRateLimit('consume-failure', `${ip || 'unknown'}:${hashToken(token)}`, 5, CONSUME_FAILURE_WINDOW_MS)
    throw error
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  const now = new Date()
  const claimed = await PasswordResetRecord.findOneAndUpdate(
    { _id: record._id, usedAt: null, revokedAt: null, expiresAt: { $gt: now } },
    { $set: { usedAt: now, usedIp: ip } },
    { new: true }
  )
  if (!claimed) throw invalidLinkError()

  const updateResult = await User.updateOne(
    { _id: record.targetUser._id, status: { $ne: USER_STATUS.DISABLED } },
    {
      $set: { passwordHash, failedLoginCount: 0, lockedUntil: null, passwordChangedAt: now },
      $inc: { tokenVersion: 1 }
    }
  )
  if (updateResult.modifiedCount !== 1) {
    await PasswordResetRecord.updateOne(
      { _id: claimed._id, usedAt: now },
      { $set: { usedAt: null, usedIp: '' } }
    )
    throw invalidLinkError()
  }
}

export async function resetPasswordDirectly(userId, newPassword, operator, ip = '', note = '') {
  const targetUser = await User.findById(userId).populate('roles')
  if (!targetUser) throw createHttpError(404, 'USER_NOT_FOUND', '用户不存在')
  if (isSuperAdminUser(targetUser) && targetUser._id.toString() !== operator._id.toString()) {
    throw createHttpError(403, 'SUPER_ADMIN_RESET_FORBIDDEN', '只能修改当前登录的超级管理员账号密码')
  }

  const now = new Date()
  targetUser.passwordHash = await bcrypt.hash(newPassword, 12)
  targetUser.failedLoginCount = 0
  targetUser.lockedUntil = null
  targetUser.passwordChangedAt = now
  targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1
  await targetUser.save()

  const record = await PasswordResetRecord.create({
    targetUser: targetUser._id,
    mode: 'direct',
    usedAt: now,
    createdBy: operator._id,
    createdIp: ip,
    usedIp: ip,
    note
  })

  return { record: serializeRecord(record), selfReset: targetUser._id.toString() === operator._id.toString() }
}
