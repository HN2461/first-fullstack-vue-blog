import request from 'supertest'
import * as XLSX from 'xlsx'
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest'
import { BUILTIN_ROLE_CODES, USER_ROLES } from '#constants/domain'
import { createApp } from '../src/app.js'
import { Role } from '#modules/rbac/models/Role.js'
import { LedgerBook } from '#modules/ledger/models/LedgerBook.js'
import { LedgerEntry } from '#modules/ledger/models/LedgerEntry.js'
import { LedgerMoment } from '#modules/ledger/models/LedgerMoment.js'
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

function buildLedgerWorkbookBuffer() {
  const wb = XLSX.utils.book_new()
  const rows = Array.from({ length: 20 }, () => [])
  rows[0] = ['2026年6月收支概览']
  rows[17] = ['2026年6月份收支明细']
  rows[18] = ['', '支出', '', '', '', '', '', '', '当日计算', '', '', '收入']
  rows[19] = ['日期', '早餐', '午餐', '晚餐', '杂费', '电费', '房租', '工作所需', '当日吃饭总支出', '当日总支出', '当日逆差', '工资', '奖金', '其他收入', '当日备注']
  rows.push(['2026/06/01', 3, 19.9, 3, '', '', '', '', 25.9, 25.9, 0, '', '', '', ''])
  rows.push(['2026/06/02', 3, 21, 10.7, 50.5, '', '', '', 34.7, 85.2, 50.5, '', '', '', '日用品'])
  rows.push(['2026/06/03', '', '', '', '', '', '', '', 0, 0, 0, '', '', '', '只有备注'])
  rows.push(['2026/06/04', '', '', '', '', '', '', '', 0, 0, 0, 5000, '', 200, '发工资'])
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  sheet.C21.c = [{ a: 'Author', t: '大盘鸡面' }]
  sheet.E22.c = [{ a: 'Author', t: '50（话费），0.5（打包费）' }]
  sheet.L24.c = [{ a: 'Author', t: '6月工资' }]
  XLSX.utils.book_append_sheet(wb, sheet, '2026年6月份收支明细')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), '模版')
  return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })
}

describe('ledger routes', () => {
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
      username: 'ledger-user',
      email: 'ledger-user@example.com'
    })
    token = signAccessToken(user)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('creates a private default book and default categories for the current user', async () => {
    const response = await request(app)
      .get('/api/ledger/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0]).toMatchObject({
      name: '默认账本',
      currency: 'CNY'
    })

    const categoriesResponse = await request(app)
      .get('/api/ledger/categories')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId: response.body.data[0].id })
      .expect(200)

    expect(categoriesResponse.body.data.map((item) => item.name)).toEqual(expect.arrayContaining(['早餐', '工资']))
  })

  it('keeps books and entries isolated by user', async () => {
    const other = await createUserWithRole(BUILTIN_ROLE_CODES.VISITOR, {
      username: 'other-ledger-user',
      email: 'other-ledger-user@example.com'
    })
    const otherToken = signAccessToken(other)
    const book = await LedgerBook.create({
      userId: other._id,
      name: '别人的账本'
    })

    await request(app)
      .patch(`/api/ledger/books/${book._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '越权修改' })
      .expect(404)

    const response = await request(app)
      .get('/api/ledger/books')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200)

    expect(response.body.data.some((item) => item.name === '别人的账本')).toBe(true)
  })

  it('blocks ledger APIs when the role does not include the ledger menu', async () => {
    const visitorRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR }).populate('menuIds')
    visitorRole.menuIds = visitorRole.menuIds
      .filter((menu) => !menu.code?.startsWith('knowledge.ledger'))
      .map((menu) => menu._id)
    await visitorRole.save()

    await request(app)
      .get('/api/ledger/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
  })

  it('previews and commits yuque monthly Excel ledger without duplicate entries', async () => {
    const booksResponse = await request(app)
      .get('/api/ledger/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    const bookId = booksResponse.body.data[0].id

    const previewResponse = await request(app)
      .post('/api/ledger/imports/preview')
      .set('Authorization', `Bearer ${token}`)
      .field('bookId', bookId)
      .attach('file', buildLedgerWorkbookBuffer(), 'ledger.xlsx')
      .expect(200)

    expect(previewResponse.body.data.stats.sheets).toBe(1)
    expect(previewResponse.body.data.stats.inserted).toBe(9)
    expect(previewResponse.body.data.previewItems.map((item) => item.categoryName)).toEqual(expect.arrayContaining(['早餐', '午餐', '工资', '其他收入']))
    expect(previewResponse.body.data.previewItems.find((item) => item.categoryName === '午餐' && item.rowNumber === 21).note).toBe('大盘鸡面')
    expect(previewResponse.body.data.previewItems.find((item) => item.categoryName === '杂费' && item.rowNumber === 22).note).toBe('50（话费），0.5（打包费）')
    expect(previewResponse.body.data.previewItems.find((item) => item.categoryName === '杂费' && item.rowNumber === 22).dailyNote).toBe('日用品')
    expect(previewResponse.body.data.previewItems.some((item) => item.note === '只有备注')).toBe(false)

    await request(app)
      .post(`/api/ledger/imports/${previewResponse.body.data.id}/commit`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(await LedgerEntry.countDocuments({ userId: user._id })).toBe(9)
    const importedMisc = await LedgerEntry.findOne({ userId: user._id, categoryNameSnapshot: '杂费' })
    expect(importedMisc.note).toBe('50（话费），0.5（打包费）')
    expect(importedMisc.dailyNote).toBe('日用品')

    const secondPreviewResponse = await request(app)
      .post('/api/ledger/imports/preview')
      .set('Authorization', `Bearer ${token}`)
      .field('bookId', bookId)
      .attach('file', buildLedgerWorkbookBuffer(), 'ledger.xlsx')
      .expect(200)

    expect(secondPreviewResponse.body.data.stats.updated).toBe(9)
    await request(app)
      .post(`/api/ledger/imports/${secondPreviewResponse.body.data.id}/commit`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(await LedgerEntry.countDocuments({ userId: user._id })).toBe(9)
  })

  it('summarizes income expense category day month and calendar data', async () => {
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
    const breakfast = categoriesResponse.body.data.find((item) => item.name === '早餐')
    const salary = categoriesResponse.body.data.find((item) => item.name === '工资')

    await request(app)
      .post('/api/ledger/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bookId,
        occurredAt: '2026-06-01',
        type: 'expense',
        categoryId: breakfast.id,
        amount: 10,
        note: '早餐',
        dailyNote: '当天总结'
      })
      .expect(201)

    await request(app)
      .post('/api/ledger/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bookId,
        occurredAt: '2026-06-01',
        type: 'income',
        categoryId: salary.id,
        amount: 100,
        note: '工资'
      })
      .expect(201)

    const sortedByAmountResponse = await request(app)
      .get('/api/ledger/entries')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId, sortField: 'amount', sortOrder: 'asc' })
      .expect(200)
    expect(sortedByAmountResponse.body.data.items.map((item) => item.amount)).toEqual([10, 100])

    const response = await request(app)
      .get('/api/ledger/summary')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId })
      .expect(200)

    expect(response.body.data.overview).toMatchObject({
      income: 100,
      expense: 10,
      balance: 90,
      averageDailyExpense: 10,
      maxDailyExpense: 10
    })
    expect(response.body.data.byCategory[0]).toMatchObject({ name: '早餐', amount: 10 })
    expect(response.body.data.byIncomeCategory[0]).toMatchObject({ name: '工资', amount: 100 })
    expect(response.body.data.byDay[0]).toMatchObject({ date: '2026-06-01', expense: 10, income: 100 })
    expect(response.body.data.byMonth[0]).toMatchObject({ month: '2026-06', balance: 90 })
    expect(response.body.data.calendar[0]).toEqual(['2026-06-01', 10])

    const incomeResponse = await request(app)
      .get('/api/ledger/summary')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId, type: 'income' })
      .expect(200)
    expect(incomeResponse.body.data.overview).toMatchObject({ income: 100, expense: 0, balance: 100 })
    expect(incomeResponse.body.data.byIncomeCategory[0]).toMatchObject({ name: '工资', amount: 100 })

    const breakfastResponse = await request(app)
      .get('/api/ledger/summary')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId, categoryId: breakfast.id })
      .expect(200)
    expect(breakfastResponse.body.data.overview).toMatchObject({ income: 0, expense: 10, balance: -10 })
    expect(breakfastResponse.body.data.byCategory).toHaveLength(1)
    expect(breakfastResponse.body.data.byCategory[0]).toMatchObject({ name: '早餐', amount: 10 })

    const yearResponse = await request(app)
      .get('/api/ledger/summary')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId, groupBy: 'year' })
      .expect(200)
    expect(yearResponse.body.data.trend[0]).toMatchObject({ label: '2026', balance: 90 })

    const dailyResponse = await request(app)
      .get('/api/ledger/daily')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId })
      .expect(200)
    expect(dailyResponse.body.data.items[0].dailyNote).toBe('当天总结')
    expect(dailyResponse.body.data.items[0].categoryAmounts[breakfast.id]).toBe(10)

    const dailyIncomeResponse = await request(app)
      .get('/api/ledger/daily')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId, type: 'income', categoryId: salary.id })
      .expect(200)
    expect(dailyIncomeResponse.body.data.items[0].expense).toBe(0)
    expect(dailyIncomeResponse.body.data.items[0].income).toBe(100)
    expect(dailyIncomeResponse.body.data.items[0].categoryAmounts[salary.id]).toBe(100)
    expect(dailyIncomeResponse.body.data.items[0].categoryAmounts[breakfast.id]).toBeUndefined()

    const insightResponse = await request(app)
      .get('/api/ledger/insights')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId, categoryId: breakfast.id, from: '2026-06-01', to: '2026-06-30' })
      .expect(200)
    expect(insightResponse.body.data.totalExpense).toBe(10)
    expect(insightResponse.body.data.mealExpense).toBe(10)
  })

  it('batch updates only owned ledger entries', async () => {
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
    const breakfast = categoriesResponse.body.data.find((item) => item.name === '早餐')
    const lunch = categoriesResponse.body.data.find((item) => item.name === '午餐')

    const first = await request(app)
      .post('/api/ledger/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookId, occurredAt: '2026-06-01', type: 'expense', categoryId: breakfast.id, amount: 10 })
      .expect(201)
    const second = await request(app)
      .post('/api/ledger/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookId, occurredAt: '2026-06-02', type: 'expense', categoryId: breakfast.id, amount: 12 })
      .expect(201)

    await request(app)
      .patch('/api/ledger/entries/batch')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ids: [first.body.data.id, second.body.data.id],
        patch: {
          categoryId: lunch.id,
          note: '批量备注',
          dailyNote: '批量当日总结'
        }
      })
      .expect(200)

    const entries = await LedgerEntry.find({ userId: user._id }).sort({ occurredAt: 1 })
    expect(entries.map((item) => item.categoryNameSnapshot)).toEqual(['午餐', '午餐'])
    expect(entries[0].note).toBe('批量备注')
    expect(entries[0].dailyNote).toBe('批量当日总结')
  })

  it('does not let overview-only ledger permission mutate entries', async () => {
    const role = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR }).populate('menuIds')
    role.menuIds = role.menuIds
      .filter((menu) => ['knowledge.root', 'knowledge.ledger', 'knowledge.ledger.overview'].includes(menu.code))
      .map((menu) => menu._id)
    await role.save()

    const booksResponse = await request(app)
      .get('/api/ledger/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    const bookId = booksResponse.body.data[0].id

    await request(app)
      .get('/api/ledger/summary')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId })
      .expect(200)

    await request(app)
      .post('/api/ledger/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookId, occurredAt: '2026-06-01', type: 'expense', categoryId: '000000000000000000000000', amount: 10 })
      .expect(403)
  })

  it('creates and isolates important ledger moments', async () => {
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
    const breakfast = categoriesResponse.body.data.find((item) => item.name === '早餐')

    const created = await request(app)
      .post('/api/ledger/moments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bookId,
        title: '第一次大额支出',
        scope: 'month',
        occurredAt: '2026-06-01',
        amount: 1888,
        categoryId: breakfast.id,
        categoryText: '家庭事项',
        mood: '值得记住',
        content: '这笔钱很有意义，之后想回头看看。',
        tags: ['生活', ' ', '纪念', '生活'],
        pinned: true
      })
      .expect(201)

    expect(created.body.data).toMatchObject({
      title: '第一次大额支出',
      scope: 'month',
      amount: 1888,
      categoryText: '家庭事项',
      tags: ['生活', '纪念'],
      pinned: true
    })

    const listResponse = await request(app)
      .get('/api/ledger/moments')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId, keyword: '意义' })
      .expect(200)

    expect(listResponse.body.data.items).toHaveLength(1)

    const categoryListResponse = await request(app)
      .get('/api/ledger/moments')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId, categoryId: breakfast.id })
      .expect(200)

    expect(categoryListResponse.body.data.items).toHaveLength(1)
    expect(categoryListResponse.body.data.items[0].category).toMatchObject({ name: '早餐' })

    await request(app)
      .patch(`/api/ledger/moments/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '六月大额支出', categoryId: null, categoryText: '阶段目标' })
      .expect(200)

    const updatedListResponse = await request(app)
      .get('/api/ledger/moments')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId, keyword: '阶段目标' })
      .expect(200)

    expect(updatedListResponse.body.data.items[0]).toMatchObject({
      title: '六月大额支出',
      categoryId: null,
      categoryText: '阶段目标'
    })

    const other = await createUserWithRole(BUILTIN_ROLE_CODES.VISITOR, {
      username: 'other-moment-user',
      email: 'other-moment-user@example.com'
    })
    const otherToken = signAccessToken(other)

    await request(app)
      .delete(`/api/ledger/moments/${created.body.data.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404)

    await request(app)
      .delete(`/api/ledger/moments/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(await LedgerMoment.countDocuments({ userId: user._id })).toBe(0)
  })
})
