import request from 'supertest'
import { BUILTIN_ROLE_CODES, USER_ROLES } from '#constants/domain'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { Memo } from '#modules/memo/models/Memo.js'
import { User } from '#modules/user/models/User.js'
import { Role } from '#modules/rbac/models/Role.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

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

describe('memo routes', () => {
  let app
  let user
  let otherUser
  let token
  let otherToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    await ensureRbacSeed()
    user = await createUser('memo-user@example.com')
    otherUser = await createUser('other-user@example.com')
    token = signAccessToken(user)
    otherToken = signAccessToken(otherUser)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('creates and lists private memos for the current user', async () => {
    const createResponse = await request(app)
      .post('/api/memos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: '研究 Vue 组件编辑器的快捷记录交互',
        type: 'study',
        priority: 'high',
        tags: ['Vue', '交互']
      })
      .expect(201)

    expect(createResponse.body.data).toMatchObject({
      title: '研究 Vue 组件编辑器的快捷记录交互',
      summary: '研究 Vue 组件编辑器的快捷记录交互',
      type: 'study',
      priority: 'high',
      tags: ['Vue', '交互'],
      status: 'open'
    })

    await request(app)
      .post('/api/memos')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ content: '另一个用户的备忘' })
      .expect(201)

    const listResponse = await request(app)
      .get('/api/memos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(listResponse.body.data.total).toBe(1)
    expect(listResponse.body.data.items[0].id).toBe(createResponse.body.data.id)
  })

  it('updates status, pin state, and stats', async () => {
    const createResponse = await request(app)
      .post('/api/memos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '本周落地计划',
        content: '梳理备忘录模块体验细节',
        type: 'plan',
        dueAt: '2026-06-20'
      })
      .expect(201)

    const updateResponse = await request(app)
      .patch(`/api/memos/${createResponse.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'completed',
        isPinned: true
      })
      .expect(200)

    expect(updateResponse.body.data).toMatchObject({
      status: 'completed',
      isPinned: true
    })

    const statsResponse = await request(app)
      .get('/api/memos/stats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(statsResponse.body.data).toMatchObject({
      open: 0,
      completed: 1,
      archived: 0,
      pinned: 1,
      total: 1
    })
  })

  it('filters memos and rejects cross-user updates', async () => {
    const createResponse = await request(app)
      .post('/api/memos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '临时灵感',
        content: '给知识库增加轻量备忘入口',
        type: 'idea',
        priority: 'medium'
      })
      .expect(201)

    await request(app)
      .post('/api/memos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '工作跟进',
        content: '整理评论审核流程',
        type: 'work'
      })
      .expect(201)

    const filterResponse = await request(app)
      .get('/api/memos')
      .query({ keyword: '知识库', type: 'idea' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(filterResponse.body.data.total).toBe(1)
    expect(filterResponse.body.data.items[0].title).toBe('临时灵感')

    await request(app)
      .patch(`/api/memos/${createResponse.body.data.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ status: 'archived' })
      .expect(404)
  })

  it('stores reference fields encrypted and reveals sensitive values only to their owner', async () => {
    const createResponse = await request(app)
      .post('/api/memos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        kind: 'reference',
        title: '联系资料',
        category: '个人信息',
        fields: [
          { key: 'phone', label: '联系电话', type: 'phone', isSensitive: true, value: '13900001234' },
          { key: 'city', label: '常住城市', type: 'text', value: '宁波' }
        ]
      })
      .expect(201)

    const memoId = createResponse.body.data.id
    const storedMemo = await Memo.findById(memoId).select('+fields.encryptedValue')
    const storedPhone = storedMemo.fields.find((field) => field.key === 'phone')
    expect(storedPhone.value).toBe('')
    expect(storedPhone.encryptedValue).toMatch(/^v1\./)
    expect(storedPhone.encryptedValue).not.toContain('13900001234')

    const detailResponse = await request(app)
      .get(`/api/memos/${memoId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(detailResponse.body.data.fields).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'phone', value: '', isSensitive: true, hasValue: true }),
      expect.objectContaining({ key: 'city', value: '宁波', isSensitive: false })
    ]))

    const searchableFieldResponse = await request(app)
      .get('/api/memos')
      .query({ keyword: '常住城市' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(searchableFieldResponse.body.data.total).toBe(1)

    const encryptedValueSearchResponse = await request(app)
      .get('/api/memos')
      .query({ keyword: '13900001234' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(encryptedValueSearchResponse.body.data.total).toBe(0)

    const fieldResponse = await request(app)
      .get(`/api/memos/${memoId}/sensitive-fields/phone`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(fieldResponse.body.data.value).toBe('13900001234')

    await request(app)
      .get(`/api/memos/${memoId}/sensitive-fields/phone`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404)

    const encryptedBeforeUpdate = storedPhone.encryptedValue
    await request(app)
      .patch(`/api/memos/${memoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        fields: [
          { key: 'phone', label: '联系电话', type: 'phone', isSensitive: true },
          { key: 'city', label: '常住城市', type: 'text', value: '杭州' }
        ]
      })
      .expect(200)

    const updatedMemo = await Memo.findById(memoId).select('+fields.encryptedValue')
    expect(updatedMemo.fields.find((field) => field.key === 'phone').encryptedValue).toBe(encryptedBeforeUpdate)
  })

  it('keeps legacy memos in the inbox and supports an active-record filter', async () => {
    await Memo.collection.insertOne({
      title: '旧版记录',
      content: '升级前创建的备忘内容',
      type: 'idea',
      status: 'open',
      priority: 'medium',
      tags: [],
      isPinned: false,
      createdBy: user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await request(app)
      .post('/api/memos')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '已归档的旧线索' })
      .then(({ body }) => request(app)
        .patch(`/api/memos/${body.data.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'archived' })
        .expect(200))

    const inboxResponse = await request(app)
      .get('/api/memos')
      .query({ kind: 'capture', status: 'active' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(inboxResponse.body.data.total).toBe(1)
    expect(inboxResponse.body.data.items[0]).toMatchObject({
      title: '旧版记录',
      kind: 'capture'
    })
  })

  it('deletes owned memos', async () => {
    const createResponse = await request(app)
      .post('/api/memos')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '稍后整理的研究问题' })
      .expect(201)

    await request(app)
      .delete(`/api/memos/${createResponse.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const listResponse = await request(app)
      .get('/api/memos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(listResponse.body.data.total).toBe(0)
  })

  it('requires memo menu permission', async () => {
    const visitorRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR }).populate('menuIds')
    visitorRole.menuIds = visitorRole.menuIds
      .filter((menu) => menu.routePath !== '/console/memos')
      .map((menu) => menu._id)
    await visitorRole.save()

    await request(app)
      .get('/api/memos')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
  })
})
