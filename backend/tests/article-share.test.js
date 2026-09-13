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

  it('creates an explicit multi-article share and reuses the same active scope', async () => {
    const first = await createArticle(admin, '自选文章一')
    const second = await createArticle(admin, '自选文章二')
    const articleIds = [first._id.toString(), second._id.toString()]
    const created = await request(app)
      .post('/api/admin/article-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ scopeType: 'articles', articleIds, mode: 'password' })
      .expect(201)

    expect(created.body.data).toMatchObject({ scopeType: 'articles', entryCount: 2 })
    const reusable = await request(app)
      .post('/api/admin/article-shares/reusable')
      .set('Authorization', `Bearer ${token}`)
      .send({ scopeType: 'articles', articleIds: [...articleIds].reverse() })
      .expect(200)

    expect(reusable.body.data).toMatchObject({ id: created.body.data.id, extractionCode: created.body.data.extractionCode })
  })

  it('does not reuse a category share after its article set changes', async () => {
    const category = await Category.create({ name: '变化目录', slug: `changing-${Date.now()}`, status: 'active', createdBy: admin._id, updatedBy: admin._id })
    await createArticle(admin, '变化前文章', category._id)
    const created = await request(app)
      .post('/api/admin/article-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ scopeType: 'category', categoryId: category._id.toString(), mode: 'public' })
      .expect(201)

    const reusableBefore = await request(app)
      .post('/api/admin/article-shares/reusable')
      .set('Authorization', `Bearer ${token}`)
      .send({ scopeType: 'category', categoryId: category._id.toString() })
      .expect(200)
    expect(reusableBefore.body.data.id).toBe(created.body.data.id)

    await createArticle(admin, '变化后新增文章', category._id)
    const reusableAfter = await request(app)
      .post('/api/admin/article-shares/reusable')
      .set('Authorization', `Bearer ${token}`)
      .send({ scopeType: 'category', categoryId: category._id.toString() })
      .expect(200)
    expect(reusableAfter.body.data).toBeNull()
  })

  it('updates share metadata and only deletes revoked or expired records', async () => {
    const article = await createArticle(admin, '删除规则文章')
    const created = await request(app)
      .post('/api/admin/article-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ scopeType: 'article', articleId: article._id.toString(), mode: 'public' })
      .expect(201)

    await request(app)
      .delete(`/api/admin/article-shares/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
    const updated = await request(app)
      .patch(`/api/admin/article-shares/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '更新后的分享标题', description: '更新后的说明' })
      .expect(200)
    expect(updated.body.data).toMatchObject({ title: '更新后的分享标题', description: '更新后的说明' })
    await request(app)
      .post(`/api/admin/article-shares/${created.body.data.id}/revoke`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    await request(app)
      .delete(`/api/admin/article-shares/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(await ArticleSharePackage.findById(created.body.data.id)).toBeNull()

    const expired = await request(app)
      .post('/api/admin/article-shares')
      .set('Authorization', `Bearer ${token}`)
      .send({ scopeType: 'article', articleId: article._id.toString(), mode: 'public' })
      .expect(201)
    await ArticleSharePackage.updateOne({ _id: expired.body.data.id }, { expiresAt: new Date(Date.now() - 1000) })
    const expiredList = await request(app)
      .get('/api/admin/article-shares?status=expired')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(expiredList.body.data.items.map((item) => item.id)).toContain(expired.body.data.id)
    await request(app)
      .delete(`/api/admin/article-shares/${expired.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })
})
