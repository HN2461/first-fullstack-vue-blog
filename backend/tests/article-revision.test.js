import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { signAccessToken } from '../src/utils/jwt.js'
import { User } from '#modules/user/models/User.js'
import { Category } from '#modules/content/models/Category.js'
import { Article } from '#modules/content/models/Article.js'
import { ArticleRevision } from '#modules/content/models/ArticleRevision.js'
import { Media } from '#modules/media/models/Media.js'
import { MediaReference } from '#modules/media/models/MediaReference.js'
import { findMediaReferences } from '#modules/media/services/mediaReference.service.js'
import { USER_ROLES } from '#constants/domain'
import { connectTestDatabase, clearTestDatabase, disconnectTestDatabase } from './helpers/testDatabase.js'

describe('文章工作草稿和发布修订', () => {
  let app, actor, auth, category
  beforeAll(connectTestDatabase)
  afterAll(disconnectTestDatabase)
  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    actor = await User.create({ username: '作者', email: 'revision@test.local', passwordHash: 'hashed', role: USER_ROLES.SUPER_ADMIN })
    auth = { Authorization: 'Bearer ' + signAccessToken(actor) }
    category = await Category.create({ name: '修订测试', slug: 'revision' })
  })
  it('保留发布内容，拦截旧窗口，保存附件引用，并可从旧版恢复为新版', async () => {
    const asset = await Media.create({
      filename: 'draft.png', originalName: 'draft.png', mimeType: 'image/png', kind: 'image',
      size: 3, storagePath: '/test/draft.png', url: '/uploads/draft.png', uploader: actor._id
    })
    const created = await request(app).post('/api/admin/articles').set(auth).send({
      slug: 'revision-check', title: '原版', summary: '原摘要', contentMarkdown: '原正文',
      category: String(category._id), cover: asset.url, status: 'published'
    }).expect(201)
    const id = created.body.data.id
    const path = '/api/admin/articles/' + id
    const read = () => request(app).get(path + '/editor').set(auth)
    const save = (action, token, content) => request(app).put(path + '/editor/' + action).set(auth).send({ token, content })
    const initial = (await read().expect(200)).body.data
    expect(initial.publishedRevision).toBe(1)
    const next = { ...initial.working, title: '新标题', contentMarkdown: '未公开的修订', cover: '' }
    const draft = (await save('draft', initial.token, next).expect(200)).body.data
    expect((await Article.findById(id)).contentMarkdown).toBe('原正文')
    expect((await request(app).get('/api/public/articles/revision-check').set(auth).expect(200)).body.data.contentMarkdown).toBe('原正文')
    expect((await request(app).get('/api/public/search').query({ q: '未公开的修订' }).set(auth).expect(200)).body.data.items).toHaveLength(0)
    expect((await read()).body.data.working.title).toBe('新标题')
    expect((await save('draft', initial.token, initial.working).expect(409)).body.code).toBe('ARTICLE_EDIT_CONFLICT')
    await save('publish', draft.token, { ...next, summary: '' }).expect(400)
    const published = (await save('publish', draft.token, next).expect(200)).body.data
    expect(published.publishedRevision).toBe(2)
    expect((await Article.findById(id)).contentMarkdown).toBe('未公开的修订')
    const history = (await request(app).get(path + '/revisions').set(auth).expect(200)).body.data
    expect(history.items.map((item) => item.number)).toEqual([1])
    expect(await MediaReference.exists({ targetId: id, mediaId: asset._id, field: 'revision:1' })).toBeTruthy()
    await MediaReference.deleteOne({ targetId: id, mediaId: asset._id, field: 'revision:1' })
    expect(await findMediaReferences(asset)).toContainEqual(expect.objectContaining({ typeLabel: '文章历史版本' }))
    const old = (await request(app).get(path + '/revisions/1').set(auth).expect(200)).body.data
    const restoredDraft = (await save('draft', published.token, old).expect(200)).body.data
    expect(await MediaReference.exists({ targetId: id, mediaId: asset._id, field: 'workingDraft' })).toBeTruthy()
    expect((await Article.findById(id)).title).toBe('新标题')
    expect((await save('publish', restoredDraft.token, old).expect(200)).body.data.publishedRevision).toBe(3)
    expect(await MediaReference.exists({ targetId: id, field: 'workingDraft' })).toBeFalsy()
    expect((await Article.findById(id)).title).toBe('原版')
    await request(app).delete(path).set(auth).expect(200)
    await request(app).delete(path + '/permanent').set(auth).expect(200)
    expect(await ArticleRevision.countDocuments({ articleId: id })).toBe(0)
    expect(await MediaReference.countDocuments({ targetId: id })).toBe(0)
  })
  it('首次编辑草稿时同步列表内容，外部已改动后的旧窗口不能覆盖', async () => {
    const article = await Article.create({ title: '草稿', slug: 'draft', createdBy: actor._id, updatedBy: actor._id })
    const path = '/api/admin/articles/' + article.id + '/editor'
    const initial = (await request(app).get(path).set(auth).expect(200)).body.data
    expect(initial.published).toBeNull()
    const content = { ...initial.working, title: '重命名草稿' }
    const next = (await request(app).put(path + '/draft').set(auth).send({ token: initial.token, content }).expect(200)).body.data
    expect((await Article.findById(article.id)).title).toBe('重命名草稿')
    await Article.updateOne({ _id: article._id }, { $set: { title: '批量命名结果' } })
    await request(app).put(path + '/draft').set(auth).send({ token: next.token, content }).expect(409)
  })
  it('支持上一版客户端的草稿发布，基准变动时需比较后确认', async () => {
    const article = await Article.create({
      title: '已发布', slug: 'legacy-editor', contentMarkdown: '发布稿', summary: '摘要',
      status: 'published', category: category._id, createdBy: actor._id, updatedBy: actor._id
    })
    const path = '/api/admin/articles/' + article.id
    const content = {
      title: '工作中', contentMarkdown: '工作稿', summary: '摘要', category: String(category._id), status: 'draft'
    }
    await request(app).patch(path).set(auth).send(content).expect(200)
    expect((await Article.findById(article.id)).title).toBe('已发布')
    await request(app).post(path + '/publish').set(auth).expect(200)
    expect((await Article.findById(article.id)).title).toBe('工作中')
    const initial = (await request(app).get(path + '/editor').set(auth)).body.data
    const [first, second] = await Promise.all(['第二个窗口', '第三个窗口'].map((title) =>
      request(app).put(path + '/editor/draft').set(auth).send({ token: initial.token, content: { ...content, title } })
    ))
    expect([first.status, second.status].sort()).toEqual([200, 409])
    await Article.updateOne({ _id: article._id }, { $set: { title: '权威仓库更新' } })
    const latest = (await request(app).get(path + '/editor').set(auth)).body.data
    expect(latest.baseChanged).toBe(true)
    await request(app).put(path + '/editor/publish').set(auth).send({ token: latest.token, content }).expect(409)
    await request(app).put(path + '/editor/publish').set(auth).send({ token: latest.token, content, acknowledgeBase: true }).expect(200)
  })
})
