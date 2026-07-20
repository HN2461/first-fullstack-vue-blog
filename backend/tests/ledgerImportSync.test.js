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
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  sheet.C21.c = [{ a: 'Author', t: '大盘鸡面' }]
  sheet.E22.c = [{ a: 'Author', t: '50（话费），0.5（打包费）' }]
  sheet.L24.c = [{ a: 'Author', t: '6月工资' }]
  XLSX.utils.book_append_sheet(workbook, sheet, '2026年6月份收支明细')
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
    const booksResponse = await request(app)
      .get('/api/ledger/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    bookId = booksResponse.body.data[0].id
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
})
