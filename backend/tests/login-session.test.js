import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { USER_ROLES } from '#constants/domain'
import { createApp } from '../src/app.js'
import { loginUser, registerUser } from '#modules/auth/services/auth.service.js'
import { LoginSession, LOGIN_SESSION_ONLINE_WINDOW_MS } from '#modules/auth/models/LoginSession.js'
import { listLoginSessions } from '#modules/auth/services/loginSession.service.js'
import { User } from '#modules/user/models/User.js'
import { signAccessToken } from '#utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

describe('login sessions', () => {
  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('creates one session for each successful login', async () => {
    await registerUser({
      username: 'session-user',
      email: 'session-user@example.com',
      password: 'password123'
    })

    await loginUser({ email: 'session-user@example.com', password: 'password123' })
    const user = await User.findOne({ email: 'session-user@example.com' })
    const sessions = await LoginSession.find({ user: user._id }).sort({ loginAt: 1 })

    expect(sessions).toHaveLength(2)
    expect(sessions.every((session) => session.sessionId)).toBe(true)
    expect(sessions.every((session) => session.status === 'active')).toBe(true)
  })

  it('updates the current session on heartbeat and marks it on logout', async () => {
    const app = createApp()
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'heartbeat-user',
        email: 'heartbeat-user@example.com',
        password: 'password123'
      })
      .expect(201)

    const cookie = registerResponse.headers['set-cookie']
    const user = await User.findOne({ email: 'heartbeat-user@example.com' })
    const sessionBefore = await LoginSession.findOne({ user: user._id })
    const oldLastSeenAt = sessionBefore.lastSeenAt

    await new Promise((resolve) => setTimeout(resolve, 5))
    const heartbeatResponse = await request(app)
      .post('/api/auth/heartbeat')
      .set('Cookie', cookie)
      .expect(200)

    expect(heartbeatResponse.body.data.updated).toBe(true)
    const sessionAfterHeartbeat = await LoginSession.findOne({ user: user._id })
    expect(sessionAfterHeartbeat.lastSeenAt.getTime()).toBeGreaterThan(oldLastSeenAt.getTime())

    await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie)
      .expect(200)

    const sessionAfterLogout = await LoginSession.findOne({ user: user._id })
    expect(sessionAfterLogout.status).toBe('logged_out')
    expect(sessionAfterLogout.logoutAt).toBeInstanceOf(Date)
  })

  it('returns current user login records without exposing another user', async () => {
    const app = createApp()
    const first = await request(app)
      .post('/api/auth/register')
      .send({ username: 'first-user', email: 'first@example.com', password: 'password123' })
      .expect(201)
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'second-user', email: 'second@example.com', password: 'password123' })
      .expect(201)

    const response = await request(app)
      .get('/api/profile/login-records')
      .set('Cookie', first.headers['set-cookie'])
      .expect(200)

    expect(response.body.data.items).toHaveLength(1)
    expect(response.body.data.items[0].user.username).toBe('first-user')
    expect(response.body.data.items[0].sessionId).toBeUndefined()
    expect(response.body.data.items[0].current).toBe(true)
  })

  it('reports active sessions online and stale sessions offline', async () => {
    await registerUser({
      username: 'status-user',
      email: 'status-user@example.com',
      password: 'password123'
    })

    const onlineResult = await listLoginSessions({ status: 'online' })
    expect(onlineResult.onlineCount).toBe(1)
    expect(onlineResult.items[0].status).toBe('online')
    expect(onlineResult.items[0].user.username).toBe('status-user')

    await LoginSession.updateMany({}, {
      $set: { lastSeenAt: new Date(Date.now() - LOGIN_SESSION_ONLINE_WINDOW_MS - 1000) }
    })

    const offlineResult = await listLoginSessions({ status: 'offline' })
    expect(offlineResult.items[0].status).toBe('offline')
    expect((await listLoginSessions({ status: 'online' })).onlineCount).toBe(0)
  })

  it('counts concurrent sessions separately while deduplicating online users', async () => {
    await registerUser({
      username: 'metric-user',
      email: 'metric-user@example.com',
      password: 'password123'
    })
    await loginUser({ email: 'metric-user@example.com', password: 'password123' })

    const concurrentResult = await listLoginSessions({ status: 'all' })
    expect(concurrentResult.onlineCount).toBe(2)
    expect(concurrentResult.onlineUserCount).toBe(1)
    expect(concurrentResult.recentLoginCount).toBe(2)

    const oldestSession = await LoginSession.findOne().sort({ loginAt: 1 })
    oldestSession.loginAt = new Date(Date.now() - 25 * 60 * 60 * 1000)
    await oldestSession.save()

    const recentResult = await listLoginSessions({ status: 'all' })
    expect(recentResult.onlineCount).toBe(2)
    expect(recentResult.onlineUserCount).toBe(1)
    expect(recentResult.recentLoginCount).toBe(1)
  })

  it('allows a super administrator to read the online user page data', async () => {
    const app = createApp()
    const admin = await User.create({
      username: 'session-admin',
      email: 'session-admin@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.SUPER_ADMIN
    })
    await registerUser({
      username: 'visible-reader',
      email: 'visible-reader@example.com',
      password: 'password123'
    })

    const response = await request(app)
      .get('/api/admin/online-users')
      .set('Authorization', `Bearer ${signAccessToken(admin)}`)
      .expect(200)

    expect(response.body.data.onlineCount).toBe(1)
    expect(response.body.data.items[0].user.username).toBe('visible-reader')
  })
})
