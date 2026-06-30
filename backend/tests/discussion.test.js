import request from 'supertest'
import { BUILTIN_ROLE_CODES, USER_ROLES } from '#constants/domain'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { DiscussionMessage } from '#modules/discussion/models/DiscussionMessage.js'
import { Notification } from '#modules/notification/models/Notification.js'
import { Menu } from '#modules/rbac/models/Menu.js'
import { Role } from '#modules/rbac/models/Role.js'
import { User } from '#modules/user/models/User.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function createDiscussionUser(email) {
  const rootMenu = await Menu.findOne({ code: 'knowledge.root' })
  const discussionMenu = await Menu.findOne({ code: 'collaboration.discussions' })
  const role = await Role.create({
    name: `讨论授权-${email}`,
    code: `discussion-${email.split('@')[0].replace(/[^a-z0-9-]/g, '-')}`,
    menuIds: [rootMenu._id, discussionMenu._id],
    status: 'active'
  })

  return User.create({
    username: email.split('@')[0],
    email,
    passwordHash: 'hashed-password',
    role: USER_ROLES.USER,
    roles: [role._id]
  })
}

async function createDiscussionAdmin(email) {
  const superRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.SUPER_ADMIN })

  return User.create({
    username: email.split('@')[0],
    email,
    passwordHash: 'hashed-password',
    role: USER_ROLES.SUPER_ADMIN,
    roles: [superRole._id]
  })
}

describe('discussion routes', () => {
  let app
  let user
  let otherUser
  let outsider
  let admin
  let token
  let otherToken
  let outsiderToken
  let adminToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    await ensureRbacSeed()
    user = await createDiscussionUser('discussion-a@example.com')
    otherUser = await createDiscussionUser('discussion-b@example.com')
    outsider = await createDiscussionUser('discussion-c@example.com')
    admin = await createDiscussionAdmin('discussion-admin@example.com')
    token = signAccessToken(user)
    otherToken = signAccessToken(otherUser)
    outsiderToken = signAccessToken(outsider)
    adminToken = signAccessToken(admin)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('does not grant discussion menu to visitor role by default', async () => {
    const visitorRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR }).populate('menuIds')
    expect(visitorRole.menuIds.some((menu) => menu.code === 'collaboration.discussions')).toBe(false)
  })

  it('creates direct discussions once and limits access to members', async () => {
    const createResponse = await request(app)
      .post('/api/discussions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'direct',
        memberIds: [otherUser._id.toString()]
      })
      .expect(201)

    const repeatResponse = await request(app)
      .post('/api/discussions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'direct',
        memberIds: [otherUser._id.toString()]
      })
      .expect(201)

    expect(repeatResponse.body.data.id).toBe(createResponse.body.data.id)

    await request(app)
      .get(`/api/discussions/${createResponse.body.data.id}/messages`)
      .set('Authorization', `Bearer ${outsiderToken}`)
      .expect(403)
  })

  it('sends, lists, marks read and deletes owned messages', async () => {
    const threadResponse = await request(app)
      .post('/api/discussions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'direct',
        memberIds: [otherUser._id.toString()]
      })
      .expect(201)

    const threadId = threadResponse.body.data.id
    const messageResponse = await request(app)
      .post(`/api/discussions/${threadId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '接口字段先保持最小集合，后面再扩展。' })
      .expect(201)

    const otherListResponse = await request(app)
      .get('/api/discussions')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200)

    expect(otherListResponse.body.data.items[0].unreadCount).toBe(1)

    await request(app)
      .post(`/api/discussions/${threadId}/read`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200)

    const messagesResponse = await request(app)
      .get(`/api/discussions/${threadId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(messagesResponse.body.data.items[0]).toMatchObject({
      content: '接口字段先保持最小集合，后面再扩展。',
      senderId: user._id.toString()
    })

    await request(app)
      .delete(`/api/discussions/${threadId}/messages/${messageResponse.body.data.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403)

    await request(app)
      .delete(`/api/discussions/${threadId}/messages/${messageResponse.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(await DiscussionMessage.countDocuments({ threadId })).toBe(0)
  })

  it('keeps only latest 300 messages per sender', async () => {
    const threadResponse = await request(app)
      .post('/api/discussions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'direct',
        memberIds: [otherUser._id.toString()]
      })
      .expect(201)

    const threadId = threadResponse.body.data.id
    const baseTime = new Date('2026-06-30T00:00:00.000Z').getTime()
    await DiscussionMessage.insertMany(Array.from({ length: 305 }, (_, index) => ({
      threadId,
      senderId: user._id,
      content: `配额测试消息 ${String(index).padStart(3, '0')}`,
      createdAt: new Date(baseTime + index * 1000),
      updatedAt: new Date(baseTime + index * 1000)
    })))

    await request(app)
      .post(`/api/discussions/${threadId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '触发配额清理的新消息' })
      .expect(201)

    expect(await DiscussionMessage.countDocuments({ senderId: user._id })).toBe(300)
    const oldest = await DiscussionMessage.findOne({ senderId: user._id }).sort({ createdAt: 1, _id: 1 })
    expect(oldest.content).toBe('配额测试消息 006')
  })

  it('hides messages only for current user local view', async () => {
    const threadResponse = await request(app)
      .post('/api/discussions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'direct',
        memberIds: [otherUser._id.toString()]
      })
      .expect(201)

    const threadId = threadResponse.body.data.id
    const messageResponse = await request(app)
      .post(`/api/discussions/${threadId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '这条只从自己的本地记录移除。' })
      .expect(201)

    await request(app)
      .post(`/api/discussions/${threadId}/messages/${messageResponse.body.data.id}/hide`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const ownListResponse = await request(app)
      .get(`/api/discussions/${threadId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    const otherListResponse = await request(app)
      .get(`/api/discussions/${threadId}/messages`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200)

    expect(ownListResponse.body.data.items).toHaveLength(0)
    expect(otherListResponse.body.data.items).toHaveLength(1)
    expect(otherListResponse.body.data.items[0].content).toBe('这条只从自己的本地记录移除。')
  })

  it('clears current thread view only for the requesting user', async () => {
    const threadResponse = await request(app)
      .post('/api/discussions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'direct',
        memberIds: [otherUser._id.toString()]
      })
      .expect(201)

    const threadId = threadResponse.body.data.id
    await request(app)
      .post(`/api/discussions/${threadId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '清空当前会话视图前的消息。' })
      .expect(201)

    await request(app)
      .post(`/api/discussions/${threadId}/clear-my-view`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const ownListResponse = await request(app)
      .get(`/api/discussions/${threadId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    const otherListResponse = await request(app)
      .get(`/api/discussions/${threadId}/messages`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200)

    expect(ownListResponse.body.data.items).toHaveLength(0)
    expect(otherListResponse.body.data.items).toHaveLength(1)
  })

  it('allows attachment-only messages and reports server storage usage', async () => {
    const threadResponse = await request(app)
      .post('/api/discussions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'direct',
        memberIds: [otherUser._id.toString()]
      })
      .expect(201)

    const threadId = threadResponse.body.data.id
    const messageResponse = await request(app)
      .post(`/api/discussions/${threadId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        attachment: {
          filename: 'only.png',
          originalName: 'only.png',
          mimeType: 'image/png',
          size: 2048,
          url: '/uploads/discussions/2026/06/only.png',
          storagePath: 'uploads/discussions/2026/06/only.png'
        }
      })
      .expect(201)

    expect(messageResponse.body.data.content).toBe('')
    expect(messageResponse.body.data.attachments[0].originalName).toBe('only.png')

    const storageResponse = await request(app)
      .get(`/api/discussions/${threadId}/storage`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(storageResponse.body.data.thread).toMatchObject({
      messageCount: 1,
      attachmentCount: 1,
      attachmentBytes: 2048,
      totalBytes: 2048
    })
    expect(storageResponse.body.data.global).toBeUndefined()
  })

  it('revokes own recent messages for all members and rejects non-sender', async () => {
    const threadResponse = await request(app)
      .post('/api/discussions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'direct',
        memberIds: [otherUser._id.toString()]
      })
      .expect(201)

    const threadId = threadResponse.body.data.id
    const messageResponse = await request(app)
      .post(`/api/discussions/${threadId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: '需要短时撤销的图片附件',
        attachment: {
          filename: 'shot.png',
          originalName: 'shot.png',
          mimeType: 'image/png',
          size: 1234,
          url: '/uploads/discussions/2026/06/shot.png',
          storagePath: 'uploads/discussions/2026/06/shot.png'
        }
      })
      .expect(201)

    await request(app)
      .post(`/api/discussions/${threadId}/messages/${messageResponse.body.data.id}/revoke`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403)

    const revokeResponse = await request(app)
      .post(`/api/discussions/${threadId}/messages/${messageResponse.body.data.id}/revoke`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(revokeResponse.body.data).toMatchObject({
      id: messageResponse.body.data.id,
      content: '',
      attachments: []
    })
    expect(revokeResponse.body.data.revokedAt).toBeTruthy()

    const otherListResponse = await request(app)
      .get(`/api/discussions/${threadId}/messages`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200)

    expect(otherListResponse.body.data.items[0]).toMatchObject({
      content: '',
      attachments: []
    })
    expect(otherListResponse.body.data.items[0].revokedAt).toBeTruthy()
  })

  it('rejects revoking messages after the short window expires', async () => {
    const threadResponse = await request(app)
      .post('/api/discussions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'direct',
        memberIds: [otherUser._id.toString()]
      })
      .expect(201)

    const threadId = threadResponse.body.data.id
    const expiredMessage = await DiscussionMessage.create({
      threadId,
      senderId: user._id,
      content: '这条消息已经超过撤销时限。',
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000)
    })

    const revokeResponse = await request(app)
      .post(`/api/discussions/${threadId}/messages/${expiredMessage._id}/revoke`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    expect(revokeResponse.body.code).toBe('DISCUSSION_MESSAGE_REVOKE_EXPIRED')
  })

  it('lets super admin view global storage and purge a thread with notifications', async () => {
    const threadResponse = await request(app)
      .post('/api/discussions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'direct',
        memberIds: [otherUser._id.toString()]
      })
      .expect(201)

    const threadId = threadResponse.body.data.id
    await request(app)
      .post(`/api/discussions/${threadId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: '带附件的清理测试',
        attachment: {
          filename: 'cleanup.txt',
          originalName: 'cleanup.txt',
          mimeType: 'text/plain',
          size: 512,
          url: '/uploads/discussions/2026/06/cleanup.txt',
          storagePath: 'backend/tests/.tmp/missing-cleanup.txt'
        }
      })
      .expect(201)

    const storageResponse = await request(app)
      .get(`/api/discussions/${threadId}/storage`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(storageResponse.body.data.global.messageCount).toBeGreaterThanOrEqual(1)

    await request(app)
      .post(`/api/discussions/${threadId}/admin/purge`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403)

    const purgeResponse = await request(app)
      .post(`/api/discussions/${threadId}/admin/purge`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(purgeResponse.body.data.deletedMessageCount).toBe(1)
    expect(await DiscussionMessage.countDocuments({ threadId })).toBe(0)
    expect(await Notification.countDocuments({
      type: 'system',
      title: '项目讨论历史已清理'
    })).toBe(2)
  })

  it('requires discussion menu permission', async () => {
    const visitorRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR })
    const visitor = await User.create({
      username: 'plain-reader',
      email: 'plain-reader@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.USER,
      roles: [visitorRole._id]
    })
    const visitorToken = signAccessToken(visitor)

    await request(app)
      .get('/api/discussions')
      .set('Authorization', `Bearer ${visitorToken}`)
      .expect(403)
  })

  it('does not expose unauthorized users through member search', async () => {
    const visitorRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR })
    await User.create({
      username: 'discussion-hidden',
      email: 'discussion-hidden@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.USER,
      roles: [visitorRole._id]
    })

    const response = await request(app)
      .get('/api/discussions/users')
      .query({ keyword: 'discussion-hidden' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(response.body.data).toEqual([])
  })
})
