import request from 'supertest'
import crypto from 'node:crypto'
import { USER_ROLES, USER_STATUS } from '#constants/domain'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import {
  loginUser,
  registerUser
} from '#modules/auth/services/auth.service.js'
import { User } from '#modules/user/models/User.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'
import { signAccessToken } from '../src/utils/jwt.js'
import { getBusinessDate } from '../src/utils/businessDate.js'
import { isBirthdayOnDate } from '#modules/user/utils/birthday.js'

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

  it('does not expose the legacy email-only password reset route', async () => {
    const app = createApp()
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email: 'reader@example.com',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123'
      })
      .expect(410)
    expect(response.body.code).toBe('PASSWORD_RESET_DISABLED')
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
    const today = getBusinessDate()
    const birthday = `1996-${today.slice(5)}`

    const profileResponse = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'birthday-user',
        birthday,
        birthdayCalendar: 'both',
        closeBirthEffect: false
      })
      .expect(200)

    expect(profileResponse.body.data).toMatchObject({
      birthday,
      birthdayCalendar: 'both',
      closeBirthEffect: false
    })

    const stateResponse = await request(app)
      .get('/api/profile/festival-effect')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(stateResponse.body.data).toMatchObject({
      serverDate: today,
      birthday,
      birthdayCalendar: 'both',
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

  it('rejects invalid and future profile birthdays', async () => {
    const app = createApp()
    await registerUser({
      username: 'birthday-validation-user',
      email: 'birthday-validation@example.com',
      password: 'password123'
    })
    const user = await User.findOne({ email: 'birthday-validation@example.com' })
    const token = signAccessToken(user)

    for (const birthday of ['1990-02-30', '2099-02-03']) {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ birthday })
        .expect(400)

      expect(response.body.code).toBe('VALIDATION_ERROR')
    }
  })

  it('calculates recurring lunar and solar birthdays from one birth date', () => {
    expect(isBirthdayOnDate('1996-07-18', 'lunar', '2026-07-17')).toBe(true)
    expect(isBirthdayOnDate('1996-07-18', 'lunar', '2026-07-18')).toBe(false)
    expect(isBirthdayOnDate('1996-07-18', 'solar', '2026-07-18')).toBe(true)
    expect(isBirthdayOnDate('1996-07-18', 'both', '2026-07-17')).toBe(true)
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
        },
        closeSiteEntranceEffect: true
      })
      .expect(200)

    expect(profileResponse.body.data.entranceEffect).toMatchObject({
      enabled: true,
      effectKey: 'starlight',
      duration: 4.5,
      triggerPages: ['home', 'consoleHome']
    })
    expect(profileResponse.body.data.closeSiteEntranceEffect).toBe(true)

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(meResponse.body.data.entranceEffect).toMatchObject({
      enabled: true,
      effectKey: 'starlight'
    })
    expect(meResponse.body.data.closeSiteEntranceEffect).toBe(true)

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

  it('keeps site entrance preference disabled by default and persists user choice', async () => {
    const app = createApp()
    await registerUser({
      username: 'site-effect-user',
      email: 'site-effect@example.com',
      password: 'password123'
    })
    const user = await User.findOne({ email: 'site-effect@example.com' })
    const token = signAccessToken(user)

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(meResponse.body.data.closeSiteEntranceEffect).toBe(false)
    expect(meResponse.body.data.articleAuthorCardEnabled).toBe(false)

    const profileResponse = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        closeSiteEntranceEffect: true,
        articleAuthorCardEnabled: true
      })
      .expect(200)

    expect(profileResponse.body.data.closeSiteEntranceEffect).toBe(true)
    expect(profileResponse.body.data.articleAuthorCardEnabled).toBe(true)

    const updatedMeResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(updatedMeResponse.body.data.closeSiteEntranceEffect).toBe(true)
    expect(updatedMeResponse.body.data.articleAuthorCardEnabled).toBe(true)
  })
})
