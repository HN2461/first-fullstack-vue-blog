import request from 'supertest'
import crypto from 'node:crypto'
import { USER_ROLES, USER_STATUS } from '#constants/domain'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import {
  loginUser,
  registerUser,
  resetPassword
} from '#modules/auth/services/auth.service.js'
import { User } from '#modules/user/models/User.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'
import { signAccessToken } from '../src/utils/jwt.js'

function encryptCredential(challenge, purpose, payload) {
  const encrypted = crypto.publicEncrypt(
    {
      key: challenge.publicKey,
      oaepHash: 'sha256',
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    },
    Buffer.from(JSON.stringify({
      purpose,
      challengeId: challenge.challengeId,
      nonce: challenge.nonce,
      ...payload
    }), 'utf8')
  )

  return {
    challengeId: challenge.challengeId,
    payload: encrypted.toString('base64')
  }
}

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

  it('locks an account after repeated invalid credentials', async () => {
    await registerUser({
      username: 'reader',
      email: 'reader@example.com',
      password: 'password123'
    })

    for (let i = 0; i < 5; i += 1) {
      await expect(loginUser({
        email: 'reader@example.com',
        password: 'wrong-password'
      })).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS'
      })
    }

    await expect(loginUser({
      email: 'reader@example.com',
      password: 'password123'
    })).rejects.toMatchObject({
      statusCode: 423,
      code: 'ACCOUNT_LOCKED'
    })
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

    const challengeResponse = await request(app)
      .get('/api/auth/challenge')
      .query({ purpose: 'register' })
      .expect(200)
    const credential = encryptCredential(challengeResponse.body.data, 'register', {
      password: 'password123'
    })

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'reader',
        email: 'reader@example.com',
        credential
      })
      .expect(201)

    expect(response.body.data.token).toEqual(expect.any(String))
    expect(response.body.data.user.email).toBe('reader@example.com')
    expect(response.headers['set-cookie']?.join(';')).toContain('blog_session=')
  })

  it('logs in and fetches current user through secure cookie', async () => {
    const app = createApp()

    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'reader',
        email: 'reader@example.com',
        password: 'password123'
      })
      .expect(201)

    const challengeResponse = await request(app)
      .get('/api/auth/challenge')
      .query({ purpose: 'login' })
      .expect(200)
    const credential = encryptCredential(challengeResponse.body.data, 'login', {
      password: 'password123'
    })

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'reader@example.com',
        credential
      })
      .expect(200)
    const cookie = loginResponse.headers['set-cookie']

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie)
      .expect(200)

    expect(meResponse.body.data.email).toBe('reader@example.com')
  })

  it('rejects reused encrypted credential challenges', async () => {
    const app = createApp()

    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'reader',
        email: 'reader@example.com',
        password: 'password123'
      })
      .expect(201)

    const challengeResponse = await request(app)
      .get('/api/auth/challenge')
      .query({ purpose: 'login' })
      .expect(200)
    const credential = encryptCredential(challengeResponse.body.data, 'login', {
      password: 'password123'
    })

    await request(app)
      .post('/api/auth/login')
      .send({
        email: 'reader@example.com',
        credential
      })
      .expect(200)

    const replayResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'reader@example.com',
        credential
      })
      .expect(400)

    expect(replayResponse.body.code).toBe('AUTH_CHALLENGE_EXPIRED')
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

  it('updates profile birthday and tracks birthday effect state with server date', async () => {
    const app = createApp()
    await registerUser({
      username: 'birthday-user',
      email: 'birthday@example.com',
      password: 'password123'
    })
    const user = await User.findOne({ email: 'birthday@example.com' })
    const token = signAccessToken(user)
    const today = new Date().toISOString().slice(0, 10)
    const birthday = `1996-${today.slice(5)}`

    const profileResponse = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'birthday-user',
        birthday,
        closeBirthEffect: false
      })
      .expect(200)

    expect(profileResponse.body.data).toMatchObject({
      birthday,
      closeBirthEffect: false
    })

    const stateResponse = await request(app)
      .get('/api/profile/festival-effect')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(stateResponse.body.data).toMatchObject({
      serverDate: today,
      birthday,
      isBirthdayToday: true,
      shouldShowBirthEffect: true
    })

    await request(app)
      .put('/api/profile/festival-effect')
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'birth-shown' })
      .expect(200)

    const secondStateResponse = await request(app)
      .get('/api/profile/festival-effect')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(secondStateResponse.body.data).toMatchObject({
      lastBirthEffectDate: today,
      shouldShowBirthEffect: false
    })
  })

  it('updates profile entrance effect settings and rejects invalid triggers', async () => {
    const app = createApp()
    await registerUser({
      username: 'effect-user',
      email: 'effect@example.com',
      password: 'password123'
    })
    const user = await User.findOne({ email: 'effect@example.com' })
    const token = signAccessToken(user)

    const profileResponse = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        entranceEffect: {
          enabled: true,
          effectKey: 'starlight',
          duration: 4.5,
          triggerPages: ['home', 'consoleHome']
        }
      })
      .expect(200)

    expect(profileResponse.body.data.entranceEffect).toMatchObject({
      enabled: true,
      effectKey: 'starlight',
      duration: 4.5,
      triggerPages: ['home', 'consoleHome']
    })

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(meResponse.body.data.entranceEffect).toMatchObject({
      enabled: true,
      effectKey: 'starlight'
    })

    const invalidResponse = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        entranceEffect: {
          enabled: true,
          effectKey: 'starlight',
          duration: 4,
          triggerPages: ['consoleHome', 'unknown']
        }
      })
      .expect(400)

    expect(invalidResponse.body.code).toBe('VALIDATION_ERROR')

    const invalidEffectResponse = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        entranceEffect: {
          enabled: true,
          effectKey: 'not-exists',
          duration: 4,
          triggerPages: ['consoleHome']
        }
      })
      .expect(400)

    expect(invalidEffectResponse.body.code).toBe('VALIDATION_ERROR')
  })
})
