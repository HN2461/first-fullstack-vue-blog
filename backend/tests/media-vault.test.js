import fs from 'node:fs'
import path from 'node:path'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { USER_ROLES } from '#constants/domain'
import { Media } from '#modules/media/models/Media.js'
import { MediaVaultSession } from '#modules/media/models/MediaVaultSession.js'
import { ensureUserVaultCategory } from '#modules/media/services/mediaCategory.service.js'
import { getVaultStorageRoot } from '#modules/media/services/mediaVault.service.js'
import { User } from '#modules/user/models/User.js'
import { createApp } from '../src/app.js'
import { signAccessToken } from '../src/utils/jwt.js'
import { resolveUploadRoot } from '../src/utils/uploadPath.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function createSuperAdmin() {
  return User.create({
    username: 'vault-super-admin',
    email: `vault-${Date.now()}-${Math.random()}@example.com`,
    passwordHash: 'hashed-password',
    role: USER_ROLES.SUPER_ADMIN
  })
}

async function createVaultMedia(owner, originalName = 'vault-note.txt') {
  const category = await ensureUserVaultCategory(owner)
  const targetPath = path.join(getVaultStorageRoot(), String(owner._id), '2026', '10', originalName)
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.writeFileSync(targetPath, Buffer.from('vault-content'))

  const media = await Media.create({
    filename: originalName,
    originalName,
    mimeType: 'text/plain',
    size: 13,
    url: '/api/admin/media-downloads/content/pending',
    storagePath: targetPath.replace(/\\/g, '/'),
    kind: 'attachment',
    category: category.name,
    categoryId: category._id,
    fileClass: 'document',
    accessScope: 'vault',
    uploader: owner._id
  })
  media.url = `/api/admin/media-downloads/content/${media._id}`
  await media.save()
  return media
}

function parseBuffer(res, callback) {
  const chunks = []
  res.on('data', (chunk) => chunks.push(chunk))
  res.on('end', () => callback(null, Buffer.concat(chunks)))
}

describe('media vault protection', () => {
  let app
  let owner
  let token
  let agent

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    fs.rmSync(path.resolve(resolveUploadRoot(), '..', 'uploads-private'), { recursive: true, force: true })
    app = createApp()
    owner = await createSuperAdmin()
    token = signAccessToken(owner)
    agent = request.agent(app)
  })

  afterAll(async () => {
    fs.rmSync(path.resolve(resolveUploadRoot(), '..', 'uploads-private'), { recursive: true, force: true })
    await disconnectTestDatabase()
  })

  it('allows first-time setup, requires the vault session, and serves protected content only after unlock', async () => {
    const status = await agent
      .get('/api/admin/media-vault/status')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(status.body.data).toMatchObject({ configured: false, unlocked: false, enabled: true })
    const media = await createVaultMedia(owner)

    const lockedList = await agent
      .get('/api/admin/media')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(lockedList.body.data.items).toHaveLength(1)
    expect(lockedList.body.data.items[0]).toMatchObject({
      id: media._id.toString(),
      originalName: '密码箱文件',
      filename: '',
      url: '',
      storagePath: '',
      accessScope: 'vault'
    })
    expect(lockedList.body.data.items[0].originalName).not.toBe(media.originalName)

    await agent
      .get(`/api/admin/media-downloads/content/${media._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    const setup = await agent
      .post('/api/admin/media-vault/setup')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'vault-pass-123' })
      .expect(201)
    expect(setup.body.data).toMatchObject({ unlocked: true })
    expect(setup.body.data.remainingSeconds).toBeGreaterThan(0)
    expect(setup.body.data.expiresAt).toBeTruthy()

    const unlockedList = await agent
      .get('/api/admin/media')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(unlockedList.body.data.items.map((item) => item.id)).toContain(media._id.toString())

    const content = await agent
      .get(`/api/admin/media-downloads/content/${media._id}`)
      .set('Authorization', `Bearer ${token}`)
      .buffer(true)
      .parse(parseBuffer)
      .expect(200)
    expect(content.body.toString('utf8')).toBe('vault-content')
    expect(content.headers['cache-control']).toBe('private, no-store')

    const session = await MediaVaultSession.findOne({ owner: owner._id })
    session.lastSeenAt = new Date(Date.now() - 5 * 60 * 1000)
    await session.save()
    const statusAfterActivity = await agent
      .get('/api/admin/media-vault/status')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(statusAfterActivity.body.data.unlocked).toBe(true)
    expect(statusAfterActivity.body.data.expiresAt).toBe(setup.body.data.expiresAt)
    expect(statusAfterActivity.body.data.remainingSeconds).toBeGreaterThan(0)
    expect(statusAfterActivity.body.data.remainingSeconds).toBeLessThanOrEqual(setup.body.data.remainingSeconds)

    await agent
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    const statusAfterLogout = await agent
      .get('/api/admin/media-vault/status')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(statusAfterLogout.body.data.unlocked).toBe(false)
  })

  it('locks after repeated failed passwords and invalidates old sessions after a password change', async () => {
    await agent
      .post('/api/admin/media-vault/setup')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'vault-pass-123' })
      .expect(201)
    await agent
      .post('/api/admin/media-vault/lock')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await agent
        .post('/api/admin/media-vault/unlock')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'wrong-pass-123' })
        .expect(400)
    }

    const locked = await agent
      .post('/api/admin/media-vault/unlock')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'vault-pass-123' })
      .expect(429)
    expect(locked.body.code).toBe('MEDIA_VAULT_LOCKED')

    const freshAgent = request.agent(app)
    await freshAgent
      .put('/api/profile/media-vault/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: 'vault-pass-123', newPassword: 'vault-pass-456' })
      .expect(200)

    const status = await agent
      .get('/api/admin/media-vault/status')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(status.body.data.unlocked).toBe(false)

    await freshAgent
      .post('/api/admin/media-vault/unlock')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'vault-pass-456' })
      .expect(200)
  })

  it('does not expose historical vault files to static serving or inventory registration', async () => {
    const relativePath = 'vault/hello.txt'
    const targetPath = path.join(resolveUploadRoot(), relativePath)
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.writeFileSync(targetPath, Buffer.from('historical-vault'))

    await request(app)
      .get(`/uploads/${relativePath}`)
      .expect(404)

    const scan = await request(app)
      .get('/api/admin/media/unregistered')
      .query({ keyword: 'hello.txt', pageSize: 10 })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(scan.body.data).toMatchObject({ registerableCount: 0, protectedCount: 1 })
    expect(scan.body.data.items[0]).toMatchObject({
      relativePath,
      url: '',
      protected: true,
      source: { type: 'protectedVault', registerable: false }
    })
    expect(scan.body.data.items[0]).not.toHaveProperty('storagePath')

    await request(app)
      .delete('/api/admin/media/unregistered/suspected-tests')
      .query({ keyword: 'hello.txt' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(fs.existsSync(targetPath)).toBe(true)
  })

  it('cannot create a public share for vault media', async () => {
    const media = await createVaultMedia(owner, 'share-blocked.txt')
    await agent
      .post('/api/admin/media-vault/setup')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'vault-pass-123' })
      .expect(201)

    const response = await agent
      .post('/api/admin/media-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '不应公开', mode: 'public', mediaIds: [media._id.toString()] })
      .expect(404)
    expect(response.body.code).toBe('SHARE_MEDIA_NOT_FOUND')
  })
})
