import request from 'supertest'
import { ARTICLE_STATUS, USER_ROLES } from '#constants/domain'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { User } from '#modules/user/models/User.js'
import { Article } from '#modules/content/models/Article.js'
import { createArticle } from '#modules/content/services/article.service.js'
import { createCategory } from '#modules/content/services/category.service.js'
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
    expect(response.body.data.total).toBe(1)
    expect(response.body.data.categories[0]).toEqual(expect.objectContaining({
      name: 'Node.js',
      slug: 'node-js',
      parent: null
    }))
    expect(response.body.data.articles[0]).toEqual({
      id: expect.any(String),
      title: '公开文章',
      slug: 'public-post',
      sortOrder: 10,
      publishedAt: expect.any(String),
      createdAt: expect.any(String),
      category: {
        id: expect.any(String),
        name: 'Node.js',
        slug: 'node-js',
        isSystem: false
      }
    })
  })

  it('returns every published article when the directory contains more than 500 entries', async () => {
    const additionalArticles = Array.from({ length: 500 }, (_, index) => ({
      title: `目录文章 ${index + 1}`,
      slug: `directory-post-${index + 1}`,
      summary: '',
      contentMarkdown: '# 正文',
      category: category.id,
      status: ARTICLE_STATUS.PUBLISHED,
      sortOrder: (index + 2) * 10,
      publishedAt: new Date(),
      createdBy: admin._id,
      updatedBy: admin._id
    }))
    await Article.insertMany(additionalArticles)

    const response = await request(createApp())
      .get('/api/public/knowledge-menu')
      .expect(200)

    expect(response.body.data.total).toBe(501)
    expect(response.body.data.articles).toHaveLength(501)
    expect(response.body.data.articles.at(-1)).toEqual(expect.objectContaining({
      slug: 'directory-post-500',
      sortOrder: 5010
    }))
  })
})
