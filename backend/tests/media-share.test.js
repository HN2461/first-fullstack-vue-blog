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
  const role = await Role.create({
    name: '资源分享管理员',
    code: `media-share-manager-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    menuIds: [mediaMenu._id],
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
    const created = await createShare(app, superToken, [media._id], { mode: 'password' })
    const visitor = request.agent(app)

    const locked = await visitor.get(`/api/public/media-shares/${created.publicId}`).expect(200)
    expect(locked.body.data).toMatchObject({ unlocked: false, items: [] })

    const unlocked = await visitor
      .post(`/api/public/media-shares/${created.publicId}/verify-password`)
      .send({ code: created.extractionCode })
      .expect(200)
    expect(unlocked.body.data.unlocked).toBe(true)
    expect(unlocked.body.data.items).toHaveLength(1)

    const secondMedia = await createMedia(superAdmin, 'rate-limited-note.txt')
    const limitedShare = await createShare(app, superToken, [secondMedia._id], { mode: 'password' })
    const wrongCode = limitedShare.extractionCode === '9999' ? '0000' : '9999'
    for (let index = 0; index < 5; index += 1) {
      await request(app)
        .post(`/api/public/media-shares/${limitedShare.publicId}/verify-password`)
        .send({ code: wrongCode })
        .expect(400)
    }

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
})
