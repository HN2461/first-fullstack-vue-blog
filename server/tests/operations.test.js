import request from 'supertest'
import { USER_ROLES } from '@blog/shared'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { User } from '../src/models/User.js'
import { createArticle } from '../src/services/article.service.js'
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
    role: USER_ROLES.ADMIN
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
})
