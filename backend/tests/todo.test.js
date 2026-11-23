import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { BUILTIN_ROLE_CODES, USER_ROLES } from '#constants/domain'
import { createApp } from '../src/app.js'
import { Role } from '#modules/rbac/models/Role.js'
import { User } from '#modules/user/models/User.js'
import { TodoItem } from '#modules/todo/models/TodoItem.js'
import { TodoList } from '#modules/todo/models/TodoList.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { signAccessToken } from '../src/utils/jwt.js'
import { getBusinessDate } from '#utils/businessDate.js'
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

describe('todo routes', () => {
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
    user = await createUser('todo-user@example.com')
    otherUser = await createUser('other-todo-user@example.com')
    token = signAccessToken(user)
    otherToken = signAccessToken(otherUser)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('filters today before paging and reads only own completed items for a journal date', async () => {
    await TodoList.insertMany(Array.from({ length: 33 }, (_, i) => ({
      title: '旧清单' + i, createdBy: user._id, planDate: new Date('2020-01-01')
    })))
    const list = await TodoList.create({ title: '今日清单', createdBy: user._id, planDate: new Date(getBusinessDate()) })
    const auth = 'Bearer ' + token
    const today = await request(app).get('/api/todos?date=today&status=active').set('Authorization', auth).expect(200)
    expect(today.body.data.items.map((row) => row.title)).toEqual(['今日清单'])
    const row = { listId: list._id, completed: true, completedAt: new Date('2026-02-11T16:15:00Z') }
    await TodoItem.insertMany([{ ...row, title: '我的交付', createdBy: user._id },
      { ...row, title: '别人的交付', createdBy: otherUser._id },
      { ...row, title: '撤销完成', createdBy: user._id, completed: false }])
    const completed = await request(app).get('/api/todos/completed?date=2026-02-12').set('Authorization', auth).expect(200)
    expect(completed.body.data.items.map((item) => item.title)).toEqual(['我的交付'])
    await request(app).get('/api/todos/completed?date=2026-02-31').set('Authorization', auth).expect(400)
  })

  it('creates an independent checklist and manages its items', async () => {
    const listResponse = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '购物清单', type: 'shopping', planDate: '2026-08-16' })
      .expect(201)

    expect(listResponse.body.data).toMatchObject({
      title: '购物清单',
      type: 'shopping',
      itemCount: 0,
      completedCount: 0
    })

    const listId = listResponse.body.data.id
    const itemResponse = await request(app)
      .post(`/api/todos/${listId}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '牛奶', priority: 'high' })
      .expect(201)

    const itemId = itemResponse.body.data.id
    expect(itemResponse.body.data).toMatchObject({ title: '牛奶', priority: 'high', completed: false })

    await request(app)
      .patch(`/api/todos/${listId}/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ completed: true })
      .expect(200)

    const detailResponse = await request(app)
      .get(`/api/todos/${listId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(detailResponse.body.data).toMatchObject({ itemCount: 1, completedCount: 1 })
    expect(detailResponse.body.data.items[0]).toMatchObject({ title: '牛奶', completed: true })
  })

  it('keeps checklists private and blocks archived list mutations', async () => {
    const listResponse = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '出行准备', type: 'travel' })
      .expect(201)
    const listId = listResponse.body.data.id

    await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200)
      .then((response) => expect(response.body.data.total).toBe(0))

    await request(app)
      .patch(`/api/todos/${listId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: '不应修改' })
      .expect(404)

    await request(app)
      .patch(`/api/todos/${listId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'archived' })
      .expect(200)

    await request(app)
      .post(`/api/todos/${listId}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '护照' })
      .expect(400)
  })

  it('deletes a list and all of its items together', async () => {
    const list = await TodoList.create({ title: '今天', type: 'daily', createdBy: user._id })
    await TodoItem.create({ listId: list._id, createdBy: user._id, title: '回复邮件' })

    await request(app)
      .delete(`/api/todos/${list.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(await TodoList.findById(list.id)).toBeNull()
    expect(await TodoItem.countDocuments({ listId: list.id })).toBe(0)
  })

  it('requires the todo menu permission', async () => {
    const visitorRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR }).populate('menuIds')
    visitorRole.menuIds = visitorRole.menuIds
      .filter((menu) => !['knowledge.root', 'knowledge.todos'].includes(menu.code))
      .map((menu) => menu._id)
    await visitorRole.save()

    await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
  })
})
