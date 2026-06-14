import request from 'supertest'
import path from 'node:path'
import { ARTICLE_STATUS, USER_ROLES } from '@blog/shared'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { User } from '../src/models/User.js'
import { createArticle, publishArticle } from '../src/services/article.service.js'
import { createCategory, listCategories } from '../src/services/category.service.js'
import { createTag, listTags } from '../src/services/tag.service.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function createUser(role = USER_ROLES.ADMIN) {
  return User.create({
    username: role === USER_ROLES.ADMIN ? 'admin' : 'reader',
    email: `${role}-${Date.now()}-${Math.random()}@example.com`,
    passwordHash: 'hashed-password',
    role
  })
}

describe('content admin services', () => {
  let admin

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    admin = await createUser()
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('creates and lists categories', async () => {
    const category = await createCategory({
      name: 'Node.js',
      slug: 'node-js',
      description: 'Node.js 学习路线'
    })

    const categories = await listCategories()

    expect(category).toMatchObject({
      name: 'Node.js',
      slug: 'node-js'
    })
    expect(categories.items).toHaveLength(1)
    expect(categories.items[0].slug).toBe('node-js')
  })

  it('creates and lists tags', async () => {
    const tag = await createTag({
      name: 'Express',
      slug: 'express',
      color: '#2852b8'
    })

    const tags = await listTags()

    expect(tag).toMatchObject({
      name: 'Express',
      slug: 'express'
    })
    expect(tags.items).toHaveLength(1)
  })

  it('creates a draft article and publishes it', async () => {
    const category = await createCategory({
      name: 'Node.js',
      slug: 'node-js'
    })
    const tag = await createTag({
      name: 'Express',
      slug: 'express'
    })

    const draft = await createArticle({
      title: 'Express 入门',
      slug: 'express-start',
      summary: '从路由开始理解 Express',
      contentMarkdown: '# Express 入门\n\nExpress 是 Node.js Web 框架。',
      category: category.id,
      tags: [tag.id]
    }, admin)

    expect(draft.status).toBe(ARTICLE_STATUS.DRAFT)
    expect(draft.wordCount).toBeGreaterThan(0)
    expect(draft.readingMinutes).toBeGreaterThanOrEqual(1)

    const published = await publishArticle(draft.id, admin)

    expect(published.status).toBe(ARTICLE_STATUS.PUBLISHED)
    expect(published.publishedAt).toEqual(expect.any(Date))
  })

  it('auto generates unique article slugs', async () => {
    const first = await createArticle({
      title: '同名文章'
    }, admin)

    const second = await createArticle({
      title: '同名文章'
    }, admin)

    expect(first.slug).toBeTruthy()
    expect(second.slug).toBeTruthy()
    expect(second.slug).not.toBe(first.slug)
  })

  it('allows saving draft without publish-only metadata', async () => {
    const draft = await createArticle({
      title: '只有标题和正文',
      contentMarkdown: '# 草稿正文'
    }, admin)

    expect(draft.status).toBe(ARTICLE_STATUS.DRAFT)
    expect(draft.summary).toBe('')
    expect(draft.category).toBeNull()
  })

  it('requires summary and category only when publishing', async () => {
    const draft = await createArticle({
      title: '待发布文章',
      contentMarkdown: '# 正文'
    }, admin)

    await expect(publishArticle(draft.id, admin)).rejects.toMatchObject({
      statusCode: 400,
      code: 'ARTICLE_SUMMARY_REQUIRED'
    })
  })
})

describe('content admin routes', () => {
  let admin
  let normalUser
  let adminToken
  let userToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    admin = await createUser(USER_ROLES.ADMIN)
    normalUser = await createUser(USER_ROLES.USER)
    adminToken = signAccessToken(admin)
    userToken = signAccessToken(normalUser)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('allows admins to manage categories, tags, and articles', async () => {
    const app = createApp()

    const categoryResponse = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Vue',
        slug: 'vue'
      })
      .expect(201)

    const tagResponse = await request(app)
      .post('/api/admin/tags')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: '组件',
        slug: 'components'
      })
      .expect(201)

    const articleResponse = await request(app)
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Vue 组件设计',
        slug: 'vue-component-design',
        summary: '组件边界和复用设计',
        contentMarkdown: '# Vue 组件设计',
        category: categoryResponse.body.data.id,
        tags: [tagResponse.body.data.id]
      })
      .expect(201)

    const publishResponse = await request(app)
      .post(`/api/admin/articles/${articleResponse.body.data.id}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(publishResponse.body.data.status).toBe(ARTICLE_STATUS.PUBLISHED)

    const archiveResponse = await request(app)
      .patch(`/api/admin/articles/${articleResponse.body.data.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: ARTICLE_STATUS.ARCHIVED })
      .expect(200)

    expect(archiveResponse.body.data.status).toBe(ARTICLE_STATUS.ARCHIVED)
  })

  it('rejects normal users from admin content APIs', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/admin/articles')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403)

    expect(response.body.code).toBe('FORBIDDEN')
  })

  it('allows admins to create media categories and upload categorized files', async () => {
    const app = createApp()

    const categoryResponse = await request(app)
      .post('/api/admin/media/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: '项目素材',
        description: '项目截图与演示文件'
      })
      .expect(201)

    expect(categoryResponse.body.data.name).toBe('项目素材')

    const uploadResponse = await request(app)
      .post('/api/admin/media')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('category', '项目素材')
      .attach('file', path.resolve(process.cwd(), 'tests/upload-filename.test.js'))
      .expect(201)

    expect(uploadResponse.body.data.category).toBe('项目素材')
    expect(uploadResponse.body.data.fileClass).toBe('code')

    const listResponse = await request(app)
      .get('/api/admin/media/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    const createdCategory = listResponse.body.data.find((item) => item.name === '项目素材')
    expect(createdCategory).toBeTruthy()
    expect(createdCategory.count).toBeGreaterThanOrEqual(1)
  })
})
