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

  it('reports cached thumbnails and clears caches without deleting originals', async () => {
    const original = await sharp({
      create: { width: 1200, height: 900, channels: 3, background: { r: 30, g: 140, b: 100 } }
    }).png().toBuffer()
    const filePath = path.join(resolveUploadRoot(), 'performance-cache-test', 'cache-image.png')
    const missingOriginalPath = path.join(resolveUploadRoot(), 'performance-cache-test', 'missing-original.png')
    const thumbnailDirectory = path.join(resolveUploadRoot(), '.generated-thumbnails')
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.mkdirSync(thumbnailDirectory, { recursive: true })
    fs.writeFileSync(filePath, original)
    const media = await Media.create({
      filename: 'cache-image.png',
      originalName: 'cache-image.png',
      mimeType: 'image/png',
      size: original.length,
      url: '/uploads/performance-cache-test/cache-image.png',
      storagePath: filePath.replace(/\\/g, '/'),
      kind: 'image',
      category: '默认素材',
      fileClass: 'image',
      uploader: admin._id
    })
    fs.writeFileSync(missingOriginalPath, original)
    const missingOriginalMedia = await Media.create({
      filename: 'missing-original.png',
      originalName: 'missing-original.png',
      mimeType: 'image/png',
      size: original.length,
      url: '/uploads/performance-cache-test/missing-original.png',
      storagePath: missingOriginalPath.replace(/\\/g, '/'),
      kind: 'image',
      category: '默认素材',
      fileClass: 'image',
      uploader: admin._id
    })
    const thumbnailPath = path.join(thumbnailDirectory, `${media._id}.webp`)
    const missingOriginalThumbnailPath = path.join(thumbnailDirectory, `${missingOriginalMedia._id}.webp`)
    const orphanPath = path.join(thumbnailDirectory, 'ffffffffffffffffffffffff.webp')

    await request(app)
      .get(`/api/admin/media-downloads/thumbnail/${media._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    await request(app)
      .get(`/api/admin/media-downloads/thumbnail/${missingOriginalMedia._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    fs.unlinkSync(missingOriginalPath)
    fs.writeFileSync(orphanPath, Buffer.alloc(48, 7))

    const overview = await request(app)
      .get('/api/admin/media/thumbnail-cache')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    expect(overview.body.data).toMatchObject({ thumbnailCount: 3, orphanCount: 2 })
    expect(overview.body.data.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ mediaId: media._id.toString(), originalName: 'cache-image.png', status: 'active' }),
      expect.objectContaining({ mediaId: missingOriginalMedia._id.toString(), status: 'missingSource', isOrphan: true }),
      expect.objectContaining({ mediaId: 'ffffffffffffffffffffffff', status: 'orphan' })
    ]))

    const orphanCleanup = await request(app)
      .delete('/api/admin/media/thumbnail-cache/orphans')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    expect(orphanCleanup.body.data).toMatchObject({ thumbnailCount: 2, deletedCount: 2 })
    expect(fs.existsSync(orphanPath)).toBe(false)
    expect(fs.existsSync(missingOriginalThumbnailPath)).toBe(false)
    expect(fs.existsSync(thumbnailPath)).toBe(true)
    expect(fs.readFileSync(filePath)).toEqual(original)

    const allCleanup = await request(app)
      .delete('/api/admin/media/thumbnail-cache/all')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    expect(allCleanup.body.data).toMatchObject({ thumbnailCount: 1, deletedCount: 1 })
    expect(fs.existsSync(thumbnailPath)).toBe(false)
    expect(fs.readFileSync(filePath)).toEqual(original)

    await request(app)
      .get(`/api/admin/media-downloads/thumbnail/${media._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    expect(fs.existsSync(thumbnailPath)).toBe(true)
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
