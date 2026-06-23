import request from 'supertest'
import { COMMENT_STATUS, USER_ROLES, USER_STATUS } from '#constants/domain'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { User } from '#modules/user/models/User.js'
import { createArticle } from '#modules/content/services/article.service.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function createUser(role = USER_ROLES.USER, status = USER_STATUS.ACTIVE) {
  const effectiveRole = role === USER_ROLES.ADMIN ? USER_ROLES.SUPER_ADMIN : role
  return User.create({
    username: `${role}-${status}`,
    email: `${role}-${status}-${Date.now()}-${Math.random()}@example.com`,
    passwordHash: 'hashed-password',
    role: effectiveRole,
    status
  })
}

describe('interaction routes', () => {
  let app
  let admin
  let user
  let mutedUser
  let article
  let adminToken
  let userToken
  let mutedToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    admin = await createUser(USER_ROLES.ADMIN)
    user = await createUser(USER_ROLES.USER)
    mutedUser = await createUser(USER_ROLES.USER, USER_STATUS.MUTED)
    adminToken = signAccessToken(admin)
    userToken = signAccessToken(user)
    mutedToken = signAccessToken(mutedUser)
    article = await createArticle({
      title: '互动文章',
      slug: `interaction-${Date.now()}`,
      contentMarkdown: '# 互动文章',
      status: 'published'
    }, admin)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('creates a visible comment and lists it publicly', async () => {
    const created = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        articleId: article.id,
        content: '这是一条正常评论'
      })
      .expect(201)

    expect(created.body.data.status).toBe(COMMENT_STATUS.VISIBLE)

    const list = await request(app)
      .get(`/api/public/articles/${article.id}/comments`)
      .expect(200)

    expect(list.body.data).toHaveLength(1)
  })

  it('sends comments with links to pending moderation', async () => {
    const created = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        articleId: article.id,
        content: '看看 http://example.com'
      })
      .expect(201)

    expect(created.body.data.status).toBe(COMMENT_STATUS.PENDING)
    expect(created.body.data.riskReasons).toContain('contains_link')
  })

  it('allows admin to approve a pending comment', async () => {
    const created = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        articleId: article.id,
        content: '看看 http://example.com'
      })
      .expect(201)

    const approved = await request(app)
      .post(`/api/admin/comments/${created.body.data.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(approved.body.data.status).toBe(COMMENT_STATUS.VISIBLE)

    const list = await request(app)
      .get('/api/admin/comments')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(list.body.data.items[0].article).toMatchObject({
      id: article.id,
      title: article.title
    })
  })

  it('blocks muted users from commenting', async () => {
    const response = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${mutedToken}`)
      .send({
        articleId: article.id,
        content: '我被禁言了'
      })
      .expect(403)

    expect(response.body.code).toBe('USER_MUTED')
  })

  it('adds and removes likes and favorites', async () => {
    const liked = await request(app)
      .post(`/api/articles/${article.id}/like`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)

    expect(liked.body.data.likeCount).toBe(1)

    const favorited = await request(app)
      .post(`/api/articles/${article.id}/favorite`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)

    expect(favorited.body.data.favoriteCount).toBe(1)

    const unliked = await request(app)
      .delete(`/api/articles/${article.id}/like`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)

    expect(unliked.body.data.likeCount).toBe(0)
  })

  it('reports visible comments back to pending moderation', async () => {
    const created = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        articleId: article.id,
        content: '需要被举报的评论'
      })
      .expect(201)

    const reported = await request(app)
      .post(`/api/comments/${created.body.data.id}/report`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)

    expect(reported.body.data.status).toBe(COMMENT_STATUS.PENDING)
    expect(reported.body.data.reportCount).toBe(1)
  })

  it('allows admin to mute a user', async () => {
    const response = await request(app)
      .patch(`/api/admin/users/${user._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: USER_STATUS.MUTED })
      .expect(200)

    expect(response.body.data.status).toBe(USER_STATUS.MUTED)
  })
})
