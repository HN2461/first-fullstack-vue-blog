import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { USER_ROLES } from '#constants/domain'
import { createArticle } from '#modules/content/services/article.service.js'
import { User } from '#modules/user/models/User.js'
import { createApp } from '../src/app.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function createUser(role = USER_ROLES.SUPER_ADMIN) {
  return User.create({
    username: role === USER_ROLES.USER ? 'reader' : 'admin',
    email: `${role}-${Date.now()}-${Math.random()}@example.com`,
    passwordHash: 'hashed-password',
    role
  })
}

describe('article batch title admin APIs', () => {
  let admin
  let normalUser
  let adminToken
  let userToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    admin = await createUser()
    normalUser = await createUser(USER_ROLES.USER)
    adminToken = signAccessToken(admin)
    userToken = signAccessToken(normalUser)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('previews selected article titles in request order', async () => {
    const app = createApp()
    const first = await createArticle({
      title: '第一篇文章',
      slug: 'first-preview-title'
    }, admin)
    const second = await createArticle({
      title: '第二篇文章',
      slug: 'second-preview-title'
    }, admin)

    const response = await request(app)
      .post('/api/admin/articles/batch/title-preview')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ids: [second.id, first.id] })
      .expect(200)

    expect(response.body.data).toMatchObject({
      total: 2
    })
    expect(response.body.data.items.map((item) => item.id)).toEqual([second.id, first.id])
    expect(response.body.data.items.map((item) => item.title)).toEqual(['第二篇文章', '第一篇文章'])
  })

  it('updates different titles without changing slugs and reports skipped rows', async () => {
    const app = createApp()
    const first = await createArticle({
      title: '旧前缀-第一篇',
      slug: 'keep-first-slug'
    }, admin)
    const second = await createArticle({
      title: '保持不变',
      slug: 'keep-second-slug'
    }, admin)
    const deleted = await createArticle({
      title: '将被删除',
      slug: 'deleted-title-row'
    }, admin)

    await request(app)
      .delete(`/api/admin/articles/${deleted.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    const response = await request(app)
      .post('/api/admin/articles/batch/titles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [
          { id: first.id, title: '第一篇' },
          { id: second.id, title: '保持不变' },
          { id: deleted.id, title: '删除后提交' }
        ]
      })
      .expect(200)

    expect(response.body.data).toMatchObject({
      total: 3,
      updatedCount: 1,
      unchangedCount: 1,
      skippedCount: 1
    })
    expect(response.body.data.items.map((item) => item.status)).toEqual(['updated', 'unchanged', 'skipped'])

    const firstDetail = await request(app)
      .get(`/api/admin/articles/${first.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    const secondDetail = await request(app)
      .get(`/api/admin/articles/${second.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(firstDetail.body.data).toMatchObject({
      title: '第一篇',
      slug: 'keep-first-slug'
    })
    expect(secondDetail.body.data).toMatchObject({
      title: '保持不变',
      slug: 'keep-second-slug'
    })
  })

  it('rejects invalid batch title payloads', async () => {
    const app = createApp()
    const article = await createArticle({
      title: '校验文章',
      slug: 'title-validation'
    }, admin)

    await request(app)
      .post('/api/admin/articles/batch/titles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ items: [{ id: 'bad-id', title: '新标题' }] })
      .expect(400)

    await request(app)
      .post('/api/admin/articles/batch/titles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ items: [{ id: article.id, title: '   ' }] })
      .expect(400)

    await request(app)
      .post('/api/admin/articles/batch/titles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ items: [{ id: article.id, title: '超长标题'.repeat(50) }] })
      .expect(400)

    await request(app)
      .post('/api/admin/articles/batch/titles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [
          { id: article.id, title: '第一次' },
          { id: article.id, title: '第二次' }
        ]
      })
      .expect(400)
  })

  it('rejects normal users from batch title APIs', async () => {
    const app = createApp()
    const article = await createArticle({
      title: '权限文章',
      slug: 'title-permission'
    }, admin)

    await request(app)
      .post('/api/admin/articles/batch/title-preview')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ ids: [article.id] })
      .expect(403)

    await request(app)
      .post('/api/admin/articles/batch/titles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [{ id: article.id, title: '普通用户不能改' }] })
      .expect(403)
  })
})
