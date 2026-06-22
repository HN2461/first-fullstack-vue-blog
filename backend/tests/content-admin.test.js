import request from 'supertest'
import path from 'node:path'
import { ARTICLE_STATUS, USER_ROLES } from '#constants/domain'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { Category } from '#modules/content/models/Category.js'
import { Menu } from '#modules/rbac/models/Menu.js'
import { Role } from '#modules/rbac/models/Role.js'
import { User } from '#modules/user/models/User.js'
import { createArticle, publishArticle } from '#modules/content/services/article.service.js'
import { createCategory, listCategories } from '#modules/content/services/category.service.js'
import { createTag, listTags } from '#modules/content/services/tag.service.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
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
    expect(categories.items.some((item) => item.slug === 'node-js')).toBe(true)
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

  it('previews and imports markdown articles with front matter', async () => {
    const app = createApp()

    const categoryResponse = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: '前端',
        slug: 'frontend'
      })
      .expect(201)

    const tagResponse = await request(app)
      .post('/api/admin/tags')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Vue',
        slug: 'vue'
      })
      .expect(201)

    const markdown = `---
title: Vue 导入测试
slug: vue-import-test
summary: 用于验证 Markdown 导入流程。
category: 前端
tags:
  - Vue
status: draft
---

# Vue 导入测试

这里是导入正文。`

    const previewResponse = await request(app)
      .post('/api/admin/articles/import/preview')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('files', Buffer.from(markdown, 'utf8'), 'vue-import-test.md')
      .expect(200)

    expect(previewResponse.body.data.items[0]).toMatchObject({
      title: 'Vue 导入测试',
      slug: 'vue-import-test',
      categoryId: categoryResponse.body.data.id,
      tagIds: [tagResponse.body.data.id],
      importStatus: 'ready',
      canImport: true
    })

    const commitResponse = await request(app)
      .post('/api/admin/articles/import/commit')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: previewResponse.body.data.items,
        options: { duplicateStrategy: 'skip' }
      })
      .expect(201)

    expect(commitResponse.body.data).toMatchObject({
      successCount: 1,
      skippedCount: 0,
      failedCount: 0
    })

    const articleResponse = await request(app)
      .get(`/api/admin/articles/${commitResponse.body.data.items[0].articleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(articleResponse.body.data).toMatchObject({
      status: ARTICLE_STATUS.DRAFT,
      sourcePath: 'vue-import-test.md',
      category: expect.objectContaining({ id: categoryResponse.body.data.id })
    })
    expect(articleResponse.body.data.sourceHash).toBeTruthy()
    expect(articleResponse.body.data.importedAt).toBeTruthy()
  })

  it('batch updates article metadata and only publishes valid articles', async () => {
    const app = createApp()

    const categoryResponse = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: '批量整理',
        slug: 'batch-organize'
      })
      .expect(201)

    const tagResponse = await request(app)
      .post('/api/admin/tags')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: '批量标签',
        slug: 'batch-tag'
      })
      .expect(201)

    const validArticle = await createArticle({
      title: '可发布文章',
      slug: 'batch-valid-article',
      summary: '这是一篇可发布文章。',
      contentMarkdown: '# 可发布文章\n\n正文内容。'
    }, admin)

    const invalidArticle = await createArticle({
      title: '缺摘要文章',
      slug: 'batch-invalid-article',
      contentMarkdown: '# 缺摘要文章\n\n正文内容。'
    }, admin)

    const batchResponse = await request(app)
      .post('/api/admin/articles/batch/meta')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ids: [validArticle.id, invalidArticle.id],
        category: {
          enabled: true,
          mode: 'fillEmpty',
          value: categoryResponse.body.data.id
        },
        tags: {
          enabled: true,
          mode: 'append',
          value: [tagResponse.body.data.id]
        },
        cover: {
          enabled: true,
          mode: 'fillEmpty',
          value: '/uploads/covers/batch.png'
        },
        status: {
          enabled: true,
          value: ARTICLE_STATUS.PUBLISHED
        }
      })
      .expect(200)

    expect(batchResponse.body.data).toMatchObject({
      total: 2,
      updatedCount: 2,
      publishedCount: 1,
      skippedCount: 0
    })

    const invalidResult = batchResponse.body.data.items.find((item) => item.id === invalidArticle.id)
    expect(invalidResult.published).toBe(false)
    expect(invalidResult.messages).toContain('发布前请填写文章摘要')

    const validDetail = await request(app)
      .get(`/api/admin/articles/${validArticle.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(validDetail.body.data).toMatchObject({
      status: ARTICLE_STATUS.PUBLISHED,
      cover: '/uploads/covers/batch.png',
      category: expect.objectContaining({ id: categoryResponse.body.data.id })
    })
    expect(validDetail.body.data.tags.map((tag) => tag.id)).toContain(tagResponse.body.data.id)

    const invalidDetail = await request(app)
      .get(`/api/admin/articles/${invalidArticle.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(invalidDetail.body.data).toMatchObject({
      status: ARTICLE_STATUS.DRAFT,
      cover: '/uploads/covers/batch.png',
      category: expect.objectContaining({ id: categoryResponse.body.data.id })
    })
    expect(invalidDetail.body.data.tags.map((tag) => tag.id)).toContain(tagResponse.body.data.id)

    const tagsResponse = await request(app)
      .get('/api/admin/tags')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    const batchTag = tagsResponse.body.data.items.find((item) => item.id === tagResponse.body.data.id)
    expect(batchTag.articleCount).toBe(2)

    const clearCategoryResponse = await request(app)
      .post('/api/admin/articles/batch/meta')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ids: [validArticle.id],
        category: {
          enabled: true,
          mode: 'clear'
        }
      })
      .expect(200)

    expect(clearCategoryResponse.body.data).toMatchObject({
      total: 1,
      updatedCount: 0,
      skippedCount: 1
    })
    expect(clearCategoryResponse.body.data.items[0].messages).toContain('发布前请选择所属分类')

    const protectedDetail = await request(app)
      .get(`/api/admin/articles/${validArticle.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(protectedDetail.body.data.category.id).toBe(categoryResponse.body.data.id)
  })

  it('keeps existing values when batch meta uses fill-empty mode', async () => {
    const app = createApp()

    const originalCategory = await createCategory({
      name: '原分类',
      slug: 'original-category'
    })
    const targetCategory = await createCategory({
      name: '目标分类',
      slug: 'target-category'
    })

    const originalTag = await createTag({
      name: '原标签',
      slug: 'original-tag'
    })
    const replaceTag = await createTag({
      name: '替换标签',
      slug: 'replace-tag'
    })

    const articleWithMeta = await createArticle({
      title: '已有元信息文章',
      slug: 'article-with-meta',
      summary: '已有摘要',
      contentMarkdown: '# 已有元信息文章\n\n正文内容。',
      category: originalCategory.id,
      tags: [originalTag.id],
      cover: '/uploads/covers/original.png'
    }, admin)

    const articleWithoutMeta = await createArticle({
      title: '待补空文章',
      slug: 'article-without-meta',
      summary: '待补空摘要',
      contentMarkdown: '# 待补空文章\n\n正文内容。'
    }, admin)

    const fillEmptyResponse = await request(app)
      .post('/api/admin/articles/batch/meta')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ids: [articleWithMeta.id, articleWithoutMeta.id],
        category: {
          enabled: true,
          mode: 'fillEmpty',
          value: targetCategory.id
        },
        cover: {
          enabled: true,
          mode: 'fillEmpty',
          value: '/uploads/covers/from-media.png'
        }
      })
      .expect(200)

    expect(fillEmptyResponse.body.data).toMatchObject({
      total: 2,
      updatedCount: 1,
      skippedCount: 0
    })

    const withMetaDetail = await request(app)
      .get(`/api/admin/articles/${articleWithMeta.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(withMetaDetail.body.data).toMatchObject({
      cover: '/uploads/covers/original.png',
      category: expect.objectContaining({ id: originalCategory.id })
    })

    const withoutMetaDetail = await request(app)
      .get(`/api/admin/articles/${articleWithoutMeta.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(withoutMetaDetail.body.data).toMatchObject({
      cover: '/uploads/covers/from-media.png',
      category: expect.objectContaining({ id: targetCategory.id })
    })

    const replaceResponse = await request(app)
      .post('/api/admin/articles/batch/meta')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ids: [articleWithMeta.id],
        tags: {
          enabled: true,
          mode: 'replace',
          value: [replaceTag.id]
        }
      })
      .expect(200)

    expect(replaceResponse.body.data.updatedCount).toBe(1)

    const replacedDetail = await request(app)
      .get(`/api/admin/articles/${articleWithMeta.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    expect(replacedDetail.body.data.tags.map((tag) => tag.id)).toEqual([replaceTag.id])

    const categoriesResponse = await request(app)
      .get('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    const originalCategoryAfter = categoriesResponse.body.data.items.find((item) => item.id === originalCategory.id)
    const targetCategoryAfter = categoriesResponse.body.data.items.find((item) => item.id === targetCategory.id)
    expect(originalCategoryAfter.articleCount).toBe(1)
    expect(targetCategoryAfter.articleCount).toBe(1)
  })

  it('detects fallback titles, duplicate slugs, invalid files, and missing dictionaries', async () => {
    const app = createApp()

    await createArticle({
      title: '已存在文章',
      slug: 'existing-article',
      contentMarkdown: '# 已存在文章'
    }, admin)

    const fallbackMarkdown = '# 自动标题\n\n正文内容'
    const duplicateMarkdown = `---
title: 重复文章
slug: existing-article
---

# 重复文章

正文内容`
    const missingDictionaryMarkdown = `---
title: 字典缺失
slug: missing-dictionary
category: 不存在分类
tags:
  - 不存在标签
---

# 字典缺失

正文内容`

    const previewResponse = await request(app)
      .post('/api/admin/articles/import/preview')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('files', Buffer.from(fallbackMarkdown, 'utf8'), 'fallback-title.md')
      .attach('files', Buffer.from(duplicateMarkdown, 'utf8'), 'duplicate.md')
      .attach('files', Buffer.from(missingDictionaryMarkdown, 'utf8'), 'missing.md')
      .attach('files', Buffer.from('plain text', 'utf8'), 'plain.txt')
      .expect(200)

    const rows = previewResponse.body.data.items
    expect(rows.find((item) => item.fileName === 'fallback-title.md')).toMatchObject({
      title: '自动标题',
      importStatus: 'ready',
      canImport: true
    })
    expect(rows.find((item) => item.fileName === 'duplicate.md')).toMatchObject({
      slug: 'existing-article',
      importStatus: 'duplicate',
      canImport: false
    })
    expect(rows.find((item) => item.fileName === 'missing.md')).toMatchObject({
      importStatus: 'warning',
      canImport: false
    })
    expect(rows.find((item) => item.fileName === 'plain.txt')).toMatchObject({
      importStatus: 'error',
      canImport: false
    })
  })

  it('downloads the markdown import template', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/admin/articles/import/template')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(response.headers['content-type']).toContain('text/markdown')
    expect(response.text).toContain('给 AI 的要求')
    expect(response.text).toContain('Front Matter')
  })

  it('supports the migration config category and article move workflow', async () => {
    const app = createApp()

    const sourceResponse = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: '前端体系',
        slug: 'frontend-system',
        sortOrder: 10
      })
      .expect(201)

    const childResponse = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Vue 专题',
        slug: 'vue-topic',
        parent: sourceResponse.body.data.id,
        sortOrder: 20
      })
      .expect(201)

    const targetResponse = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: '工程实践',
        slug: 'engineering-practice'
      })
      .expect(201)

    const sourceArticle = await createArticle({
      title: '前端目录整理',
      slug: 'frontend-catalog',
      category: sourceResponse.body.data.id
    }, admin)

    const childArticle = await createArticle({
      title: 'Vue 迁移说明',
      slug: 'vue-migration-note',
      category: childResponse.body.data.id
    }, admin)

    await Category.updateMany({}, { $set: { articleCount: 999 } })

    const treeResponse = await request(app)
      .get('/api/admin/categories/tree')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    const sourceNode = treeResponse.body.data.find((item) => item.id === sourceResponse.body.data.id)
    expect(sourceNode).toMatchObject({
      id: sourceResponse.body.data.id,
      name: '前端体系',
      articleCount: 1,
      directArticleCount: 1,
      branchArticleCount: 2
    })
    expect(sourceNode.children[0]).toMatchObject({
      id: childResponse.body.data.id,
      name: 'Vue 专题',
      articleCount: 1,
      directArticleCount: 1,
      branchArticleCount: 1
    })

    const branchArticlesResponse = await request(app)
      .get(`/api/admin/categories/${sourceResponse.body.data.id}/articles`)
      .query({ page: 1, pageSize: 20 })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(branchArticlesResponse.body.data.total).toBe(2)
    expect(branchArticlesResponse.body.data.items.map((item) => item.id)).toEqual(expect.arrayContaining([
      sourceArticle.id,
      childArticle.id
    ]))

    const singleMoveResponse = await request(app)
      .post(`/api/admin/articles/${childArticle.id}/category`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ targetCategoryId: targetResponse.body.data.id })
      .expect(200)

    expect(singleMoveResponse.body.data.category).toBe(targetResponse.body.data.id)

    const batchMoveResponse = await request(app)
      .post('/api/admin/articles/category/batch')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        articleIds: [sourceArticle.id],
        targetCategoryId: targetResponse.body.data.id
      })
      .expect(200)

    expect(batchMoveResponse.body.data.movedCount).toBe(1)

    const emptySourceResponse = await request(app)
      .get(`/api/admin/categories/${sourceResponse.body.data.id}/articles`)
      .query({ page: 1, pageSize: 20 })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(emptySourceResponse.body.data.total).toBe(0)

    const targetArticlesResponse = await request(app)
      .get(`/api/admin/categories/${targetResponse.body.data.id}/articles`)
      .query({ page: 1, pageSize: 20 })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(targetArticlesResponse.body.data.total).toBe(2)
  })

  it('allows the migration config menu to use category tree and article-category move APIs', async () => {
    const app = createApp()
    await ensureRbacSeed()

    const menuCodes = ['management.root', 'content.group', 'content.migration']
    const migrationMenus = await Menu.find({ code: { $in: menuCodes } })
    const migrationRole = await Role.create({
      name: '迁移配置专员',
      code: `migration-only-${Date.now()}`,
      menuIds: migrationMenus.map((menu) => menu._id),
      status: 'active'
    })
    const migrationUser = await User.create({
      username: 'migration-only',
      email: `migration-only-${Date.now()}@example.com`,
      passwordHash: 'hashed-password',
      role: USER_ROLES.ADMIN,
      roles: [migrationRole._id]
    })
    const migrationToken = signAccessToken(migrationUser)

    const sourceResponse = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${migrationToken}`)
      .send({
        name: '迁移来源',
        slug: 'migration-source'
      })
      .expect(201)

    const targetResponse = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${migrationToken}`)
      .send({
        name: '迁移目标',
        slug: 'migration-target'
      })
      .expect(201)

    const sourceArticle = await createArticle({
      title: '迁移配置权限验证',
      slug: 'migration-menu-permission',
      category: sourceResponse.body.data.id
    }, admin)

    await request(app)
      .get('/api/admin/categories/tree')
      .set('Authorization', `Bearer ${migrationToken}`)
      .expect(200)

    const branchArticlesResponse = await request(app)
      .get(`/api/admin/categories/${sourceResponse.body.data.id}/articles`)
      .set('Authorization', `Bearer ${migrationToken}`)
      .expect(200)

    expect(branchArticlesResponse.body.data.total).toBe(1)

    await request(app)
      .post(`/api/admin/articles/${sourceArticle.id}/category`)
      .set('Authorization', `Bearer ${migrationToken}`)
      .send({ targetCategoryId: targetResponse.body.data.id })
      .expect(200)

    await request(app)
      .get('/api/admin/articles')
      .set('Authorization', `Bearer ${migrationToken}`)
      .expect(403)
  })

  it('lists admin articles by latest update and filters category branches', async () => {
    const app = createApp()

    const parentResponse = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: '工程体系',
        slug: 'engineering-system'
      })
      .expect(201)

    const childResponse = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: '构建工具',
        slug: 'build-tools',
        parent: parentResponse.body.data.id
      })
      .expect(201)

    const olderArticle = await createArticle({
      title: '旧文章后编辑',
      slug: 'older-edited-later',
      summary: '旧文章后编辑',
      contentMarkdown: '旧文章后编辑',
      category: childResponse.body.data.id
    }, admin)

    await new Promise((resolve) => setTimeout(resolve, 10))

    const newerArticle = await createArticle({
      title: '新文章未编辑',
      slug: 'newer-not-edited',
      summary: '新文章未编辑',
      contentMarkdown: '新文章未编辑',
      category: childResponse.body.data.id
    }, admin)

    await new Promise((resolve) => setTimeout(resolve, 10))

    await request(app)
      .patch(`/api/admin/articles/${olderArticle.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: ARTICLE_STATUS.ARCHIVED })
      .expect(200)

    const response = await request(app)
      .get('/api/admin/articles')
      .query({ category: parentResponse.body.data.id, page: 1, pageSize: 10 })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(response.body.data.total).toBe(2)
    expect(response.body.data.items.map((item) => item.id)).toEqual([
      olderArticle.id,
      newerArticle.id
    ])
  })

  it('keeps category sort order when moving without a sortOrder payload', async () => {
    const app = createApp()

    const categoryResponse = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: '排序保持',
        slug: 'keep-sort-order',
        sortOrder: 88
      })
      .expect(201)

    const moveResponse = await request(app)
      .post(`/api/admin/categories/${categoryResponse.body.data.id}/move`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ targetParentId: null })
      .expect(200)

    expect(moveResponse.body.data.sortOrder).toBe(88)
  })

  it('validates category update payloads and regenerates slug when cleared', async () => {
    const app = createApp()

    const categoryResponse = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Node 分类',
        slug: 'node-category'
      })
      .expect(201)

    const treeResponse = await request(app)
      .get('/api/admin/categories/tree')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    const uncategorized = treeResponse.body.data.find((item) => item.isSystem)
    expect(uncategorized).toMatchObject({
      name: '默认分类',
      slug: 'uncategorized'
    })

    const invalidResponse = await request(app)
      .patch(`/api/admin/categories/${categoryResponse.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'disabled' })
      .expect(400)

    expect(invalidResponse.body.code).toBe('VALIDATION_ERROR')

    const reservedParentResponse = await request(app)
      .patch(`/api/admin/categories/${categoryResponse.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        parent: uncategorized.id
      })
      .expect(400)

    expect(reservedParentResponse.body.code).toBe('CATEGORY_RESERVED')

    const updateResponse = await request(app)
      .patch(`/api/admin/categories/${categoryResponse.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Node 分类更新',
        slug: ''
      })
      .expect(200)

    expect(updateResponse.body.data.slug).toBeTruthy()
    expect(updateResponse.body.data.slug).not.toBe('node-category')
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
