import fs from 'node:fs'
import path from 'node:path'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { USER_ROLES } from '#constants/domain'
import { User } from '#modules/user/models/User.js'
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
    ['avatars/user.jpg', 'avatar', false],
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
})
