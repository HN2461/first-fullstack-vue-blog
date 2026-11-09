import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import request from 'supertest'
import sharp from 'sharp'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from '../src/app.js'
import { User } from '#modules/user/models/User.js'
import { Role } from '#modules/rbac/models/Role.js'
import { Menu } from '#modules/rbac/models/Menu.js'
import { Media } from '#modules/media/models/Media.js'
import { Notification } from '#modules/notification/models/Notification.js'
import { Feedback } from '#modules/feedback/models/Feedback.js'
import { FeedbackEvent } from '#modules/feedback/models/FeedbackEvent.js'
import { flushFeedbackNotifications } from '#modules/feedback/services/feedbackNotification.service.js'
import { initializeFeedbackMenus } from '#modules/feedback/services/feedbackMenu.service.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { findMediaReferences } from '#modules/media/services/mediaReference.service.js'
import { deleteMedia, moveMediaCategory } from '#modules/media/services/media.service.js'
import { resolveUploadRoot } from '#utils/uploadPath.js'
import { signAccessToken } from '#utils/jwt.js'
import { connectTestDatabase, clearTestDatabase, disconnectTestDatabase } from './helpers/testDatabase.js'

describe('意见反馈完整流程', () => {
  let app, user, other, manager, token, otherToken, managerToken, png
  const authorization = (value) => ({ Authorization: `Bearer ${value}` })
  const submit = (overrides = {}) =>
    request(app)
      .post('/api/feedback')
      .set(authorization(token))
      .send({
        requestId: crypto.randomUUID(),
        type: 'bug',
        title: '账本筛选异常',
        content: '选择月份后结果没有变化',
        ...overrides
      })
  const action = (feedback, kind, content, management = false, extra = {}) =>
    request(app)
      .post(`/api/${management ? 'admin/' : ''}feedback/${feedback.id}/${kind}`)
      .set(authorization(management ? managerToken : token))
      .send({ requestId: crypto.randomUUID(), version: feedback.version, content, ...extra })

  beforeAll(async () => {
    await connectTestDatabase()
    png = await sharp({ create: { width: 4, height: 4, channels: 3, background: '#ffffff' } })
      .png()
      .toBuffer()
  })
  beforeEach(async () => {
    vi.restoreAllMocks()
    await clearTestDatabase()
    await ensureRbacSeed()
    const visitor = await Role.findOne({ code: 'visitor' })
    const superRole = await Role.findOne({ isSuperAdmin: true })
    user = await User.create({
      username: '反馈用户',
      email: 'feedback@example.com',
      passwordHash: 'hashed',
      role: 'user',
      roles: [visitor._id]
    })
    other = await User.create({
      username: '其他用户',
      email: 'feedback-other@example.com',
      passwordHash: 'hashed',
      role: 'user',
      roles: [visitor._id]
    })
    manager = await User.create({
      username: '超级管理员',
      email: 'feedback-admin@example.com',
      passwordHash: 'hashed',
      role: 'super_admin',
      roles: [superRole._id]
    })
    token = signAccessToken(user)
    otherToken = signAccessToken(other)
    managerToken = signAccessToken(manager)
    app = createApp()
  })
  afterAll(async () => {
    vi.restoreAllMocks()
    await disconnectTestDatabase()
  })

  it('私有提交、分页和幂等重试，并且不保存来源查询参数', async () => {
    const requestId = crypto.randomUUID()
    const first = await submit({ requestId, sourcePath: '/console/ledger/entries?secret=hidden#anchor' }).expect(201)
    const second = await submit({ requestId }).expect(201)
    expect(first.body.data.id).toBe(second.body.data.id)
    expect(first.body.data.sourcePath).toBe('/console/ledger/entries')
    expect(await Feedback.countDocuments()).toBe(1)
    expect(await Notification.countDocuments({ recipient: manager._id })).toBe(1)
    expect(await Notification.countDocuments({ recipient: user._id })).toBe(0)
    const list = await request(app).get('/api/feedback?page=1&pageSize=1').set(authorization(token)).expect(200)
    expect(list.body.data.total).toBe(1)
    expect(list.body.data.items[0]).not.toHaveProperty('content')
    await request(app)
      .get('/api/feedback')
      .set(authorization(otherToken))
      .expect(200)
      .then((res) => expect(res.body.data.total).toBe(0))
    await request(app).get(`/api/feedback/${first.body.data.id}`).set(authorization(otherToken)).expect(404)
    await request(app).get('/api/admin/feedback').set(authorization(token)).expect(403)
    await request(app).get('/api/feedback').expect(401)
  })

  it('支持待补充、用户回复、处理完成、重开和撤回的沟通闭环', async () => {
    let feedback = (await submit().expect(201)).body.data
    feedback = (await action(feedback, 'status', '请补充手机型号', true, { status: 'waiting' }).expect(200)).body.data
    expect(feedback.status).toBe('waiting')
    feedback = (await action(feedback, 'reply', '手机浏览器中复现').expect(200)).body.data
    expect(feedback.status).toBe('pending')
    feedback = (await action(feedback, 'status', '修复已上线，请重试', true, { status: 'completed' }).expect(200)).body.data
    await action(feedback, 'reply', '仍然有问题').expect(409)
    feedback = (await action(feedback, 'reopen', '相同操作仍有问题').expect(200)).body.data
    expect(feedback.status).toBe('pending')
    feedback = (await action(feedback, 'withdraw', '已确认是操作错误').expect(200)).body.data
    expect(feedback.status).toBe('closed')
    expect(feedback.events.total).toBe(6)
    const notifications = await Notification.find({ recipient: user._id }).lean()
    expect(notifications).toHaveLength(2)
    expect(notifications.every((entry) => entry.link === `/console/feedback?id=${feedback.id}`)).toBe(true)
  })

  it('版本冲突不丢历史，重复发送不增加回复或通知', async () => {
    const feedback = (await submit().expect(201)).body.data
    const requestId = crypto.randomUUID()
    await action(feedback, 'reply', '补充说明', false, { requestId }).expect(200)
    await action(feedback, 'reply', '补充说明', false, { requestId }).expect(200)
    await action(feedback, 'reply', '过期版本').expect(409)
    expect(await FeedbackEvent.countDocuments()).toBe(2)
    expect(await Notification.countDocuments()).toBe(2)
    await action(feedback, 'status', '越权处理', false, { status: 'completed' }).expect(404)
  })

  it('选择或粘贴的图片登记在固定上传目录，并仅允许本人和处理人读取', async () => {
    const response = await request(app)
      .post('/api/feedback')
      .set(authorization(token))
      .field('requestId', crypto.randomUUID())
      .field('type', 'bug')
      .field('title', '截图反馈')
      .field('content', '附图')
      .attach('images', png, { filename: 'screen.png', contentType: 'image/png' })
      .expect(201)
    const feedback = response.body.data
    const image = feedback.attachments[0]
    expect(image).not.toHaveProperty('storagePath')
    const media = await Media.findById(image.id)
    expect(media.accessScope).toBe('private')
    expect(path.relative(path.join(resolveUploadRoot(), 'feedback'), media.storagePath)).not.toMatch(/^\.\./)
    await request(app).get(image.url).expect(401)
    await request(app).get(image.url).set(authorization(otherToken)).expect(404)
    const ownImage = await request(app).get(image.url).set(authorization(token))
    expect(ownImage.status, JSON.stringify(ownImage.body)).toBe(200)
    expect(ownImage.headers['cache-control']).toBe('private, no-store')
    await request(app).get(image.url).set(authorization(managerToken)).expect(200)
    const relative = path.relative(resolveUploadRoot(), media.storagePath).replaceAll('\\', '/')
    await request(app).get(`/uploads/${relative}`).expect(404)
    expect((await findMediaReferences(media))[0].type).toBe('feedbackAttachment')
    await expect(deleteMedia(media.id, manager)).rejects.toMatchObject({ code: 'MEDIA_REFERENCED' })
    await expect(moveMediaCategory(media.id, '默认素材', manager)).rejects.toMatchObject({ code: 'FEEDBACK_MEDIA_PROTECTED' })
    const reply = await request(app)
      .post(`/api/feedback/${feedback.id}/reply`)
      .set(authorization(token))
      .field('requestId', crypto.randomUUID())
      .field('version', feedback.version)
      .attach('images', png, { filename: 'paste.png', contentType: 'image/png' })
      .expect(200)
    expect(reply.body.data.events.items[0].attachments).toHaveLength(1)
  })

  it('拒绝伪造和超量图片，并清理同次提交中已经写入的文件', async () => {
    await request(app)
      .post('/api/feedback')
      .set(authorization(token))
      .field('requestId', crypto.randomUUID())
      .field('type', 'bug')
      .field('title', '伪造图片')
      .field('content', '测试')
      .attach('images', png, 'valid.png')
      .attach('images', Buffer.from('not an image'), 'invalid.png')
      .expect(400)
    expect(await Media.countDocuments({ feedback: { $ne: null } })).toBe(0)
    expect(await Feedback.countDocuments()).toBe(0)
    const files = await fs.readdir(path.join(resolveUploadRoot(), 'feedback'), { recursive: true }).catch(() => [])
    expect(files.filter((name) => name.endsWith('.png'))).toHaveLength(0)
    const req = request(app)
      .post('/api/feedback')
      .set(authorization(token))
      .field('requestId', crypto.randomUUID())
      .field('type', 'bug')
      .field('title', '超量')
      .field('content', '测试')
    for (let index = 0; index < 6; index += 1) req.attach('images', png, `image-${index}.png`)
    await req.expect(400)
  })

  it('处理状态必须说明原因，非法类型、查询和越权操作被拒绝', async () => {
    await submit({ type: 'invalid' }).expect(400)
    const feedback = (await submit().expect(201)).body.data
    await action(feedback, 'status', '', true, { status: 'closed' }).expect(400)
    await action(feedback, 'status', '无效', true, { status: 'unknown' }).expect(400)
    await request(app).get('/api/feedback?status=unknown').set(authorization(token)).expect(400)
    await request(app).get('/api/feedback/not-an-id').set(authorization(token)).expect(404)
    await request(app)
      .post(`/api/feedback/${feedback.id}/withdraw`)
      .set(authorization(otherToken))
      .send({ requestId: crypto.randomUUID(), version: 1, content: '越权' })
      .expect(404)
    const notice = await Notification.findOne({ recipient: manager._id })
    await request(app).post(`/api/public/announcements/${notice.id}/read`).set(authorization(otherToken)).expect(404)
  })

  it('通知投递失败保留反馈，并从持久事件幂等补发', async () => {
    const spy = vi.spyOn(Notification, 'updateOne').mockRejectedValueOnce(new Error('temporary notification failure'))
    const feedback = (await submit().expect(201)).body.data
    expect(await Feedback.exists({ _id: feedback.id })).toBeTruthy()
    expect(await FeedbackEvent.countDocuments({ notifiedAt: null })).toBe(1)
    spy.mockRestore()
    await flushFeedbackNotifications()
    await flushFeedbackNotifications()
    expect(await Notification.countDocuments()).toBe(1)
    expect(await FeedbackEvent.countDocuments({ notifiedAt: null })).toBe(0)
  })

  it('仅反馈管理授权即可处理和收到通知，不依赖项目讨论权限', async () => {
    const menu = await Menu.findOne({ code: 'governance.feedback' })
    const role = await Role.create({ code: 'feedback-handler', name: '反馈处理人', menuIds: [menu._id] })
    const handler = await User.create({
      username: '处理人',
      email: 'handler@example.com',
      passwordHash: 'hashed',
      roles: [role._id],
      role: 'user'
    })
    const handlerToken = signAccessToken(handler)
    const feedback = (await submit().expect(201)).body.data
    expect(await Notification.countDocuments({ recipient: handler._id })).toBe(1)
    await request(app).get(`/api/admin/feedback/${feedback.id}`).set(authorization(handlerToken)).expect(200)
    await request(app).get('/api/discussions').set(authorization(handlerToken)).expect(403)
    await request(app).get('/api/admin/feedback').set(authorization(otherToken)).expect(403)
  })

  it('长沟通历史可分页访问，个人反馈权限可撤回且重复初始化不重新授权', async () => {
    const feedback = (await submit().expect(201)).body.data
    await FeedbackEvent.insertMany(
      Array.from({ length: 24 }, (_, index) => ({
        feedback: feedback.id,
        actor: user._id,
        requestId: crypto.randomUUID(),
        kind: 'reply',
        content: `回复 ${index}`,
        ready: true,
        notifiedAt: new Date()
      }))
    )
    const detail = await request(app).get(`/api/feedback/${feedback.id}`).set(authorization(token)).expect(200)
    expect(detail.body.data.events.total).toBe(25)
    expect(detail.body.data.events.items).toHaveLength(20)
    const more = await request(app).get(`/api/feedback/${feedback.id}/events?page=2`).set(authorization(token)).expect(200)
    expect(more.body.data.items).toHaveLength(5)
    const menu = await Menu.findOne({ code: 'knowledge.feedback' })
    await Role.updateMany({ code: 'visitor' }, { $pull: { menuIds: menu._id } })
    expect(await initializeFeedbackMenus(true)).toEqual({ createdMenus: 0, grantRoles: 0 })
    await ensureRbacSeed()
    await request(app).get('/api/feedback').set(authorization(token)).expect(403)
  })

  it('上线菜单迁移默认只读，应用后幂等并保留其他菜单挂载和角色授权', async () => {
    await Menu.deleteMany({ code: { $in: ['knowledge.feedback', 'governance.feedback'] } })
    const before = await Menu.findOne({ code: 'knowledge.root' }).lean()
    const plan = await initializeFeedbackMenus(false)
    expect(plan.createdMenus).toBe(2)
    expect(plan.grantRoles).toBeGreaterThan(0)
    expect(await Menu.countDocuments({ code: /feedback$/ })).toBe(0)
    await initializeFeedbackMenus(true)
    expect(await initializeFeedbackMenus(false)).toEqual({ createdMenus: 0, grantRoles: 0 })
    const after = await Menu.findOne({ code: 'knowledge.root' }).lean()
    expect(after.parentId).toEqual(before.parentId)
    expect(after.sortOrder).toBe(before.sortOrder)
    const visitor = await Role.findOne({ code: 'visitor' }).populate('menuIds')
    expect(visitor.menuIds.some((menu) => menu.code === 'knowledge.feedback')).toBe(true)
    expect(visitor.menuIds.some((menu) => menu.code === 'governance.feedback')).toBe(false)
  })
})
