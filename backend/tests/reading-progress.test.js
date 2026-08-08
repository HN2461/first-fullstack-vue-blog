import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { USER_ROLES } from '#constants/domain'
import { createApp } from '../src/app.js'
import { ArticleReadingProgress } from '#modules/readingProgress/models/ArticleReadingProgress.js'
import { User } from '#modules/user/models/User.js'
import { createArticle } from '#modules/content/services/article.service.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function createUser(name, role = USER_ROLES.USER) {
  return User.create({
    username: name,
    email: `${name}-${Date.now()}-${Math.random()}@example.com`,
    passwordHash: 'hashed-password',
    role
  })
}

describe('article reading progress routes', () => {
  let app
  let admin
  let user
  let otherUser
  let article
  let userToken
  let otherToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    admin = await createUser('reading-admin', USER_ROLES.SUPER_ADMIN)
    user = await createUser('reading-user')
    otherUser = await createUser('reading-other')
    userToken = signAccessToken(user)
    otherToken = signAccessToken(otherUser)
    article = await createArticle({
      title: '阅读进度文章',
      slug: `reading-progress-${Date.now()}`,
      contentMarkdown: '# 阅读进度文章\n\n## 第二节',
      status: 'published'
    }, admin)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('requires authentication and returns null before the first save', async () => {
    await request(app)
      .get(`/api/articles/${article.id}/reading-progress`)
      .expect(401)

    const response = await request(app)
      .get(`/api/articles/${article.id}/reading-progress`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)

    expect(response.body.data).toBeNull()
  })

  it('upserts one progress record per user and article', async () => {
    const first = await request(app)
      .put(`/api/articles/${article.id}/reading-progress`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        progressPercent: 34.25,
        scrollRatio: 0.3425,
        anchorSlug: 'second-section',
        anchorOffset: 128
      })
      .expect(200)

    expect(first.body.data).toMatchObject({
      articleId: article.id,
      progressPercent: 34.25,
      anchorSlug: 'second-section',
      completedAt: null
    })

    await request(app)
      .put(`/api/articles/${article.id}/reading-progress`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ progressPercent: 57, scrollRatio: 0.57, anchorSlug: '', anchorOffset: 0 })
      .expect(200)

    expect(await ArticleReadingProgress.countDocuments({ userId: user._id, articleId: article.id })).toBe(1)
    const stored = await ArticleReadingProgress.findOne({ userId: user._id, articleId: article.id })
    expect(stored.progressPercent).toBe(57)
  })

  it('isolates users, marks completion and clears progress idempotently', async () => {
    await request(app)
      .put(`/api/articles/${article.id}/reading-progress`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ progressPercent: 96, scrollRatio: 0.96 })
      .expect(200)

    const otherResponse = await request(app)
      .get(`/api/articles/${article.id}/reading-progress`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200)
    expect(otherResponse.body.data).toBeNull()

    const ownResponse = await request(app)
      .get(`/api/articles/${article.id}/reading-progress`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
    expect(ownResponse.body.data.completedAt).toEqual(expect.any(String))

    for (let index = 0; index < 2; index += 1) {
      await request(app)
        .delete(`/api/articles/${article.id}/reading-progress`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
    }
    expect(await ArticleReadingProgress.countDocuments()).toBe(0)
  })

  it('rejects invalid payloads and draft articles', async () => {
    await request(app)
      .put(`/api/articles/${article.id}/reading-progress`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ progressPercent: 101, scrollRatio: 1.01 })
      .expect(400)

    const draft = await createArticle({
      title: '阅读进度草稿',
      contentMarkdown: '# 草稿'
    }, admin)

    await request(app)
      .put(`/api/articles/${draft.id}/reading-progress`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ progressPercent: 30, scrollRatio: 0.3 })
      .expect(404)
  })
})
