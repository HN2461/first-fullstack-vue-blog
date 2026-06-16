import request from 'supertest'
import { USER_ROLES, USER_STATUS } from '@blog/shared'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import {
  loginUser,
  registerUser,
  resetPassword
} from '../src/services/auth.service.js'
import { User } from '../src/models/User.js'
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

  it('resets password without requiring the old password', async () => {
    await registerUser({
      username: 'reader',
      email: 'reader@example.com',
      password: 'password123'
    })

    await resetPassword({
      email: 'reader@example.com',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123'
    })

    await expect(loginUser({
      email: 'reader@example.com',
      password: 'password123'
    })).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS'
    })

    const result = await loginUser({
      email: 'reader@example.com',
      password: 'newPassword123'
    })
    expect(result.user.email).toBe('reader@example.com')
  })

  it('rejects password reset for disabled users', async () => {
    await registerUser({
      username: 'reader',
      email: 'reader@example.com',
      password: 'password123'
    })
    await User.updateOne({ email: 'reader@example.com' }, { $set: { status: USER_STATUS.DISABLED } })

    await expect(resetPassword({
      email: 'reader@example.com',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123'
    })).rejects.toMatchObject({
      statusCode: 403,
      code: 'USER_DISABLED'
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

    const captchaResponse = await request(app)
      .get('/api/captcha/generate')
      .expect(200)
    const storedCaptcha = global.captchaStore.get(captchaResponse.body.captchaId)

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'reader@example.com',
        password: 'password123',
        captchaId: captchaResponse.body.captchaId,
        captchaText: storedCaptcha.text
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

  it('resets password through POST /api/auth/reset-password', async () => {
    const app = createApp()

    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'reader',
        email: 'reader@example.com',
        password: 'password123'
      })
      .expect(201)

    await request(app)
      .post('/api/auth/reset-password')
      .send({
        email: 'reader@example.com',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123'
      })
      .expect(200)

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'reader@example.com',
        password: 'newPassword123'
      })
      .expect(200)

    expect(loginResponse.body.data.user.email).toBe('reader@example.com')
  })
})
