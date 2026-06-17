import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'

describe('health routes', () => {
  it('returns api health information', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/api/health')
      .expect(200)

    expect(response.body).toMatchObject({
      success: true,
      message: 'success',
      data: {
        service: 'personal-fullstack-blog-api',
        status: 'ok'
      }
    })
    expect(response.body.data.timestamp).toEqual(expect.any(String))
  })
})
