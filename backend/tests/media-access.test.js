import fs from 'node:fs'
import path from 'node:path'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { USER_ROLES } from '#constants/domain'
import { Media } from '#modules/media/models/Media.js'
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

async function createMediaManager() {
  await ensureRbacSeed()
  const mediaMenu = await Menu.findOne({ routePath: '/console/manage/media' })
  const role = await Role.create({
    name: '媒体管理员',
    code: `media-manager-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    menuIds: [mediaMenu._id],
    status: 'active'
  })
  return createUser(USER_ROLES.ADMIN, { username: 'media-manager', roles: [role._id] })
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

    const superResponse = await request(app)
      .get('/api/admin/media')
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200)

    expect(superResponse.body.data.items.map((item) => item.originalName)).toEqual(
      expect.arrayContaining(['super-note.txt', 'manager-note.txt'])
    )
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

  it('moves owned media to configured categories and rejects cross-owner batch moves', async () => {
    const managerMedia = await createMedia(mediaManager, 'manager-category-move.txt')
    const managerSecondMedia = await createMedia(mediaManager, 'manager-category-second.txt')
    const superMedia = await createMedia(superAdmin, 'super-category-protected.txt')

    await request(app)
      .patch(`/api/admin/media/${managerMedia._id}/category`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ category: '文章封面' })
      .expect(200)

    expect((await Media.findById(managerMedia._id)).category).toBe('文章封面')

    await request(app)
      .patch('/api/admin/media/category/batch')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        ids: [managerMedia._id.toString(), managerSecondMedia._id.toString(), superMedia._id.toString()],
        category: '文章正文图片'
      })
      .expect(404)

    expect((await Media.findById(managerMedia._id)).category).toBe('文章封面')
    expect((await Media.findById(managerSecondMedia._id)).category).toBe('默认素材')

    await request(app)
      .patch('/api/admin/media/category/batch')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        ids: [managerMedia._id.toString(), managerSecondMedia._id.toString()],
        category: '文章正文图片'
      })
      .expect(200)

    expect((await Media.findById(managerMedia._id)).category).toBe('文章正文图片')
    expect((await Media.findById(managerSecondMedia._id)).category).toBe('文章正文图片')
  })
})
