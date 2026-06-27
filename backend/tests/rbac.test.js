import request from 'supertest'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { BUILTIN_ROLE_CODES, USER_ROLES } from '#constants/domain'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { Role } from '#modules/rbac/models/Role.js'
import { Menu } from '#modules/rbac/models/Menu.js'
import { Notification } from '#modules/notification/models/Notification.js'
import { ProjectTimelineRecord } from '#modules/projectTimeline/models/ProjectTimelineRecord.js'
import { User } from '#modules/user/models/User.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { upsertProjectTimelineSeedRecord } from '#modules/projectTimeline/services/projectTimeline.service.js'
import { buildProjectTimelineSeedRecords } from '../src/scripts/seedProjectTimeline.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

function encryptCredential(challenge, purpose, payload) {
  const encrypted = crypto.publicEncrypt(
    {
      key: challenge.publicKey,
      oaepHash: 'sha256',
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    },
    Buffer.from(JSON.stringify({
      purpose,
      challengeId: challenge.challengeId,
      nonce: challenge.nonce,
      ...payload
    }), 'utf8')
  )

  return {
    challengeId: challenge.challengeId,
    payload: encrypted.toString('base64')
  }
}

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

describe('rbac account and permission flows', () => {
  let app
  let superAdmin
  let superAdminToken

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    await ensureRbacSeed()
    superAdmin = await createUserWithRole(BUILTIN_ROLE_CODES.SUPER_ADMIN, {
      username: 'super-admin',
      email: 'super-admin@example.com',
      legacyRole: USER_ROLES.SUPER_ADMIN
    })
    superAdminToken = signAccessToken(superAdmin)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('allows super admin to create a user through encrypted credential', async () => {
    const visitorRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR })
    const challengeResponse = await request(app)
      .get('/api/auth/challenge')
      .query({ purpose: 'admin-create-user' })
      .expect(200)

    const credential = encryptCredential(challengeResponse.body.data, 'admin-create-user', {
      password: 'password123'
    })

    const response = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        username: 'created-user',
        email: 'created-user@example.com',
        roleIds: [visitorRole._id.toString()],
        status: 'active',
        credential
      })
      .expect(201)

    expect(response.body.data.email).toBe('created-user@example.com')
    expect(response.body.data.roles[0].code).toBe(BUILTIN_ROLE_CODES.VISITOR)
    expect(response.body.data.passwordHash).toBeUndefined()
  })

  it('blocks non-super admins from creating users', async () => {
    const usersMenu = await Menu.findOne({ code: 'governance.users' })
    const userManagerRole = await Role.create({
      name: '用户管理员',
      code: 'user-manager-no-super',
      menuIds: [usersMenu._id],
      status: 'active'
    })
    const admin = await User.create({
      username: 'base-admin',
      email: 'base-admin@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.ADMIN,
      roles: [userManagerRole._id]
    })
    const adminToken = signAccessToken(admin)
    const challengeResponse = await request(app)
      .get('/api/auth/challenge')
      .query({ purpose: 'admin-create-user' })
      .expect(200)

    const credential = encryptCredential(challengeResponse.body.data, 'admin-create-user', {
      password: 'password123'
    })

    const response = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'blocked-user',
        email: 'blocked-user@example.com',
        credential
      })
      .expect(403)

    expect(response.body.code).toBe('SUPER_ADMIN_REQUIRED')
  })

  it('lets a logged-in user submit and view permission request history', async () => {
    const user = await createUserWithRole(BUILTIN_ROLE_CODES.VISITOR, {
      username: 'reader',
      email: 'reader@example.com'
    })
    const token = signAccessToken(user)

    await request(app)
      .post('/api/profile/permission-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reason: '申请参与内容运营'
      })
      .expect(201)

    const response = await request(app)
      .get('/api/profile/permission-requests')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(response.body.data.total).toBe(1)
    expect(response.body.data.items[0]).toMatchObject({
      reason: '申请参与内容运营',
      status: 'pending'
    })
  })

  it('lets a user choose the target role when submitting a permission request', async () => {
    const commentsMenu = await Menu.findOne({ code: 'governance.comments' })
    const commentAuditorRole = await Role.create({
      name: '评论审核员',
      code: 'comment-auditor',
      remarkName: '只处理评论',
      menuIds: [commentsMenu._id],
      status: 'active',
      sortOrder: 80
    })
    const user = await createUserWithRole(BUILTIN_ROLE_CODES.VISITOR, {
      username: 'role-applicant',
      email: 'role-applicant@example.com'
    })
    const token = signAccessToken(user)

    const rolesResponse = await request(app)
      .get('/api/profile/permission-request-roles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(rolesResponse.body.data.some((role) => role.code === BUILTIN_ROLE_CODES.VISITOR)).toBe(false)
    expect(rolesResponse.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: commentAuditorRole._id.toString(),
        name: '评论审核员',
        remarkName: '只处理评论'
      })
    ]))

    await request(app)
      .post('/api/profile/permission-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        targetRoleId: commentAuditorRole._id.toString(),
        reason: '申请处理评论审核'
      })
      .expect(201)

    const response = await request(app)
      .get('/api/profile/permission-requests')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(response.body.data.items[0]).toMatchObject({
      reason: '申请处理评论审核',
      targetRole: {
        id: commentAuditorRole._id.toString(),
        name: '评论审核员',
        remarkName: '只处理评论'
      }
    })
  })

  it('rejects permission requests for roles the user already has', async () => {
    const visitorRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR })
    const user = await createUserWithRole(BUILTIN_ROLE_CODES.VISITOR, {
      username: 'existing-role-user',
      email: 'existing-role-user@example.com'
    })
    const token = signAccessToken(user)

    const response = await request(app)
      .post('/api/profile/permission-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        targetRoleId: visitorRole._id.toString(),
        reason: '重复申请已有角色'
      })
      .expect(409)

    expect(response.body.code).toBe('ROLE_ALREADY_ASSIGNED')
  })

  it('includes backend-controlled knowledge menus for ordinary users', async () => {
    const user = await createUserWithRole(BUILTIN_ROLE_CODES.VISITOR, {
      username: 'knowledge-reader',
      email: 'knowledge-reader@example.com'
    })
    const token = signAccessToken(user)

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const rootMenus = response.body.data.permissions.rootMenus
    const knowledgeRoot = rootMenus.find((menu) => menu.code === 'knowledge.root')

    expect(knowledgeRoot).toBeTruthy()
    expect(knowledgeRoot.children.map((menu) => menu.name)).toContain('全部文章')
    expect(knowledgeRoot.children.map((menu) => menu.name)).toContain('文章目录')
    expect(knowledgeRoot.children.map((menu) => menu.name)).toContain('账本')
    expect(knowledgeRoot.children.map((menu) => menu.routePath)).toContain('/console/articles')
    expect(knowledgeRoot.children.map((menu) => menu.routePath)).toContain('/console/article-directory')
    expect(response.body.data.permissions.menuPaths).toContain('/console/ledger/overview')
    expect(response.body.data.permissions.menuPaths).toContain('/console/ledger/entries')
    expect(response.body.data.permissions.menuPaths).toContain('/console/articles')
    expect(response.body.data.permissions.menuPaths).toContain('/console/article-directory')
    expect(response.body.data.permissions.menuPaths).toContain('/console/profile')
    expect(rootMenus.some((menu) => menu.code === 'management.root')).toBe(false)
  })

  it('lists knowledge system menus in menu management and role permission tree', async () => {
    const menusResponse = await request(app)
      .get('/api/rbac/menus')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200)
    const permissionMenusResponse = await request(app)
      .get('/api/rbac/roles/permission-menus')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200)

    const flatMenus = menusResponse.body.data.items
    const permissionFlatMenus = permissionMenusResponse.body.data.items
    const knowledgeArticleMenu = flatMenus.find((menu) => menu.code === 'knowledge.articles')
    const knowledgeDirectoryMenu = flatMenus.find((menu) => menu.code === 'knowledge.directory')
    const ledgerMenu = flatMenus.find((menu) => menu.code === 'knowledge.ledger')
    const ledgerOverviewMenu = flatMenus.find((menu) => menu.code === 'knowledge.ledger.overview')
    const ledgerMomentsMenu = flatMenus.find((menu) => menu.code === 'knowledge.ledger.moments')
    const ledgerCategoriesMenu = flatMenus.find((menu) => menu.code === 'knowledge.ledger.categories')

    expect(knowledgeArticleMenu).toMatchObject({
      name: '全部文章',
      type: 'system',
      routePath: '/console/articles'
    })
    expect(knowledgeDirectoryMenu).toMatchObject({
      name: '文章目录',
      type: 'system',
      routePath: '/console/article-directory',
      directoryAutoExpandWhenNested: true
    })
    expect(ledgerMenu).toMatchObject({
      name: '账本',
      type: 'system',
      routePath: ''
    })
    expect(ledgerOverviewMenu).toMatchObject({
      name: '汇总图表',
      type: 'system',
      routePath: '/console/ledger/overview'
    })
    expect(ledgerMomentsMenu).toMatchObject({
      name: '重要记录',
      type: 'system',
      routePath: '/console/ledger/moments'
    })
    expect(ledgerCategoriesMenu).toMatchObject({
      hidden: true,
      routePath: ''
    })
    expect(permissionFlatMenus.some((menu) => menu.code === 'knowledge.articles')).toBe(true)
    expect(permissionFlatMenus.some((menu) => menu.code === 'knowledge.directory')).toBe(true)
    expect(permissionFlatMenus.some((menu) => menu.code === 'knowledge.ledger.entries')).toBe(true)
    expect(permissionFlatMenus.some((menu) => menu.code === 'knowledge.ledger.moments')).toBe(true)
  })

  it('seeds project timeline menu under system operations', async () => {
    const projectTimelineMenu = await Menu.findOne({ code: 'governance.projectTimeline' }).populate('parentId')

    expect(projectTimelineMenu).toMatchObject({
      name: '项目记录台账',
      icon: 'ClockCircleOutlined',
      routePath: '/console/manage/project-timeline',
      routeKey: 'admin.project.timeline',
      sortOrder: 25
    })
    expect(projectTimelineMenu.parentId.code).toBe('system.group')
  })

  it('lets menu-authorized admins create and page project timeline records in descending time order', async () => {
    await request(app)
      .post('/api/admin/project-timeline')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        title: '较早节点',
        detail: '先完成基础搭建',
        occurredAt: '2026-06-18T10:00:00.000Z',
        category: '项目搭建'
      })
      .expect(201)

    await request(app)
      .post('/api/admin/project-timeline')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        title: '较新节点',
        detail: '随后完成台账页面',
        occurredAt: '2026-06-21T10:00:00.000Z',
        category: '功能更新'
      })
      .expect(201)

    const response = await request(app)
      .get('/api/admin/project-timeline')
      .query({ page: 1, pageSize: 10 })
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200)

    expect(response.body.data.total).toBe(2)
    expect(response.body.data.items.map((item) => item.title)).toEqual(['较新节点', '较早节点'])
    expect(response.body.data.items[0]).toMatchObject({
      category: '功能更新',
      source: 'manual'
    })

    const searchResponse = await request(app)
      .get('/api/admin/project-timeline')
      .query({ keyword: '基础搭建' })
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200)

    expect(searchResponse.body.data.total).toBe(1)
    expect(searchResponse.body.data.items[0].title).toBe('较早节点')
  })

  it('blocks project timeline API when admin role lacks the timeline menu', async () => {
    const commentsMenu = await Menu.findOne({ code: 'governance.comments' })
    const limitedRole = await Role.create({
      name: '仅评论审核角色',
      code: 'project-timeline-blocked',
      menuIds: [commentsMenu._id],
      status: 'active'
    })
    const limitedAdmin = await User.create({
      username: 'project-timeline-blocked',
      email: 'project-timeline-blocked@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.ADMIN,
      roles: [limitedRole._id]
    })
    const token = signAccessToken(limitedAdmin)

    const response = await request(app)
      .get('/api/admin/project-timeline')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)

    expect(response.body.code).toBe('MENU_PERMISSION_REQUIRED')
  })

  it('imports project timeline records from a daily collaboration JSON file idempotently', async () => {
    const payload = Buffer.from(JSON.stringify({
      schemaVersion: 1,
      date: '2026-06-21',
      source: 'collaboration_daily',
      records: [
        {
          id: 'daily-import-test',
          title: '导入测试记录',
          detail: '通过页面上传每日协作记录文件导入。',
          occurredAt: '2026-06-21T19:20:00+08:00',
          category: '体验优化'
        }
      ]
    }), 'utf8')

    const firstResponse = await request(app)
      .post('/api/admin/project-timeline/import')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .attach('file', payload, {
        filename: '2026-06-21.json',
        contentType: 'application/json'
      })
      .expect(200)

    const secondResponse = await request(app)
      .post('/api/admin/project-timeline/import')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .attach('file', payload, {
        filename: '2026-06-21.json',
        contentType: 'application/json'
      })
      .expect(200)

    const importedCount = await ProjectTimelineRecord.countDocuments({
      source: 'collaboration_daily',
      legacyId: '2026-06-21-daily-import-test'
    })

    expect(firstResponse.body.data).toMatchObject({ inserted: 1, duplicated: 0, total: 1 })
    expect(secondResponse.body.data).toMatchObject({ inserted: 0, duplicated: 1, total: 1 })
    expect(importedCount).toBe(1)

    const importedRecord = await ProjectTimelineRecord.findOne({
      source: 'collaboration_daily',
      legacyId: '2026-06-21-daily-import-test'
    })
    expect(importedRecord.category).toBe('体验优化')
  })

  it('updates project timeline record title, detail, category and time', async () => {
    const createResponse = await request(app)
      .post('/api/admin/project-timeline')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        title: '待编辑节点',
        detail: '原始详情',
        occurredAt: '2026-06-20T10:00:00.000Z',
        category: '功能更新'
      })
      .expect(201)

    const updateResponse = await request(app)
      .patch(`/api/admin/project-timeline/${createResponse.body.data.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        title: '已编辑节点',
        detail: '1. 调整标题。2. 调整详情。',
        occurredAt: '2026-06-22T10:30:00.000Z',
        category: '体验优化'
      })
      .expect(200)

    expect(updateResponse.body.data).toMatchObject({
      title: '已编辑节点',
      detail: '1. 调整标题。2. 调整详情。',
      category: '体验优化'
    })
    expect(new Date(updateResponse.body.data.occurredAt).toISOString()).toBe('2026-06-22T10:30:00.000Z')
  })

  it('imports multiple project timeline JSON files and keeps duplicated records out', async () => {
    const firstPayload = Buffer.from(JSON.stringify({
      schemaVersion: 1,
      date: '2026-06-22',
      source: 'collaboration_daily',
      records: [
        {
          id: 'batch-1',
          title: '批量导入一',
          detail: '第一天补录。',
          occurredAt: '2026-06-22T10:00:00+08:00',
          category: '功能更新'
        }
      ]
    }), 'utf8')
    const secondPayload = Buffer.from(JSON.stringify({
      schemaVersion: 1,
      date: '2026-06-23',
      source: 'collaboration_daily',
      records: [
        {
          id: 'batch-2',
          title: '批量导入二',
          detail: '第二天补录。',
          occurredAt: '2026-06-23T10:00:00+08:00',
          category: '问题修复'
        }
      ]
    }), 'utf8')

    const firstResponse = await request(app)
      .post('/api/admin/project-timeline/import-batch')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .attach('files', firstPayload, {
        filename: '2026-06-22.json',
        contentType: 'application/json'
      })
      .attach('files', secondPayload, {
        filename: '2026-06-23.json',
        contentType: 'application/json'
      })
      .expect(200)

    const secondResponse = await request(app)
      .post('/api/admin/project-timeline/import-batch')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .attach('files', firstPayload, {
        filename: '2026-06-22.json',
        contentType: 'application/json'
      })
      .attach('files', secondPayload, {
        filename: '2026-06-23.json',
        contentType: 'application/json'
      })
      .expect(200)

    expect(firstResponse.body.data).toMatchObject({ inserted: 2, duplicated: 0, total: 2 })
    expect(secondResponse.body.data).toMatchObject({ inserted: 0, duplicated: 2, total: 2 })
    expect(firstResponse.body.data.files).toHaveLength(2)
    expect(await ProjectTimelineRecord.countDocuments({ source: 'collaboration_daily' })).toBe(2)
  })

  it('exports project timeline records with stable dedupe keys for re-import', async () => {
    const createResponse = await request(app)
      .post('/api/admin/project-timeline')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        title: '可导出节点',
        detail: '导出后再次导入不应重复。',
        occurredAt: '2026-06-24T10:00:00.000Z',
        category: '部署发布'
      })
      .expect(201)

    const exportResponse = await request(app)
      .get('/api/admin/project-timeline/export')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200)

    expect(exportResponse.body).toMatchObject({
      schemaVersion: 1,
      source: 'current_project'
    })
    expect(exportResponse.body.records).toHaveLength(1)
    expect(exportResponse.body.records[0]).toMatchObject({
      id: createResponse.body.data.id,
      legacyId: `record-${createResponse.body.data.id}`,
      source: 'manual',
      title: '可导出节点'
    })

    const payload = Buffer.from(JSON.stringify(exportResponse.body), 'utf8')
    const importResponse = await request(app)
      .post('/api/admin/project-timeline/import')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .attach('file', payload, {
        filename: 'project-timeline-export.json',
        contentType: 'application/json'
      })
      .expect(200)

    expect(importResponse.body.data).toMatchObject({ inserted: 0, duplicated: 1, total: 1 })
    expect(await ProjectTimelineRecord.countDocuments()).toBe(1)
  })

  it('builds project timeline seed records from allowed legacy notifications and keeps apply idempotent', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'timeline-seed-'))
    const tempFile = path.join(tempDir, 'notifications.json')
    fs.writeFileSync(tempFile, JSON.stringify({
      notifications: [
        {
          id: 'daily-1',
          source: 'daily',
          tag: '今日消息',
          title: '今日更新',
          content: '补充今日进度',
          date: '2026-06-20T08:00:00+08:00'
        },
        {
          id: 'history-1',
          source: 'history',
          category: '历史消息',
          title: '历史记录',
          summary: '旧站历史节点',
          historyDate: '2026-06-19'
        },
        {
          id: 'manual-1',
          source: 'manual',
          category: '手动消息',
          title: '手动补录',
          content: '人工整理节点',
          date: '2026-06-18'
        },
        {
          id: 'git-1',
          source: 'git',
          category: 'Git 提交',
          title: '提交噪音',
          content: '不应导入',
          date: '2026-06-17'
        },
        {
          id: 'bad-1',
          source: 'daily',
          tag: '今日消息',
          title: '缺少时间',
          content: '应跳过'
        }
      ]
    }), 'utf8')

    const { records, skipped } = buildProjectTimelineSeedRecords(tempFile)
    const legacyRecords = records.filter((record) => record.source.startsWith('legacy_'))

    expect(legacyRecords.map((record) => record.legacyId)).toEqual(['daily-1', 'history-1', 'manual-1'])
    expect(skipped).toEqual([{ id: 'bad-1', reason: '缺少标题、详情或时间' }])

    const firstResult = await upsertProjectTimelineSeedRecord(legacyRecords[0])
    const secondResult = await upsertProjectTimelineSeedRecord(legacyRecords[0])
    const count = await ProjectTimelineRecord.countDocuments({
      source: legacyRecords[0].source,
      legacyId: legacyRecords[0].legacyId
    })

    expect(firstResult.inserted).toBe(true)
    expect(secondResult.inserted).toBe(false)
    expect(count).toBe(1)
  })

  it('allows configuring nested auto expand for the article directory module', async () => {
    const directoryMenu = await Menu.findOne({ code: 'knowledge.directory' })

    const updateResponse = await request(app)
      .patch(`/api/rbac/menus/${directoryMenu._id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: '文章目录',
        directoryAutoExpandWhenNested: false
      })
      .expect(200)

    expect(updateResponse.body.data).toMatchObject({
      code: 'knowledge.directory',
      routePath: '/console/article-directory',
      directoryAutoExpandWhenNested: false
    })

    const freshMenu = await Menu.findById(directoryMenu._id)
    expect(freshMenu.directoryAutoExpandWhenNested).toBe(false)
  })

  it('protects system menu route fields while allowing display configuration', async () => {
    const knowledgeArticleMenu = await Menu.findOne({ code: 'knowledge.articles' })

    const routeResponse = await request(app)
      .patch(`/api/rbac/menus/${knowledgeArticleMenu._id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        routePath: '/console/manage/articles',
        code: 'knowledge.articles'
      })
      .expect(403)

    expect(routeResponse.body.code).toBe('SYSTEM_MENU_FIELD_PROTECTED')

    const updateResponse = await request(app)
      .patch(`/api/rbac/menus/${knowledgeArticleMenu._id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: '全部文章入口',
        hidden: true
      })
      .expect(200)

    expect(updateResponse.body.data).toMatchObject({
      name: '全部文章入口',
      hidden: true,
      routePath: '/console/articles'
    })

    const deleteResponse = await request(app)
      .delete(`/api/rbac/menus/${knowledgeArticleMenu._id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(403)

    expect(deleteResponse.body.code).toBe('BUILTIN_MENU_PROTECTED')
  })

  it('blocks admin API access when role lacks the matching menu permission', async () => {
    const commentsMenu = await Menu.findOne({ code: 'governance.comments' })
    const limitedRole = await Role.create({
      name: '仅评论审核',
      code: 'comment-only',
      menuIds: [commentsMenu._id],
      status: 'active'
    })
    const limitedAdmin = await User.create({
      username: 'limited-admin',
      email: 'limited-admin@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.ADMIN,
      roles: [limitedRole._id]
    })
    const token = signAccessToken(limitedAdmin)

    await request(app)
      .get('/api/admin/comments')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)

    expect(response.body.code).toBe('MENU_PERMISSION_REQUIRED')
  })

  it('does not grant admin domain access from legacy admin role alone', async () => {
    const noMenuRole = await Role.create({
      name: '空菜单管理员',
      code: 'empty-menu-admin',
      menuIds: [],
      status: 'active'
    })
    const legacyAdmin = await User.create({
      username: 'legacy-admin-without-menu',
      email: 'legacy-admin-without-menu@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.ADMIN,
      roles: [noMenuRole._id]
    })
    const token = signAccessToken(legacyAdmin)

    const response = await request(app)
      .get('/api/admin/comments')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)

    expect(response.body.code).toBe('FORBIDDEN')
  })

  it('lets role managers load permission menu tree without menu management access', async () => {
    const rolesMenu = await Menu.findOne({ code: 'governance.roles' })
    const roleManagerRole = await Role.create({
      name: '角色管理员',
      code: 'role-manager',
      menuIds: [rolesMenu._id],
      status: 'active'
    })
    const roleManager = await User.create({
      username: 'role-manager',
      email: 'role-manager@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.ADMIN,
      roles: [roleManagerRole._id]
    })
    const token = signAccessToken(roleManager)

    await request(app)
      .get('/api/rbac/roles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const permissionMenusResponse = await request(app)
      .get('/api/rbac/roles/permission-menus')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(permissionMenusResponse.body.data.tree.length).toBeGreaterThan(0)

    const menusResponse = await request(app)
      .get('/api/rbac/menus')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)

    expect(menusResponse.body.code).toBe('MENU_PERMISSION_REQUIRED')
  })

  it('paginates and filters roles with user counts', async () => {
    const rolesMenu = await Menu.findOne({ code: 'governance.roles' })
    const operatorRole = await Role.create({
      name: '内容运营',
      code: 'content-operator',
      remarkName: '外包运营组',
      menuIds: [rolesMenu._id],
      status: 'active',
      sortOrder: 50
    })
    await Role.create({
      name: '停用角色',
      code: 'disabled-role',
      menuIds: [],
      status: 'disabled',
      sortOrder: 60
    })
    await User.create({
      username: 'operator',
      email: 'operator@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.ADMIN,
      roles: [operatorRole._id]
    })

    const response = await request(app)
      .get('/api/rbac/roles')
      .query({
        page: 1,
        pageSize: 10,
        keyword: '外包',
        status: 'active',
        type: 'custom'
      })
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200)

    expect(response.body.data.total).toBe(1)
    expect(response.body.data.items[0]).toMatchObject({
      code: 'content-operator',
      remarkName: '外包运营组',
      userCount: 1
    })
  })

  it('keeps admin base approval scoped to dashboard instead of all admin menus', async () => {
    const adminBaseRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.ADMIN_BASE })
    const mediaMenu = await Menu.findOne({ code: 'content.media' })
    const usersMenu = await Menu.findOne({ code: 'governance.users' })

    expect(adminBaseRole.menuIds.map((id) => id.toString())).not.toContain(mediaMenu._id.toString())
    expect(adminBaseRole.menuIds.map((id) => id.toString())).not.toContain(usersMenu._id.toString())

    const user = await createUserWithRole(BUILTIN_ROLE_CODES.VISITOR, {
      username: 'scoped-applicant',
      email: 'scoped-applicant@example.com'
    })
    const token = signAccessToken(user)
    const createResponse = await request(app)
      .post('/api/profile/permission-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reason: '申请查看管理工作台'
      })
      .expect(201)

    await request(app)
      .post(`/api/rbac/permission-requests/${createResponse.body.data.id}/review`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ action: 'approve' })
      .expect(200)

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(meResponse.body.data.permissions.menuPaths).toContain('/console')
    expect(meResponse.body.data.permissions.menuPaths).not.toContain('/console/manage/media')
    expect(meResponse.body.data.permissions.menuPaths).not.toContain('/console/manage/users')

    const mediaResponse = await request(app)
      .get('/api/admin/media')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)

    expect(mediaResponse.body.code).toBe('MENU_PERMISSION_REQUIRED')
  })

  it('keeps manually configured builtin role menus after rbac seed sync', async () => {
    const visitorRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR })
    const articlesMenu = await Menu.findOne({ code: 'knowledge.articles' })
    const directoryMenu = await Menu.findOne({ code: 'knowledge.directory' })

    await request(app)
      .patch(`/api/rbac/roles/${visitorRole._id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        menuIds: [articlesMenu._id.toString()],
        status: 'active'
      })
      .expect(200)

    await ensureRbacSeed()

    const updatedRole = await Role.findById(visitorRole._id)
    const menuIds = updatedRole.menuIds.map((id) => id.toString())

    expect(menuIds).toContain(articlesMenu._id.toString())
    expect(menuIds).not.toContain(directoryMenu._id.toString())
  })

  it('adds ancestor menus when assigning only a child menu to a role', async () => {
    const rolesMenu = await Menu.findOne({ code: 'governance.roles' })
    const managementRoot = await Menu.findOne({ code: 'management.root' })

    const response = await request(app)
      .post('/api/rbac/roles')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: '授权测试角色',
        code: 'permission-test',
        menuIds: [rolesMenu._id.toString()],
        status: 'active'
      })
      .expect(201)

    expect(response.body.data.menuIds).toContain(rolesMenu._id.toString())
    expect(response.body.data.menuIds).toContain(managementRoot._id.toString())
  })

  it('does not let inherited console root permission unlock unrelated admin menus', async () => {
    const commentsMenu = await Menu.findOne({ code: 'governance.comments' })
    const createRoleResponse = await request(app)
      .post('/api/rbac/roles')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: '评论审核员',
        code: 'comment-auditor',
        menuIds: [commentsMenu._id.toString()],
        status: 'active'
      })
      .expect(201)
    const limitedRole = await Role.findById(createRoleResponse.body.data.id)
    const limitedAdmin = await User.create({
      username: 'comment-auditor',
      email: 'comment-auditor@example.com',
      passwordHash: 'hashed-password',
      role: USER_ROLES.ADMIN,
      roles: [limitedRole._id]
    })
    const token = signAccessToken(limitedAdmin)

    expect(createRoleResponse.body.data.menuIds.length).toBeGreaterThan(1)

    await request(app)
      .get('/api/admin/comments')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)

    expect(response.body.code).toBe('MENU_PERMISSION_REQUIRED')
  })

  it('prevents disabled roles from being approved through permission requests', async () => {
    const adminBaseRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.ADMIN_BASE })
    adminBaseRole.status = 'disabled'
    await adminBaseRole.save()

    const user = await createUserWithRole(BUILTIN_ROLE_CODES.VISITOR, {
      username: 'disabled-applicant',
      email: 'disabled-applicant@example.com'
    })
    const token = signAccessToken(user)

    const createResponse = await request(app)
      .post('/api/profile/permission-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reason: '申请参与内容运营'
      })
      .expect(400)

    expect(createResponse.body.code).toBe('TARGET_ROLE_DISABLED')
  })

  it('creates an unread system notification when permission request is reviewed', async () => {
    const user = await createUserWithRole(BUILTIN_ROLE_CODES.VISITOR, {
      username: 'applicant',
      email: 'applicant@example.com'
    })
    const token = signAccessToken(user)
    const createResponse = await request(app)
      .post('/api/profile/permission-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reason: '申请参与内容运营'
      })
      .expect(201)

    await request(app)
      .post(`/api/rbac/permission-requests/${createResponse.body.data.id}/review`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ action: 'approve' })
      .expect(200)

    const notification = await Notification.findOne({
      recipient: user._id,
      type: 'system',
      title: '权限申请已通过'
    })

    expect(notification).toBeTruthy()

    const unreadResponse = await request(app)
      .get('/api/public/announcements/unread-count')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(unreadResponse.body.data.count).toBeGreaterThanOrEqual(1)
  })

  it('allows super admin to delete ordinary users but protects super admin accounts', async () => {
    const user = await createUserWithRole(BUILTIN_ROLE_CODES.VISITOR, {
      username: 'deletable-user',
      email: 'deletable-user@example.com'
    })

    await request(app)
      .delete(`/api/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200)

    expect(await User.findById(user.id)).toBeNull()

    const protectedResponse = await request(app)
      .delete(`/api/admin/users/${superAdmin.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(403)

    expect(protectedResponse.body.code).toBe('SUPER_ADMIN_USER_PROTECTED')
  })

  it('persists menu reorder after subsequent menu queries', async () => {
    const rolesMenu = await Menu.findOne({ code: 'governance.roles' })
    const menusMenu = await Menu.findOne({ code: 'governance.menus' })
    const managementRoot = await Menu.findOne({ code: 'management.root' })

    await request(app)
      .post('/api/rbac/menus/reorder')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        items: [
          { id: rolesMenu.id, parentId: managementRoot.id, sortOrder: 30 },
          { id: menusMenu.id, parentId: managementRoot.id, sortOrder: 10 }
        ]
      })
      .expect(200)

    const response = await request(app)
      .get('/api/rbac/menus')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200)

    const managementMenu = response.body.data.tree.find((item) => item.code === 'management.root')
    const menuIndex = managementMenu.children.findIndex((item) => item.code === 'governance.menus')
    const roleIndex = managementMenu.children.findIndex((item) => item.code === 'governance.roles')
    expect(menuIndex).toBeGreaterThanOrEqual(0)
    expect(roleIndex).toBeGreaterThan(menuIndex)
  })

  it('allows child menus to be promoted or nested under another menu', async () => {
    const rolesMenu = await Menu.findOne({ code: 'governance.roles' })
    const menusMenu = await Menu.findOne({ code: 'governance.menus' })

    await request(app)
      .post('/api/rbac/menus/reorder')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        items: [
          { id: rolesMenu.id, parentId: null, sortOrder: 30 },
          { id: menusMenu.id, parentId: rolesMenu.id, sortOrder: 10 }
        ]
      })
      .expect(200)

    const promoted = await Menu.findById(rolesMenu.id)
    const nested = await Menu.findById(menusMenu.id)
    expect(promoted.parentType).toBe('root')
    expect(promoted.parentId).toBeNull()
    expect(promoted.level).toBe(1)
    expect(nested.parentId.toString()).toBe(rolesMenu.id)
    expect(nested.level).toBe(2)
  })

  it('blocks using article directory module as a parent menu', async () => {
    const directoryMenu = await Menu.findOne({ code: 'knowledge.directory' })
    const menusMenu = await Menu.findOne({ code: 'governance.menus' })

    const createResponse = await request(app)
      .post('/api/rbac/menus')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: '测试子菜单',
        code: 'test.child.under.directory',
        parentId: directoryMenu.id,
        routePath: '/console/test-child'
      })
      .expect(400)

    expect(createResponse.body.code).toBe('MENU_PARENT_NOT_CONTAINER')

    const updateResponse = await request(app)
      .patch(`/api/rbac/menus/${menusMenu.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        parentId: directoryMenu.id
      })
      .expect(400)

    expect(updateResponse.body.code).toBe('MENU_PARENT_NOT_CONTAINER')

    const reorderResponse = await request(app)
      .post('/api/rbac/menus/reorder')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        items: [
          { id: menusMenu.id, parentId: directoryMenu.id, sortOrder: 10 }
        ]
      })
      .expect(400)

    expect(reorderResponse.body.code).toBe('MENU_PARENT_NOT_CONTAINER')
  })
})
