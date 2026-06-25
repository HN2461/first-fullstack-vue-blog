import request from 'supertest'
import fs from 'node:fs'
import { USER_ROLES } from '#constants/domain'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { Media } from '#modules/media/models/Media.js'
import { User } from '#modules/user/models/User.js'
import { createArticle } from '#modules/content/services/article.service.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function createAdmin() {
  return User.create({
    username: 'admin',
    email: `ops-admin-${Date.now()}-${Math.random()}@example.com`,
    passwordHash: 'hashed-password',
    role: USER_ROLES.SUPER_ADMIN
  })
}

describe('operations routes', () => {
  let app
  let admin
  let adminToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    admin = await createAdmin()
    adminToken = signAccessToken(admin)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('updates and exposes site settings', async () => {
    await request(app)
      .patch('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        siteTitle: '测试博客',
        authorName: '主人'
      })
      .expect(200)

    const response = await request(app)
      .get('/api/public/site/profile')
      .expect(200)

    expect(response.body.data.siteTitle).toBe('测试博客')
    expect(response.body.data.authorName).toBe('主人')
  })

  it('blocks new comments when comment setting is disabled', async () => {
    const article = await createArticle({
      title: '关闭评论文章',
      slug: 'comment-disabled-post',
      status: 'published'
    }, admin)

    await request(app)
      .patch('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ commentEnabled: false })
      .expect(200)

    const response = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        articleId: article.id,
        content: '这里不应该写入评论'
      })
      .expect(403)

    expect(response.body.code).toBe('COMMENTS_DISABLED')
  })

  it('keeps profile fields aligned between profile page and admin users', async () => {
    const profileResponse = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: '资料管理员',
        bio: '长期维护知识库',
        website: 'https://example.com',
        location: '深圳'
      })
      .expect(200)

    expect(profileResponse.body.data).toMatchObject({
      username: '资料管理员',
      bio: '长期维护知识库',
      website: 'https://example.com',
      location: '深圳'
    })

    const notificationResponse = await request(app)
      .put('/api/profile/notifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: false,
        site: true,
        comment: false,
        like: true
      })
      .expect(200)

    expect(notificationResponse.body.data).toEqual({
      email: false,
      site: true,
      comment: false,
      like: true
    })

    const usersResponse = await request(app)
      .get('/api/admin/users')
      .query({ keyword: '深圳' })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(usersResponse.body.data.items[0]).toMatchObject({
      id: admin._id.toString(),
      username: '资料管理员',
      bio: '长期维护知识库',
      website: 'https://example.com',
      location: '深圳',
      notificationSettings: {
        email: false,
        site: true,
        comment: false,
        like: true
      }
    })

    const recordsResponse = await request(app)
      .get('/api/profile/login-records')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(recordsResponse.body.data).toEqual({
      items: [],
      total: 0,
      source: 'pending_integration'
    })
  })

  it('lets admins set backend-only remarks for ordinary users', async () => {
    const user = await User.create({
      username: 'ordinary-reader',
      email: 'ordinary-reader@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.USER
    })

    const remarkResponse = await request(app)
      .patch(`/api/admin/users/${user._id}/remark`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ remarkName: '同事测试账号' })
      .expect(200)

    expect(remarkResponse.body.data).toMatchObject({
      id: user._id.toString(),
      remarkName: '同事测试账号'
    })

    const usersResponse = await request(app)
      .get('/api/admin/users')
      .query({ keyword: '同事' })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(usersResponse.body.data.total).toBe(1)
    expect(usersResponse.body.data.items[0]).toMatchObject({
      email: 'ordinary-reader@example.com',
      remarkName: '同事测试账号'
    })
  })

  it('creates admin announcements and lists active public announcements', async () => {
    await request(app)
      .post('/api/admin/announcements')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: '系统公告',
        content: '博客系统上线'
      })
      .expect(201)

    const response = await request(app)
      .get('/api/public/announcements')
      .expect(200)

    expect(response.body.data.items).toHaveLength(1)
    expect(response.body.data.items[0].title).toBe('系统公告')
  })

  it('returns basic admin stats', async () => {
    await createArticle({
      title: '统计文章',
      slug: 'stats-post',
      status: 'published'
    }, admin)

    const response = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(response.body.data.articleCount).toBe(1)
    expect(response.body.data.publishedCount).toBe(1)
    expect(response.body.data.userCount).toBe(1)
  })

  it('returns monitor overview for admin users', async () => {
    await request(app)
      .get('/api/health')
      .expect(200)

    const response = await request(app)
      .get('/api/admin/monitor/overview')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(response.body.data.system).toMatchObject({
      environment: expect.any(String),
      platform: expect.any(String),
      nodeVersion: expect.any(String),
      serviceVersion: expect.any(String)
    })
    expect(response.body.data.service.api.status).toBe('up')
    expect(response.body.data.service.database.readyState).toBe(1)
    expect(response.body.data.requests.totalRequests).toBeGreaterThanOrEqual(1)
    expect(Array.isArray(response.body.data.alerts)).toBe(true)
  })

  it('uploads media metadata', async () => {
    const response = await request(app)
      .post('/api/admin/media')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('hello'), {
        filename: 'hello.txt',
        contentType: 'text/plain'
      })
      .expect(201)

    expect(response.body.data.originalName).toBe('hello.txt')
    expect(response.body.data.kind).toBe('attachment')
  })

  it('renames media display name while keeping stored file path stable', async () => {
    const uploadResponse = await request(app)
      .post('/api/admin/media')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('files', Buffer.from('rename me'), {
        filename: 'untitled.txt',
        contentType: 'text/plain'
      })
      .expect(201)

    const media = uploadResponse.body.data
    const renameResponse = await request(app)
      .patch(`/api/admin/media/${media.id}/name`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ originalName: '课程资料' })
      .expect(200)

    expect(renameResponse.body.data.originalName).toBe('课程资料.txt')
    expect(renameResponse.body.data.storagePath).toBe(media.storagePath)

    const stored = await Media.findById(media.id)
    expect(stored.originalName).toBe('课程资料.txt')
    expect(stored.storagePath).toBe(media.storagePath)
    expect(fs.existsSync(media.storagePath)).toBe(true)
  })

  it('enforces configurable media upload limits', async () => {
    await request(app)
      .patch('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        mediaMaxFilesPerUpload: 1,
        mediaMaxFileSizeMB: 1
      })
      .expect(200)

    const countResponse = await request(app)
      .post('/api/admin/media')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('files', Buffer.from('first'), {
        filename: 'first.txt',
        contentType: 'text/plain'
      })
      .attach('files', Buffer.from('second'), {
        filename: 'second.txt',
        contentType: 'text/plain'
      })
      .expect(400)

    expect(countResponse.body.code).toBe('MEDIA_UPLOAD_COUNT_LIMIT')

    const sizeResponse = await request(app)
      .post('/api/admin/media')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('files', Buffer.alloc(1024 * 1024 + 1), {
        filename: 'large.bin',
        contentType: 'application/octet-stream'
      })
      .expect(400)

    expect(sizeResponse.body.code).toBe('MEDIA_UPLOAD_SIZE_LIMIT')
  })

  it('uses recycle bin lifecycle for media files', async () => {
    const uploadResponse = await request(app)
      .post('/api/admin/media')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('files', Buffer.from('recyclable file'), {
        filename: 'recycle.txt',
        contentType: 'text/plain'
      })
      .expect(201)

    const media = uploadResponse.body.data
    expect(fs.existsSync(media.storagePath)).toBe(true)

    const softDeleteResponse = await request(app)
      .delete(`/api/admin/media/${media.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(softDeleteResponse.body.data).toMatchObject({
      id: media.id,
      deleted: true,
      mode: 'soft'
    })
    expect(fs.existsSync(media.storagePath)).toBe(true)
    expect(await Media.findById(media.id)).toBeTruthy()

    const activeResponse = await request(app)
      .get('/api/admin/media')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(activeResponse.body.data.total).toBe(0)

    const trashResponse = await request(app)
      .get('/api/admin/media/trash')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(trashResponse.body.data.total).toBe(1)
    expect(trashResponse.body.data.items[0].deletedAt).toBeTruthy()

    const restoreResponse = await request(app)
      .post(`/api/admin/media/${media.id}/restore`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(restoreResponse.body.data.deletedAt).toBeNull()

    await request(app)
      .delete(`/api/admin/media/${media.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    const permanentDeleteResponse = await request(app)
      .delete(`/api/admin/media/${media.id}/permanent`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(permanentDeleteResponse.body.data).toMatchObject({
      id: media.id,
      deleted: true,
      mode: 'permanent',
      fileRemoved: true
    })
    expect(fs.existsSync(media.storagePath)).toBe(false)
    expect(await Media.findById(media.id)).toBeNull()
  })

  it('permanently deletes trash media even when legacy storagePath is invalid', async () => {
    const uploadResponse = await request(app)
      .post('/api/admin/media')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('files', Buffer.from('legacy path file'), {
        filename: 'legacy-delete.txt',
        contentType: 'text/plain'
      })
      .expect(201)

    const media = uploadResponse.body.data
    expect(fs.existsSync(media.storagePath)).toBe(true)

    await Media.findByIdAndUpdate(media.id, {
      deletedAt: new Date(),
      storagePath: 'C:/Users/HN246/Desktop/legacy/backend/uploads/2026/06/legacy-delete.txt'
    })

    const permanentDeleteResponse = await request(app)
      .delete(`/api/admin/media/${media.id}/permanent`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(permanentDeleteResponse.body.data).toMatchObject({
      id: media.id,
      deleted: true,
      mode: 'permanent',
      fileRemoved: true
    })
    expect(fs.existsSync(media.storagePath)).toBe(false)
    expect(await Media.findById(media.id)).toBeNull()
  })
})
