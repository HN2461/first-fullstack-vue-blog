import request from 'supertest'
import { BUILTIN_ROLE_CODES, USER_ROLES } from '#constants/domain'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
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
      content: '研究 Vue 组件编辑器的快捷记录交互',
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
