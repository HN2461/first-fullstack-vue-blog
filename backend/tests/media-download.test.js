import fs from 'node:fs'
import path from 'node:path'
import request from 'supertest'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
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

const createdFiles = new Set()

async function createUser(role, extra = {}) {
  return User.create({
    username: extra.username || `media-download-${role}`,
    email: `${extra.username || role}-${Date.now()}-${Math.random()}@example.com`,
    passwordHash: 'hashed-password',
    role,
    roles: extra.roles || []
  })
}

async function createMediaManager() {
  await ensureRbacSeed()
  const mediaMenu = await Menu.findOne({ routePath: '/console/manage/media' })
  const role = await Role.create({
    name: '媒体下载管理员',
    code: `media-download-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    menuIds: [mediaMenu._id],
    status: 'active'
  })
  return createUser(USER_ROLES.ADMIN, {
    username: 'media-download-manager',
    roles: [role._id]
  })
}

async function createMedia(owner, options = {}) {
  const originalName = options.originalName || '资源.txt'
  const filename = options.filename || `${Date.now()}-${Math.random().toString(16).slice(2)}.txt`
  const targetPath = path.join(resolveUploadRoot(), 'download-test', filename)
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.writeFileSync(targetPath, Buffer.from(options.content || originalName))
  createdFiles.add(targetPath)

  return Media.create({
    filename,
    originalName,
    mimeType: options.mimeType || 'text/plain',
    size: fs.statSync(targetPath).size,
    url: `/uploads/download-test/${filename}`,
    storagePath: targetPath.replace(/\\/g, '/'),
    kind: options.kind || 'attachment',
    category: '默认素材',
    fileClass: options.fileClass || 'document',
    uploader: owner._id
  })
}

function parseBuffer(res, callback) {
  const chunks = []
  res.on('data', (chunk) => chunks.push(chunk))
  res.on('end', () => callback(null, Buffer.concat(chunks)))
}

describe('media downloads', () => {
  let app
  let superAdmin
  let mediaManager
  let ordinaryAdmin
  let superToken
  let managerToken
  let ordinaryToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    superAdmin = await createUser(USER_ROLES.SUPER_ADMIN, { username: 'media-download-super' })
    mediaManager = await createMediaManager()
    ordinaryAdmin = await createUser(USER_ROLES.ADMIN, { username: 'media-download-ordinary' })
    superToken = signAccessToken(superAdmin)
    managerToken = signAccessToken(mediaManager)
    ordinaryToken = signAccessToken(ordinaryAdmin)
  })

  afterEach(() => {
    createdFiles.forEach((filePath) => fs.rmSync(filePath, { force: true }))
    createdFiles.clear()
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('downloads one owned file with the media library name and actual extension', async () => {
    const media = await createMedia(mediaManager, {
      filename: `${Date.now()}-source.png`,
      originalName: '项目:封面图.jpg',
      mimeType: 'image/png',
      kind: 'image',
      fileClass: 'image',
      content: 'image-content'
    })

    const response = await request(app)
      .get(`/api/admin/media-downloads/${media._id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .buffer(true)
      .parse(parseBuffer)
      .expect(200)

    expect(response.headers['content-type']).toContain('image/png')
    expect(response.headers['content-disposition']).toContain(encodeURIComponent('项目-封面图.png'))
    expect(response.body.toString('utf8')).toBe('image-content')
  })

  it('creates a zip with custom prefix names and preserves selection order', async () => {
    const first = await createMedia(superAdmin, {
      filename: `${Date.now()}-first.txt`,
      originalName: '一串很长的字符.txt',
      content: 'first-content'
    })
    const second = await createMedia(superAdmin, {
      filename: `${Date.now()}-second.png`,
      originalName: '另一串字符.png',
      mimeType: 'image/png',
      kind: 'image',
      fileClass: 'image',
      content: 'second-content'
    })

    const response = await request(app)
      .post('/api/admin/media-downloads/batch/archive')
      .set('Authorization', `Bearer ${superToken}`)
      .send({
        ids: [second._id.toString(), first._id.toString()],
        namingMode: 'prefix',
        prefix: '项目/截图',
        archiveName: '交付资料'
      })
      .buffer(true)
      .parse(parseBuffer)
      .expect(200)

    expect(response.headers['content-type']).toContain('application/zip')
    expect(response.headers['content-disposition']).toContain(encodeURIComponent('交付资料.zip'))
    const archiveText = response.body.toString('utf8')
    expect(archiveText).toContain('项目-截图-01.png')
    expect(archiveText).toContain('项目-截图-02.txt')
  })

  it('rejects menu-less users, cross-owner selections and unmanaged file paths', async () => {
    const ownedMedia = await createMedia(mediaManager, { originalName: '我的资料.txt' })
    const superMedia = await createMedia(superAdmin, { originalName: '其他用户资料.txt' })

    await request(app)
      .get(`/api/admin/media-downloads/${ownedMedia._id}`)
      .set('Authorization', `Bearer ${ordinaryToken}`)
      .expect(403)

    const crossOwnerResponse = await request(app)
      .post('/api/admin/media-downloads/batch/archive')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        ids: [ownedMedia._id.toString(), superMedia._id.toString()],
        namingMode: 'original'
      })
      .expect(404)
    expect(crossOwnerResponse.body.code).toBe('MEDIA_DOWNLOAD_NOT_FOUND')

    ownedMedia.storagePath = path.resolve(resolveUploadRoot(), '..', 'outside-download.txt')
    ownedMedia.url = '/private/outside-download.txt'
    await ownedMedia.save()

    const unsafeResponse = await request(app)
      .get(`/api/admin/media-downloads/${ownedMedia._id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(404)
    expect(unsafeResponse.body.code).toBe('MEDIA_DOWNLOAD_FILE_MISSING')
  })
})
