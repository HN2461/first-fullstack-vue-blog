import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { BUILTIN_ROLE_CODES, USER_ROLES } from '#constants/domain'
import { createApp } from '../src/app.js'
import { LedgerEntry } from '#modules/ledger/models/LedgerEntry.js'
import { Role } from '#modules/rbac/models/Role.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { User } from '#modules/user/models/User.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

describe('ledger summary comparison route', () => {
  let app
  let user
  let token

  beforeAll(connectTestDatabase)

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    await ensureRbacSeed()
    const role = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR })
    user = await User.create({
      username: 'ledger-comparison-user',
      email: 'ledger-comparison@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.USER,
      roles: [role._id]
    })
    token = signAccessToken(user)
  })

  afterAll(disconnectTestDatabase)

  it('returns the natural previous-month progress and meaningful balance change', async () => {
    const booksResponse = await request(app)
      .get('/api/ledger/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    const bookId = booksResponse.body.data[0].id
    const categoriesResponse = await request(app)
      .get('/api/ledger/categories')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId })
      .expect(200)
    const salary = categoriesResponse.body.data.find((item) => item.name === '工资')
    const breakfast = categoriesResponse.body.data.find((item) => item.name === '早餐')

    await LedgerEntry.insertMany([
      { userId: user._id, bookId, occurredAt: '2026-05-31', type: 'income', categoryId: salary.id, categoryNameSnapshot: salary.name, amount: 9999 },
      { userId: user._id, bookId, occurredAt: '2026-06-10', type: 'income', categoryId: salary.id, categoryNameSnapshot: salary.name, amount: 5000 },
      { userId: user._id, bookId, occurredAt: '2026-06-10', type: 'expense', categoryId: breakfast.id, categoryNameSnapshot: breakfast.name, amount: 8000 },
      { userId: user._id, bookId, occurredAt: '2026-07-10', type: 'income', categoryId: salary.id, categoryNameSnapshot: salary.name, amount: 5000 },
      { userId: user._id, bookId, occurredAt: '2026-07-10', type: 'expense', categoryId: breakfast.id, categoryNameSnapshot: breakfast.name, amount: 2000 }
    ])

    const response = await request(app)
      .get('/api/ledger/summary')
      .set('Authorization', `Bearer ${token}`)
      .query({
        bookId,
        from: '2026-07-01',
        to: '2026-07-20',
        period: 'thisMonth',
        groupBy: 'day'
      })
      .expect(200)

    expect(response.body.data.overview).toMatchObject({ income: 5000, expense: 2000, balance: 3000 })
    expect(response.body.data.previousPeriod).toMatchObject({
      from: '2026-06-01',
      to: '2026-06-20',
      income: 5000,
      expense: 8000,
      balance: -3000,
      changeRate: { income: 0, expense: -75, balance: null },
      changeAmount: { income: 0, expense: -6000, balance: 6000 }
    })
  })
})
