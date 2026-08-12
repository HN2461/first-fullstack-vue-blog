import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import { USER_ROLES } from '#constants/domain'
import { resolveLegacyUploadRoot, resolveUploadRoot } from '#utils/uploadPath.js'
import { Media } from '#modules/media/models/Media.js'
import { MediaSharePackage } from '../models/MediaSharePackage.js'
import { MediaShareSession } from '../models/MediaShareSession.js'
import {
  assertPasswordAttemptAllowed,
  clearPasswordFailure,
  createShareSession,
  findValidShareSession,
  invalidateShareSessions,
  recordPasswordFailure
} from './mediaShareSecurity.service.js'
import { decryptMediaShareCode, encryptMediaShareCode } from './mediaShareCode.service.js'
import { attachShareEntryAvailability } from './mediaShareReference.service.js'
import {
  buildMediaShareListQuery,
  buildMediaShareSort,
  countMediaShareStatuses
} from './mediaShareQuery.service.js'

const PUBLIC_ID_BYTES = 16
const SESSION_DOWNLOAD_ALLOWED = true

function shareError(message, statusCode, code) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function canManageAllShares(actor) {
  return actor?.role === USER_ROLES.SUPER_ADMIN || actor?.isSuperAdmin === true
}

function getActorQuery(actor) {
  return canManageAllShares(actor) ? {} : { createdBy: actor?._id || actor?.id }
}

function getMediaActorQuery(actor) {
  return canManageAllShares(actor) ? {} : { uploader: actor?._id || actor?.id }
}

function getShareStatus(share, now = new Date()) {
  if (share.status === 'revoked') return 'revoked'
  if (share.expiresAt && share.expiresAt <= now) return 'expired'
  if (share.maxAccessCount !== null && share.accessCount >= share.maxAccessCount) return 'exhausted'
  return 'active'
}

function assertShareUsable(share, { allowExhausted = false } = {}) {
  const status = getShareStatus(share)
  if (status === 'revoked') throw shareError('该资源分享已被撤销', 410, 'SHARE_REVOKED')
  if (status === 'expired') throw shareError('该资源分享已过期', 410, 'SHARE_EXPIRED')
  if (status === 'exhausted' && !allowExhausted) {
    throw shareError('该资源分享的访问名额已用完', 410, 'SHARE_ACCESS_EXHAUSTED')
  }
}

function normalizeExpiresAt(value) {
  if (value === null || value === undefined || value === '') return null
  const date = new Date(value)
  if (!Number.isFinite(date.getTime()) || date <= new Date()) {
    throw shareError('分享有效期必须是未来时间', 400, 'SHARE_EXPIRES_INVALID')
  }
  return date
}

function normalizeMaxAccessCount(value) {
  if (value === null || value === undefined || value === '') return null
  const count = Number(value)
  if (!Number.isInteger(count) || count < 1 || count > 100000) {
    throw shareError('最大访问次数必须是 1 到 100000 的整数', 400, 'SHARE_ACCESS_LIMIT_INVALID')
  }
  return count
}

function makeEntryId() {
  return crypto.randomBytes(8).toString('base64url')
}

function getPreviewType(entry) {
  const mime = String(entry.mimeType || '').toLowerCase()
  const extension = String(entry.originalName || '').split('.').pop().toLowerCase()
  if (mime.startsWith('image/') || entry.fileClass === 'image') return 'image'
  if (mime.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov'].includes(extension)) return 'video'
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(extension)) return 'audio'
  if (mime === 'application/pdf' || extension === 'pdf') return 'pdf'
  if (mime.startsWith('text/') || ['txt', 'md', 'json', 'js', 'ts', 'vue', 'css', 'html', 'xml', 'yml', 'yaml', 'csv'].includes(extension)) return 'text'
  return 'other'
}

function serializeAdminShare(share) {
  const status = getShareStatus(share)
  return {
    id: share._id.toString(),
    publicId: share.publicId,
    sharePath: `/share/${share.publicId}`,
    name: share.name,
    description: share.description || '',
    mode: share.mode,
    status,
    expiresAt: share.expiresAt,
    maxAccessCount: share.maxAccessCount,
    accessCount: share.accessCount,
    viewCount: share.viewCount,
    downloadCount: share.downloadCount,
    entryCount: share.entries.length,
    totalSize: share.entries.reduce((sum, item) => sum + item.size, 0),
    entries: share.entries.map((entry) => ({
      entryId: entry.entryId,
      originalName: entry.originalName,
      mimeType: entry.mimeType,
      size: entry.size,
      fileClass: entry.fileClass
    })),
    extractionCodeAvailable: share.mode === 'password' && Boolean(share.passwordCipher),
    revokedAt: share.revokedAt,
    createdAt: share.createdAt,
    updatedAt: share.updatedAt
  }
}

function serializePublicShare(share, unlocked, session = null) {
  return {
    publicId: share.publicId,
    name: share.name,
    description: share.description || '',
    mode: share.mode,
    unlocked,
    expiresAt: share.expiresAt,
    maxAccessCount: share.maxAccessCount,
    accessCount: share.accessCount,
    remainingAccessCount: share.maxAccessCount === null
      ? null
      : Math.max(0, share.maxAccessCount - share.accessCount),
    sessionExpiresAt: session?.expiresAt || null,
    items: unlocked
      ? share.entries.map((entry) => ({
          entryId: entry.entryId,
          originalName: entry.originalName,
          mimeType: entry.mimeType,
          size: entry.size,
          fileClass: entry.fileClass,
          previewType: getPreviewType(entry)
        }))
      : []
  }
}

async function findAdminShare(id, actor, options = {}) {
  const query = { _id: id, ...getActorQuery(actor) }
  const source = options.password ? MediaSharePackage.findOne(query).select('+passwordHash') : MediaSharePackage.findOne(query)
  const share = await source
  if (!share) throw shareError('资源分享不存在', 404, 'SHARE_NOT_FOUND')
  return share
}

async function reserveAccess(share) {
  const filter = {
    _id: share._id,
    status: 'active',
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }]
  }
  if (share.maxAccessCount !== null) {
    filter.$expr = { $lt: ['$accessCount', '$maxAccessCount'] }
  }

  const updated = await MediaSharePackage.findOneAndUpdate(
    filter,
    { $inc: { accessCount: 1 }, $set: { lastAccessAt: new Date() } },
    { new: true }
  )
  if (!updated) {
    assertShareUsable(share)
    throw shareError('该资源分享的访问名额已用完', 410, 'SHARE_ACCESS_EXHAUSTED')
  }
  return updated
}

async function createAccessSession(share, mode, req, res) {
  try {
    return await createShareSession(share, mode, req, res)
  } catch (error) {
    await MediaSharePackage.updateOne({ _id: share._id, accessCount: { $gt: 0 } }, { $inc: { accessCount: -1 } })
    throw error
  }
}

export async function createMediaShare(input, actor) {
  const media = await Media.find({
    _id: { $in: input.mediaIds },
    deletedAt: null,
    ...getMediaActorQuery(actor)
  })
  if (media.length !== input.mediaIds.length) {
    throw shareError('部分资源不存在、已删除或无权分享', 404, 'SHARE_MEDIA_NOT_FOUND')
  }

  const mediaMap = new Map(media.map((item) => [item._id.toString(), item]))
  const password = input.mode === 'password'
    ? String(crypto.randomInt(0, 10000)).padStart(4, '0')
    : ''
  const share = await MediaSharePackage.create({
    publicId: crypto.randomBytes(PUBLIC_ID_BYTES).toString('base64url'),
    name: input.name,
    description: input.description || '',
    mode: input.mode,
    passwordHash: password ? await bcrypt.hash(password, 10) : '',
    passwordCipher: password ? encryptMediaShareCode(password) : '',
    expiresAt: normalizeExpiresAt(input.expiresAt),
    maxAccessCount: normalizeMaxAccessCount(input.maxAccessCount),
    createdBy: actor._id,
    entries: input.mediaIds.map((id, index) => {
      const item = mediaMap.get(id)
      return {
        entryId: makeEntryId(),
        media: item._id,
        originalName: item.originalName,
        mimeType: item.mimeType,
        size: item.size,
        fileClass: item.fileClass || 'other',
        sortOrder: index
      }
    })
  })

  return {
    ...serializeAdminShare(share),
    extractionCode: password || null
  }
}

export async function listMediaShares({ actor, page = 1, pageSize = 20, ...filters } = {}) {
  const currentPage = Math.max(1, Number(page) || 1)
  const limit = Math.min(100, Math.max(1, Number(pageSize) || 20))
  const actorQuery = getActorQuery(actor)
  const now = new Date()
  const query = buildMediaShareListQuery(filters, actorQuery, now)
  const [items, total, counts] = await Promise.all([
    MediaSharePackage.find(query).select('+passwordCipher')
      .sort(buildMediaShareSort(filters.sortField, filters.sortOrder))
      .skip((currentPage - 1) * limit)
      .limit(limit),
    MediaSharePackage.countDocuments(query),
    countMediaShareStatuses(MediaSharePackage, actorQuery, now)
  ])
  return { items: items.map(serializeAdminShare), total, page: currentPage, pageSize: limit, counts }
}

export async function getMediaShareDetail(id, actor) {
  const share = await MediaSharePackage.findOne({ _id: id, ...getActorQuery(actor) }).select('+passwordCipher')
  if (!share) throw shareError('资源分享不存在', 404, 'SHARE_NOT_FOUND')
  return {
    ...serializeAdminShare(share),
    entries: await attachShareEntryAvailability(share)
  }
}

export async function updateMediaShare(id, input, actor) {
  const share = await findAdminShare(id, actor)
  const nextExpiresAt = input.expiresAt === undefined ? share.expiresAt : normalizeExpiresAt(input.expiresAt)
  const nextMaxAccessCount = input.maxAccessCount === undefined ? share.maxAccessCount : normalizeMaxAccessCount(input.maxAccessCount)
  if (nextMaxAccessCount !== null && nextMaxAccessCount < share.accessCount) {
    throw shareError('最大访问次数不能小于已经使用的访问次数', 400, 'SHARE_ACCESS_LIMIT_TOO_LOW')
  }
  if (input.name !== undefined) share.name = input.name
  if (input.description !== undefined) share.description = input.description
  share.expiresAt = nextExpiresAt
  share.maxAccessCount = nextMaxAccessCount
  await share.save()
  return serializeAdminShare(share)
}

export async function revokeMediaShare(id, actor) {
  const share = await findAdminShare(id, actor)
  if (share.status !== 'revoked') {
    share.status = 'revoked'
    share.revokedAt = new Date()
    share.revokedBy = actor._id
    share.accessVersion += 1
    await share.save()
    await invalidateShareSessions(share._id)
  }
  return serializeAdminShare(share)
}

export async function revealMediaShareCode(id, actor) {
  const share = await MediaSharePackage.findOne({ _id: id, ...getActorQuery(actor) })
    .select('+passwordCipher')
  if (!share) throw shareError('资源分享不存在', 404, 'SHARE_NOT_FOUND')
  if (share.mode !== 'password') throw shareError('公开分享没有提取码', 400, 'SHARE_PASSWORD_NOT_REQUIRED')

  const extractionCode = decryptMediaShareCode(share.passwordCipher)
  if (!extractionCode) {
    throw shareError('历史分享未保存可恢复提取码，请重新生成', 409, 'SHARE_CODE_UNAVAILABLE')
  }
  return { extractionCode }
}

export async function resetMediaShareCode(id, actor) {
  const share = await MediaSharePackage.findOne({ _id: id, ...getActorQuery(actor) })
    .select('+passwordHash +passwordCipher')
  if (!share) throw shareError('资源分享不存在', 404, 'SHARE_NOT_FOUND')
  if (share.mode !== 'password') throw shareError('公开分享没有提取码', 400, 'SHARE_PASSWORD_NOT_REQUIRED')
  if (share.status === 'revoked') throw shareError('已撤销分享不能重置提取码', 409, 'SHARE_REVOKED')

  const extractionCode = String(crypto.randomInt(0, 10000)).padStart(4, '0')
  share.passwordHash = await bcrypt.hash(extractionCode, 10)
  share.passwordCipher = encryptMediaShareCode(extractionCode)
  share.accessVersion += 1
  share.accessCount = 0
  share.lastAccessAt = null
  await share.save()
  await invalidateShareSessions(share._id)
  return { extractionCode }
}

export async function deleteRevokedMediaShare(id, actor) {
  const share = await findAdminShare(id, actor)
  if (share.status !== 'revoked') {
    throw shareError('只能删除已经撤销的分享记录', 409, 'SHARE_DELETE_REQUIRES_REVOKED')
  }

  await Promise.all([
    MediaSharePackage.deleteOne({ _id: share._id }),
    invalidateShareSessions(share._id)
  ])
  return { id: share._id.toString(), deleted: true }
}

export async function getPublicMediaShare(publicId, req) {
  const share = await MediaSharePackage.findOne({ publicId })
  if (!share) throw shareError('资源分享不存在', 404, 'SHARE_NOT_FOUND')
  const session = await findValidShareSession(share, req)
  assertShareUsable(share, { allowExhausted: Boolean(session) })
  await MediaSharePackage.updateOne({ _id: share._id }, { $inc: { viewCount: 1 } })
  return serializePublicShare(share, Boolean(session), session)
}

async function getPublicShareWithSession(publicId, req) {
  const share = await MediaSharePackage.findOne({ publicId })
  if (!share) throw shareError('资源分享不存在', 404, 'SHARE_NOT_FOUND')
  const session = await findValidShareSession(share, req)
  assertShareUsable(share, { allowExhausted: Boolean(session) })
  return { share, session }
}

async function establishPublicAccess(share, mode, req, res) {
  const session = await findValidShareSession(share, req)
  if (session) return { share, session }
  const updated = await reserveAccess(share)
  const created = await createAccessSession(updated, mode, req, res)
  return { share: updated, session: created }
}

export async function claimPublicMediaShare(publicId, req, res) {
  const { share } = await getPublicShareWithSession(publicId, req)
  if (share.mode !== 'public') throw shareError('该资源分享需要提取码', 400, 'SHARE_PASSWORD_REQUIRED')
  const result = await establishPublicAccess(share, 'public', req, res)
  return serializePublicShare(result.share, true, result.session)
}

export async function verifyPublicMediaShare(publicId, code, req, res) {
  const share = await MediaSharePackage.findOne({ publicId }).select('+passwordHash')
  if (!share) throw shareError('资源分享不存在', 404, 'SHARE_NOT_FOUND')
  if (share.mode !== 'password') throw shareError('该资源分享无需提取码', 400, 'SHARE_PASSWORD_NOT_REQUIRED')
  const existing = await findValidShareSession(share, req)
  assertShareUsable(share, { allowExhausted: Boolean(existing) })
  if (existing) return serializePublicShare(share, true, existing)

  await assertPasswordAttemptAllowed(share, req)
  const matched = await bcrypt.compare(code, share.passwordHash)
  if (!matched) {
    await recordPasswordFailure(share, req)
    throw shareError('提取码无效，请稍后重试', 400, 'SHARE_PASSWORD_INVALID')
  }

  await clearPasswordFailure(share, req)
  const result = await establishPublicAccess(share, 'password', req, res)
  return serializePublicShare(result.share, true, result.session)
}

export async function getPublicShareContent(publicId, entryId, req) {
  const { share, session } = await getPublicShareWithSession(publicId, req)
  if (!session || !SESSION_DOWNLOAD_ALLOWED) throw shareError('请先获取资源包访问权限', 403, 'SHARE_ACCESS_REQUIRED')
  const entry = share.entries.find((item) => item.entryId === entryId)
  if (!entry) throw shareError('分享资源不存在', 404, 'SHARE_ENTRY_NOT_FOUND')
  const media = await Media.findById(entry.media)
  if (!media) throw shareError('该资源已不可用', 410, 'SHARE_MEDIA_UNAVAILABLE')
  const filePath = await resolveStoragePath(media)
  return { share, session, entry, media, filePath }
}

export async function getPublicShareDownloadEntries(publicId, req) {
  const { share, session } = await getPublicShareWithSession(publicId, req)
  if (!session || !SESSION_DOWNLOAD_ALLOWED) throw shareError('请先获取资源包访问权限', 403, 'SHARE_ACCESS_REQUIRED')

  const mediaItems = await Media.find({ _id: { $in: share.entries.map((entry) => entry.media) } })
  const mediaMap = new Map(mediaItems.map((item) => [item._id.toString(), item]))
  const entries = []

  for (const entry of share.entries) {
    const media = mediaMap.get(entry.media.toString())
    if (!media) throw shareError(`资源「${entry.originalName}」已不可用`, 410, 'SHARE_MEDIA_UNAVAILABLE')
    entries.push({ entry, media, filePath: await resolveStoragePath(media) })
  }

  return { share, session, entries }
}

async function resolveStoragePath(media) {
  const roots = [resolveUploadRoot(), resolveLegacyUploadRoot()]
  const candidates = [media.storagePath]
  if (String(media.url || '').startsWith('/uploads/')) {
    const relative = String(media.url).replace(/^\/uploads\//, '').replace(/\//g, path.sep)
    candidates.push(...roots.map((root) => path.join(root, relative)))
  }

  for (const candidate of candidates) {
    const target = path.resolve(String(candidate || ''))
    const inside = roots.some((root) => {
      const relative = path.relative(path.resolve(root), target)
      return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
    })
    if (!inside) continue
    try {
      const stat = await fs.stat(target)
      if (stat.isFile()) return { path: target, size: stat.size }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }

  throw shareError('该资源文件已不存在', 410, 'SHARE_FILE_UNAVAILABLE')
}

export function getShareStatusForAdmin(share) {
  return getShareStatus(share)
}
