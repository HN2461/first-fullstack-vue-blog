import fs from 'node:fs'
import path from 'node:path'
import request from 'supertest'
import sharp from 'sharp'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { USER_ROLES } from '#constants/domain'
import { Media } from '#modules/media/models/Media.js'
import { MediaCategory } from '#modules/media/models/MediaCategory.js'
import { User } from '#modules/user/models/User.js'
import { createApp } from '../src/app.js'
import { signAccessToken } from '../src/utils/jwt.js'
import { resolveUploadRoot } from '../src/utils/uploadPath.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

function parseBuffer(res, callback) {
  const chunks = []
  res.on('data', (chunk) => chunks.push(chunk))
  res.on('end', () => callback(null, Buffer.concat(chunks)))
}

describe('media performance endpoints', () => {
  let app
  let admin
  let adminToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    admin = await User.create({
      username: 'media-performance-admin',
      email: `media-performance-${Date.now()}-${Math.random()}@example.com`,
      passwordHash: 'hashed-password',
      role: USER_ROLES.SUPER_ADMIN
    })
    adminToken = signAccessToken(admin)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('serves bounded WebP thumbnails without changing or publicly exposing the original', async () => {
    const original = await sharp({
      create: { width: 1600, height: 1200, channels: 3, background: { r: 220, g: 70, b: 55 } }
    }).png().toBuffer()
    const filePath = path.join(resolveUploadRoot(), 'performance-test', 'large-image.png')
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, original)
    const media = await Media.create({
      filename: 'large-image.png',
      originalName: 'large-image.png',
      mimeType: 'image/png',
      size: original.length,
      url: '/uploads/performance-test/large-image.png',
      storagePath: filePath.replace(/\\/g, '/'),
      kind: 'image',
      category: '默认素材',
      fileClass: 'image',
      uploader: admin._id
    })

    const response = await request(app)
      .get(`/api/admin/media-downloads/thumbnail/${media._id}`)
      .set('Cookie', `blog_session=${adminToken}`)
      .buffer(true)
      .parse(parseBuffer)
      .expect(200)

    const metadata = await sharp(response.body).metadata()
    expect(response.headers['content-type']).toContain('image/webp')
    expect(response.headers['cache-control']).toBe('private, no-store')
    expect(metadata).toMatchObject({ format: 'webp', width: 640, height: 480 })
    expect(fs.readFileSync(filePath)).toEqual(original)

    await request(app)
      .get(`/uploads/.generated-thumbnails/${media._id}.webp`)
      .expect(404)
  })

  it('aggregates file classes and reports actual upload directory usage', async () => {
    const uploadRoot = resolveUploadRoot()
    const category = await MediaCategory.create({ name: '性能统计分类', owner: admin._id })
    const imagePath = path.join(uploadRoot, 'stats-test', 'image.png')
    const textPath = path.join(uploadRoot, 'stats-test', 'readme.txt')
    fs.mkdirSync(path.dirname(imagePath), { recursive: true })
    fs.writeFileSync(imagePath, Buffer.alloc(100, 1))
    fs.writeFileSync(textPath, Buffer.alloc(40, 2))

    for (const [filename, filePath, mimeType, fileClass, kind, categoryId] of [
      ['image.png', imagePath, 'image/png', 'image', 'image', category._id],
      ['readme.txt', textPath, 'text/plain', 'document', 'attachment', null]
    ]) {
      await Media.create({
        filename,
        originalName: filename,
        mimeType,
        size: fs.statSync(filePath).size,
        url: `/uploads/stats-test/${filename}`,
        storagePath: filePath.replace(/\\/g, '/'),
        kind,
        category: '默认素材',
        categoryId,
        fileClass,
        uploader: admin._id
      })
    }

    const statsResponse = await request(app)
      .get('/api/admin/media/statistics')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    expect(statsResponse.body.data.byFileClass).toMatchObject({ image: 1, document: 1 })

    const categoryStatsResponse = await request(app)
      .get('/api/admin/media/statistics')
      .query({ categoryId: category._id.toString() })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    expect(categoryStatsResponse.body.data.byFileClass).toMatchObject({ image: 1, document: 0 })

    const storageResponse = await request(app)
      .get('/api/admin/media/storage?refresh=true')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    expect(storageResponse.body.data.totalBytes).toBeGreaterThanOrEqual(140)
    expect(storageResponse.body.data.areas).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '公开上传目录', bytes: expect.any(Number), fileCount: expect.any(Number) }),
      expect.objectContaining({ label: '密码箱及私有资源', bytes: expect.any(Number), fileCount: expect.any(Number) }),
      expect.objectContaining({ label: '临时上传文件', bytes: expect.any(Number), fileCount: expect.any(Number) })
    ]))
  })
})
