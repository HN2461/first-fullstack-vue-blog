import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { BUILTIN_ROLE_CODES, USER_ROLES } from '#constants/domain'
import { Menu } from '#modules/rbac/models/Menu.js'
import { Role } from '#modules/rbac/models/Role.js'
import { Question } from '#modules/questionBank/models/Question.js'
import { QuestionProgress } from '#modules/questionBank/models/QuestionProgress.js'
import { User } from '#modules/user/models/User.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const questionDataDir = path.resolve(testDir, '../src/data/questionBank')

function loadBuiltinQuestionData() {
  const categories = JSON.parse(fs.readFileSync(path.join(questionDataDir, 'categories.json'), 'utf8')).items
  const questions = fs.readdirSync(questionDataDir)
    .filter((fileName) => /^questions-.+\.json$/i.test(fileName))
    .sort()
    .flatMap((fileName) => JSON.parse(fs.readFileSync(path.join(questionDataDir, fileName), 'utf8')).questions)
  return { categories, questions }
}

async function createSuperUser(email) {
  const role = await Role.findOne({ code: BUILTIN_ROLE_CODES.SUPER_ADMIN })
  return User.create({
    username: email.split('@')[0],
    email,
    passwordHash: 'hashed-password',
    role: USER_ROLES.SUPER_ADMIN,
    roles: [role._id]
  })
}

async function createCategory(app, token, key, name, parentId) {
  const response = await request(app)
    .post('/api/question-bank/categories')
    .set('Authorization', `Bearer ${token}`)
    .send({ key, name, parentId })
    .expect(201)
  return response.body.data
}

async function createQuestion(app, token, categoryId, overrides = {}) {
  const response = await request(app)
    .post('/api/question-bank/questions')
    .set('Authorization', `Bearer ${token}`)
    .send({
      categoryId,
      type: 'single_choice',
      stem: 'JavaScript 中哪个队列优先于宏任务队列执行？',
      options: [
        { id: 'A', content: '微任务队列' },
        { id: 'B', content: '定时器队列' }
      ],
      answerKeys: ['A'],
      explanation: '当前宏任务结束后会先清空微任务队列。',
      difficulty: 'medium',
      tags: ['JavaScript', '事件循环'],
      ...overrides
    })
    .expect(201)
  return response.body.data
}

describe('question bank routes', () => {
  let app
  let token
  let otherToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    await ensureRbacSeed()
    app = createApp()
    token = signAccessToken(await createSuperUser('question-owner@example.com'))
    otherToken = signAccessToken(await createSuperUser('question-other@example.com'))
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('ships 120 structurally valid and uniquely coded essential questions', () => {
    const { categories, questions } = loadBuiltinQuestionData()
    const categoryKeys = new Set(categories.map((item) => item.key))
    const questionCodes = questions.map((item) => item.code)

    expect(categories).toHaveLength(16)
    expect(questions).toHaveLength(120)
    expect(new Set(questionCodes).size).toBe(120)
    expect(questions.every((item) => categoryKeys.has(item.categoryKey))).toBe(true)
    expect(questions.every((item) => item.stem?.trim() && item.answerKeys?.length && item.explanation?.trim())).toBe(true)
    expect(questions.filter((item) => ['single_choice', 'multiple_choice'].includes(item.type)).every((item) => item.options?.length >= 2)).toBe(true)
  })

  it('seeds a standalone question bank menu tree', async () => {
    const root = await Menu.findOne({ code: 'questionbank.root' })
    const children = await Menu.find({ parentId: root._id }).sort({ sortOrder: 1 })

    expect(root.toSafeJSON()).toMatchObject({ name: '题库', parentType: 'root' })
    expect(children.map((item) => item.code)).toEqual([
      'questionbank.overview',
      'questionbank.questions',
      'questionbank.papers',
      'questionbank.practice',
      'questionbank.review',
      'questionbank.attempts'
    ])
  })

  it('manages nested categories and hides answers from question lists', async () => {
    const root = await createCategory(app, token, 'frontend', '前端')
    const javascript = await createCategory(app, token, 'frontend.javascript', 'JavaScript', root.id)
    const question = await createQuestion(app, token, javascript.id)

    const categoryResponse = await request(app)
      .get('/api/question-bank/categories')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(categoryResponse.body.data.tree[0].children[0]).toMatchObject({
      name: 'JavaScript',
      fullName: '前端 / JavaScript'
    })

    const listResponse = await request(app)
      .get('/api/question-bank/questions')
      .query({ categoryId: root.id })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(listResponse.body.data.total).toBe(1)
    expect(listResponse.body.data.items[0].answerKeys).toBeUndefined()
    expect(listResponse.body.data.items[0].explanation).toBeUndefined()

    const detailResponse = await request(app)
      .get(`/api/question-bank/questions/${question.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(detailResponse.body.data.answerKeys).toEqual(['A'])
  })

  it('starts, autosaves, submits and reviews a private practice attempt', async () => {
    const category = await createCategory(app, token, 'frontend.javascript', 'JavaScript')
    const first = await createQuestion(app, token, category.id, { code: 'js-event-loop' })
    const second = await createQuestion(app, token, category.id, {
      code: 'js-closure',
      stem: '闭包是否可以保留对词法作用域变量的引用？',
      type: 'true_false',
      options: [],
      answerKeys: ['true'],
      explanation: '闭包会保留函数创建时的词法环境。'
    })

    const startResponse = await request(app)
      .post('/api/question-bank/attempts/quick')
      .set('Authorization', `Bearer ${token}`)
      .send({ count: 2, categoryId: category.id })
      .expect(201)
    const attempt = startResponse.body.data
    expect(attempt.questions).toHaveLength(2)
    expect(attempt.questions[0].answerKeys).toBeUndefined()
    expect(attempt.questions[0].explanation).toBeUndefined()

    const answers = {
      [first.id]: ['B'],
      [second.id]: ['true']
    }
    for (const question of attempt.questions) {
      await request(app)
        .patch(`/api/question-bank/attempts/${attempt.id}/answer`)
        .set('Authorization', `Bearer ${token}`)
        .send({ questionId: question.questionId, answerKeys: answers[question.questionId] })
        .expect(200)
    }

    const submitResponse = await request(app)
      .post(`/api/question-bank/attempts/${attempt.id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(200)
    expect(submitResponse.body.data).toMatchObject({
      status: 'submitted',
      correctCount: 1,
      totalScore: 50
    })
    expect(submitResponse.body.data.questions.every((item) => item.answerKeys)).toBe(true)

    const wrongResponse = await request(app)
      .get('/api/question-bank/progress')
      .query({ scope: 'wrong' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(wrongResponse.body.data.total).toBe(1)
    expect(wrongResponse.body.data.items[0].questionId).toBe(first.id)

    await request(app)
      .get(`/api/question-bank/attempts/${attempt.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404)
  })

  it('creates a fixed paper and preserves its question snapshot', async () => {
    const category = await createCategory(app, token, 'backend.node', 'Node.js')
    const question = await createQuestion(app, token, category.id, { code: 'node-event-loop' })
    const paperResponse = await request(app)
      .post('/api/question-bank/papers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Node.js 高频题模拟卷',
        mode: 'fixed',
        questionIds: [question.id],
        durationMinutes: 20,
        passScore: 60
      })
      .expect(201)

    const startResponse = await request(app)
      .post(`/api/question-bank/papers/${paperResponse.body.data.id}/start`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
    expect(startResponse.body.data).toMatchObject({
      mode: 'exam',
      title: 'Node.js 高频题模拟卷',
      durationMinutes: 20,
      questionCount: 1
    })
    expect(startResponse.body.data.questions[0]).toMatchObject({
      questionId: question.id,
      version: 1
    })
  })

  it('starts a random paper from its configured question pool', async () => {
    const category = await createCategory(app, token, 'database.redis', 'Redis')
    const questions = []
    for (const code of ['redis-cache', 'redis-expire', 'redis-lock']) {
      questions.push(await createQuestion(app, token, category.id, { code, stem: `${code} 的核心知识点是什么？` }))
    }

    const paperResponse = await request(app)
      .post('/api/question-bank/papers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Redis 随机模拟卷',
        mode: 'random',
        filters: { categoryIds: [category.id] },
        questionCount: 2,
        durationMinutes: 15
      })
      .expect(201)

    const startResponse = await request(app)
      .post(`/api/question-bank/papers/${paperResponse.body.data.id}/start`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
    const selectedIds = startResponse.body.data.questions.map((item) => item.questionId)

    expect(startResponse.body.data.questionCount).toBe(2)
    expect(new Set(selectedIds).size).toBe(2)
    expect(selectedIds.every((id) => questions.some((item) => item.id === id))).toBe(true)
    expect(startResponse.body.data.questions.every((item) => item.answerKeys === undefined)).toBe(true)
  })

  it('normalizes short answers without exposing results before submission', async () => {
    const category = await createCategory(app, token, 'backend.node', 'Node.js')
    const question = await createQuestion(app, token, category.id, {
      code: 'node-short-answer',
      type: 'short_answer',
      stem: 'Node.js 中用于调度异步任务的核心机制是什么？',
      options: [],
      answerKeys: ['Event Loop'],
      explanation: 'Event Loop 即事件循环。'
    })
    const startResponse = await request(app)
      .post('/api/question-bank/attempts/quick')
      .set('Authorization', `Bearer ${token}`)
      .send({ count: 1, categoryId: category.id })
      .expect(201)
    const attemptId = startResponse.body.data.id

    await request(app)
      .patch(`/api/question-bank/attempts/${attemptId}/answer`)
      .set('Authorization', `Bearer ${token}`)
      .send({ questionId: question.id, answerKeys: ['  event   loop  '] })
      .expect(200)

    const draftResponse = await request(app)
      .get(`/api/question-bank/attempts/${attemptId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(draftResponse.body.data.questions[0]).toMatchObject({ submittedAnswer: ['event   loop'] })
    expect(draftResponse.body.data.questions[0].answerKeys).toBeUndefined()
    expect(draftResponse.body.data.questions[0].explanation).toBeUndefined()

    const submitResponse = await request(app)
      .post(`/api/question-bank/attempts/${attemptId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(200)
    expect(submitResponse.body.data).toMatchObject({ correctCount: 1, totalScore: 100 })
  })

  it('supports favorite and due review scopes while excluding archived questions', async () => {
    const category = await createCategory(app, token, 'frontend.vue', 'Vue')
    const question = await createQuestion(app, token, category.id, { code: 'vue-reactivity' })

    await request(app)
      .patch(`/api/question-bank/progress/${question.id}/favorite`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isFavorite: true })
      .expect(200)
    await QuestionProgress.updateOne(
      { questionId: question.id },
      { $set: { lastCorrect: false, nextReviewAt: new Date(Date.now() - 1000) } }
    )

    for (const scope of ['favorite', 'due', 'wrong']) {
      const response = await request(app)
        .get('/api/question-bank/progress')
        .query({ scope })
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      expect(response.body.data.total).toBe(1)
      expect(response.body.data.items[0].questionId).toBe(question.id)
    }

    await Question.updateOne({ _id: question.id }, { $set: { status: 'archived' } })
    const archivedResponse = await request(app)
      .get('/api/question-bank/progress')
      .query({ scope: 'favorite' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(archivedResponse.body.data).toMatchObject({ items: [], total: 0 })
  })

  it('denies question bank APIs when the assigned role has no matching menu', async () => {
    const noMenuRole = await Role.create({
      name: '无题库权限',
      code: 'question-bank-denied',
      menuIds: [],
      status: 'active'
    })
    const user = await User.create({
      username: 'question-denied',
      email: 'question-denied@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.USER,
      roles: [noMenuRole._id]
    })
    const deniedToken = signAccessToken(user)

    const response = await request(app)
      .get('/api/question-bank/overview')
      .set('Authorization', `Bearer ${deniedToken}`)
      .expect(403)
    expect(response.body.code).toBe('MENU_PERMISSION_REQUIRED')
  })
})
