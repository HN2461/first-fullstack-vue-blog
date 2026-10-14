import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import { request as httpRequest } from 'node:http'
import request from 'supertest'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from '../src/app.js'
import { signAccessToken } from '../src/utils/jwt.js'
import { User } from '#modules/user/models/User.js'
import { Media } from '#modules/media/models/Media.js'
import { USER_ROLES } from '#constants/domain'
import { createMediaCategory, ensureUserVaultCategory } from '#modules/media/services/mediaCategory.service.js'
import {
  cleanupExpiredMediaUploads, deleteMediaUploadSession, getMediaUploadTemporaryRoot,
  MEDIA_UPLOAD_CHUNK_SIZE, MEDIA_UPLOAD_SESSION_TTL
} from '#modules/media/services/mediaUploadSession.service.js'
import { getActiveMediaUploadCount } from '#modules/media/services/mediaUploadGuard.service.js'
import { clearTestDatabase, connectTestDatabase, disconnectTestDatabase } from './helpers/testDatabase.js'

const base = '/api/admin/media-uploads'
const created = []

describe('resumable media uploads', () => {
  let app
  let user
  let token

  beforeAll(connectTestDatabase)
  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    user = await User.create({ username: '上传管理员', email: 'upload-session@example.com', passwordHash: 'hashed', role: USER_ROLES.SUPER_ADMIN })
    token = signAccessToken(user)
  })
  afterEach(async () => {
    for (const item of created.splice(0)) await deleteMediaUploadSession(item.id, item.user)
    expect(getActiveMediaUploadCount()).toBe(0)
  })
  afterAll(disconnectTestDatabase)

  async function create(size = 6, extra = {}) {
    const id = randomUUID()
    created.push({ id, user })
    const input = { uploadId: id, name: '中文资料.txt', size, mimeType: 'text/plain', lastModified: 123, ...extra }
    const response = await request(app).post(base).set('Authorization', `Bearer ${token}`).send(input).expect(201)
    return { id, input, data: response.body.data }
  }

  function sendChunk(id, offset, content, checksum = '') {
    const body = Buffer.from(content)
    return request(app).put(`${base}/${id}/chunk`).set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/octet-stream').set('X-Upload-Offset', String(offset))
      .set('X-Upload-Checksum', checksum || createHash('sha256').update(body).digest('hex')).send(body)
  }

  it('resumes confirmed bytes, accepts identical retries and creates exactly one resource', async () => {
    const { id, input } = await create()
    expect((await sendChunk(id, 0, 'abc').expect(200)).body.data.offset).toBe(3)
    const recovered = await request(app).post(base).set('Authorization', `Bearer ${token}`).send(input).expect(201)
    expect(recovered.body.data.offset).toBe(3)
    expect((await sendChunk(id, 0, 'abc').expect(200)).body.data.offset).toBe(3)
    await sendChunk(id, 3, 'def').expect(200)
    const result = await request(app).post(`${base}/${id}/complete`).set('Authorization', `Bearer ${token}`).send({}).expect(200)
    const repeated = await request(app).post(`${base}/${id}/complete`).set('Authorization', `Bearer ${token}`).send({}).expect(200)
    expect(repeated.body.data.result.id).toBe(result.body.data.result.id)
    expect(await Media.countDocuments()).toBe(1)
    const media = await Media.findById(result.body.data.result.id)
    expect(await fs.readFile(media.storagePath, 'utf8')).toBe('abcdef')
    expect(media.originalName).toBe('中文资料.txt')
    await deleteMediaUploadSession(id, user)
    expect(await Media.countDocuments()).toBe(1)
    expect(await fs.readFile(media.storagePath, 'utf8')).toBe('abcdef')
  })

  it('rejects missing bytes, invalid offsets, changed retries and corrupted checksums', async () => {
    const { id } = await create()
    await request(app).post(`${base}/${id}/complete`).set('Authorization', `Bearer ${token}`).send({}).expect(409)
    await sendChunk(id, 3, 'def').expect(409)
    await sendChunk(id, 0, 'abc', '0'.repeat(64)).expect(400)
    await sendChunk(id, 0, 'abc').expect(200)
    await sendChunk(id, 0, 'xyz').expect(409)
    const response = await request(app).get(`${base}/${id}`).set('Authorization', `Bearer ${token}`).expect(200)
    expect(response.body.data.offset).toBe(3)
    expect(await Media.countDocuments()).toBe(0)
  })

  it('keeps temporary files private and rejects another user or an anonymous caller', async () => {
    const { id } = await create()
    const other = await User.create({ username: '其他管理员', email: 'other-upload@example.com', passwordHash: 'hashed', role: USER_ROLES.SUPER_ADMIN })
    await request(app).get(`${base}/${id}`).set('Authorization', `Bearer ${signAccessToken(other)}`).expect(404)
    await request(app).delete(`${base}/${id}`).set('Authorization', `Bearer ${signAccessToken(other)}`).expect(404)
    await request(app).get(`${base}/${id}`).expect(401)
    await request(app).get(`/uploads/../.media-tmp/resumable/${id}/content.part`).expect(404)
  })

  it('requires the media menu permission even when the actor is an administrator', async () => {
    const admin = await User.create({ username: '无权限管理员', email: 'no-menu-upload@example.com', passwordHash: 'hashed', role: USER_ROLES.ADMIN })
    await request(app).post(base).set('Authorization', `Bearer ${signAccessToken(admin)}`)
      .send({ uploadId: randomUUID(), name: 'a.txt', size: 1 }).expect(403)
  })

  it('validates file limits and category ownership before receiving file bytes', async () => {
    await request(app).post(base).set('Authorization', `Bearer ${token}`)
      .send({ uploadId: randomUUID(), name: 'a.txt', size: 21 * 1024 * 1024 }).expect(400)
    await request(app).post(base).set('Authorization', `Bearer ${token}`)
      .send({ uploadId: randomUUID(), name: 'a.forbidden', size: 1 }).expect(400)
    const other = await User.create({ username: '分类所有者', email: 'category-upload@example.com', passwordHash: 'hashed', role: USER_ROLES.ADMIN })
    const category = await createMediaCategory({ name: '私有分类' }, other)
    await request(app).post(base).set('Authorization', `Bearer ${token}`)
      .send({ uploadId: randomUUID(), name: 'a.txt', size: 1, categoryId: category.id }).expect(404)
  })

  it('truncates unconfirmed bytes left by a process interruption before resuming', async () => {
    const { id } = await create()
    await sendChunk(id, 0, 'abc').expect(200)
    const part = path.join(getMediaUploadTemporaryRoot(), 'resumable', id, 'content.part')
    await fs.appendFile(part, 'unconfirmed')
    await sendChunk(id, 3, 'def').expect(200)
    const response = await request(app).post(`${base}/${id}/complete`).set('Authorization', `Bearer ${token}`).send({}).expect(200)
    expect(await fs.readFile(response.body.data.result.storagePath, 'utf8')).toBe('abcdef')
  })

  it('recovers a committed resource when the completion receipt was not saved', async () => {
    const { id } = await create(3)
    await sendChunk(id, 0, 'abc').expect(200)
    const result = await request(app).post(`${base}/${id}/complete`).set('Authorization', `Bearer ${token}`).send({}).expect(200)
    const metaPath = path.join(getMediaUploadTemporaryRoot(), 'resumable', id, 'session.json')
    const meta = JSON.parse(await fs.readFile(metaPath, 'utf8'))
    delete meta.result
    await fs.writeFile(metaPath, JSON.stringify(meta), 'utf8')
    const recovered = await request(app).post(`${base}/${id}/complete`).set('Authorization', `Bearer ${token}`).send({}).expect(200)
    expect(recovered.body.data.result.id).toBe(result.body.data.result.id)
    expect(await Media.countDocuments()).toBe(1)
  })

  it('bounds each chunk and supports files spanning several requests', async () => {
    const { id } = await create(MEDIA_UPLOAD_CHUNK_SIZE + 1)
    // 用声明长度验证入口拒绝；无需真正发送超量字节，避免早期拒绝触发 TCP 重置。
    await request(app).put(`${base}/${id}/chunk`).set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/octet-stream').set('Content-Length', String(MEDIA_UPLOAD_CHUNK_SIZE + 1))
      .set('X-Upload-Offset', '0').send(Buffer.from('X')).expect(413)
    await sendChunk(id, 0, Buffer.alloc(MEDIA_UPLOAD_CHUNK_SIZE, 65)).expect(200)
    await sendChunk(id, MEDIA_UPLOAD_CHUNK_SIZE, 'B').expect(200)
    const result = await request(app).post(`${base}/${id}/complete`).set('Authorization', `Bearer ${token}`).send({}).expect(200)
    const content = await fs.readFile(result.body.data.result.storagePath)
    expect(content.length).toBe(MEDIA_UPLOAD_CHUNK_SIZE + 1)
    expect(content.at(-1)).toBe(66)
  })

  it('cleans expired sessions and legacy partial files but keeps recent uploads', async () => {
    const old = await create()
    const recent = await create()
    const metadataPath = path.join(getMediaUploadTemporaryRoot(), 'resumable', old.id, 'session.json')
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'))
    metadata.updatedAt = Date.now() - MEDIA_UPLOAD_SESSION_TTL - 1000
    await fs.writeFile(metadataPath, JSON.stringify(metadata), 'utf8')
    const legacy = path.join(getMediaUploadTemporaryRoot(), `${randomUUID()}-old.txt`)
    await fs.writeFile(legacy, 'unfinished')
    const expiredAt = new Date(metadata.updatedAt)
    await fs.utimes(legacy, expiredAt, expiredAt)
    expect(await cleanupExpiredMediaUploads()).toBeGreaterThanOrEqual(2)
    await request(app).get(`${base}/${old.id}`).set('Authorization', `Bearer ${token}`).expect(404)
    await request(app).get(`${base}/${recent.id}`).set('Authorization', `Bearer ${token}`).expect(200)
    await expect(fs.stat(legacy)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('allows empty files to complete without fake chunk requests', async () => {
    const { id } = await create(0)
    const response = await request(app).post(`${base}/${id}/complete`).set('Authorization', `Bearer ${token}`).send({}).expect(200)
    expect(response.body.data.result.size).toBe(0)
  })

  it('releases the upload slot after a connection abort and preserves the confirmed offset', async () => {
    const { id } = await create()
    const server = app.listen(0, '127.0.0.1')
    await new Promise((resolve) => server.once('listening', resolve))
    const client = httpRequest({
      hostname: '127.0.0.1', port: server.address().port, method: 'PUT', path: `${base}/${id}/chunk`,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/octet-stream', 'Content-Length': '6', 'X-Upload-Offset': '0' }
    })
    client.on('error', () => {})
    try {
      client.write('abc')
      await vi.waitFor(() => expect(getActiveMediaUploadCount()).toBe(1), { timeout: 3000 })
      client.destroy()
      await vi.waitFor(() => expect(getActiveMediaUploadCount()).toBe(0), { timeout: 3000 })
    } finally {
      client.destroy()
      await new Promise((resolve) => server.close(resolve))
    }
    const response = await request(app).get(`${base}/${id}`).set('Authorization', `Bearer ${token}`).expect(200)
    expect(response.body.data.offset).toBe(0)
  })

  it('rejects locked vault uploads before any temporary file is created', async () => {
    const vault = await ensureUserVaultCategory(user)
    await request(app).post(base).set('Authorization', `Bearer ${token}`)
      .send({ uploadId: randomUUID(), name: 'private.txt', size: 1, categoryId: String(vault._id) }).expect(403)
  })
})
