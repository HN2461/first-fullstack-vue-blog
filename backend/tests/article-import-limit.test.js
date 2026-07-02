import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { USER_ROLES } from '#constants/domain'
import { createApp } from '../src/app.js'
import { User } from '#modules/user/models/User.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function createAdmin() {
  return User.create({
    username: 'admin',
    email: `admin-${Date.now()}-${Math.random()}@example.com`,
    passwordHash: 'hashed-password',
    role: USER_ROLES.SUPER_ADMIN
  })
}

describe('article import upload limits', () => {
  let adminToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    const admin = await createAdmin()
    adminToken = signAccessToken(admin)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('previews more than twenty markdown files in one batch', async () => {
    const app = createApp()
    const fileCount = 21
    const requestBuilder = request(app)
      .post('/api/admin/articles/import/preview')
      .set('Authorization', `Bearer ${adminToken}`)

    Array.from({ length: fileCount }).forEach((_, index) => {
      const number = index + 1
      const slug = `bulk-import-${number}`
      const markdown = `---
title: 批量导入 ${number}
slug: ${slug}
summary: 批量导入上限验证。
---

# 批量导入 ${number}

正文内容。`

      requestBuilder.attach('files', Buffer.from(markdown, 'utf8'), `${slug}.md`)
    })

    const previewResponse = await requestBuilder
    if (previewResponse.status !== 200) {
      throw new Error(JSON.stringify(previewResponse.body))
    }
    const rows = previewResponse.body.data.items

    expect(rows).toHaveLength(fileCount)
    expect(rows.every((item) => item.importStatus === 'ready')).toBe(true)
    expect(rows.every((item) => item.canImport)).toBe(true)
  })
})
