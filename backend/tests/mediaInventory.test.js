import fs from 'node:fs'
import path from 'node:path'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { USER_ROLES } from '#constants/domain'
import { User } from '#modules/user/models/User.js'
import { Media } from '#modules/media/models/Media.js'
import { inferInventorySource } from '#modules/media/utils/mediaInventory.util.js'
import { signAccessToken } from '../src/utils/jwt.js'
import { resolveUploadRoot } from '../src/utils/uploadPath.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

describe('media inventory source rules', () => {
  let app
  let adminToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    const admin = await User.create({
      username: 'inventory-admin',
      email: `inventory-${Date.now()}-${Math.random()}@example.com`,
      passwordHash: 'hashed-password',
      role: USER_ROLES.SUPER_ADMIN
    })
    adminToken = signAccessToken(admin)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it.each([
    ['avatars/user.jpg', 'avatar', true],
    ['resumes/profile.jpg', 'resume', false],
    ['discussions/2026/08/file.png', 'discussion', false],
    ['article-snapshot/20260812/source.md', 'articleSnapshot', false],
    ['2026/08/media.png', 'media', true],
    ['media/legacy.png', 'media', true],
    ['inventory-test/file.txt', 'test', true],
    ['manual/file.txt', 'upload', true]
  ])('identifies %s as %s', (relativePath, type, registerable) => {
    expect(inferInventorySource(relativePath)).toMatchObject({ type, registerable })
  })

  it('protects resume photos from registration and suspected-file cleanup', async () => {
    const relativePath = `resumes/${Date.now()}-hello.txt`
    const targetPath = path.join(resolveUploadRoot(), relativePath)
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.writeFileSync(targetPath, Buffer.from('resume-photo'))

    const scanResponse = await request(app)
      .get('/api/admin/media/unregistered')
      .query({ keyword: path.basename(targetPath), pageSize: 10 })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(scanResponse.body.data).toMatchObject({
      total: 1,
      registerableCount: 0,
      protectedCount: 1
    })
    expect(scanResponse.body.data.items[0]).toMatchObject({
      relativePath: relativePath.replace(/\\/g, '/'),
      registerable: false,
      suspectedTest: true,
      protected: true,
      source: {
        type: 'resume',
        label: '简历照片目录',
        registerable: false
      }
    })

    const registerResponse = await request(app)
      .post('/api/admin/media/register-untracked')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ items: [{ relativePath }] })
      .expect(201)

    expect(registerResponse.body.data).toMatchObject({
      createdCount: 0,
      skippedCount: 1
    })
    expect(registerResponse.body.data.skipped[0]).toMatchObject({
      relativePath: relativePath.replace(/\\/g, '/'),
      reason: 'resume_resource'
    })

    const clearResponse = await request(app)
      .delete('/api/admin/media/unregistered/suspected-tests')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(clearResponse.body.data.skipped).toEqual(expect.arrayContaining([
      expect.objectContaining({ relativePath: relativePath.replace(/\\/g, '/') })
    ]))
    expect(fs.existsSync(targetPath)).toBe(true)
    fs.rmSync(targetPath, { force: true })
  })

  it('allows registering untracked avatar files while keeping active avatars protected from cleanup', async () => {
    const activeRelativePath = `avatars/${Date.now()}-active-avatar.jpg`
    const activeTargetPath = path.join(resolveUploadRoot(), activeRelativePath)
    fs.mkdirSync(path.dirname(activeTargetPath), { recursive: true })
    fs.writeFileSync(activeTargetPath, Buffer.from('active-avatar'))
    const user = await User.create({
      username: 'avatar-owner',
      email: `avatar-owner-${Date.now()}@example.com`,
      passwordHash: 'hashed-password',
      role: USER_ROLES.USER,
      avatar: `/uploads/${activeRelativePath.replace(/\\/g, '/')}`
    })

    const scanResponse = await request(app)
      .get('/api/admin/media/unregistered')
      .query({ keyword: path.basename(activeTargetPath), pageSize: 10 })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(scanResponse.body.data.items[0]).toMatchObject({
      relativePath: activeRelativePath.replace(/\\/g, '/'),
      source: { type: 'avatar', registerable: true },
      registerable: false,
      protected: true,
      usage: { referenceCount: 1 }
    })

    expect(scanResponse.body.data.registerableCount).toBe(0)

    const activeRegisterResponse = await request(app)
      .post('/api/admin/media/register-untracked')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ items: [{ relativePath: activeRelativePath }] })
      .expect(201)

    expect(activeRegisterResponse.body.data).toMatchObject({ createdCount: 0, skippedCount: 1 })
    expect(activeRegisterResponse.body.data.skipped[0]).toMatchObject({
      reason: 'referenced_resource',
      relativePath: activeRelativePath.replace(/\\/g, '/')
    })
    expect(await Media.countDocuments({ url: `/uploads/${activeRelativePath}` })).toBe(0)

    const clearResponse = await request(app)
      .delete('/api/admin/media/unregistered/old-avatars')
      .query({ keyword: path.basename(activeTargetPath) })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(clearResponse.body.data.deletedCount).toBe(0)
    expect(fs.existsSync(activeTargetPath)).toBe(true)

    await User.findByIdAndUpdate(user._id, { $set: { avatar: '' } })
    const registerResponse = await request(app)
      .post('/api/admin/media/register-untracked')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ items: [{ relativePath: activeRelativePath }] })
      .expect(201)

    expect(registerResponse.body.data.createdCount).toBe(1)
    expect(fs.existsSync(activeTargetPath)).toBe(true)
    fs.rmSync(activeTargetPath, { force: true })
  })

  it('cleans only unregistered avatars with no remaining business references', async () => {
    const relativePath = `avatars/${Date.now()}-old-avatar.jpg`
    const targetPath = path.join(resolveUploadRoot(), relativePath)
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.writeFileSync(targetPath, Buffer.from('old-avatar'))

    const response = await request(app)
      .delete('/api/admin/media/unregistered/old-avatars')
      .query({ keyword: path.basename(targetPath) })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(response.body.data).toMatchObject({ deletedCount: 1, skippedCount: 0 })
    expect(fs.existsSync(targetPath)).toBe(false)
  })
})
