import request from 'supertest'
import crypto from 'node:crypto'
import { BUILTIN_ROLE_CODES, USER_ROLES } from '#constants/domain'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { Role } from '#modules/rbac/models/Role.js'
import { Menu } from '#modules/rbac/models/Menu.js'
import { Notification } from '#modules/notification/models/Notification.js'
import { User } from '#modules/user/models/User.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
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
    const admin = await createUserWithRole(BUILTIN_ROLE_CODES.ADMIN_BASE, {
      username: 'base-admin',
      email: 'base-admin@example.com',
      legacyRole: USER_ROLES.ADMIN
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
        keyword: 'content',
        status: 'active',
        type: 'custom'
      })
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200)

    expect(response.body.data.total).toBe(1)
    expect(response.body.data.items[0]).toMatchObject({
      code: 'content-operator',
      userCount: 1
    })
  })

  it('adds ancestor menus when assigning only a child menu to a role', async () => {
    const rolesMenu = await Menu.findOne({ code: 'governance.roles' })
    const governanceRoot = await Menu.findOne({ code: 'governance.root' })

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
    expect(response.body.data.menuIds).toContain(governanceRoot._id.toString())
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
    const dashboard = await Menu.findOne({ code: 'console.dashboard' })
    const governanceRoot = await Menu.findOne({ code: 'governance.root' })

    await request(app)
      .post('/api/rbac/menus/reorder')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        items: [
          { id: dashboard.id, parentId: null, sortOrder: 40 },
          { id: governanceRoot.id, parentId: null, sortOrder: 10 }
        ]
      })
      .expect(200)

    const response = await request(app)
      .get('/api/rbac/menus')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200)

    const rootMenus = response.body.data.tree.filter((item) => !item.parentId)
    expect(rootMenus[0].code).toBe('governance.root')
    expect(rootMenus.at(-1).code).toBe('console.dashboard')
  })
})
