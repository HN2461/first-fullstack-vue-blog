import request from 'supertest'
import { ARTICLE_STATUS, USER_ROLES } from '#constants/domain'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { User } from '#modules/user/models/User.js'
import { createArticle } from '#modules/content/services/article.service.js'
import { createCategory } from '#modules/content/services/category.service.js'
import { createTag } from '#modules/content/services/tag.service.js'
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

describe('public reader routes', () => {
  let admin
  let category
  let tag

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
    tag = await createTag({
      name: 'Express',
      slug: 'express'
    })
    await createArticle({
      title: '已发布文章',
      slug: 'published-post',
      summary: '这篇文章应该出现在前台',
      contentMarkdown: '# 已发布文章\n\nExpress reader content',
      category: category.id,
      tags: [tag.id],
      status: ARTICLE_STATUS.PUBLISHED
    }, admin)
    await createArticle({
      title: '草稿文章',
      slug: 'draft-post',
      summary: '这篇文章不应该出现在前台',
      contentMarkdown: '# 草稿文章',
      status: ARTICLE_STATUS.DRAFT
    }, admin)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('returns public homepage summary', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/home')
      .expect(200)

    expect(response.body.data.stats.articleCount).toBe(1)
    expect(response.body.data.recentArticles).toHaveLength(1)
    expect(response.body.data.recentArticles[0].slug).toBe('published-post')
  })

  it('lists only published articles', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/articles')
      .expect(200)

    expect(response.body.data.items).toHaveLength(1)
    expect(response.body.data.items[0].slug).toBe('published-post')
  })

  it('returns article detail by slug', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/articles/published-post')
      .expect(200)

    expect(response.body.data.title).toBe('已发布文章')
    expect(response.body.data.contentMarkdown).toContain('Express reader content')
  })

  it('does not expose draft article detail', async () => {
    const app = createApp()

    await request(app)
      .get('/api/public/articles/draft-post')
      .expect(404)
  })

  it('filters by category, tag, and query', async () => {
    const app = createApp()

    const byCategory = await request(app)
      .get('/api/public/articles')
      .query({ category: 'node-js' })
      .expect(200)
    const byTag = await request(app)
      .get('/api/public/articles')
      .query({ tag: 'express' })
      .expect(200)
    const byQuery = await request(app)
      .get('/api/public/search')
      .query({ q: 'reader' })
      .expect(200)

    expect(byCategory.body.data.items).toHaveLength(1)
    expect(byTag.body.data.items).toHaveLength(1)
    expect(byQuery.body.data.items).toHaveLength(1)
  })

  it('returns an empty list for unknown category or tag slug instead of failing', async () => {
    const app = createApp()

    const unknownCategory = await request(app)
      .get('/api/public/articles?category=missing-category')
      .expect(200)

    expect(unknownCategory.body.data.items).toEqual([])
    expect(unknownCategory.body.data.total).toBe(0)

    const unknownTag = await request(app)
      .get('/api/public/articles?tag=missing-tag')
      .expect(200)

    expect(unknownTag.body.data.items).toEqual([])
    expect(unknownTag.body.data.total).toBe(0)
  })

  it('includes descendant category articles when filtering by a parent category', async () => {
    const app = createApp()
    const childCategory = await createCategory({
      name: 'Express',
      slug: 'express-child',
      parent: category.id
    })

    await createArticle({
      title: '子分类文章',
      slug: 'child-category-post',
      summary: '这篇文章属于 Node.js 的子分类',
      contentMarkdown: '# 子分类文章',
      category: childCategory.id,
      status: ARTICLE_STATUS.PUBLISHED
    }, admin)

    const response = await request(app)
      .get('/api/public/articles')
      .query({ category: 'node-js', pageSize: 20 })
      .expect(200)

    expect(response.body.data.items.map((item) => item.slug)).toEqual(
      expect.arrayContaining(['published-post', 'child-category-post'])
    )
  })
})
