import request from 'supertest'
import mongoose from 'mongoose'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp } from '../src/app.js'

describe('health routes', () => {
  afterEach(() => vi.restoreAllMocks())

  it('keeps the process alive while the database is disconnected', async () => {
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(0)
    const app = createApp()
    await request(app).get('/api/health').expect(200)
    await request(app).get('/api/ready').expect(503)
  })

  it('only reports ready after a bounded database ping succeeds', async () => {
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1)
    const command = vi.fn().mockRejectedValueOnce(new Error('private connection error')).mockResolvedValueOnce({ ok: 1 })
    const originalDb = mongoose.connection.db
    mongoose.connection.db = { command }
    try {
      const app = createApp()
      const failure = await request(app).get('/api/ready').expect(503)
      expect(failure.text).not.toContain('private connection error')
      await request(app).get('/api/ready').expect(200)
      expect(command).toHaveBeenCalledWith({ ping: 1 }, { timeoutMS: 2000 })
    } finally {
      mongoose.connection.db = originalDb
    }
  })

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
