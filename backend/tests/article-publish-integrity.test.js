import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { ARTICLE_STATUS, USER_ROLES } from '#constants/domain'
import { Article } from '#modules/content/models/Article.js'
import { User } from '#modules/user/models/User.js'
import { createApp } from '../src/app.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

describe('article publish integrity', () => {
  let app
  let adminToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    const admin = await User.create({
      username: 'publish-guard-admin',
      email: `publish-guard-${Date.now()}@example.com`,
      passwordHash: 'hashed-password',
      role: USER_ROLES.SUPER_ADMIN
    })
    adminToken = signAccessToken(admin)
    app = createApp()
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('rejects an incomplete article created directly as published', async () => {
    const response = await request(app)
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: '不完整的直接发布文章',
        contentMarkdown: '# 正文',
        status: ARTICLE_STATUS.PUBLISHED
      })
      .expect(400)

    expect(response.body.code).toBe('ARTICLE_SUMMARY_REQUIRED')
    expect(await Article.countDocuments()).toBe(0)
  })

  it('rejects edits that would leave a published article incomplete', async () => {
    const categoryResponse = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '发布完整性', slug: 'publish-integrity' })
      .expect(201)

    const articleResponse = await request(app)
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: '完整文章',
        slug: 'complete-article',
        summary: '完整摘要',
        contentMarkdown: '# 完整正文',
        category: categoryResponse.body.data.id
      })
      .expect(201)

    await request(app)
      .post(`/api/admin/articles/${articleResponse.body.data.id}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    const response = await request(app)
      .patch(`/api/admin/articles/${articleResponse.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: '完整文章',
        slug: 'complete-article',
        summary: '',
        contentMarkdown: '# 完整正文',
        category: categoryResponse.body.data.id,
        tags: [],
        resources: []
      })
      .expect(400)

    expect(response.body.code).toBe('ARTICLE_SUMMARY_REQUIRED')
    const stored = await Article.findById(articleResponse.body.data.id).lean()
    expect(stored.status).toBe(ARTICLE_STATUS.PUBLISHED)
    expect(stored.summary).toBe('完整摘要')
  })
})
