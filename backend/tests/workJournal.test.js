import fs from 'node:fs/promises'
import path from 'node:path'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { BUILTIN_ROLE_CODES, USER_ROLES } from '#constants/domain'
import { User } from '#modules/user/models/User.js'
import { Employment } from '#modules/workJournal/models/Employment.js'
import { WorkLog } from '#modules/workJournal/models/WorkLog.js'
import { WorkReport } from '#modules/workJournal/models/WorkReport.js'
import { Media } from '#modules/media/models/Media.js'
import { MediaCategory } from '#modules/media/models/MediaCategory.js'
import { listMedia } from '#modules/media/services/media.service.js'
import { resolvePrivateWorkJournalRoot } from '#modules/workJournal/services/workJournal.service.js'
import { resolveUploadRoot } from '#utils/uploadPath.js'
import { Menu } from '#modules/rbac/models/Menu.js'
import { Role } from '#modules/rbac/models/Role.js'
import { ensureRbacSeed, hydrateUserPermissions } from '#modules/rbac/services/rbac.service.js'
import { signAccessToken } from '../src/utils/jwt.js'
import { createApp } from '../src/app.js'
import { clearTestDatabase, connectTestDatabase, disconnectTestDatabase } from './helpers/testDatabase.js'

async function createUser(email) {
  const visitorRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR })
  return User.create({
    username: email.split('@')[0],
    email,
    passwordHash: 'hashed-password',
    role: USER_ROLES.USER,
    roles: visitorRole ? [visitorRole._id] : []
  })
}

describe('work journal routes', () => {
  let app
  let user
  let otherUser
  let token
  let otherToken
  let employment

  beforeAll(async () => connectTestDatabase())

  beforeEach(async () => {
    await clearTestDatabase()
    await fs.rm(resolvePrivateWorkJournalRoot(), { recursive: true, force: true })
    await fs.rm(path.join(resolveUploadRoot(), 'work-journal'), { recursive: true, force: true })
    app = createApp()
    await ensureRbacSeed()
    user = await createUser('journal-user@example.com')
    otherUser = await createUser('journal-other@example.com')
    token = signAccessToken(user)
    otherToken = signAccessToken(otherUser)
    const response = await request(app)
      .post('/api/work-journal/employments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company: '甲方科技',
        position: '前端工程师',
        startedOn: '2026-01-05',
        probationSalary: '8K',
        regularSalary: '10K',
        salaryUnit: '月薪',
        workSchedule: '大小周',
        workStartTime: '09:00',
        workEndTime: '18:00',
        departureContactName: '李 HR',
        departureContactPhone: '13800001234',
        departureContactEmail: 'hr@example.com',
        workContent: '负责管理后台和数据看板开发',
        companyAddress: '深圳市南山区科技园 1 号楼'
      })
      .expect(201)
    employment = response.body.data
    expect(employment).toMatchObject({
      probationSalary: '8K',
      regularSalary: '10K',
      salaryUnit: '月薪',
      workSchedule: '大小周',
      workStartTime: '09:00',
      workEndTime: '18:00',
      departureContactName: '李 HR',
      departureContactPhone: '13800001234',
      departureContactEmail: 'hr@example.com',
      workContent: '负责管理后台和数据看板开发',
      companyAddress: '深圳市南山区科技园 1 号楼'
    })
  })

  afterAll(async () => {
    await fs.rm(resolvePrivateWorkJournalRoot(), { recursive: true, force: true })
    await fs.rm(path.join(resolveUploadRoot(), 'work-journal'), { recursive: true, force: true })
    await disconnectTestDatabase()
  })

  it('isolates employment records and work logs by user', async () => {
    const otherEmployment = await request(app)
      .post('/api/work-journal/employments')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ company: '乙方软件', position: '开发工程师', startedOn: '2026-03-01' })
      .expect(201)

    await request(app)
      .get('/api/work-journal/employments')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then((response) => expect(response.body.data.map((item) => item.id)).toEqual([employment.id]))

    await request(app)
      .post('/api/work-journal/logs')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ employmentId: employment.id, workDate: '2026-06-01', title: '越权' })
      .expect(404)

    await request(app)
      .patch(`/api/work-journal/employments/${otherEmployment.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ note: '越权' })
      .expect(404)
  })

  it('updates extended employment details independently', async () => {
    const response = await request(app)
      .patch(`/api/work-journal/employments/${employment.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ regularSalary: '11K', workSchedule: '双休', workStartTime: '08:30', companyAddress: '深圳市南山区新地址' })
      .expect(200)

    expect(response.body.data).toMatchObject({
      probationSalary: '8K',
      regularSalary: '11K',
      workSchedule: '双休',
      workStartTime: '08:30',
      companyAddress: '深圳市南山区新地址'
    })
    expect(await Employment.findById(employment.id)).toMatchObject({ regularSalary: '11K', workSchedule: '双休' })
  })

  it('creates one daily log per employment and rejects duplicate dates', async () => {
    const payload = { employmentId: employment.id, workDate: '2026-06-01', title: '完成订单查询页', accomplishments: '交付筛选与分页' }
    const created = await request(app)
      .post('/api/work-journal/logs')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201)
    expect(created.body.data).toMatchObject({ status: 'draft', version: 1, workDate: payload.workDate })

    await request(app)
      .post('/api/work-journal/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...payload, title: '重复日期' })
      .expect(409)

    expect(await WorkLog.countDocuments({ createdBy: user._id })).toBe(1)
  })

  it('snapshots finalized versions and returns a date range report', async () => {
    const first = await request(app)
      .post('/api/work-journal/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ employmentId: employment.id, workDate: '2026-06-01', title: '完成接口联调', accomplishments: '完成用户与订单接口联调', nextPlan: '推进验收', contentMarkdown: '记录关键响应样例和验收结论。' })
      .expect(201)

    const finalized = await request(app)
      .patch(`/api/work-journal/logs/${first.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'final' })
      .expect(200)
    expect(finalized.body.data.finalizedAt).toBeTruthy()

    const edited = await request(app)
      .patch(`/api/work-journal/logs/${first.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ accomplishments: '补充验收通过记录', status: 'final' })
      .expect(200)
    expect(edited.body.data).toMatchObject({ version: 2, revisionCount: 1, status: 'final' })

    const reopened = await request(app)
      .patch(`/api/work-journal/logs/${first.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'draft' })
      .expect(200)
    expect(reopened.body.data).toMatchObject({ version: 2, revisionCount: 2 })
    expect(reopened.body.data.revisions[1]).toMatchObject({ version: 2, accomplishments: '补充验收通过记录' })

    const draftEdit = await request(app)
      .patch(`/api/work-journal/logs/${first.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ accomplishments: '继续补充交接记录' })
      .expect(200)
    expect(draftEdit.body.data).toMatchObject({ version: 3, revisionCount: 2 })

    const report = await request(app)
      .get('/api/work-journal/reports')
      .query({ employmentId: employment.id, period: 'week', date: '2026-06-03' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(report.body.data).toMatchObject({ from: '2026-06-01', to: '2026-06-07' })
    expect(report.body.data.items).toHaveLength(1)
    expect(report.body.data.items[0].accomplishments).toBe('继续补充交接记录')
    expect(report.body.data.items[0].contentMarkdown).toBe('记录关键响应样例和验收结论。')
  })

  it('stores image evidence outside public uploads and authorizes reads by log owner', async () => {
    const created = await request(app)
      .post('/api/work-journal/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ employmentId: employment.id, workDate: '2026-06-01', title: '补充联调截图', summary: '接口联调完成' })
      .expect(201)

    const evidence = await request(app)
      .post(`/api/work-journal/logs/${created.body.data.id}/evidence`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from([0xff, 0xd8, 0xff, 0xd9]), '联调截图.jpg')
      .expect(201)

    expect(evidence.body.data).toMatchObject({ originalName: '联调截图.jpg', mimeType: 'image/jpeg' })
    expect(evidence.body.data.sha256).toMatch(/^[a-f0-9]{64}$/)
    const log = await WorkLog.findById(created.body.data.id)
    const media = await Media.findById(evidence.body.data.mediaId)
    const storedPath = media.storagePath
    const workCategory = await MediaCategory.findOne({ name: '工作日志', system: true, owner: null })
    expect(media).toMatchObject({ accessScope: 'private', category: '工作日志', categoryId: workCategory._id })
    expect(media.workJournalLog.toString()).toBe(log._id.toString())
    expect(log.evidence[0].mediaId.toString()).toBe(media._id.toString())
    expect(path.relative(path.join(resolveUploadRoot(), 'work-journal'), storedPath).startsWith('..')).toBe(false)
    const managedAssets = await listMedia({ category: '工作日志', actor: user })
    expect(managedAssets.items.map((item) => item.id)).toContain(media._id.toString())
    expect(managedAssets.items.find((item) => item.id === media._id.toString()).usage).toMatchObject({
      usageStatus: 'referenced',
      referenceCount: 1
    })
    expect(await fs.readFile(storedPath)).toEqual(Buffer.from([0xff, 0xd8, 0xff, 0xd9]))
    const publicRelativePath = path.relative(resolveUploadRoot(), storedPath).replace(/\\/g, '/')
    await request(app).get(`/uploads/${publicRelativePath}`).expect(404)

    await request(app)
      .get(media.url)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404)

    const managedImage = await request(app)
      .get(media.url)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(managedImage.headers['cache-control']).toContain('private')
    expect(managedImage.body).toEqual(Buffer.from([0xff, 0xd8, 0xff, 0xd9]))

    await request(app)
      .get(`/api/work-journal/logs/${created.body.data.id}/evidence/${evidence.body.data.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404)

    const downloaded = await request(app)
      .get(`/api/work-journal/logs/${created.body.data.id}/evidence/${evidence.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(downloaded.status, JSON.stringify({ body: downloaded.body, text: downloaded.text, headers: downloaded.headers })).toBe(200)
    expect(downloaded.headers['cache-control']).toContain('private')
    expect(downloaded.headers['x-content-type-options']).toBe('nosniff')
    expect(downloaded.body).toEqual(Buffer.from([0xff, 0xd8, 0xff, 0xd9]))

    await fs.writeFile(storedPath, Buffer.from('changed'))
    await request(app)
      .get(`/api/work-journal/logs/${created.body.data.id}/evidence/${evidence.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409)
    await fs.writeFile(storedPath, Buffer.from([0xff, 0xd8, 0xff, 0xd9]))

    await request(app)
      .delete(`/api/work-journal/logs/${created.body.data.id}/evidence/${evidence.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    await expect(fs.access(storedPath)).rejects.toThrow()
    expect(await Media.findById(media._id)).toBeNull()
  })

  it('rejects non-image payloads and cross-owner or menu-less requests', async () => {
    const created = await request(app)
      .post('/api/work-journal/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ employmentId: employment.id, workDate: '2026-06-01', title: '测试凭证' })
      .expect(201)

    await request(app)
      .post(`/api/work-journal/logs/${created.body.data.id}/evidence`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('<svg onload="alert(1)"></svg>'), 'payload.png')
      .expect(400)

    await request(app)
      .delete(`/api/work-journal/logs/${created.body.data.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404)

    const visitorRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR }).populate('menuIds')
    visitorRole.menuIds = visitorRole.menuIds
      .filter((menu) => !menu.code?.startsWith('knowledge.workjournal.') && menu.code !== 'knowledge.workjournal' && menu.code !== 'knowledge.root')
      .map((menu) => menu._id)
    await visitorRole.save()
    const permissions = await hydrateUserPermissions(user)
    expect(permissions.permissions.menuPaths).not.toContain('/console/work-journal/daily')
    await request(app).get('/api/work-journal/employments').set('Authorization', `Bearer ${token}`).expect(403)
  })

  it('exports work logs and evidence as a private zip', async () => {
    const created = await request(app)
      .post('/api/work-journal/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ employmentId: employment.id, workDate: '2026-06-01', title: '交付记录', accomplishments: '交付版本' })
      .expect(201)
    await request(app)
      .post(`/api/work-journal/logs/${created.body.data.id}/evidence`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from([0xff, 0xd8, 0xff, 0xd9]), 'proof.jpg')
      .expect(201)

    const response = await request(app)
      .get('/api/work-journal/export')
      .query({ employmentId: employment.id })
      .set('Authorization', `Bearer ${token}`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => callback(null, Buffer.concat(chunks)))
      })
      .expect(200)
    expect(response.headers['content-type']).toContain('application/zip')
    expect(response.headers['cache-control']).toContain('private')
    expect(response.body.subarray(0, 2).toString()).toBe('PK')
  })

  it('keeps evidence in the trash and restores the complete work log', async () => {
    const created = await request(app)
      .post('/api/work-journal/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ employmentId: employment.id, workDate: '2026-06-01', title: '保留凭证的记录', accomplishments: '完成交付' })
      .expect(201)
    const evidence = await request(app)
      .post(`/api/work-journal/logs/${created.body.data.id}/evidence`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from([0xff, 0xd8, 0xff, 0xd9]), '交付截图.jpg')
      .expect(201)
    const log = await WorkLog.findById(created.body.data.id)
    const media = await Media.findById(evidence.body.data.mediaId)
    const filePath = media.storagePath

    await request(app)
      .delete(`/api/work-journal/logs/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const activeList = await request(app)
      .get('/api/work-journal/logs')
      .query({ employmentId: employment.id })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(activeList.body.data.total).toBe(0)
    const trashedMedia = await Media.findById(evidence.body.data.mediaId)
    expect(trashedMedia.deletedAt).toBeTruthy()

    const trash = await request(app)
      .get('/api/work-journal/trash')
      .query({ employmentId: employment.id })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(trash.body.data.items[0]).toMatchObject({ id: created.body.data.id, deletedAt: expect.any(String) })
    expect(trash.body.data.items[0].evidence).toHaveLength(1)
    await expect(fs.access(filePath)).resolves.toBeUndefined()
    await request(app)
      .get(`/api/work-journal/logs/${created.body.data.id}/evidence/${evidence.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const restored = await request(app)
      .post(`/api/work-journal/logs/${created.body.data.id}/restore`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(restored.body.data).toMatchObject({ deletedAt: null, title: '保留凭证的记录' })
    expect((await Media.findById(evidence.body.data.mediaId)).deletedAt).toBeNull()
    await request(app)
      .get(`/api/work-journal/logs/${created.body.data.id}/evidence/${evidence.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })

  it('creates, lists, edits, finalizes, and deletes saved weekly and monthly reports', async () => {
    for (const workDate of ['2026-06-01', '2026-06-03', '2026-06-14']) {
      await request(app)
        .post('/api/work-journal/logs')
        .set('Authorization', `Bearer ${token}`)
        .send({ employmentId: employment.id, workDate, title: `工作记录 ${workDate}`, accomplishments: '完成计划事项' })
        .expect(201)
    }

    const weekly = await request(app)
      .post('/api/work-journal/saved-reports')
      .set('Authorization', `Bearer ${token}`)
      .send({ employmentId: employment.id, period: 'week', date: '2026-06-03' })
      .expect(201)
    expect(weekly.body.data).toMatchObject({
      period: 'week',
      fromDate: '2026-06-01',
      toDate: '2026-06-07',
      status: 'draft',
      company: '甲方科技'
    })
    expect(weekly.body.data.contentMarkdown).toContain('工作记录 2026-06-01')

    await request(app)
      .post('/api/work-journal/saved-reports')
      .set('Authorization', `Bearer ${token}`)
      .send({ employmentId: employment.id, period: 'week', date: '2026-06-05' })
      .expect(409)

    const edited = await request(app)
      .patch(`/api/work-journal/saved-reports/${weekly.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '六月第一周进展', contentMarkdown: '# 第一周\n\n完成三项交付。' })
      .expect(200)
    expect(edited.body.data).toMatchObject({ title: '六月第一周进展', status: 'draft' })

    const finalized = await request(app)
      .patch(`/api/work-journal/saved-reports/${weekly.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'final' })
      .expect(200)
    expect(finalized.body.data.finalizedAt).toBeTruthy()

    const monthly = await request(app)
      .post('/api/work-journal/saved-reports')
      .set('Authorization', `Bearer ${token}`)
      .send({ employmentId: employment.id, period: 'month', date: '2026-06-11' })
      .expect(201)
    expect(monthly.body.data).toMatchObject({ fromDate: '2026-06-01', toDate: '2026-06-30' })

    const list = await request(app)
      .get('/api/work-journal/saved-reports')
      .query({ employmentId: employment.id, period: 'week' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(list.body.data.items).toHaveLength(1)
    expect(list.body.data.items[0].title).toBe('六月第一周进展')

    await request(app)
      .delete(`/api/work-journal/saved-reports/${weekly.body.data.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404)
    await request(app)
      .delete(`/api/work-journal/saved-reports/${weekly.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })

  it('deletes a work experience with its logs, reports, and private evidence', async () => {
    const created = await request(app)
      .post('/api/work-journal/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ employmentId: employment.id, workDate: '2026-06-01', title: '关联数据清理验证', accomplishments: '验证经历删除' })
      .expect(201)
    await request(app)
      .post(`/api/work-journal/logs/${created.body.data.id}/evidence`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from([0xff, 0xd8, 0xff, 0xd9]), 'proof.jpg')
      .expect(201)
    await request(app)
      .post('/api/work-journal/saved-reports')
      .set('Authorization', `Bearer ${token}`)
      .send({ employmentId: employment.id, period: 'month', date: '2026-06-01' })
      .expect(201)
    const log = await WorkLog.findById(created.body.data.id)
    const media = await Media.findById(log.evidence[0].mediaId)
    const filePath = media.storagePath

    await request(app)
      .delete(`/api/work-journal/employments/${employment.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404)

    await request(app)
      .delete(`/api/work-journal/employments/${employment.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(await Employment.countDocuments({ _id: employment.id })).toBe(0)
    expect(await WorkLog.countDocuments({ employment: employment.id })).toBe(0)
    expect(await fs.access(filePath).then(() => true, () => false)).toBe(false)
    const reports = await request(app)
      .get('/api/work-journal/saved-reports')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(reports.body.data.total).toBe(0)
  })

  it('enforces report-menu access separately from daily journal access', async () => {
    const reportMenus = await Menu.find({
      code: { $in: ['knowledge.workjournal.weekly', 'knowledge.workjournal.monthly'] }
    })
    const reportMenuIds = new Set(reportMenus.map((menu) => menu._id.toString()))
    const visitorRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR }).populate('menuIds')
    visitorRole.menuIds = visitorRole.menuIds
      .filter((menu) => !reportMenuIds.has(menu._id.toString()))
      .map((menu) => menu._id)
    await visitorRole.save()

    const daily = await request(app)
      .get('/api/work-journal/logs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(daily.body.data.items).toEqual([])

    await request(app)
      .get('/api/work-journal/saved-reports')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
  })

  it('requires authentication and the work journal menu', async () => {
    await request(app).get('/api/work-journal/employments').expect(401)
    await Employment.updateOne({ _id: employment.id }, { $set: { note: '仍归属当前用户' } })
    expect(await Employment.countDocuments({ createdBy: user._id })).toBe(1)
  })
})
