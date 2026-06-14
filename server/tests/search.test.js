import request from 'supertest'
import { ARTICLE_STATUS, USER_ROLES } from '@blog/shared'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { User } from '../src/models/User.js'
import { createArticle } from '../src/services/article.service.js'
import { createCategory } from '../src/services/category.service.js'
import { createTag } from '../src/services/tag.service.js'
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

describe('search routes', () => {
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

    // 创建多篇已发布文章用于搜索测试
    await createArticle({
      title: 'MongoDB 索引优化指南',
      slug: 'mongodb-index-guide',
      summary: '深入讲解 MongoDB 复合索引与查询优化策略',
      contentMarkdown: '# MongoDB 索引优化\n\n复合索引是提升查询性能的关键手段。ESR 原则帮助你正确排列索引字段顺序。',
      category: category.id,
      tags: [tag.id],
      status: ARTICLE_STATUS.PUBLISHED
    }, admin)

    await createArticle({
      title: 'Express 中间件原理',
      slug: 'express-middleware',
      summary: '从源码角度解读 Express 洋葱模型与中间件执行机制',
      contentMarkdown: '# Express 中间件\n\n中间件是 Express 的核心概念，理解洋葱模型对编写高效 Node.js 应用至关重要。',
      category: category.id,
      tags: [tag.id],
      status: ARTICLE_STATUS.PUBLISHED
    }, admin)

    await createArticle({
      title: 'Vue3 组合式 API 实战',
      slug: 'vue3-composition-api',
      summary: '深入理解 Vue3 Composition API 的设计理念与最佳实践',
      contentMarkdown: '# Vue3 组合式 API\n\nComposition API 让逻辑复用更加灵活，是 Vue3 最重要的特性之一。',
      status: ARTICLE_STATUS.PUBLISHED
    }, admin)

    // 草稿不应出现在搜索结果中
    await createArticle({
      title: 'MongoDB 草稿文章',
      slug: 'mongodb-draft',
      summary: '这篇关于 MongoDB 的草稿不应被搜索到',
      contentMarkdown: 'MongoDB 草稿内容',
      status: ARTICLE_STATUS.DRAFT
    }, admin)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('returns search results with relevance scoring', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/search')
      .query({ q: 'MongoDB' })
      .expect(200)

    expect(response.body.success).toBe(true)
    const data = response.body.data
    expect(data.items.length).toBeGreaterThanOrEqual(1)
    expect(data.items[0].title).toContain('MongoDB')
    expect(data.items[0].relevanceScore).toBeDefined()
    expect(data.items[0].highlightedTitle).toBeDefined()
    expect(data.items[0].snippet).toBeDefined()
    expect(data.total).toBeGreaterThanOrEqual(1)
    expect(data.tookMs).toBeDefined()
    expect(data.terms).toContain('MongoDB')
  })

  it('excludes draft articles from search results', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/search')
      .query({ q: '草稿' })
      .expect(200)

    expect(response.body.data.items).toHaveLength(0)
  })

  it('returns facets with categories and tags', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/search')
      .query({ q: 'Express' })
      .expect(200)

    const facets = response.body.data.facets
    expect(facets).toBeDefined()
    expect(facets.categories).toBeInstanceOf(Array)
    expect(facets.tags).toBeInstanceOf(Array)
    // Express 中间件文章属于 Node.js 分类和 Express 标签
    if (facets.categories.length > 0) {
      expect(facets.categories[0]).toHaveProperty('name')
      expect(facets.categories[0]).toHaveProperty('slug')
      expect(facets.categories[0]).toHaveProperty('count')
    }
  })

  it('filters by category slug', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/search')
      .query({ q: 'MongoDB', category: 'node-js' })
      .expect(200)

    expect(response.body.data.items.length).toBeGreaterThanOrEqual(1)
    response.body.data.items.forEach((item) => {
      expect(item.category.slug).toBe('node-js')
    })
  })

  it('filters by tag slug', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/search')
      .query({ q: 'Express', tag: 'express' })
      .expect(200)

    expect(response.body.data.items.length).toBeGreaterThanOrEqual(1)
  })

  it('supports date sort', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/search')
      .query({ q: 'MongoDB', sort: 'date' })
      .expect(200)

    expect(response.body.data.items).toBeInstanceOf(Array)
  })

  it('supports views sort', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/search')
      .query({ q: 'MongoDB', sort: 'views' })
      .expect(200)

    expect(response.body.data.items).toBeInstanceOf(Array)
  })

  it('returns empty results for missing category', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/search')
      .query({ q: 'MongoDB', category: 'nonexistent' })
      .expect(200)

    expect(response.body.data.items).toHaveLength(0)
    expect(response.body.data.total).toBe(0)
  })

  it('returns empty results when no query provided', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/search')
      .expect(200)

    expect(response.body.data.items).toHaveLength(0)
    expect(response.body.data.total).toBe(0)
  })

  it('returns search suggestions', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/search/suggest')
      .query({ q: 'Mongo' })
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data.items).toBeInstanceOf(Array)
    if (response.body.data.items.length > 0) {
      expect(response.body.data.items[0]).toHaveProperty('title')
      expect(response.body.data.items[0]).toHaveProperty('slug')
    }
  })

  it('returns empty suggestions when no query provided', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/search/suggest')
      .expect(200)

    expect(response.body.data.items).toHaveLength(0)
  })

  it('highlights matched terms in title and summary', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/search')
      .query({ q: 'MongoDB' })
      .expect(200)

    const item = response.body.data.items.find((i) => i.title.includes('MongoDB'))
    expect(item).toBeDefined()
    expect(item.highlightedTitle).toContain('<mark>')
    expect(item.highlightedSummary || item.summary).toBeDefined()
  })

  it('returns multi-word search results', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/search')
      .query({ q: 'MongoDB 索引' })
      .expect(200)

    expect(response.body.data.terms).toContain('MongoDB')
    expect(response.body.data.terms).toContain('索引')
  })

  it('supports pagination', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/public/search')
      .query({ q: 'MongoDB', page: 1, pageSize: 1 })
      .expect(200)

    expect(response.body.data.page).toBe(1)
    expect(response.body.data.pageSize).toBe(1)
    expect(response.body.data.items.length).toBeLessThanOrEqual(1)
  })
})
