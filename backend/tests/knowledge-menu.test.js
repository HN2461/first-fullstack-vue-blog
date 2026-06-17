import request from 'supertest'
import { ARTICLE_STATUS, USER_ROLES } from '#constants/domain'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { User } from '../src/models/User.js'
import { createArticle } from '../src/services/article.service.js'
import { createCategory } from '../src/services/category.service.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function createAdmin() {
  return User.create({
    username: 'admin',
    email: `admin-${Date.now()}-${Math.random()}@example.com`,
    passwordHash: 'hashed-password',
    role: USER_ROLES.ADMIN
  })
}

describe('knowledge menu routes', () => {
  let admin
  let category

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    admin = await createAdmin()
    category = await createCategory({
      name: 'Node.js',
      slug: 'node-js'
    })

    await createArticle({
      title: '公开文章',
      slug: 'public-post',
      summary: '菜单只需要轻量信息',
      contentMarkdown: '# 正文',
      category: category.id,
      status: ARTICLE_STATUS.PUBLISHED
    }, admin)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('returns lightweight knowledge menu data', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/knowledge-menu')
      .expect(200)

    expect(response.body.data.categories).toHaveLength(1)
    expect(response.body.data.articles).toHaveLength(1)
    expect(response.body.data.articles[0]).not.toHaveProperty('contentMarkdown')
    expect(response.body.data.articles[0]).not.toHaveProperty('resources')
  })
})
