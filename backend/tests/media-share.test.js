import fs from 'node:fs'
import path from 'node:path'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { USER_ROLES } from '#constants/domain'
import { Media } from '#modules/media/models/Media.js'
import { MediaSharePackage } from '#modules/mediaShare/models/MediaSharePackage.js'
import { Menu } from '#modules/rbac/models/Menu.js'
import { Role } from '#modules/rbac/models/Role.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { User } from '#modules/user/models/User.js'
import { createApp } from '../src/app.js'
import { signAccessToken } from '../src/utils/jwt.js'
import { resolveUploadRoot } from '../src/utils/uploadPath.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function createUser(role, username, roles = []) {
  return User.create({
    username,
    email: `${username}-${Date.now()}-${Math.random()}@example.com`,
    passwordHash: 'hashed-password',
    role,
    roles
  })
}

async function createMediaManager() {
  await ensureRbacSeed()
  const mediaMenu = await Menu.findOne({ routePath: '/console/manage/media' })
  const mediaShareMenu = await Menu.findOne({ routePath: '/console/manage/media-shares' })
  const role = await Role.create({
    name: '资源分享管理员',
    code: `media-share-manager-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    menuIds: [mediaMenu._id, mediaShareMenu._id],
    status: 'active'
  })
  return createUser(USER_ROLES.ADMIN, 'media-share-manager', [role._id])
}

async function createMedia(owner, originalName, content = 'shared file content', overrides = {}) {
  const relativePath = path.join('media-share-tests', `${Date.now()}-${Math.random().toString(16).slice(2)}-${originalName}`)
  const storagePath = path.join(resolveUploadRoot(), relativePath)
  fs.mkdirSync(path.dirname(storagePath), { recursive: true })
  fs.writeFileSync(storagePath, content)

  return Media.create({
    filename: path.basename(storagePath),
    originalName,
    mimeType: overrides.mimeType || 'text/plain',
    size: Buffer.byteLength(content),
    url: `/uploads/${relativePath.replace(/\\/g, '/')}`,
    storagePath: storagePath.replace(/\\/g, '/'),
    kind: overrides.kind || 'attachment',
    category: '默认素材',
    fileClass: overrides.fileClass || 'document',
    uploader: owner._id,
    ...overrides
  })
}

async function createShare(app, token, mediaIds, overrides = {}) {
  const response = await request(app)
    .post('/api/admin/media-shares')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: '测试资源包',
      description: '用于验证公开分享链路',
      mediaIds: mediaIds.map((id) => id.toString()),
      mode: 'public',
      expiresAt: null,
      maxAccessCount: null,
      ...overrides
    })
    .expect(201)

  return response.body.data
}

describe('media resource package sharing', () => {
  let app
  let superAdmin
  let superToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    superAdmin = await createUser(USER_ROLES.SUPER_ADMIN, 'media-share-super')
    superToken = signAccessToken(superAdmin)
  })

  afterAll(async () => {
    await clearTestDatabase()
    await disconnectTestDatabase()
  })

  it('creates shares from owned media and blocks cross-owner media for scoped administrators', async () => {
    const manager = await createMediaManager()
    const managerToken = signAccessToken(manager)
    const managerMedia = await createMedia(manager, 'manager-note.txt')
    const superMedia = await createMedia(superAdmin, 'super-note.txt')

    await request(app)
      .post('/api/admin/media-shares')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ name: '越权资源包', mediaIds: [superMedia._id.toString()], mode: 'public' })
      .expect(404)

    const share = await createShare(app, managerToken, [managerMedia._id])
    expect(share).toMatchObject({
      name: '测试资源包',
      mode: 'public',
      status: 'active',
      entryCount: 1,
      extractionCode: null
    })
    expect(share.entries[0]).not.toHaveProperty('media')
    expect(share.entries[0]).not.toHaveProperty('storagePath')
  })

  it('returns a four-digit extraction code only in the password share creation response', async () => {
    const media = await createMedia(superAdmin, 'password-note.txt')
    const created = await createShare(app, superToken, [media._id], { mode: 'password' })

    expect(created.extractionCode).toMatch(/^\d{4}$/)
    const listResponse = await request(app)
      .get('/api/admin/media-shares')
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200)

    expect(listResponse.body.data.items[0]).not.toHaveProperty('extractionCode')
    expect(listResponse.body.data.items[0]).not.toHaveProperty('passwordHash')
    const stored = await MediaSharePackage.findById(created.id).select('+passwordHash')
    expect(stored.passwordHash).not.toBe(created.extractionCode)
  })

  it('allows anonymous public access without exposing media ids or storage addresses and reuses the visitor session', async () => {
    const media = await createMedia(superAdmin, 'public-note.txt')
    const created = await createShare(app, superToken, [media._id], { maxAccessCount: 1 })
    const visitor = request.agent(app)

    const initial = await visitor.get(`/api/public/media-shares/${created.publicId}`).expect(200)
    expect(initial.body.data).toMatchObject({ mode: 'public', unlocked: false, items: [] })

    const claimed = await visitor.post(`/api/public/media-shares/${created.publicId}/claim`).expect(200)
    expect(claimed.headers['set-cookie']?.join(';')).toContain(`media_share_${created.publicId}=`)
    expect(claimed.body.data.items[0]).toMatchObject({ originalName: 'public-note.txt', previewType: 'text' })
    expect(claimed.body.data.items[0]).not.toHaveProperty('id')
    expect(claimed.body.data.items[0]).not.toHaveProperty('media')
    expect(claimed.body.data.items[0]).not.toHaveProperty('url')
    expect(claimed.body.data.items[0]).not.toHaveProperty('storagePath')

    const repeated = await visitor.post(`/api/public/media-shares/${created.publicId}/claim`).expect(200)
    expect(repeated.body.data.accessCount).toBe(1)
    await request(app).post(`/api/public/media-shares/${created.publicId}/claim`).expect(410)

    const content = await visitor
      .get(`/api/public/media-shares/${created.publicId}/entries/${claimed.body.data.items[0].entryId}/content`)
      .expect(200)
    expect(content.text).toBe('shared file content')
  })

  it('unlocks password shares and limits repeated four-digit password attempts', async () => {
    const media = await createMedia(superAdmin, 'protected-note.txt')
    const created = await createShare(app, superToken, [media._id], { mode: 'password', maxAccessCount: 1 })
    const visitor = request.agent(app)

    const locked = await visitor.get(`/api/public/media-shares/${created.publicId}`).expect(200)
    expect(locked.body.data).toMatchObject({ unlocked: false, items: [] })

    const unlocked = await visitor
      .post(`/api/public/media-shares/${created.publicId}/verify-password`)
      .send({ code: created.extractionCode })
      .expect(200)
    expect(unlocked.body.data.unlocked).toBe(true)
    expect(unlocked.body.data.items).toHaveLength(1)

    await request(app)
      .post(`/api/public/media-shares/${created.publicId}/verify-password`)
      .send({ code: created.extractionCode })
      .expect(410)
    const existingSession = await visitor
      .post(`/api/public/media-shares/${created.publicId}/verify-password`)
      .send({ code: created.extractionCode })
      .expect(200)
    expect(existingSession.body.data.unlocked).toBe(true)

    const secondMedia = await createMedia(superAdmin, 'rate-limited-note.txt')
    const limitedShare = await createShare(app, superToken, [secondMedia._id], { mode: 'password' })
    const wrongCode = limitedShare.extractionCode === '9999' ? '0000' : '9999'
    const failedAttempts = await Promise.all(Array.from({ length: 5 }, () => (
      request(app)
        .post(`/api/public/media-shares/${limitedShare.publicId}/verify-password`)
        .send({ code: wrongCode })
    )))
    expect(failedAttempts.every((response) => response.status === 400)).toBe(true)

    const blocked = await request(app)
      .post(`/api/public/media-shares/${limitedShare.publicId}/verify-password`)
      .send({ code: wrongCode })
      .expect(429)
    expect(blocked.body.code).toBe('SHARE_PASSWORD_RATE_LIMITED')
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0)
  })

  it('revokes existing visitor sessions immediately', async () => {
    const media = await createMedia(superAdmin, 'revoked-note.txt')
    const created = await createShare(app, superToken, [media._id])
    const visitor = request.agent(app)
    const claimed = await visitor.post(`/api/public/media-shares/${created.publicId}/claim`).expect(200)
    const entryId = claimed.body.data.items[0].entryId

    await request(app)
      .post(`/api/admin/media-shares/${created.id}/revoke`)
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200)

    await visitor
      .get(`/api/public/media-shares/${created.publicId}/entries/${entryId}/content`)
      .expect(410)
  })

  it('streams attachment, range and zip downloads through controlled endpoints', async () => {
    const media = await createMedia(superAdmin, 'download-note.txt', '0123456789')
    const created = await createShare(app, superToken, [media._id])
    const visitor = request.agent(app)
    const claimed = await visitor.post(`/api/public/media-shares/${created.publicId}/claim`).expect(200)
    const entryId = claimed.body.data.items[0].entryId
    const contentPath = `/api/public/media-shares/${created.publicId}/entries/${entryId}/content`

    const range = await visitor.get(contentPath).set('Range', 'bytes=2-5').expect(206)
    expect(range.headers['content-range']).toBe('bytes 2-5/10')
    expect(range.text).toBe('2345')

    const attachment = await visitor.get(`${contentPath}?disposition=attachment`).expect(200)
    expect(attachment.headers['content-disposition']).toContain('attachment')
    expect(attachment.headers['content-disposition']).not.toContain(media.storagePath)

    await visitor.get(contentPath).set('Range', 'bytes=99-100').expect(416)

    const archive = await visitor
      .get(`/api/public/media-shares/${created.publicId}/download`)
      .buffer(true)
      .expect(200)
    expect(archive.headers['content-type']).toContain('application/zip')
    expect(archive.headers['content-disposition']).toContain('attachment')

    const stored = await MediaSharePackage.findById(created.id)
    expect(stored.downloadCount).toBe(2)
  })

  it('rejects media files whose resolved path is outside managed upload roots', async () => {
    const media = await createMedia(superAdmin, 'outside-note.txt')
    media.storagePath = path.resolve(resolveUploadRoot(), '..', 'outside-note.txt')
    media.url = '/private/outside-note.txt'
    await media.save()

    const created = await createShare(app, superToken, [media._id])
    const visitor = request.agent(app)
    const claimed = await visitor.post(`/api/public/media-shares/${created.publicId}/claim`).expect(200)

    const response = await visitor
      .get(`/api/public/media-shares/${created.publicId}/entries/${claimed.body.data.items[0].entryId}/content`)
      .expect(410)
    expect(response.body.code).toBe('SHARE_FILE_UNAVAILABLE')
  })

  it('reveals and resets encrypted extraction codes without leaking credentials in list responses', async () => {
    const media = await createMedia(superAdmin, 'reset-code-note.txt')
    const created = await createShare(app, superToken, [media._id], { mode: 'password', maxAccessCount: 3 })
    const visitor = request.agent(app)

    const listResponse = await request(app)
      .get('/api/admin/media-shares')
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200)
    expect(listResponse.body.data.items[0].extractionCodeAvailable).toBe(true)
    expect(listResponse.body.data.items[0]).not.toHaveProperty('extractionCode')
    expect(listResponse.body.data.items[0]).not.toHaveProperty('passwordHash')
    expect(listResponse.body.data.items[0]).not.toHaveProperty('passwordCipher')

    const revealed = await request(app)
      .get(`/api/admin/media-shares/${created.id}/extraction-code`)
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200)
    expect(revealed.body.data.extractionCode).toBe(created.extractionCode)

    const unlocked = await visitor
      .post(`/api/public/media-shares/${created.publicId}/verify-password`)
      .send({ code: created.extractionCode })
      .expect(200)
    const entryId = unlocked.body.data.items[0].entryId

    const reset = await request(app)
      .post(`/api/admin/media-shares/${created.id}/extraction-code/reset`)
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200)
    expect(reset.body.data.extractionCode).toMatch(/^\d{4}$/)
    expect(reset.body.data.extractionCode).not.toBe(created.extractionCode)
    await visitor.get(`/api/public/media-shares/${created.publicId}/entries/${entryId}/content`).expect(403)
    await request(app)
      .post(`/api/public/media-shares/${created.publicId}/verify-password`)
      .send({ code: created.extractionCode })
      .expect(400)
    await request(app)
      .post(`/api/public/media-shares/${created.publicId}/verify-password`)
      .send({ code: reset.body.data.extractionCode })
      .expect(200)

    const stored = await MediaSharePackage.findById(created.id)
    expect(stored.accessCount).toBe(1)
  })

  it('reports unavailable codes for historical shares and isolates administrator-owned shares', async () => {
    const owner = await createMediaManager()
    const other = await createMediaManager()
    const ownerToken = signAccessToken(owner)
    const otherToken = signAccessToken(other)
    const media = await createMedia(owner, 'historical-code.txt')
    const created = await createShare(app, ownerToken, [media._id], { mode: 'password' })
    await MediaSharePackage.updateOne({ _id: created.id }, { $set: { passwordCipher: '' } })

    const unavailable = await request(app)
      .get(`/api/admin/media-shares/${created.id}/extraction-code`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(409)
    expect(unavailable.body.code).toBe('SHARE_CODE_UNAVAILABLE')

    await request(app)
      .get(`/api/admin/media-shares/${created.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404)
    await request(app)
      .post(`/api/admin/media-shares/${created.id}/revoke`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404)
  })

  it('filters dynamic share statuses, returns global status counts and only deletes revoked records', async () => {
    const media = await createMedia(superAdmin, 'status-filter.txt')
    const active = await createShare(app, superToken, [media._id], { name: '生效资源包' })
    const expired = await createShare(app, superToken, [media._id], { name: '过期资源包', mode: 'password' })
    const exhausted = await createShare(app, superToken, [media._id], { name: '用尽资源包', maxAccessCount: 1 })
    const revoked = await createShare(app, superToken, [media._id], { name: '撤销资源包' })
    await MediaSharePackage.updateOne({ _id: expired.id }, { $set: { expiresAt: new Date(Date.now() - 60000) } })
    await MediaSharePackage.updateOne({ _id: exhausted.id }, { $set: { accessCount: 1 } })
    await request(app).post(`/api/admin/media-shares/${revoked.id}/revoke`).set('Authorization', `Bearer ${superToken}`).expect(200)

    const activeDelete = await request(app)
      .delete(`/api/admin/media-shares/${active.id}`)
      .set('Authorization', `Bearer ${superToken}`)
      .expect(409)
    expect(activeDelete.body.code).toBe('SHARE_DELETE_REQUIRES_REVOKED')

    for (const [status, expectedId] of [['active', active.id], ['expired', expired.id], ['exhausted', exhausted.id], ['revoked', revoked.id]]) {
      const response = await request(app)
        .get('/api/admin/media-shares')
        .query({ status, pageSize: 20 })
        .set('Authorization', `Bearer ${superToken}`)
        .expect(200)
      expect(response.body.data.items.map((item) => item.id)).toEqual([expectedId])
      expect(response.body.data.counts).toEqual({ all: 4, active: 1, expired: 1, exhausted: 1, revoked: 1 })
    }

    const passwordOnly = await request(app)
      .get('/api/admin/media-shares')
      .query({ keyword: '过期', mode: 'password' })
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200)
    expect(passwordOnly.body.data.items.map((item) => item.id)).toEqual([expired.id])

    await request(app).delete(`/api/admin/media-shares/${revoked.id}`).set('Authorization', `Bearer ${superToken}`).expect(200)
    await request(app).get(`/api/public/media-shares/${revoked.publicId}`).expect(404)
    expect(await Media.findById(media._id)).not.toBeNull()
  })

  it('keeps shared media available in trash and blocks permanent deletion until shares are revoked', async () => {
    const media = await createMedia(superAdmin, 'protected-delete.txt')
    const created = await createShare(app, superToken, [media._id])
    const visitor = request.agent(app)
    const claimed = await visitor.post(`/api/public/media-shares/${created.publicId}/claim`).expect(200)
    const entryId = claimed.body.data.items[0].entryId

    const references = await request(app)
      .get(`/api/admin/media/${media._id}/references`)
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200)
    expect(references.body.data.references.some((item) => item.type === 'resourceShare')).toBe(true)

    await request(app).delete(`/api/admin/media/${media._id}`).set('Authorization', `Bearer ${superToken}`).expect(200)
    await visitor.get(`/api/public/media-shares/${created.publicId}/entries/${entryId}/content`).expect(200)
    const blocked = await request(app)
      .delete(`/api/admin/media/${media._id}/permanent`)
      .set('Authorization', `Bearer ${superToken}`)
      .expect(409)
    expect(blocked.body.code).toBe('MEDIA_ACTIVE_SHARE_REFERENCE')

    await request(app).post(`/api/admin/media-shares/${created.id}/revoke`).set('Authorization', `Bearer ${superToken}`).expect(200)
    await request(app).delete(`/api/admin/media/${media._id}/permanent`).set('Authorization', `Bearer ${superToken}`).expect(200)
    expect(await Media.findById(media._id)).toBeNull()
    expect(fs.existsSync(media.storagePath)).toBe(false)
  })
})
