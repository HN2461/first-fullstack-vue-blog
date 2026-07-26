import request from 'supertest'
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest'
import { BUILTIN_ROLE_CODES, USER_ROLES } from '#constants/domain'
import { createApp } from '../src/app.js'
import { Role } from '#modules/rbac/models/Role.js'
import { LedgerBook } from '#modules/ledger/models/LedgerBook.js'
import { User } from '#modules/user/models/User.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function createUserWithRole(roleCode, overrides = {}) {
  const role = await Role.findOne({ code: roleCode })
  return User.create({
    username: overrides.username || roleCode,
    email: overrides.email || `${roleCode}-${Date.now()}-${Math.random()}@example.com`,
    passwordHash: 'hashed-password',
    role: overrides.legacyRole || USER_ROLES.USER,
    roles: role ? [role._id] : [],
    ...overrides
  })
}

describe('ledger moment routes', () => {
  let app
  let user
  let token

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    await ensureRbacSeed()
    user = await createUserWithRole(BUILTIN_ROLE_CODES.VISITOR, {
      username: 'ledger-moment-user',
      email: 'ledger-moment-user@example.com'
    })
    token = signAccessToken(user)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('allows legacy edit payloads with the current book id but rejects book moves', async () => {
    const booksResponse = await request(app)
      .get('/api/ledger/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    const bookId = booksResponse.body.data[0].id

    const created = await request(app)
      .post('/api/ledger/moments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bookId,
        title: '助学贷款分期还款分担记录',
        scope: 'day',
        occurredAt: '2026-02-22',
        amount: 32224.72,
        categoryText: '助学贷款',
        mood: '感恩、债务分担、减轻压力',
        content: '记录助学贷款分期还款安排。',
        tags: ['助学贷款', '家人分担', '分期利息'],
        pinned: true
      })
      .expect(201)

    const updated = await request(app)
      .patch(`/api/ledger/moments/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        bookId,
        title: '助学贷款分期还款分担记录已确认',
        categoryText: '助学贷款'
      })
      .expect(200)

    expect(updated.body.data).toMatchObject({
      bookId,
      title: '助学贷款分期还款分担记录已确认',
      categoryText: '助学贷款'
    })

    const otherBook = await LedgerBook.create({
      userId: user._id,
      name: '另一个账本'
    })

    const rejected = await request(app)
      .patch(`/api/ledger/moments/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        bookId: otherBook._id.toString(),
        title: '尝试移动账本'
      })
      .expect(400)

    expect(rejected.body.message).toBe('重要记录所属账本不支持修改')
  })
})
