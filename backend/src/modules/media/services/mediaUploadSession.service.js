import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import mongoose from 'mongoose'
import { env } from '#config/env'
import { resolveUploadRoot } from '#utils/uploadPath.js'
import { buildSafeStoredFilename } from '#utils/uploadFilename.js'
import { Media } from '#modules/media/models/Media.js'
import { getSettings } from '#modules/settings/services/setting.service.js'
import { isMediaExtensionAllowed } from '#modules/media/constants/mediaUpload.constants.js'
import { assertMediaCategoryExists } from './mediaCategory.service.js'
import { createMediaFromFiles } from './media.service.js'
import { requireMediaVaultAccess } from './mediaVault.service.js'
import { getMediaUploadCapacity } from './mediaUploadGuard.service.js'

export const MEDIA_UPLOAD_CHUNK_SIZE = 2 * 1024 * 1024
export const MEDIA_UPLOAD_SESSION_TTL = 24 * 60 * 60 * 1000
const locks = new Set()
const uuidPattern = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i

function uploadError(statusCode, code, message) {
  return Object.assign(new Error(message), { statusCode, code })
}

/** 返回非公开的上传临时目录；无参数，路径解析失败时抛出异常。 */
export function getMediaUploadTemporaryRoot() {
  return path.resolve(resolveUploadRoot(), '..', '.media-tmp')
}

function getSessionRoot() {
  return path.join(getMediaUploadTemporaryRoot(), 'resumable')
}

function getSessionDir(id) {
  if (!uuidPattern.test(id)) throw uploadError(400, 'MEDIA_UPLOAD_ID_INVALID', '上传任务 ID 不正确')
  return path.join(getSessionRoot(), id)
}

async function withLock(id, callback) {
  // 当前部署为单进程 PM2 fork，串行化同一任务，避免重试和取消同时改写文件。
  if (locks.has(id)) throw uploadError(409, 'MEDIA_UPLOAD_BUSY', '上传任务正在处理，请稍后重试')
  locks.add(id)
  try {
    return await callback()
  } finally {
    locks.delete(id)
  }
}

async function readSession(id) {
  try {
    return JSON.parse(await fs.readFile(path.join(getSessionDir(id), 'session.json'), 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') throw uploadError(404, 'MEDIA_UPLOAD_SESSION_MISSING', '上传任务不存在或已过期，请重新上传')
    if (error instanceof SyntaxError) throw uploadError(409, 'MEDIA_UPLOAD_SESSION_DAMAGED', '上传任务信息损坏，请重新选择文件')
    throw error
  }
}

async function saveSession(session) {
  session.updatedAt = Date.now()
  const dir = getSessionDir(session.id)
  // 元数据原子替换；进程中断时以最后一次确认的 offset 恢复，而非相信文件尾部。
  await fs.writeFile(path.join(dir, 'session.next.json'), JSON.stringify(session), 'utf8')
  await fs.rename(path.join(dir, 'session.next.json'), path.join(dir, 'session.json'))
}

function assertSessionAccess(session, actor) {
  if (session.owner !== String(actor._id || actor.id)) {
    throw uploadError(404, 'MEDIA_UPLOAD_SESSION_MISSING', '上传任务不存在或无权访问')
  }
  if (Date.now() - session.updatedAt > MEDIA_UPLOAD_SESSION_TTL) {
    throw uploadError(410, 'MEDIA_UPLOAD_SESSION_EXPIRED', '上传任务已过期，请重新上传')
  }
  if (session.accessMode === 'vault') requireMediaVaultAccess(actor)
}

async function validateFile(input, actor) {
  const settings = await getSettings()
  const maxBytes = Math.min(1024, Number(settings.mediaMaxFileSizeMB) || 20) * 1024 * 1024
  if (input.size > maxBytes) throw uploadError(400, 'MEDIA_UPLOAD_SIZE_LIMIT', `单文件大小不能超过 ${maxBytes / 1024 / 1024}MB`)
  if (!isMediaExtensionAllowed(input.name, settings.mediaAllowedExtensions)) {
    throw uploadError(400, 'MEDIA_UPLOAD_EXTENSION_NOT_ALLOWED', '当前上传限制不支持此文件类型')
  }
  const category = await assertMediaCategoryExists(input.category, actor, input.categoryId)
  if (category.accessMode === 'vault') requireMediaVaultAccess(actor)
  return { category, maxFiles: Math.min(20, Number(settings.mediaMaxFilesPerUpload) || 5) }
}

function publicSession(session) {
  return {
    uploadId: session.id,
    offset: session.offset,
    size: session.size,
    chunkSize: MEDIA_UPLOAD_CHUNK_SIZE,
    status: session.result ? 'completed' : 'uploading',
    result: session.result || null
  }
}

async function listSessions() {
  await fs.mkdir(getSessionRoot(), { recursive: true })
  const entries = await fs.readdir(getSessionRoot(), { withFileTypes: true })
  const sessions = []
  for (const entry of entries) {
    if (!entry.isDirectory() || !uuidPattern.test(entry.name)) continue
    try {
      sessions.push(await readSession(entry.name))
    } catch (error) {
      if (!['MEDIA_UPLOAD_SESSION_MISSING', 'MEDIA_UPLOAD_SESSION_DAMAGED'].includes(error.code)) throw error
    }
  }
  return sessions
}

async function assertSessionCapacity(input, owner, maxFiles) {
  const sessions = (await listSessions()).filter((item) => !item.result && Date.now() - item.updatedAt <= MEDIA_UPLOAD_SESSION_TTL)
  if (sessions.filter((item) => item.owner === owner).length >= maxFiles) {
    throw uploadError(429, 'MEDIA_UPLOAD_SESSION_LIMIT', '未完成上传任务较多，请先继续或清空已有任务')
  }
  const capacity = getMediaUploadCapacity()
  const reserved = sessions.reduce((sum, item) => sum + item.size, 0)
  if (reserved + input.size > capacity.maxTotalBytes) {
    throw uploadError(429, 'MEDIA_UPLOAD_TOTAL_LIMIT', '未完成上传文件总量超过限制，请先完成或清空已有任务')
  }
  const disk = await fs.statfs(getSessionRoot())
  const available = Number(disk.bavail) * Number(disk.bsize)
  // 入库时保留原始分片数据再复制一份，保证响应丢失或进程重启后仍能恢复。
  const required = sessions.reduce((sum, item) => sum + 2 * item.size - item.offset, 0) + 2 * input.size + capacity.diskReserveBytes
  if (!Number.isFinite(available) || available < required) {
    throw uploadError(507, 'MEDIA_UPLOAD_STORAGE_INSUFFICIENT', '服务器上传存储空间不足')
  }
}

/**
 * 创建或恢复单文件上传任务，文件信息和分类绑定到当前用户。
 * @param {Object} input - 已校验的任务 ID、文件信息和分类
 * @param {Object} actor - 当前用户，含密码箱解锁状态
 * @returns {Promise<Object>} 已确认偏移、分片大小或完成回执
 * @throws {Error} 文件规则、权限、任务配额或磁盘空间不满足时拒绝；相同 ID 不允许换文件。
 */
export async function createMediaUploadSession(input, actor) {
  return withLock('create', () => withLock(input.uploadId, async () => {
    let existing
    try {
      existing = await readSession(input.uploadId)
    } catch (error) {
      if (error.code !== 'MEDIA_UPLOAD_SESSION_MISSING') throw error
    }
    if (existing) {
      assertSessionAccess(existing, actor)
      if (['name', 'size', 'lastModified', 'category', 'categoryId'].some((key) => (existing[key] || '') !== (input[key] || ''))) {
        throw uploadError(409, 'MEDIA_UPLOAD_FILE_CHANGED', '当前任务的文件或分类已变化，请清空后重新选择')
      }
      await saveSession(existing)
      return publicSession(existing)
    }
    const { category, maxFiles } = await validateFile(input, actor)
    const owner = String(actor._id || actor.id)
    await assertSessionCapacity(input, owner, maxFiles)
    const session = {
      ...input,
      id: input.uploadId,
      owner,
      mediaId: new mongoose.Types.ObjectId().toString(),
      accessMode: category.accessMode,
      offset: 0,
      filename: `${input.uploadId}-${buildSafeStoredFilename(input.name)}`,
      updatedAt: Date.now()
    }
    const dir = getSessionDir(session.id)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, 'content.part'), Buffer.alloc(0))
    await saveSession(session)
    return publicSession(session)
  }))
}

/**
 * 查询服务器已确认的进度，不以客户端发送进度作为续传依据。
 * @param {string} id - 上传任务 UUID
 * @param {Object} actor - 当前用户
 * @returns {Promise<Object>} 偏移和完成回执
 * @throws {Error} 任务不存在、过期或用户无权访问时拒绝。
 */
export async function getMediaUploadSession(id, actor) {
  return withLock(id, async () => {
    const session = await readSession(id)
    assertSessionAccess(session, actor)
    await saveSession(session)
    return publicSession(session)
  })
}

/**
 * 接收一个有界分片；持久化字节和偏移后才向客户端确认。
 * @param {string} id - 上传任务 UUID
 * @param {Object} actor - 当前用户
 * @param {number} offset - 分片在原文件中的字节位置
 * @param {Buffer} body - 最多 2MB 的完整分片
 * @param {string} checksum - 可选 SHA-256，用于校验浏览器传来的分片
 * @returns {Promise<Object>} 最新服务器确认进度
 * @throws {Error} 偏移、大小、校验和不符或重复分片内容变化时拒绝，不推进进度。
 */
export async function appendMediaUploadChunk(id, actor, offset, body, checksum = '') {
  return withLock(id, async () => {
    const session = await readSession(id)
    assertSessionAccess(session, actor)
    if (session.result) return publicSession(session)
    if (!Buffer.isBuffer(body) || !body.length || body.length > MEDIA_UPLOAD_CHUNK_SIZE || offset + body.length > session.size) {
      throw uploadError(400, 'MEDIA_UPLOAD_CHUNK_SIZE_INVALID', '上传分片大小不正确')
    }
    const digest = createHash('sha256').update(body).digest('hex')
    if (checksum && checksum !== digest) throw uploadError(400, 'MEDIA_UPLOAD_CHECKSUM_INVALID', '上传分片校验失败，请重试')
    if (offset > session.offset || (offset < session.offset && offset + body.length > session.offset)) {
      throw uploadError(409, 'MEDIA_UPLOAD_OFFSET_CONFLICT', '上传进度不一致，请查询进度后继续')
    }
    const handle = await fs.open(path.join(getSessionDir(id), 'content.part'), 'r+')
    try {
      if (offset < session.offset) {
        const previous = Buffer.alloc(body.length)
        const { bytesRead } = await handle.read(previous, 0, previous.length, offset)
        if (bytesRead !== body.length || !previous.equals(body)) throw uploadError(409, 'MEDIA_UPLOAD_CHUNK_CONFLICT', '重复分片内容不一致')
      } else {
        // 上一次写入若未保存偏移就崩溃，先截去未确认尾部，避免重复追加。
        await handle.truncate(session.offset)
        let written = 0
        while (written < body.length) {
          const result = await handle.write(body, written, body.length - written, offset + written)
          written += result.bytesWritten
        }
        await handle.sync()
        session.offset += body.length
      }
    } finally {
      await handle.close()
    }
    await saveSession(session)
    return publicSession(session)
  })
}

/**
 * 校验完整文件并入库；固定资源 ID 保证完成请求重复执行不创建重复资源。
 * @param {string} id - 上传任务 UUID
 * @param {Object} actor - 当前用户
 * @returns {Promise<Object>} 完成状态和媒体资源
 * @throws {Error} 文件未完整接收或规则、权限发生变化时拒绝，临时数据保留以便继续。
 */
export async function completeMediaUploadSession(id, actor) {
  return withLock(id, async () => {
    const session = await readSession(id)
    assertSessionAccess(session, actor)
    if (session.result) return publicSession(session)
    if (session.offset !== session.size) throw uploadError(409, 'MEDIA_UPLOAD_INCOMPLETE', '文件尚未完整上传')
    // 完成响应丢失或入库后进程重启时，优先返回原有资源，避免重复创建。
    const existing = await Media.findOne({ _id: session.mediaId, uploader: session.owner })
    if (existing) {
      if (existing.accessScope === 'vault') {
        requireMediaVaultAccess(actor)
        const url = `/api/admin/media-downloads/content/${existing._id}`
        if (existing.url !== url) {
          existing.url = url
          await existing.save()
        }
      }
      session.result = existing.toSafeJSON()
    } else {
      await validateFile(session, actor)
      const dir = getSessionDir(id)
      const source = path.join(dir, 'content.part')
      const stat = await fs.stat(source)
      if (stat.size < session.size) throw uploadError(409, 'MEDIA_UPLOAD_INCOMPLETE', '服务器临时文件不完整，请重新上传')
      await fs.truncate(source, session.size)
      const readyPath = path.join(dir, session.filename)
      await fs.copyFile(source, readyPath)
      const result = await createMediaFromFiles([{
        path: readyPath,
        filename: session.filename,
        originalname: session.name,
        mimetype: session.mimeType || 'application/octet-stream',
        size: session.size
      }], actor, {
        category: session.category,
        categoryId: session.categoryId,
        mediaIds: [session.mediaId]
      })
      session.result = result.items[0]
    }
    await saveSession(session)
    await fs.unlink(path.join(getSessionDir(id), 'content.part')).catch((error) => {
      if (error.code !== 'ENOENT') console.error('清理已完成上传的临时文件失败', error)
    })
    return publicSession(session)
  })
}

/**
 * 删除当前用户的临时任务；已入库资源保持有效。
 * @param {string} id - 上传任务 UUID
 * @param {Object} actor - 当前用户
 * @returns {Promise<void>} 清理完成；任务不存在时幂等成功
 * @throws {Error} 用户无权访问或文件系统清理失败时拒绝。
 */
export async function deleteMediaUploadSession(id, actor) {
  return withLock(id, async () => {
    let session
    try {
      session = await readSession(id)
    } catch (error) {
      if (error.code === 'MEDIA_UPLOAD_SESSION_MISSING') return
      throw error
    }
    if (session.owner !== String(actor._id || actor.id)) throw uploadError(404, 'MEDIA_UPLOAD_SESSION_MISSING', '上传任务不存在或无权访问')
    await fs.rm(getSessionDir(id), { recursive: true, force: true })
  })
}

/**
 * 清理超过 24 小时的临时文件和上传回执，作为进程崩溃后的兜底。
 * @param {number} now - 当前时间戳，测试时可指定
 * @returns {Promise<number>} 删除的过期任务或旧临时文件数
 * @throws {Error} 文件系统访问失败时抛出；正在处理的任务不会被删除。
 */
export async function cleanupExpiredMediaUploads(now = Date.now()) {
  const root = getMediaUploadTemporaryRoot()
  await fs.mkdir(root, { recursive: true })
  let removed = 0
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    if (!entry.isFile()) continue
    const file = path.join(root, entry.name)
    if (now - (await fs.stat(file)).mtimeMs > MEDIA_UPLOAD_SESSION_TTL) {
      await fs.unlink(file)
      removed += 1
    }
  }
  await fs.mkdir(getSessionRoot(), { recursive: true })
  for (const entry of await fs.readdir(getSessionRoot(), { withFileTypes: true })) {
    if (!entry.isDirectory() || !uuidPattern.test(entry.name) || locks.has(entry.name)) continue
    await withLock(entry.name, async () => {
      const dir = getSessionDir(entry.name)
      let updatedAt = (await fs.stat(dir)).mtimeMs
      try {
        updatedAt = (await readSession(entry.name)).updatedAt
      } catch (error) {
        if (!['MEDIA_UPLOAD_SESSION_MISSING', 'MEDIA_UPLOAD_SESSION_DAMAGED'].includes(error.code)) throw error
      }
      if (now - updatedAt > MEDIA_UPLOAD_SESSION_TTL) {
        await fs.rm(dir, { recursive: true, force: true })
        removed += 1
      }
    })
  }
  return removed
}

/**
 * 启动上传临时数据的定时清理，并在启动时先执行一次。
 * @returns {Promise<NodeJS.Timeout>} 不阻止进程退出的清理定时器
 * @throws {Error} 启动清理访问文件系统失败时抛出；定时清理错误记录日志。
 */
export async function startMediaUploadCleanup() {
  await cleanupExpiredMediaUploads()
  const timer = setInterval(() => {
    cleanupExpiredMediaUploads().catch((error) => console.error('清理过期媒体上传任务失败', error))
  }, 60 * 60 * 1000)
  timer.unref()
  return timer
}
