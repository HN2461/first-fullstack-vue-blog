import fs from 'node:fs'
import path from 'node:path'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { USER_ROLES } from '#constants/domain'
import { Media } from '#modules/media/models/Media.js'
import { MediaCategory } from '#modules/media/models/MediaCategory.js'
import { Menu } from '#modules/rbac/models/Menu.js'
import { Role } from '#modules/rbac/models/Role.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { User } from '#modules/user/models/User.js'
import { createApp } from '../src/app.js'
import { signAccessToken } from '../src/utils/jwt.js'
import { resolveUploadRoot } from '../src/utils/uploadPath.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function createUser(role, extra = {}) {
  return User.create({
    username: extra.username || `media-${role}`,
    email: `${extra.username || role}-${Date.now()}-${Math.random()}@example.com`,
    passwordHash: 'hashed-password',
    role,
    roles: extra.roles || [],
    avatar: extra.avatar || ''
  })
}

async function createMediaManager(username = 'media-manager') {
  await ensureRbacSeed()
  const mediaMenu = await Menu.findOne({ routePath: '/console/manage/media' })
  const role = await Role.create({
    name: '媒体管理员',
    code: `media-manager-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    menuIds: [mediaMenu._id],
    status: 'active'
  })
  return createUser(USER_ROLES.ADMIN, { username, roles: [role._id] })
}

async function createMedia(owner, originalName) {
  return Media.create({
    filename: originalName,
    originalName,
    mimeType: 'text/plain',
    size: 10,
    url: `/uploads/2026/07/${originalName}`,
    storagePath: path.join(resolveUploadRoot(), '2026', '07', originalName).replace(/\\/g, '/'),
    kind: 'attachment',
    category: '默认素材',
    fileClass: 'code',
    uploader: owner._id
  })
}

function listUploadFiles(root) {
  return fs.readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath || entry.path, entry.name))
    .sort()
}

describe('media access scope', () => {
  let app
  let superAdmin
  let mediaManager
  let superToken
  let managerToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    superAdmin = await createUser(USER_ROLES.SUPER_ADMIN, { username: 'super-media' })
    mediaManager = await createMediaManager()
    superToken = signAccessToken(superAdmin)
    managerToken = signAccessToken(mediaManager)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('limits registered media records to owner unless user is super admin', async () => {
    await createMedia(superAdmin, 'super-note.txt')
    await createMedia(mediaManager, 'manager-note.txt')

    const managerResponse = await request(app)
      .get('/api/admin/media')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200)

    expect(managerResponse.body.data.items.map((item) => item.originalName)).toEqual(['manager-note.txt'])
    expect(managerResponse.body.data.items[0].uploader).toMatchObject({
      id: mediaManager._id.toString(),
      username: mediaManager.username
    })
    expect(managerResponse.body.data.items[0]).not.toHaveProperty('storagePath')

    const superResponse = await request(app)
      .get('/api/admin/media')
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200)

    expect(superResponse.body.data.items.map((item) => item.originalName)).toEqual(
      expect.arrayContaining(['super-note.txt', 'manager-note.txt'])
    )
  })

  it('媒体管理员只读取上传约束，完整系统设置仍受超级管理员保护', async () => {
    const response = await request(app).get('/api/admin/media/upload-rules')
      .set('Authorization', `Bearer ${managerToken}`).expect(200)
    expect(Object.keys(response.body.data).sort()).toEqual(['allowedExtensions', 'maxFileSizeMB', 'maxFiles'])
    await request(app).get('/api/admin/settings').set('Authorization', `Bearer ${managerToken}`).expect(403)
    await request(app).get('/api/admin/media/upload-rules').expect(401)
  })

  it('混入越权或不存在文件的批量删除在整批校验时拒绝，不先删除本人文件', async () => {
    const mine = await createMedia(mediaManager, 'owned.txt')
    const other = await createMedia(superAdmin, 'other.txt')
    const response = await request(app).post('/api/admin/media/batch/delete')
      .set('Authorization', `Bearer ${managerToken}`).send({ ids: [String(mine._id), String(other._id)] }).expect(409)
    expect(response.body.code).toBe('MEDIA_BATCH_CHANGED')
    expect((await Media.findById(mine._id)).deletedAt).toBeNull()
    expect((await Media.findById(other._id)).deletedAt).toBeNull()
  })

  it('回收站批量恢复和彻底删除在混入失效 ID 时不先改动有效文件', async () => {
    const media = await createMedia(superAdmin, 'trash-owned.txt')
    await Media.updateOne({ _id: media._id }, { $set: { deletedAt: new Date() } })
    for (const action of ['restore', 'permanent']) {
      await request(app).post(`/api/admin/media/trash/batch/${action}`).set('Authorization', `Bearer ${superToken}`)
        .send({ ids: [String(media._id), 'ffffffffffffffffffffffff'] }).expect(409)
      expect((await Media.findById(media._id)).deletedAt).toBeTruthy()
    }
  })

  it('文件夹数量按当前工作区累计跨账号的系统分类，与进入后的列表一致', async () => {
    const first = await createMedia(superAdmin, 'mine.txt')
    const second = await createMedia(mediaManager, 'theirs.txt')
    const legacy = await createMedia(mediaManager, 'legacy.txt')
    const image = await createMedia(superAdmin, 'article.txt')
    await request(app).get('/api/admin/media/categories').set('Authorization', `Bearer ${superToken}`).expect(200)
    const category = await MediaCategory.findOne({ name: '默认素材', system: true })
    await Media.updateMany({ _id: { $in: [first._id, second._id] } }, { $set: { scene: 'admin-library', categoryId: category._id } })
    await Media.updateOne({ _id: image._id }, { $set: { scene: 'article-content', categoryId: category._id } })
    const categories = async (workspace, token = superToken) => (await request(app).get('/api/admin/media/categories')
      .query({ workspace, scope: 'all' }).set('Authorization', `Bearer ${token}`).expect(200)).body.data
    const materials = await categories('library')
    expect(materials.find((item) => item.id === String(category._id)).count).toBe(3)
    expect((await categories('business')).find((item) => item.id === String(category._id)).count).toBe(1)
    expect((await categories('all')).find((item) => item.id === String(category._id)).count).toBe(4)
    expect((await categories('library', managerToken)).find((item) => item.id === String(category._id)).count).toBe(2)
    const listed = await request(app).get('/api/admin/media').query({ workspace: 'library', categoryId: String(category._id), category: '默认素材' })
      .set('Authorization', `Bearer ${superToken}`).expect(200)
    expect(listed.body.data.total).toBe(3)
    expect(listed.body.data.items.map((item) => item.id)).toEqual(expect.arrayContaining([String(first._id), String(second._id), String(legacy._id)]))
  })

  it('历史同名分类进入文件夹后按归属过滤，普通账号不能借分类参数跨账号', async () => {
    const first = await createMedia(superAdmin, 'my-project.txt')
    const second = await createMedia(mediaManager, 'their-project.txt')
    await Media.updateMany({ _id: { $in: [first._id, second._id] } }, { $set: { category: '项目', categoryId: null } })
    const listed = await request(app).get('/api/admin/media').query({ workspace: 'library', category: '项目', categoryOwner: String(mediaManager._id) })
      .set('Authorization', `Bearer ${superToken}`).expect(200)
    expect(listed.body.data.items.map((item) => item.id)).toEqual([String(second._id)])
    const forbidden = await request(app).get('/api/admin/media').query({ workspace: 'library', category: '项目', categoryOwner: String(superAdmin._id) })
      .set('Authorization', `Bearer ${managerToken}`).expect(200)
    expect(forbidden.body.data.total).toBe(0)
  })

  it('按工作区在服务端分页和统计，分类跨视图保留且不能绕过上传人范围', async () => {
    const library = await createMedia(superAdmin, 'library.txt')
    const legacy = await createMedia(superAdmin, 'legacy.txt')
    const article = await createMedia(superAdmin, 'article.txt')
    const photo = await createMedia(mediaManager, 'resume-photo.txt')
    const ownVault = await createMedia(superAdmin, 'owner-vault.txt')
    const otherVault = await createMedia(mediaManager, 'other-vault.txt')
    await Media.updateOne({ _id: library._id }, { $set: { scene: 'admin-library' } })
    await Media.collection.updateOne({ _id: legacy._id }, { $unset: { scene: '' } })
    await Media.updateOne({ _id: article._id }, { $set: { scene: 'article-content' } })
    await Media.updateOne({ _id: photo._id }, { $set: { scene: 'resume-photo', accessScope: 'private' } })
    await Media.updateMany({ _id: { $in: [ownVault._id, otherVault._id] } }, { $set: { accessScope: 'vault', scene: 'admin-library' } })
    const list = async (query, token = superToken) => (await request(app).get('/api/admin/media').query(query).set('Authorization', `Bearer ${token}`).expect(200)).body.data
    const materials = await list({ workspace: 'library', pageSize: 1 })
    expect(materials.total).toBe(2)
    expect(materials.items).toHaveLength(1)
    expect((await list({ workspace: 'business' })).items.map((item) => item.id)).toEqual(expect.arrayContaining([String(article._id), String(photo._id)]))
    expect((await list({ workspace: 'business' }, managerToken)).items.map((item) => item.id)).toEqual([String(photo._id)])
    expect((await list({ workspace: 'vault' }, managerToken)).items).toEqual([expect.objectContaining({ id: String(otherVault._id), originalName: '密码箱文件', url: '' })])
    expect((await list({ workspace: 'vault' })).items.map((item) => item.id)).toEqual([String(ownVault._id)])
    const statistics = await request(app).get('/api/admin/media/statistics').query({ workspace: 'library' }).set('Authorization', `Bearer ${superToken}`).expect(200)
    expect(statistics.body.data.byFileClass.code).toBe(2)
    expect((await list({ workspace: 'business', category: '默认素材' })).total).toBe(2)
    expect((await list({ workspace: 'all' })).total).toBe(5)
    const folderSearch = await list({ workspace: 'folders' })
    expect(folderSearch.total).toBe(4)
    expect(folderSearch.items.every((item) => item.accessScope !== 'vault')).toBe(true)
    expect((await list({ workspace: 'folders' }, managerToken)).items.map((item) => item.id)).toEqual([String(photo._id)])
  })

  it('工作区与分类来源筛选取交集，私人及密码箱文件不能混入素材库', async () => {
    const media = await createMedia(superAdmin, 'private.txt')
    await Media.updateOne({ _id: media._id }, { $set: { accessScope: 'private', scene: 'resume-photo' } })
    const response = await request(app).get('/api/admin/media').query({ workspace: 'library', scene: 'resume-photo', accessScope: 'private' })
      .set('Authorization', `Bearer ${superToken}`).expect(200)
    expect(response.body.data.total).toBe(0)
    const stats = await request(app).get('/api/admin/media/statistics').query({ workspace: 'library', scene: 'resume-photo', accessScope: 'private' })
      .set('Authorization', `Bearer ${superToken}`).expect(200)
    expect(Object.values(stats.body.data.byFileClass).reduce((sum, count) => sum + count, 0)).toBe(0)
  })

  it('文件名中的方括号和正则符号按原文字搜索，列表与统计口径一致', async () => {
    await createMedia(superAdmin, '资料[最终版].txt')
    await createMedia(superAdmin, '普通资料.txt')
    const list = await request(app).get('/api/admin/media').query({ keyword: '[' })
      .set('Authorization', `Bearer ${superToken}`).expect(200)
    expect(list.body.data.total).toBe(1)
    expect(list.body.data.items[0].originalName).toBe('资料[最终版].txt')
    const stats = await request(app).get('/api/admin/media/statistics').query({ keyword: '[' })
      .set('Authorization', `Bearer ${superToken}`).expect(200)
    expect(stats.body.data.byFileClass.code).toBe(1)
    const literal = await request(app).get('/api/admin/media').query({ keyword: '.*' })
      .set('Authorization', `Bearer ${superToken}`).expect(200)
    expect(literal.body.data.total).toBe(0)
  })

  it('allows only super admin to scan server files and marks referenced avatars', async () => {
    const uploadRoot = resolveUploadRoot()
    const relativePath = `avatars/${Date.now()}-avatar.png`
    const targetPath = path.join(uploadRoot, relativePath)
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.writeFileSync(targetPath, Buffer.from('avatar-image'))
    await User.findByIdAndUpdate(mediaManager._id, { $set: { avatar: `/uploads/${relativePath}` } })

    await request(app)
      .get('/api/admin/media/unregistered')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(403)

    const scanResponse = await request(app)
      .get('/api/admin/media/unregistered')
      .query({ keyword: path.basename(relativePath), pageSize: 10 })
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200)

    expect(scanResponse.body.data).not.toHaveProperty('uploadRoot')
    expect(scanResponse.body.data.items[0]).toMatchObject({
      relativePath,
      protected: true,
      source: {
        type: 'avatar',
        label: '用户头像目录'
      },
      usage: {
        usageStatus: 'referenced',
        referenceCount: 1
      }
    })
    expect(scanResponse.body.data.items[0].references[0]).toMatchObject({
      type: 'userAvatar',
      ownerTitle: mediaManager.username
    })
    expect(scanResponse.body.data.items[0]).not.toHaveProperty('storagePath')

    await request(app)
      .get('/api/admin/media/unregistered/detail')
      .query({ relativePath })
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(403)

    const detailResponse = await request(app)
      .get('/api/admin/media/unregistered/detail')
      .query({ relativePath })
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200)

    expect(detailResponse.body.data).toMatchObject({
      relativePath,
      source: { type: 'avatar' },
      usage: { referenceCount: 1 },
      references: [expect.objectContaining({
        type: 'userAvatar',
        ownerTitle: mediaManager.username
      })]
    })
    expect(detailResponse.body.data).not.toHaveProperty('storagePath')
  })

  it('returns document and snapshot categories as protected system categories', async () => {
    const response = await request(app)
      .get('/api/admin/media/categories')
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200)

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: '文章原始文档',
          system: true,
          description: expect.stringContaining('原始附件')
        }),
        expect.objectContaining({
          name: '文章快照原始文档',
          system: true,
          description: expect.stringContaining('文章快照')
        })
      ])
    )
  })

  it('本人普通资源可整理，系统分类禁止上传和双向迁移，批量预检避免部分成功', async () => {
    const category = await MediaCategory.create({ name: '项目资料', owner: mediaManager._id })
    const target = await MediaCategory.create({ name: '部署', owner: mediaManager._id })
    const ordinary = await createMedia(mediaManager, 'ordinary.txt')
    const system = await createMedia(mediaManager, 'system.txt')
    await Media.updateOne({ _id: ordinary._id }, { category: category.name, categoryId: category._id, scene: 'admin-library' })
    await request(app).patch(`/api/admin/media/${ordinary._id}/category`).set('Authorization', `Bearer ${managerToken}`)
      .send({ categoryId: String(target._id) }).expect(200)
    const denied = await request(app).patch(`/api/admin/media/${ordinary._id}/category`).set('Authorization', `Bearer ${managerToken}`)
      .send({ category: '文章封面' }).expect(403)
    expect(denied.body.code).toBe('MEDIA_SYSTEM_CATEGORY_READONLY')
    await request(app).patch(`/api/admin/media/${system._id}/category`).set('Authorization', `Bearer ${managerToken}`)
      .send({ categoryId: String(target._id) }).expect(403)
    await request(app).patch('/api/admin/media/category/batch').set('Authorization', `Bearer ${managerToken}`)
      .send({ ids: [String(ordinary._id), String(system._id)], categoryId: String(category._id) }).expect(403)
    expect((await Media.findById(ordinary._id)).category).toBe('部署')
    const before = listUploadFiles(resolveUploadRoot())
    await request(app).post('/api/admin/media').set('Authorization', `Bearer ${managerToken}`)
      .field('category', '文章封面').attach('files', Buffer.from('system upload'), 'system.txt').expect(403)
    await request(app).post('/api/admin/media-uploads').set('Authorization', `Bearer ${managerToken}`)
      .send({ uploadId: '12345678-1234-4234-8234-123456789abc', name: 'system.txt', size: 1, category: '文章封面' }).expect(403)
    expect(listUploadFiles(resolveUploadRoot())).toEqual(before)
    expect(await Media.countDocuments()).toBe(2)
  })

  it('超级管理员也不能手动整理其他人的文件或把素材写进系统分类', async () => {
    const category = await MediaCategory.create({ name: '项目资料', owner: mediaManager._id })
    const media = await createMedia(mediaManager, 'other.txt')
    await Media.updateOne({ _id: media._id }, { category: category.name, categoryId: category._id })
    await request(app).patch(`/api/admin/media/${media._id}/category`).set('Authorization', `Bearer ${superToken}`)
      .send({ categoryId: String(category._id) }).expect(403)
    await request(app).patch(`/api/admin/media/${media._id}/category`).set('Authorization', `Bearer ${superToken}`)
      .send({ category: '文章封面' }).expect(403)
    expect((await Media.findById(media._id)).category).toBe('项目资料')
  })

  it('isolates same-name custom categories by creator', async () => {
    const secondManager = await createMediaManager('media-manager-two')
    const secondToken = signAccessToken(secondManager)

    const firstCategory = await request(app)
      .post('/api/admin/media/categories')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ name: '项目资料', description: '第一个账号的资料' })
      .expect(201)

    const secondCategory = await request(app)
      .post('/api/admin/media/categories')
      .set('Authorization', `Bearer ${secondToken}`)
      .send({ name: '项目资料', description: '第二个账号的资料' })
      .expect(201)

    expect(firstCategory.body.data.id).not.toBe(secondCategory.body.data.id)
    expect(firstCategory.body.data.owner).toBe(mediaManager._id.toString())
    expect(secondCategory.body.data.owner).toBe(secondManager._id.toString())

    const firstList = await request(app)
      .get('/api/admin/media/categories')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200)
    const secondList = await request(app)
      .get('/api/admin/media/categories')
      .set('Authorization', `Bearer ${secondToken}`)
      .expect(200)

    expect(firstList.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: firstCategory.body.data.id, name: '项目资料' }),
      expect.objectContaining({ name: '默认素材', system: true })
    ]))
    expect(firstList.body.data.some((item) => item.id === secondCategory.body.data.id)).toBe(false)
    expect(secondList.body.data.some((item) => item.id === firstCategory.body.data.id)).toBe(false)

    await request(app)
      .patch(`/api/admin/media/categories/${firstCategory.body.data.id}`)
      .set('Authorization', `Bearer ${secondToken}`)
      .send({ description: '越权修改' })
      .expect(404)

    await request(app)
      .delete(`/api/admin/media/categories/${firstCategory.body.data.id}`)
      .set('Authorization', `Bearer ${secondToken}`)
      .expect(404)
  })

  it('deleting a custom category only moves resources owned by its creator', async () => {
    const secondManager = await createMediaManager('media-manager-two')
    const secondToken = signAccessToken(secondManager)
    const firstCategory = await request(app)
      .post('/api/admin/media/categories')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ name: '项目资料' })
      .expect(201)
    const secondCategory = await request(app)
      .post('/api/admin/media/categories')
      .set('Authorization', `Bearer ${secondToken}`)
      .send({ name: '项目资料' })
      .expect(201)
    const firstMedia = await createMedia(mediaManager, 'first-private-category.txt')
    const secondMedia = await createMedia(secondManager, 'second-private-category.txt')

    await Media.findByIdAndUpdate(firstMedia._id, {
      $set: { category: '项目资料', categoryId: firstCategory.body.data.id }
    })
    await Media.findByIdAndUpdate(secondMedia._id, {
      $set: { category: '项目资料', categoryId: secondCategory.body.data.id }
    })

    await request(app)
      .delete(`/api/admin/media/categories/${firstCategory.body.data.id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200)

    const [updatedFirst, updatedSecond] = await Promise.all([
      Media.findById(firstMedia._id),
      Media.findById(secondMedia._id)
    ])
    expect(updatedFirst.category).toBe('未分类')
    expect(updatedFirst.categoryId.toString()).not.toBe(firstCategory.body.data.id)
    expect(updatedSecond.category).toBe('项目资料')
    expect(updatedSecond.categoryId.toString()).toBe(secondCategory.body.data.id)
    expect(await MediaCategory.findById(secondCategory.body.data.id)).not.toBeNull()
  })

  it('rejects uploads to another user private category and removes the written file', async () => {
    const secondManager = await createMediaManager('media-manager-two')
    const secondToken = signAccessToken(secondManager)
    const secondCategory = await request(app)
      .post('/api/admin/media/categories')
      .set('Authorization', `Bearer ${secondToken}`)
      .send({ name: '项目资料' })
      .expect(201)
    const uploadRoot = resolveUploadRoot()
    const beforeFiles = listUploadFiles(uploadRoot)

    const response = await request(app)
      .post('/api/admin/media')
      .set('Authorization', `Bearer ${managerToken}`)
      .field('category', '项目资料')
      .field('categoryId', secondCategory.body.data.id)
      .attach('files', Buffer.from('private category payload'), {
        filename: 'private-category.txt',
        contentType: 'text/plain'
      })
      .expect(404)

    expect(response.body.code).toBe('MEDIA_CATEGORY_NOT_FOUND')
    expect(await Media.countDocuments({ originalName: 'private-category.txt' })).toBe(0)
    expect(listUploadFiles(uploadRoot)).toEqual(beforeFiles)
  })
})
