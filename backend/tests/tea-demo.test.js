import crypto from 'node:crypto'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

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

async function getChallenge(app, purpose) {
  const response = await request(app)
    .get('/api/tea-demo/v1/auth/challenge')
    .query({ purpose })
    .expect(200)

  return response.body.data
}

async function loginWithChallenge(app, identifier, password, purpose = 'login') {
  const challenge = await getChallenge(app, purpose)
  const credential = encryptCredential(challenge, purpose, {
    identifier,
    password
  })

  const response = await request(app)
    .post('/api/tea-demo/v1/auth/login')
    .send({ credential })
    .expect(200)

  return response.body.data
}

describe('tea demo api', () => {
  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('returns a challenge and supports encrypted register/login/me/refresh/logout', async () => {
    const app = createApp()

    const registerChallenge = await getChallenge(app, 'register')
    const registerCredential = encryptCredential(registerChallenge, 'register', {
      username: 'reader',
      email: 'reader@example.com',
      password: 'password123',
      nickname: '阅读者'
    })

    await request(app)
      .post('/api/tea-demo/v1/auth/register')
      .send({ credential: registerCredential })
      .expect(201)

    const replayResponse = await request(app)
      .post('/api/tea-demo/v1/auth/register')
      .send({ credential: registerCredential })
      .expect(400)

    expect(replayResponse.body.code).toBe('AUTH_CHALLENGE_EXPIRED')

    const duplicateChallenge = await getChallenge(app, 'register')
    const duplicateCredential = encryptCredential(duplicateChallenge, 'register', {
      username: 'reader',
      email: 'another-reader@example.com',
      password: 'password123'
    })
    const duplicateResponse = await request(app)
      .post('/api/tea-demo/v1/auth/register')
      .send({ credential: duplicateCredential })
      .expect(409)

    expect(duplicateResponse.body.code).toBe('USERNAME_EXISTS')

    const invalidChallenge = await getChallenge(app, 'register')
    const invalidCredential = encryptCredential(invalidChallenge, 'register', {
      username: 'invalid-email-user',
      email: 'invalid-email',
      password: 'password123'
    })
    const invalidResponse = await request(app)
      .post('/api/tea-demo/v1/auth/register')
      .send({ credential: invalidCredential })
      .expect(400)

    expect(invalidResponse.body.code).toBe('VALIDATION_ERROR')

    const loginData = await loginWithChallenge(app, 'reader', 'password123')
    expect(loginData.token).toEqual(expect.any(String))
    expect(loginData.user.username).toBe('reader')
    expect(loginData.user.roles).toContain('USER')

    const meResponse = await request(app)
      .get('/api/tea-demo/v1/auth/me')
      .set('Authorization', `Bearer ${loginData.token}`)
      .expect(200)

    expect(meResponse.body.data.username).toBe('reader')

    const refreshResponse = await request(app)
      .post('/api/tea-demo/v1/auth/refresh')
      .set('Authorization', `Bearer ${loginData.token}`)
      .expect(200)

    expect(refreshResponse.body.data.token).toEqual(expect.any(String))
    expect(refreshResponse.body.data.token).not.toBe(loginData.token)

    await request(app)
      .post('/api/tea-demo/v1/auth/logout')
      .set('Authorization', `Bearer ${loginData.token}`)
      .expect(200)

    await request(app)
      .get('/api/tea-demo/v1/auth/me')
      .set('Authorization', `Bearer ${loginData.token}`)
      .expect(401)
  })

  it('returns categories and public products', async () => {
    const app = createApp()

    const categoriesResponse = await request(app)
      .get('/api/tea-demo/v1/product-categories')
      .expect(200)

    expect(categoriesResponse.body.data.length).toBeGreaterThan(1)

    const productsResponse = await request(app)
      .get('/api/tea-demo/v1/products')
      .expect(200)

    expect(productsResponse.body.data.list.length).toBeGreaterThan(0)
    const firstProduct = productsResponse.body.data.list[0]
    expect(firstProduct.categoryName).toBeTruthy()
    expect(firstProduct.image).toMatch(/^https:\/\//)
    expect(firstProduct.imageUrl).toBe(firstProduct.image)
    expect(firstProduct.image).not.toContain('/images/logo.webp')

    const detailResponse = await request(app)
      .get(`/api/tea-demo/v1/products/${firstProduct.id}`)
      .expect(200)

    expect(detailResponse.body.data.specs).toBeTruthy()
    expect(detailResponse.body.data.bannerImages.length).toBeGreaterThan(0)
  })

  it('allows configured local origins and rejects unknown browser origins', async () => {
    const app = createApp()

    const allowedResponse = await request(app)
      .options('/api/tea-demo/v1/products')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204)

    expect(allowedResponse.headers['access-control-allow-origin']).toBe('http://localhost:5173')

    const deniedResponse = await request(app)
      .options('/api/tea-demo/v1/products')
      .set('Origin', 'https://not-allowed.example')
      .set('Access-Control-Request-Method', 'GET')
      .expect(403)

    expect(deniedResponse.body.code).toBe('CORS_ORIGIN_DENIED')
  })

  it('enforces admin permissions for product CRUD', async () => {
    const app = createApp()

    const userLogin = await loginWithChallenge(app, 'user', '123456')

    await request(app)
      .get('/api/tea-demo/v1/admin/products')
      .set('Authorization', `Bearer ${userLogin.token}`)
      .expect(403)

    const adminLogin = await loginWithChallenge(app, 'admin', '123456')

    const createResponse = await request(app)
      .post('/api/tea-demo/v1/admin/products')
      .set('Authorization', `Bearer ${adminLogin.token}`)
      .send({
        name: '黑糖珍珠奶茶',
        nameEn: 'Brown Sugar Bubble Milk Tea',
        description: '黑糖香气搭配 Q 弹珍珠。',
        descriptionEn: 'Brown sugar aroma with chewy pearls.',
        price: 31,
        categoryCode: 'tea',
        imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=82',
        isNew: true,
        isHot: false,
        status: 'ON_SALE',
        stock: 200,
        sortOrder: 99,
        specs: {
          sizes: [
            { code: 'm', name: '中杯', nameEn: 'Medium', extraPrice: 0 }
          ],
          sweetness: [
            { code: 'normal', name: '正常糖', nameEn: 'Normal Sugar' }
          ],
          toppings: [
            { code: 'pearls', name: '珍珠', nameEn: 'Pearls', price: 3 }
          ]
        }
      })
      .expect(201)

    const productId = createResponse.body.data.id
    expect(createResponse.body.data.image).toBe(createResponse.body.data.imageUrl)
    expect(createResponse.body.data.image).toMatch(/^https:\/\//)

    const updateResponse = await request(app)
      .put(`/api/tea-demo/v1/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminLogin.token}`)
      .send({
        price: 33,
        isHot: true
      })
      .expect(200)

    expect(updateResponse.body.data.price).toBe(33)
    expect(updateResponse.body.data.isHot).toBe(true)

    const clearDescriptionResponse = await request(app)
      .put(`/api/tea-demo/v1/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminLogin.token}`)
      .send({ description: '' })
      .expect(200)

    expect(clearDescriptionResponse.body.data.description).toBe('')

    await request(app)
      .patch(`/api/tea-demo/v1/admin/products/${productId}/status`)
      .set('Authorization', `Bearer ${adminLogin.token}`)
      .send({ status: 'SOLD_OUT' })
      .expect(200)

    await request(app)
      .delete(`/api/tea-demo/v1/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminLogin.token}`)
      .expect(200)

    await request(app)
      .get(`/api/tea-demo/v1/admin/products/${productId}`)
      .set('Authorization', `Bearer ${adminLogin.token}`)
      .expect(404)
  })
})
