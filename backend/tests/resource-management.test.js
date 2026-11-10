import fs from 'node:fs/promises'
import path from 'node:path'
import request from 'supertest'
import { beforeAll, beforeEach, afterAll, describe, it, expect } from 'vitest'
import { createApp } from '../src/app.js'
import { User } from '#modules/user/models/User.js'
import { Resume } from '#modules/resume/models/Resume.js'
import { ResumeExportRecord } from '#modules/resume/models/ResumeExportRecord.js'
import { Media } from '#modules/media/models/Media.js'
import { MediaReference } from '#modules/media/models/MediaReference.js'
import { Article } from '#modules/content/models/Article.js'
import { DiscussionMessage } from '#modules/discussion/models/DiscussionMessage.js'
import { createResource } from '#modules/media/services/resourceFile.service.js'
import { saveResourceBindings } from '#modules/media/services/resourceBinding.service.js'
import { cleanupPendingResources } from '#modules/media/services/resourceLifecycle.service.js'
import { reconcileResources } from '#modules/media/services/resourceMigration.service.js'
import { removeDiscussionResources } from '#modules/discussion/services/discussionAttachment.service.js'
import { resolveResourcePath } from '#modules/media/services/resourceStorage.service.js'
import { getResourceStorageAreas } from '#modules/media/services/resourceStorage.service.js'
import { attachMediaReferenceSummaries, getMediaReferenceDetail } from '#modules/media/services/mediaReference.service.js'
import { MediaCategory } from '#modules/media/models/MediaCategory.js'
import { deleteMedia, permanentDeleteMedia } from '#modules/media/services/media.service.js'
import { createArticle, deleteArticle, permanentDeleteArticle } from '#modules/content/services/article.service.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { signAccessToken } from '../src/utils/jwt.js'
import { resolveUploadRoot } from '../src/utils/uploadPath.js'
import { jpegFixture, pngFixture } from './helpers/resourceFixtures.js'
import { connectTestDatabase, clearTestDatabase, disconnectTestDatabase } from './helpers/testDatabase.js'

describe('统一文件管理', () => {
  let app, owner, other, token, otherToken
  beforeAll(connectTestDatabase)
  beforeEach(async () => {
    await clearTestDatabase()
    await ensureRbacSeed()
    app = createApp()
    owner = await User.create({ username: '资源管理员', email: 'resource@example.com', passwordHash: 'hash', role: 'super_admin' })
    other = await User.create({ username: '其他用户', email: 'resource-other@example.com', passwordHash: 'hash', role: 'user' })
    token = signAccessToken(owner)
    otherToken = signAccessToken(other)
  })
  afterAll(disconnectTestDatabase)

  const image = () => ({ buffer: jpegFixture, originalname: '照片.jpg', mimetype: 'image/jpeg', size: jpegFixture.length })

  it('普通用户无需媒体后台权限即可上传真实头像，替换和移除只解绑', async () => {
    const response = await request(app).post('/api/profile/avatar').set('Authorization', `Bearer ${otherToken}`)
      .attach('avatar', jpegFixture, 'avatar.jpg').expect(200)
    const media = await Media.findOne({ uploader: other._id })
    expect(response.body.data.avatar).toBe(media.url)
    expect(media.scene).toBe('user-avatar')
    expect(await MediaReference.countDocuments({ mediaId: media._id })).toBe(1)
    await request(app).get(media.url).expect(200)
    await request(app).delete('/api/profile/avatar').set('Authorization', `Bearer ${otherToken}`).expect(200)
    expect(await MediaReference.countDocuments({ mediaId: media._id })).toBe(0)
    expect((await Media.findById(media._id)).lifecycleStatus).toBe('pending')
    await request(app).post('/api/profile/avatar').set('Authorization', `Bearer ${otherToken}`)
      .attach('avatar', Buffer.from('fake'), { filename: 'fake.jpg', contentType: 'image/jpeg' }).expect(400)
  })

  it('简历照片鉴权、复制复用、替换和导出共同使用同一文件记录', async () => {
    const resume = await Resume.create({ title: '照片测试', ownerId: owner._id })
    const uploaded = await request(app).post(`/api/resumes/${resume._id}/photo`).set('Authorization', `Bearer ${token}`)
      .attach('photo', jpegFixture, 'photo.jpg').expect(200)
    const profile = uploaded.body.data.sections.profile
    const original = await Media.findById(profile.photoMediaId)
    expect(original.accessScope).toBe('private')
    await request(app).get(original.url).expect(401)
    await request(app).get(original.url).set('Authorization', `Bearer ${otherToken}`).expect(403)
    await request(app).get(original.url).set('Authorization', `Bearer ${token}`).expect(200)
    const copied = await request(app).post(`/api/resumes/${resume._id}/duplicate`).set('Authorization', `Bearer ${token}`).expect(201)
    expect(await MediaReference.countDocuments({ mediaId: original._id })).toBe(2)
    await request(app).post(`/api/resumes/${resume._id}/photo`).set('Authorization', `Bearer ${token}`).attach('photo', jpegFixture, 'second.jpg').expect(200)
    expect(await MediaReference.countDocuments({ mediaId: original._id })).toBe(1)
    await request(app).get(original.url).set('Authorization', `Bearer ${token}`).expect(200)
    await request(app).post('/api/resume-exports').set('Authorization', `Bearer ${token}`).send({ resumeId: copied.body.data.id, format: 'word', templateKey: 'boss' }).expect(201)
    await request(app).patch(`/api/resumes/${resume._id}`).set('Authorization', `Bearer ${otherToken}`).send({ sections: { profile } }).expect(403)
  })

  it('主动保存的素材无引用也保留，超期待绑定文件才清理', async () => {
    const pending = await createResource(image(), owner, { scene: 'article-cover' })
    const retained = await createResource(image(), owner, { scene: 'admin-library', retained: true })
    const result = await cleanupPendingResources({ now: new Date(Date.now() + 25 * 60 * 60 * 1000) })
    expect(result.deleted).toBe(1)
    expect(await Media.exists({ _id: pending._id })).toBeNull()
    expect(await fs.readFile(retained.storagePath)).toEqual(jpegFixture)
  })

  it('多处引用、业务回收站和恢复保留阻止资源误删', async () => {
    const media = await createResource(image(), owner, { scene: 'article-cover' })
    const a = await createArticle({ title: '第一篇', slug: 'resource-a', contentMarkdown: '正文', cover: media.url }, owner)
    const b = await createArticle({ title: '第二篇', slug: 'resource-b', contentMarkdown: `![图](${media.url})` }, owner)
    expect(await MediaReference.countDocuments({ mediaId: media._id })).toBe(2)
    await expect(deleteMedia(media._id, owner)).rejects.toMatchObject({ code: 'MEDIA_REFERENCED' })
    await deleteArticle(a.id, owner)
    await deleteArticle(b.id, owner)
    expect(await MediaReference.countDocuments({ mediaId: media._id, state: 'retained' })).toBe(2)
    await expect(permanentDeleteMedia(media._id, owner)).rejects.toMatchObject({ code: 'MEDIA_REFERENCED' })
    await permanentDeleteArticle(a.id)
    await permanentDeleteArticle(b.id)
    expect(await MediaReference.countDocuments({ mediaId: media._id })).toBe(0)
  })

  it('绑定与清理并发时先登记引用，业务保存不确定也保留文件', async () => {
    const media = await createResource(image(), owner, { scene: 'article-cover' })
    await Media.updateOne({ _id: media._id }, { $set: { expiresAt: new Date(0) } })
    let entered, release
    const ready = new Promise((resolve) => { entered = resolve })
    const waiting = new Promise((resolve) => { release = resolve })
    const saving = saveResourceBindings({ targetType: 'test', targetId: 'race', field: 'image', mediaIds: [media._id] }, async () => { entered(); await waiting })
    await ready
    const cleanup = cleanupPendingResources()
    release()
    await saving
    await cleanup
    expect(await Media.exists({ _id: media._id })).toBeTruthy()
    const second = await createResource(image(), owner, { scene: 'article-cover' })
    await expect(saveResourceBindings({ targetType: 'test', targetId: 'failed', field: 'image', mediaIds: [second._id] }, async () => { throw new Error('写入结果不确定') })).rejects.toThrow()
    expect(await MediaReference.exists({ mediaId: second._id, state: 'pending' })).toBeTruthy()
  })

  it('阻止私人文件用于公开文章或普通素材选择，保护原件和缩略图', async () => {
    const resume = await Resume.create({ ownerId: owner._id, title: '隐私' })
    const media = await createResource(image(), owner, { scene: 'resume-photo', targetId: resume._id })
    const publicMedia = await createResource(image(), owner, { scene: 'admin-library', retained: true })
    await expect(createArticle({ title: '拒绝泄露', slug: 'private-resource', resources: [{ mediaId: media._id, name: '照片', url: media.url, kind: 'image' }] }, owner)).rejects.toMatchObject({ code: 'ARTICLE_PRIVATE_RESOURCE' })
    const response = await request(app).get('/api/resources?scene=article-resource').set('Authorization', `Bearer ${token}`).expect(200)
    expect(response.body.data.items.some((item) => item.id === String(media._id))).toBe(false)
    expect(response.body.data.items).toEqual(expect.arrayContaining([expect.objectContaining({ id: String(publicMedia._id), mediaId: String(publicMedia._id) })]))
    expect(response.body.data.items[0]).not.toHaveProperty('storagePath')
    await request(app).get('/api/resources?scene=feedback-image').set('Authorization', `Bearer ${token}`).expect(403)
    await request(app).post('/api/resources/upload/admin-library').set('Authorization', `Bearer ${otherToken}`).attach('file', jpegFixture, 'photo.jpg').expect(403)
  })

  it('历史消息伪造路径不能删除受管目录外或其他业务文件', async () => {
    const safeFile = path.join(resolveUploadRoot(), 'safe.txt')
    await fs.writeFile(safeFile, '不能删除')
    await removeDiscussionResources([{ _id: 'legacy', attachments: [{ storagePath: safeFile }] }])
    expect(await fs.readFile(safeFile, 'utf8')).toBe('不能删除')
    await expect(resolveResourcePath({ storageKey: 'public/../../package.json' })).rejects.toMatchObject({ code: 'RESOURCE_PATH_INVALID' })
    await request(app).get('/uploads/discussions/2026/01/a.txt').expect(404)
    await request(app).get('/uploads/resumes/photo.jpg').expect(404)
    await request(app).get('/uploads/resources/article-cover/photo.jpg').expect(404)
  })

  it('讨论只接受服务端附件编号，并拒绝跨用户或跨会话使用附件', async () => {
    const thread = (await request(app).post('/api/discussions').set('Authorization', `Bearer ${token}`)
      .send({ type: 'direct', memberIds: [String(other._id)] }).expect(201)).body.data
    const media = await createResource({ buffer: Buffer.from('note'), originalname: 'note.txt', mimetype: 'text/plain' }, owner, { scene: 'discussion-attachment', targetId: thread.id })
    await request(app).post(`/api/discussions/${thread.id}/messages`).set('Authorization', `Bearer ${token}`)
      .send({ attachment: { mediaId: String(media._id), storagePath: 'package.json' } }).expect(400)
    const wrong = await createResource({ buffer: Buffer.from('note'), originalname: 'note.txt', mimetype: 'text/plain' }, owner, { scene: 'discussion-attachment', targetId: String(owner._id) })
    await request(app).post(`/api/discussions/${thread.id}/messages`).set('Authorization', `Bearer ${token}`)
      .send({ attachment: { mediaId: String(wrong._id) } }).expect(403)
    const response = await request(app).post(`/api/discussions/${thread.id}/messages`).set('Authorization', `Bearer ${token}`)
      .send({ attachment: { mediaId: String(media._id) } }).expect(201)
    expect(response.body.data.attachments[0]).not.toHaveProperty('storagePath')
  })

  it('历史文件预演不写库，正式补录和引用回填重复执行保持幂等', async () => {
    const root = resolveUploadRoot()
    await fs.mkdir(path.join(root, 'avatars'), { recursive: true })
    await fs.mkdir(path.join(root, 'resumes'), { recursive: true })
    await fs.mkdir(path.join(root, 'discussions'), { recursive: true })
    await fs.writeFile(path.join(root, 'avatars', 'old.jpg'), jpegFixture)
    await fs.writeFile(path.join(root, 'resumes', 'old.jpg'), jpegFixture)
    const discussionPath = path.join(root, 'discussions', 'old.txt')
    await fs.writeFile(discussionPath, '历史附件')
    await User.updateOne({ _id: owner._id }, { $set: { avatar: '/uploads/avatars/old.jpg' } })
    await Resume.create({ ownerId: owner._id, title: '历史照片', sections: { profile: { photoUrl: '/uploads/resumes/old.jpg' } } })
    await DiscussionMessage.create({ threadId: owner._id, senderId: owner._id, contentType: 'file', attachments: [{ filename: 'old.txt', originalName: 'old.txt', mimeType: 'text/plain', size: 12, url: '/uploads/discussions/old.txt', storagePath: discussionPath }] })
    const dry = await reconcileResources()
    expect(dry.errors).toEqual([])
    expect(dry.files).toBe(3)
    expect(await Media.countDocuments()).toBe(0)
    const applied = await reconcileResources({ apply: true })
    expect(applied.errors).toEqual([])
    const repeated = await reconcileResources()
    expect(repeated).toMatchObject({ files: 0, metadata: 0, bindings: 0, businesses: 0, errors: [] })
  })

  it('简历选用公开 PNG 的完整网址时登记引用，Word 保留照片且不修改原件', async () => {
    const media = await createResource({ buffer: pngFixture, originalname: '公开照片.png', mimetype: 'image/png' }, owner, { scene: 'admin-library', retained: true })
    const first = await Resume.create({ title: '公开照片', ownerId: owner._id })
    const response = await request(app).patch(`/api/resumes/${first._id}`).set('Authorization', `Bearer ${token}`)
      .send({ sections: { profile: { name: '测试姓名', photoUrl: `https://example.com${media.url}?v=1` } } }).expect(200)
    expect(response.body.data.sections.profile).toMatchObject({ photoMediaId: String(media._id), photoUrl: media.url })
    await request(app).get(`/api/resumes/${first._id}/photo`).set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /image\/png/).expect(200)
    const second = await request(app).post(`/api/resumes/${first._id}/duplicate`).set('Authorization', `Bearer ${token}`).expect(201)
    expect(await MediaReference.countDocuments({ mediaId: media._id })).toBe(2)
    const exported = await request(app).post('/api/resume-exports').set('Authorization', `Bearer ${token}`)
      .send({ resumeId: String(first._id), format: 'word', templateKey: 'boss' }).expect(201)
    const record = await ResumeExportRecord.findById(exported.body.data.id)
    const name = Buffer.from('word/media/resume-photo.jpg')
    const start = record.fileData.indexOf(name)
    expect(start).toBeGreaterThan(0)
    expect(record.fileData.subarray(start + name.length, start + name.length + 2)).toEqual(Buffer.from([0xff, 0xd8]))
    expect(await fs.readFile(media.storagePath)).toEqual(pngFixture)
    await request(app).patch(`/api/resumes/${first._id}`).set('Authorization', `Bearer ${token}`)
      .send({ sections: { profile: { photoUrl: '' } } }).expect(200)
    expect(await MediaReference.countDocuments({ mediaId: media._id, targetId: second.body.data.id })).toBe(1)
    await expect(deleteMedia(media._id, owner)).rejects.toMatchObject({ code: 'MEDIA_REFERENCED' })
  })

  it('旧地址、完整网址和回收站业务在尚未补录引用时也阻止误删', async () => {
    const media = await createResource(image(), owner, { scene: 'admin-library', retained: true })
    const legacyUrl = `/uploads/${media.storageKey.slice('public/'.length)}`
    const article = await Article.create({ title: '回收站旧文章', slug: 'legacy-trash-photo', createdBy: owner._id, updatedBy: owner._id,
      cover: `https://example.com${legacyUrl}?version=old`, deletedAt: new Date() })
    const resume = await Resume.create({ title: '尚未补录的简历', ownerId: owner._id,
      sections: { profile: { photoUrl: `https://example.com${media.url}?version=old` } } })
    await User.updateOne({ _id: other._id }, { $set: { avatar: `https://example.com${legacyUrl}?version=old` } })
    expect(await MediaReference.countDocuments()).toBe(0)
    const detail = await getMediaReferenceDetail(media)
    expect(detail.references).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'articleCover', ownerId: String(article._id), status: 'trash' }),
      expect.objectContaining({ type: 'resumePhoto', ownerId: String(resume._id) }),
      expect.objectContaining({ type: 'userAvatar', ownerId: String(other._id) })
    ]))
    const [listed] = await attachMediaReferenceSummaries([media])
    expect(listed.usage).toEqual(detail.summary)
    expect(detail.summary.referenceCount).toBe(3)
    await expect(permanentDeleteMedia(media._id, owner)).rejects.toMatchObject({ code: 'MEDIA_REFERENCED' })
  })

  it('媒体列表与引用详情一致，封面正文不重复计算笼统索引，失败引用仍可见', async () => {
    const media = await createResource(image(), owner, { scene: 'article-cover' })
    await createArticle({ title: '封面使用', slug: 'count-cover', cover: media.url }, owner)
    await createArticle({ title: '正文使用', slug: 'count-body', contentMarkdown: `![图片](https://example.com${media.url}?v=1)` }, owner)
    await expect(saveResourceBindings({ targetType: 'test', targetId: 'uncertain', field: 'image', mediaIds: [media._id] },
      async () => { throw new Error('保存状态待确认') })).rejects.toThrow('保存状态待确认')
    const [listed] = await attachMediaReferenceSummaries([media])
    const detail = await getMediaReferenceDetail(media)
    expect(listed.usage).toEqual(detail.summary)
    expect(detail.summary.referenceCount).toBe(3)
    expect(detail.references).toEqual(expect.arrayContaining([expect.objectContaining({ status: 'pending', ownerId: 'uncertain' })]))
  })

  it('完整网址不能绕过文章私人照片限制', async () => {
    const resume = await Resume.create({ title: '私人照片', ownerId: owner._id })
    const media = await createResource(image(), owner, { scene: 'resume-photo', targetId: resume._id })
    const url = `https://example.com${media.url}?v=1`
    await expect(createArticle({ title: '封面泄露', slug: 'reject-full-cover', cover: url }, owner))
      .rejects.toMatchObject({ code: 'ARTICLE_PRIVATE_RESOURCE' })
    await expect(createArticle({ title: '正文泄露', slug: 'reject-full-body', contentMarkdown: `![照片](${url})` }, owner))
      .rejects.toMatchObject({ code: 'ARTICLE_PRIVATE_RESOURCE' })
  })

  it('保护中的失败引用延后检查，不阻塞后面废弃文件的批量清理', async () => {
    const protectedMedia = await createResource(image(), owner, { scene: 'article-cover' })
    const discarded = await createResource(image(), owner, { scene: 'article-cover' })
    await Media.updateOne({ _id: protectedMedia._id }, { $set: { expiresAt: new Date(0) } })
    await Media.updateOne({ _id: discarded._id }, { $set: { expiresAt: new Date(1) } })
    await MediaReference.create({ mediaId: protectedMedia._id, targetType: 'test', targetId: 'uncertain', field: 'image', state: 'pending' })
    expect(await cleanupPendingResources({ limit: 1, dryRun: true })).toMatchObject({ protected: 1, deleted: 0 })
    expect((await Media.findById(protectedMedia._id)).expiresAt.getTime()).toBe(0)
    expect(await cleanupPendingResources({ limit: 1 })).toMatchObject({ protected: 1, deleted: 0 })
    expect(await cleanupPendingResources({ limit: 1 })).toMatchObject({ protected: 0, deleted: 1 })
    expect(await fs.readFile(protectedMedia.storagePath)).toEqual(jpegFixture)
    expect(await Media.exists({ _id: discarded._id })).toBeNull()
  })

  it('旧素材补录保留上传人、自建分类、密码箱和旧链接，共用头像不改变归属', async () => {
    const root = resolveUploadRoot()
    const category = await MediaCategory.create({ name: '我的照片分类', owner: owner._id })
    const avatarPath = path.join(root, 'avatars', 'shared.jpg')
    const vaultPath = path.join(getResourceStorageAreas().find((area) => area.key === 'private').path, 'vault', 'old.jpg')
    await fs.mkdir(path.dirname(avatarPath), { recursive: true })
    await fs.mkdir(path.dirname(vaultPath), { recursive: true })
    await fs.writeFile(avatarPath, jpegFixture)
    await fs.writeFile(vaultPath, jpegFixture)
    const original = await Media.create({ filename: 'shared.jpg', originalName: '旧头像', mimeType: 'image/jpeg', size: jpegFixture.length,
      storagePath: avatarPath, url: '/uploads/avatars/shared.jpg', kind: 'image', uploader: owner._id, category: category.name, categoryId: category._id })
    const vault = await Media.create({ filename: 'old.jpg', originalName: '密码箱照片', mimeType: 'image/jpeg', size: jpegFixture.length,
      storagePath: vaultPath, url: '/api/media/vault/old', kind: 'image', accessScope: 'vault', uploader: owner._id, category: '密码箱' })
    // 模拟线上改造前的原始记录，不能只在带新默认值的文档上证明历史兼容。
    await Media.collection.updateMany({}, { $unset: { scene: '', provider: '', storageKey: '', lifecycleStatus: '', expiresAt: '', attachedAt: '' } })
    await User.updateMany({ _id: { $in: [owner._id, other._id] } }, { $set: { avatar: original.url } })
    await Article.create({ title: '旧文章', slug: 'kept-old-source', createdBy: owner._id, updatedBy: owner._id, cover: `https://example.com${original.url}` })
    const before = await reconcileResources()
    expect(before.errors).toEqual([])
    expect(before.bindings).toBe(3)
    expect((await Media.findById(original._id)).scene).toBe('')
    expect((await reconcileResources({ apply: true })).errors).toEqual([])
    const after = await Media.findById(original._id)
    expect((await Media.collection.findOne({ _id: original._id })).lifecycleStatus).toBe('retained')
    expect(after.toObject()).toMatchObject({ uploader: owner._id, categoryId: category._id, category: category.name, url: original.url,
      storagePath: avatarPath, lifecycleStatus: 'retained', accessScope: 'public' })
    expect((await Media.findById(vault._id)).toObject()).toMatchObject({ accessScope: 'vault', url: vault.url, uploader: owner._id, lifecycleStatus: 'retained' })
    expect(await MediaReference.countDocuments({ mediaId: original._id })).toBe(3)
    expect(await reconcileResources()).toMatchObject({ files: 0, metadata: 0, bindings: 0, businesses: 0, errors: [] })
    expect(await fs.readFile(avatarPath)).toEqual(jpegFixture)
    expect(await fs.readFile(vaultPath)).toEqual(jpegFixture)
    await Article.create({ title: '历史异常', slug: 'legacy-private-use', createdBy: owner._id, updatedBy: owner._id, cover: vault.url })
    const anomaly = await reconcileResources()
    expect(anomaly.errors).toEqual([expect.objectContaining({ message: expect.stringContaining('私人文件或密码箱') })])
    expect((await Media.findById(vault._id)).accessScope).toBe('vault')
    await User.updateOne({ _id: other._id }, { $set: { avatar: vault.url } })
    await DiscussionMessage.create({ threadId: owner._id, senderId: other._id, contentType: 'file', attachments: [{
      mediaId: vault._id, filename: 'old.jpg', originalName: 'old.jpg', mimeType: 'image/jpeg', size: jpegFixture.length, url: vault.url, storagePath: vaultPath
    }] })
    const rejected = await reconcileResources({ apply: true })
    expect(rejected.errors).toHaveLength(3)
    expect(await MediaReference.countDocuments({ mediaId: vault._id })).toBe(0)
    expect((await Media.findById(vault._id)).accessScope).toBe('vault')
  })
})
