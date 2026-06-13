import request from 'supertest'
import { USER_ROLES, USER_STATUS } from '@blog/shared'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import {
  loginUser,
  registerUser
} from '../src/services/auth.service.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

describe('auth service', () => {
  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('registers a user with a hashed password and safe profile', async () => {
    const result = await registerUser({
      username: '主人',
      email: 'owner@example.com',
      password: 'password123'
    })

    expect(result.token).toEqual(expect.any(String))
    expect(result.user).toMatchObject({
      username: '主人',
      email: 'owner@example.com',
      role: USER_ROLES.USER,
      status: USER_STATUS.ACTIVE
    })
    expect(result.user.passwordHash).toBeUndefined()
  })

  it('rejects duplicated email registration', async () => {
    await registerUser({
      username: 'first',
      email: 'same@example.com',
      password: 'password123'
    })

    await expect(registerUser({
      username: 'second',
      email: 'same@example.com',
      password: 'password456'
    })).rejects.toMatchObject({
      statusCode: 409,
      code: 'EMAIL_EXISTS'
    })
  })

  it('logs in an active user with correct credentials', async () => {
    await registerUser({
      username: 'reader',
      email: 'reader@example.com',
      password: 'password123'
    })

    const result = await loginUser({
      email: 'reader@example.com',
      password: 'password123'
    })

    expect(result.token).toEqual(expect.any(String))
    expect(result.user.email).toBe('reader@example.com')
  })

  it('rejects invalid login credentials', async () => {
    await registerUser({
      username: 'reader',
      email: 'reader@example.com',
      password: 'password123'
    })

    await expect(loginUser({
      email: 'reader@example.com',
      password: 'wrong-password'
    })).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS'
    })
  })
})

describe('auth routes', () => {
  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('registers through POST /api/auth/register', async () => {
    const app = createApp()

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'reader',
        email: 'reader@example.com',
        password: 'password123'
      })
      .expect(201)

    expect(response.body.data.token).toEqual(expect.any(String))
    expect(response.body.data.user.email).toBe('reader@example.com')
  })

  it('logs in and fetches current user through token', async () => {
    const app = createApp()

    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'reader',
        email: 'reader@example.com',
        password: 'password123'
      })
      .expect(201)

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'reader@example.com',
        password: 'password123'
      })
      .expect(200)

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.data.token}`)
      .expect(200)

    expect(meResponse.body.data.email).toBe('reader@example.com')
  })

  it('rejects current user request without token', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/auth/me')
      .expect(401)

    expect(response.body.code).toBe('UNAUTHORIZED')
  })
})
