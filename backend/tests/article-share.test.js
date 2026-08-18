import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { USER_ROLES, ARTICLE_STATUS } from '#constants/domain'
import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'
import { ArticleSharePackage } from '#modules/articleShare/models/ArticleSharePackage.js'
import { Menu } from '#modules/rbac/models/Menu.js'
import { Role } from '#modules/rbac/models/Role.js'
import { User } from '#modules/user/models/User.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { createApp } from '../src/app.js'
import { signAccessToken } from '../src/utils/jwt.js'
import { clearTestDatabase, connectTestDatabase, disconnectTestDatabase } from './helpers/testDatabase.js'

async function createArticle(owner, title, category = null, overrides = {}) {
  return Article.create({
    title,
    slug: `${title.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(16).slice(2)}`,
    summary: '共享阅读测试摘要',
    contentMarkdown: '# 共享正文\n\n仅用于接口验证。',
    category,
    status: ARTICLE_STATUS.PUBLISHED,
    publishedAt: new Date(),
    createdBy: owner._id,
    updatedBy: owner._id,
    ...overrides
  })
}

describe('article shared reading', () => {
  let app
  let admin
  let token

  beforeAll(async () => connectTestDatabase())
  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    await ensureRbacSeed()
    admin = await User.create({
      username: 'article-share-admin',
      email: `article-share-${Date.now()}@example.com`,
      passwordHash: 'hashed-password',
      role: USER_ROLES.SUPER_ADMIN
    })
    token = signAccessToken(admin)
  })
  afterAll(async () => {
    await clearTestDatabase()
    await disconnectTestDatabase()
  })

  it('creates a single article share and gates article content behind access', async () => {
    const article = await createArticle(admin, '匿名阅读文章')
    const created = await request(app)
      .post('/api/admin/article-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ scopeType: 'article', articleId: article._id.toString(), mode: 'public' })
      .expect(201)

    expect(created.body.data).toMatchObject({ scopeType: 'article', mode: 'public', entryCount: 1 })
    const visitor = request.agent(app)
    const locked = await visitor.get(`/api/public/article-shares/${created.body.data.publicId}`).expect(200)
    expect(locked.body.data).toMatchObject({ unlocked: false, entries: [] })
    await visitor.get(`/api/public/article-shares/${created.body.data.publicId}/articles/${article.slug}`).expect(403)
    const claimed = await visitor.post(`/api/public/article-shares/${created.body.data.publicId}/claim`).expect(200)
    expect(claimed.body.data.article.contentMarkdown).toContain('共享正文')
    expect(claimed.body.data.article.resources).toBeUndefined()
    await visitor.get(`/api/public/article-shares/${created.body.data.publicId}/articles/${article.slug}`).expect(200)
  })

  it('supports password access, rejects wrong codes, and revokes existing sessions', async () => {
    const article = await createArticle(admin, '提取码文章')
    const created = await request(app)
      .post('/api/admin/article-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ scopeType: 'article', articleId: article._id.toString(), mode: 'password' })
      .expect(201)
    const visitor = request.agent(app)
    await visitor.post(`/api/public/article-shares/${created.body.data.publicId}/verify-password`).send({ code: '0000' }).expect(400)
    await visitor.post(`/api/public/article-shares/${created.body.data.publicId}/verify-password`).send({ code: created.body.data.extractionCode }).expect(200)
    await request(app).post(`/api/admin/article-shares/${created.body.data.id}/revoke`).set('Authorization', `Bearer ${token}`).expect(200)
    await visitor.get(`/api/public/article-shares/${created.body.data.publicId}`).expect(410)
  })

  it('captures a category snapshot and excludes drafts', async () => {
    const category = await Category.create({ name: '共享目录', slug: `share-${Date.now()}`, status: 'active', createdBy: admin._id, updatedBy: admin._id })
    const published = await createArticle(admin, '目录已发布', category._id)
    await createArticle(admin, '目录草稿', category._id, { status: ARTICLE_STATUS.DRAFT, publishedAt: null })
    const created = await request(app)
      .post('/api/admin/article-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ scopeType: 'category', categoryId: category._id.toString(), mode: 'public' })
      .expect(201)
    expect(created.body.data.entries.map((entry) => entry.slug)).toEqual([published.slug])
  })
})
