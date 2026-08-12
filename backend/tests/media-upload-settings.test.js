import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { USER_ROLES } from '#constants/domain'
import { createApp } from '../src/app.js'
import { User } from '#modules/user/models/User.js'
import { Media } from '#modules/media/models/Media.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function createAdmin() {
  return User.create({
    username: 'media-admin',
    email: `media-admin-${Date.now()}-${Math.random()}@example.com`,
    passwordHash: 'hashed-password',
    role: USER_ROLES.SUPER_ADMIN
  })
}

describe('media upload settings', () => {
  let app
  let adminToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    const admin = await createAdmin()
    adminToken = signAccessToken(admin)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('persists allowed extensions and rejects disabled media extensions', async () => {
    const settingsResponse = await request(app)
      .patch('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        mediaMaxFilesPerUpload: 10,
        mediaMaxFileSizeMB: 200,
        mediaAllowedExtensions: ['.zip']
      })
      .expect(200)

    expect(settingsResponse.body.data.mediaAllowedExtensions).toEqual(['.zip'])

    const blockedResponse = await request(app)
      .post('/api/admin/media')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('files', Buffer.from('installer payload'), {
        filename: 'tool.exe',
        contentType: 'application/octet-stream'
      })
      .expect(400)

    expect(blockedResponse.body.code).toBe('MEDIA_UPLOAD_EXTENSION_NOT_ALLOWED')
    expect(await Media.countDocuments()).toBe(0)

    const uploadResponse = await request(app)
      .post('/api/admin/media')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('files', Buffer.from('zip payload'), {
        filename: 'tool.zip',
        contentType: 'application/zip'
      })
      .expect(201)

    expect(uploadResponse.body.data.fileClass).toBe('archive')
    expect(await Media.countDocuments()).toBe(1)
  })

  it('accepts the 1GB media limit and rejects values above the absolute limit', async () => {
    const accepted = await request(app)
      .patch('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ mediaMaxFileSizeMB: 1024 })
      .expect(200)

    expect(accepted.body.data.mediaMaxFileSizeMB).toBe(1024)

    const rejected = await request(app)
      .patch('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ mediaMaxFileSizeMB: 1025 })
      .expect(400)

    expect(rejected.body.message).toContain('1024MB')
  })
})
