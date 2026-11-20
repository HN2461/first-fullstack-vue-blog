import request from 'supertest'
import * as XLSX from 'xlsx'
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

function buildLedgerWorkbookBuffer(options = {}) {
  const workbook = XLSX.utils.book_new()
  const rows = Array.from({ length: 20 }, () => [])
  rows[0] = ['2026年6月收支概览']
  rows[17] = ['2026年6月份收支明细']
  rows[18] = ['', '支出', '', '', '', '', '', '', '当日计算', '', '', '收入']
  rows[19] = ['日期', '早餐', '午餐', '晚餐', '杂费', '电费', '房租', '工作所需', '当日吃饭总支出', '当日总支出', '当日逆差', '工资', '奖金', '其他收入', '当日备注']
  rows.push(['2026/06/01', options.firstBreakfast ?? 3, 19.9, 3, '', '', '', '', 25.9, 25.9, 0, '', '', '', ''])
  rows.push(['2026/06/02', 3, 21, 10.7, 50.5, '', '', '', 34.7, 85.2, 50.5, '', '', '', '日用品'])
  rows.push(['2026/06/03', '', '', '', '', '', '', '', 0, 0, 0, '', '', '', '只有备注'])
  rows.push(['2026/06/04', '', '', '', '', '', '', '', 0, 0, 0, 5000, '', 200, '发工资'])
  if (options.fifthBreakfast !== undefined) {
    rows.push(['2026/06/05', options.fifthBreakfast, '', '', '', '', '', '', 0, 0, 0, '', '', '', ''])
  }
  if (options.trailingFormulaRows) {
    rows[50] = Array(15).fill('')
    rows[51] = Array(15).fill('')
  }
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  if (options.trailingFormulaRows) {
    sheet.I51 = { t: 'n', v: 0, f: 'SUM(B51:D51)' }
    sheet.J51 = { t: 'n', v: 0, f: 'SUM(B51:H51)' }
    sheet.K51 = { t: 'n', v: 0, f: 'J51-I51' }
    sheet.I52 = { t: 'n', v: 0, f: 'SUM(B52:D52)' }
    sheet.K52 = { t: 'n', v: 0, f: 'J52-I52' }
  }
  sheet.C21.c = [{ a: 'Author', t: '大盘鸡面' }]
  sheet.E22.c = [{ a: 'Author', t: '50（话费），0.5（打包费）' }]
  sheet.L24.c = [{ a: 'Author', t: '6月工资' }]
  XLSX.utils.book_append_sheet(workbook, sheet, options.sheetName || '2026年6月份收支明细')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), '模版')
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })
}

describe('ledger Excel import synchronization', () => {
  let app
  let user
  let token
  let bookId

  beforeAll(connectTestDatabase)

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    await ensureRbacSeed()
    const role = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR })
    user = await User.create({
      username: 'ledger-import-user',
      email: 'ledger-import-user@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.USER,
      roles: [role._id]
    })
    token = signAccessToken(user)
    const bookResponse = await request(app)
      .post('/api/ledger/books')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '导入测试账本' })
      .expect(201)
    bookId = bookResponse.body.data.id
  })

  afterAll(disconnectTestDatabase)

  async function previewAndCommit(buffer) {
    const previewResponse = await request(app)
      .post('/api/ledger/imports/preview')
      .set('Authorization', `Bearer ${token}`)
      .field('bookId', bookId)
      .attach('file', buffer, 'ledger.xlsx')
      .expect(200)

    const commitResponse = await request(app)
      .post(`/api/ledger/imports/${previewResponse.body.data.id}/commit`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    return { previewResponse, commitResponse }
  }

  it('commits monthly Excel data idempotently with comments and daily notes', async () => {
    const { previewResponse } = await previewAndCommit(buildLedgerWorkbookBuffer())

    expect(previewResponse.body.data.stats).toMatchObject({ sheets: 1, inserted: 9, deleted: 0 })
    expect(previewResponse.body.data.previewItems.map((item) => item.categoryName)).toEqual(expect.arrayContaining(['早餐', '午餐', '工资', '其他收入']))
    expect(previewResponse.body.data.previewItems.find((item) => item.categoryName === '午餐' && item.rowNumber === 21).note).toBe('大盘鸡面')
    expect(previewResponse.body.data.previewItems.find((item) => item.categoryName === '杂费' && item.rowNumber === 22)).toMatchObject({
      note: '50（话费），0.5（打包费）',
      dailyNote: '日用品'
    })
    expect(previewResponse.body.data.previewItems.some((item) => item.note === '只有备注')).toBe(false)
    expect(await LedgerEntry.countDocuments({ userId: user._id })).toBe(9)

    const second = await previewAndCommit(buildLedgerWorkbookBuffer())
    expect(second.previewResponse.body.data.stats).toMatchObject({ updated: 9, deleted: 0 })
    expect(await LedgerEntry.countDocuments({ userId: user._id })).toBe(9)
  })

  it('lists previewed and committed imports by book without losing repeated import history', async () => {
    const previewResponse = await request(app)
      .post('/api/ledger/imports/preview')
      .set('Authorization', `Bearer ${token}`)
      .field('bookId', bookId)
      .attach('file', buildLedgerWorkbookBuffer(), 'ledger.xlsx')
      .expect(200)
    const firstBatchId = previewResponse.body.data.id

    const previewList = await request(app)
      .get('/api/ledger/imports')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId })
      .expect(200)

    expect(previewList.body.data.total).toBe(1)
    expect(previewList.body.data.items[0]).toMatchObject({ id: firstBatchId, bookId, status: 'previewed' })

    await request(app)
      .post(`/api/ledger/imports/${firstBatchId}/commit`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    const second = await previewAndCommit(buildLedgerWorkbookBuffer())
    const secondBatchId = second.previewResponse.body.data.id
    expect(secondBatchId).not.toBe(firstBatchId)

    // 相同文件重新预览会生成独立批次，流水幂等不能导致历史批次被覆盖。
    const firstPage = await request(app)
      .get('/api/ledger/imports')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId, page: 1, pageSize: 1 })
      .expect(200)
    const secondPage = await request(app)
      .get('/api/ledger/imports')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId, page: 2, pageSize: 1 })
      .expect(200)

    expect(firstPage.body.data).toMatchObject({ total: 2, page: 1, pageSize: 1 })
    expect(secondPage.body.data).toMatchObject({ total: 2, page: 2, pageSize: 1 })
    expect(firstPage.body.data.items).toHaveLength(1)
    expect(secondPage.body.data.items).toHaveLength(1)
    expect(firstPage.body.data.items[0]).toMatchObject({
      id: secondBatchId,
      bookId,
      status: 'committed',
      stats: { inserted: 0, updated: 9 }
    })
    expect(secondPage.body.data.items[0]).toMatchObject({
      id: firstBatchId,
      bookId,
      status: 'committed',
      stats: { inserted: 9, updated: 0 }
    })
    expect(firstPage.body.data.items[0].committedAt).toBeTruthy()
    expect(secondPage.body.data.items[0].committedAt).toBeTruthy()
  })

  it('isolates import history by book and user', async () => {
    await previewAndCommit(buildLedgerWorkbookBuffer())
    const otherBook = await request(app)
      .post('/api/ledger/books')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '没有导入记录的账本' })
      .expect(201)

    const otherBookList = await request(app)
      .get('/api/ledger/imports')
      .set('Authorization', `Bearer ${token}`)
      .query({ bookId: otherBook.body.data.id })
      .expect(200)
    expect(otherBookList.body.data).toMatchObject({ items: [], total: 0 })

    const otherUser = await User.create({
      username: 'other-ledger-import-user',
      email: 'other-ledger-import-user@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.USER,
      roles: user.roles
    })
    const otherToken = signAccessToken(otherUser)
    const otherUserList = await request(app)
      .get('/api/ledger/imports')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200)
    expect(otherUserList.body.data).toMatchObject({ items: [], total: 0 })

    const forbiddenBookList = await request(app)
      .get('/api/ledger/imports')
      .set('Authorization', `Bearer ${otherToken}`)
      .query({ bookId })
      .expect(404)
    expect(forbiddenBookList.body.code).toBe('LEDGER_BOOK_NOT_FOUND')
  })

  it('deletes cleared Excel cells without deleting manual entries', async () => {
    await previewAndCommit(buildLedgerWorkbookBuffer())
    const breakfast = await LedgerEntry.findOne({ userId: user._id, categoryNameSnapshot: '早餐' })
    await LedgerEntry.create({
      userId: user._id,
      bookId,
      occurredAt: '2026-06-05',
      type: 'expense',
      categoryId: breakfast.categoryId,
      categoryNameSnapshot: '早餐',
      amount: 8,
      source: 'manual'
    })

    const previewResponse = await request(app)
      .post('/api/ledger/imports/preview')
      .set('Authorization', `Bearer ${token}`)
      .field('bookId', bookId)
      .attach('file', buildLedgerWorkbookBuffer({ firstBreakfast: '' }), 'ledger.xlsx')
      .expect(200)

    expect(previewResponse.body.data.stats).toMatchObject({ updated: 8, deleted: 1 })
    expect(previewResponse.body.data.previewItems.find((item) => item.action === 'delete')).toMatchObject({
      categoryName: '早餐',
      amount: 3
    })

    const commitResponse = await request(app)
      .post(`/api/ledger/imports/${previewResponse.body.data.id}/commit`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(commitResponse.body.data.stats.deleted).toBe(1)
    expect(await LedgerEntry.countDocuments({ userId: user._id, source: 'excel_import' })).toBe(8)
    expect(await LedgerEntry.countDocuments({ userId: user._id, source: 'manual', amount: 8 })).toBe(1)
  })

  it('does not delete Excel entries for date rows omitted from a partial workbook', async () => {
    await previewAndCommit(buildLedgerWorkbookBuffer({ fifthBreakfast: 4 }))

    const second = await previewAndCommit(buildLedgerWorkbookBuffer())

    expect(second.previewResponse.body.data.stats.deleted).toBe(0)
    expect(await LedgerEntry.countDocuments({ userId: user._id, source: 'excel_import' })).toBe(10)
    expect(await LedgerEntry.countDocuments({
      userId: user._id,
      source: 'excel_import',
      categoryNameSnapshot: '早餐',
      amount: 4
    })).toBe(1)
  })

  it('imports a short month sheet name when the page title identifies the month', async () => {
    const { previewResponse } = await previewAndCommit(buildLedgerWorkbookBuffer({ sheetName: '2026年06' }))

    expect(previewResponse.body.data.stats).toMatchObject({ sheets: 1, inserted: 9, errors: 0 })
    expect(await LedgerEntry.countDocuments({ userId: user._id, source: 'excel_import' })).toBe(9)
  })

  it('ignores trailing formula-only rows without reporting date errors', async () => {
    const { previewResponse } = await previewAndCommit(buildLedgerWorkbookBuffer({ trailingFormulaRows: true }))

    expect(previewResponse.body.data.stats).toMatchObject({ sheets: 1, inserted: 9, errors: 0 })
  })
})
