import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { FestivalDay } from '#modules/festival/models/FestivalDay.js'
import { User } from '#modules/user/models/User.js'
import { USER_ROLES } from '#constants/domain'
import { signAccessToken } from '../src/utils/jwt.js'
import { clearTestDatabase, connectTestDatabase, disconnectTestDatabase } from './helpers/testDatabase.js'

describe('festival calendar routes', () => {
  beforeAll(connectTestDatabase)
  beforeEach(clearTestDatabase)
  afterAll(disconnectTestDatabase)

  it('returns cached holiday and make-up workday in the public calendar', async () => {
    await FestivalDay.create([{ year: 2026, date: '2026-05-01', name: '劳动节', isHoliday: true, source: 'test' }, { year: 2026, date: '2026-05-09', name: '劳动节后补班', isWorkday: true, source: 'test' }])
    const response = await request(createApp()).get('/api/public/festivals?date=2026-05-01').expect(200)
    expect(response.body.data.dayStatus.isHoliday).toBe(true)
    expect(response.body.data.upcoming.some((item) => item.type === 'make-up-workday')).toBe(true)
  })

  it('allows only a super administrator to create custom festivals', async () => {
    const admin = await User.create({ username: 'festival-admin', email: 'festival-admin@example.com', passwordHash: 'hash', role: USER_ROLES.SUPER_ADMIN })
    const response = await request(createApp()).post('/api/admin/festivals').set('Authorization', `Bearer ${signAccessToken(admin)}`).send({ name: '站点纪念日', month: 8, day: 3, greeting: '今天也值得被记录。' }).expect(201)
    expect(response.body.data.name).toBe('站点纪念日')
    expect(response.body.data.category).toBe('system-broadcast')
    expect(response.body.data.greeting).toBe('今天也值得被记录。')
  })

  it('archives custom festivals instead of deleting them and supports restore', async () => {
    const admin = await User.create({ username: 'festival-restore-admin', email: 'festival-restore-admin@example.com', passwordHash: 'hash', role: USER_ROLES.SUPER_ADMIN })
    const token = `Bearer ${signAccessToken(admin)}`
    const created = await request(createApp()).post('/api/admin/festivals').set('Authorization', token).send({ name: '可恢复纪念日', month: 9, day: 9 }).expect(201)
    const archived = await request(createApp()).delete(`/api/admin/festivals/${created.body.data.id || created.body.data._id}`).set('Authorization', token).expect(200)
    expect(archived.body.data.deletedAt).toBeTruthy()
    expect(archived.body.data.enabled).toBe(false)
    const restored = await request(createApp()).post(`/api/admin/festivals/${created.body.data.id || created.body.data._id}/restore`).set('Authorization', token).expect(200)
    expect(restored.body.data.deletedAt).toBeNull()
    expect(restored.body.data.enabled).toBe(true)
  })
})
