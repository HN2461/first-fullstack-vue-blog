import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { BUILTIN_ROLE_CODES, USER_ROLES } from '#constants/domain'
import { User } from '#modules/user/models/User.js'
import { Role } from '#modules/rbac/models/Role.js'
import { LogRelayEntry } from '#modules/logRelay/models/LogRelayEntry.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

describe('log relay routes', () => {
  let app
  let token

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    await ensureRbacSeed()
    const role = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR })
    const user = await User.create({
      username: 'log-relay-user',
      email: 'log-relay-user@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.USER,
      roles: [role._id]
    })
    token = signAccessToken(user)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('accepts raw text publicly and lists it for authorized users', async () => {
    const uploadResponse = await request(app)
      .post('/api/log-relay')
      .set('Content-Type', 'text/plain; charset=utf-8')
      .send('device boot\nframe received')
      .expect(201)

    expect(uploadResponse.body.data).toMatchObject({
      content: 'device boot\nframe received',
      byteLength: 26
    })

    const listResponse = await request(app)
      .get('/api/log-relay')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(listResponse.body.data).toMatchObject({
      count: 1,
      content: 'device boot\nframe received'
    })
    expect(await LogRelayEntry.countDocuments()).toBe(1)
  })

  it('shares entries and clears them for a permitted user', async () => {
    await request(app).post('/api/log-relay').set('Content-Type', 'text/plain').send('first').expect(201)
    await request(app).post('/api/log-relay').set('Content-Type', 'text/plain').send('second').expect(201)

    const listResponse = await request(app)
      .get('/api/log-relay')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(listResponse.body.data.content).toBe('first\n\nsecond')
    expect(listResponse.body.data.count).toBe(2)

    const clearResponse = await request(app)
      .delete('/api/log-relay')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(clearResponse.body.data.clearedCount).toBe(2)
    expect(await LogRelayEntry.countDocuments()).toBe(0)
  })

  it('protects listing and clearing with login and menu access', async () => {
    await request(app).get('/api/log-relay').expect(401)
    await request(app).delete('/api/log-relay').expect(401)

    const role = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR }).populate('menuIds')
    role.menuIds = role.menuIds.filter((menu) => menu.routePath !== '/console/log-relay').map((menu) => menu._id)
    await role.save()

    await request(app)
      .get('/api/log-relay')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
  })
})
