import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { USER_ROLES, USER_STATUS } from '#constants/domain'
import { User } from '#modules/user/models/User.js'
import { Setting } from '#modules/settings/models/Setting.js'
import { PasswordResetRecord } from '#modules/passwordReset/models/PasswordResetRecord.js'
import { signAccessToken } from '../src/utils/jwt.js'
import { clearTestDatabase, connectTestDatabase, disconnectTestDatabase } from './helpers/testDatabase.js'

function encryptCredential(challenge, purpose, payload) {
  const encrypted = crypto.publicEncrypt(
    { key: challenge.publicKey, oaepHash: 'sha256', padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
    Buffer.from(JSON.stringify({ purpose, challengeId: challenge.challengeId, nonce: challenge.nonce, ...payload }), 'utf8')
  )
  return { challengeId: challenge.challengeId, payload: encrypted.toString('base64') }
}

async function createUser(email, role = USER_ROLES.USER, status = USER_STATUS.ACTIVE) {
  return User.create({
    username: email.split('@')[0],
    email,
    passwordHash: await bcrypt.hash('password123', 12),
    role,
    status
  })
}

async function getCredential(app, purpose, payload) {
  const challengeResponse = await request(app).get('/api/auth/challenge').query({ purpose }).expect(200)
  return encryptCredential(challengeResponse.body.data, purpose, payload)
}

function tokenFromUrl(url) {
  return new URLSearchParams(new URL(url).hash.slice(1)).get('token')
}

describe('password reset workflow', () => {
  beforeAll(connectTestDatabase)
  beforeEach(clearTestDatabase)
  afterAll(disconnectTestDatabase)

  it('generates a hashed one-time link and invalidates old sessions after consumption', async () => {
    const app = createApp()
    const admin = await createUser('owner@example.com', USER_ROLES.SUPER_ADMIN)
    const user = await createUser('reader@example.com')
    const adminToken = signAccessToken(admin)
    const oldUserToken = signAccessToken(user)

    const createResponse = await request(app)
      .post(`/api/admin/users/${user._id}/password-reset-links`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ expiresInMinutes: 30, note: 'QQ 核验通过' })
      .expect(201)

    const token = tokenFromUrl(createResponse.body.data.resetUrl)
    const storedRecord = await PasswordResetRecord.findById(createResponse.body.data.record.id).lean()
    expect(token).toHaveLength(43)
    expect(storedRecord.tokenHash).not.toBe(token)
    expect(JSON.stringify(storedRecord)).not.toContain(token)

    const inspectResponse = await request(app)
      .post('/api/auth/password-reset/inspect')
      .send({ token })
      .expect(200)
    expect(inspectResponse.body.data).toMatchObject({ status: 'active', maskedEmail: 're****@example.com' })
    expect((await PasswordResetRecord.findById(storedRecord._id)).usedAt).toBeNull()

    const credential = await getCredential(app, 'password-reset-link', {
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123'
    })
    await request(app).post('/api/auth/password-reset/consume').send({ token, credential }).expect(200)

    await request(app).get('/api/auth/me').set('Authorization', `Bearer ${oldUserToken}`).expect(401)
    await request(app).post('/api/auth/login').send({ email: user.email, password: 'newPassword123' }).expect(200)
    const usedResponse = await request(app)
      .post('/api/auth/password-reset/inspect')
      .send({ token })
      .expect(200)
    expect(usedResponse.body.data.status).toBe('used')
    const revokeUsedResponse = await request(app)
      .post(`/api/admin/password-reset-links/${storedRecord._id}/revoke`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(409)
    expect(revokeUsedResponse.body.code).toBe('PASSWORD_RESET_LINK_NOT_ACTIVE')

    const secondCredential = await getCredential(app, 'password-reset-link', {
      newPassword: 'anotherPassword123',
      confirmPassword: 'anotherPassword123'
    })
    const secondResponse = await request(app)
      .post('/api/auth/password-reset/consume')
      .send({ token, credential: secondCredential })
      .expect(400)
    expect(secondResponse.body.code).toBe('PASSWORD_RESET_LINK_INVALID')
  })

  it('revokes previous links, supports manual revocation, and blocks disabled accounts', async () => {
    const app = createApp()
    const admin = await createUser('owner@example.com', USER_ROLES.SUPER_ADMIN)
    const user = await createUser('reader@example.com')
    const adminToken = signAccessToken(admin)

    const first = await request(app).post(`/api/admin/users/${user._id}/password-reset-links`)
      .set('Authorization', `Bearer ${adminToken}`).send({ expiresInMinutes: 15 }).expect(201)
    const second = await request(app).post(`/api/admin/users/${user._id}/password-reset-links`)
      .set('Authorization', `Bearer ${adminToken}`).send({ expiresInMinutes: 60 }).expect(201)

    const supersededResponse = await request(app)
      .post('/api/auth/password-reset/inspect')
      .send({ token: tokenFromUrl(first.body.data.resetUrl) })
      .expect(200)
    expect(supersededResponse.body.data.status).toBe('revoked')
    const activeDeleteResponse = await request(app)
      .delete(`/api/admin/password-reset-records/${second.body.data.record.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(409)
    expect(activeDeleteResponse.body.code).toBe('PASSWORD_RESET_RECORD_ACTIVE')
    await request(app).post(`/api/admin/password-reset-links/${second.body.data.record.id}/revoke`)
      .set('Authorization', `Bearer ${adminToken}`).expect(200)
    const revokedResponse = await request(app)
      .post('/api/auth/password-reset/inspect')
      .send({ token: tokenFromUrl(second.body.data.resetUrl) })
      .expect(200)
    expect(revokedResponse.body.data.status).toBe('revoked')
    await request(app)
      .delete(`/api/admin/password-reset-records/${second.body.data.record.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    const remainingRecords = await request(app)
      .get(`/api/admin/users/${user._id}/password-reset-records`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    expect(remainingRecords.body.data.some((item) => item.id === second.body.data.record.id)).toBe(false)
    expect(await PasswordResetRecord.findById(second.body.data.record.id)).toBeNull()
    const deletedLinkInspect = await request(app)
      .post('/api/auth/password-reset/inspect')
      .send({ token: tokenFromUrl(second.body.data.resetUrl) })
      .expect(400)
    expect(deletedLinkInspect.body.code).toBe('PASSWORD_RESET_LINK_INVALID')

    const expired = await request(app).post(`/api/admin/users/${user._id}/password-reset-links`)
      .set('Authorization', `Bearer ${adminToken}`).send({ expiresInMinutes: 15 }).expect(201)
    await PasswordResetRecord.updateOne(
      { _id: expired.body.data.record.id },
      { $set: { expiresAt: new Date(Date.now() - 1000) } }
    )
    const expiredResponse = await request(app)
      .post('/api/auth/password-reset/inspect')
      .send({ token: tokenFromUrl(expired.body.data.resetUrl) })
      .expect(200)
    expect(expiredResponse.body.data.status).toBe('expired')

    await User.updateOne({ _id: user._id }, { $set: { status: USER_STATUS.DISABLED } })
    const blocked = await request(app).post(`/api/admin/users/${user._id}/password-reset-links`)
      .set('Authorization', `Bearer ${adminToken}`).send({ expiresInMinutes: 30 }).expect(403)
    expect(blocked.body.code).toBe('USER_DISABLED')
  })

  it('treats a reset link as invalid after its target account is deleted', async () => {
    const app = createApp()
    const admin = await createUser('owner@example.com', USER_ROLES.SUPER_ADMIN)
    const user = await createUser('reader@example.com')
    const createResponse = await request(app)
      .post(`/api/admin/users/${user._id}/password-reset-links`)
      .set('Authorization', `Bearer ${signAccessToken(admin)}`)
      .send({ expiresInMinutes: 30 })
      .expect(201)

    const token = tokenFromUrl(createResponse.body.data.resetUrl)
    await User.deleteOne({ _id: user._id })

    const response = await request(app)
      .post('/api/auth/password-reset/inspect')
      .send({ token })
      .expect(400)
    expect(response.body.code).toBe('PASSWORD_RESET_LINK_INVALID')
  })

  it('requires super admin access and allows a super admin to reset only their own protected account', async () => {
    const app = createApp()
    const admin = await createUser('owner@example.com', USER_ROLES.SUPER_ADMIN)
    const otherAdmin = await createUser('other-owner@example.com', USER_ROLES.SUPER_ADMIN)
    const user = await createUser('reader@example.com')

    await request(app).post(`/api/admin/users/${user._id}/password-reset-links`)
      .set('Authorization', `Bearer ${signAccessToken(user)}`).send({ expiresInMinutes: 30 }).expect(403)

    const credential = await getCredential(app, 'admin-reset-password', {
      newPassword: 'ownerPassword456',
      confirmPassword: 'ownerPassword456'
    })
    const selfResponse = await request(app).post(`/api/admin/users/${admin._id}/reset-password`)
      .set('Authorization', `Bearer ${signAccessToken(admin)}`).send({ credential, note: '本人修改' }).expect(200)
    expect(selfResponse.body.data.selfReset).toBe(true)

    const otherCredential = await getCredential(app, 'admin-reset-password', {
      newPassword: 'blockedPassword456',
      confirmPassword: 'blockedPassword456'
    })
    const refreshedAdmin = await User.findById(admin._id)
    const blocked = await request(app).post(`/api/admin/users/${otherAdmin._id}/reset-password`)
      .set('Authorization', `Bearer ${signAccessToken(refreshedAdmin)}`).send({ credential: otherCredential }).expect(403)
    expect(blocked.body.code).toBe('SUPER_ADMIN_RESET_FORBIDDEN')
  })

  it('rate limits repeated link inspection and invalid consumption attempts', async () => {
    const app = createApp()
    const invalidToken = 'x'.repeat(43)

    for (let index = 0; index < 30; index += 1) {
      await request(app).post('/api/auth/password-reset/inspect').send({ token: invalidToken }).expect(400)
    }
    const inspectLimited = await request(app)
      .post('/api/auth/password-reset/inspect')
      .send({ token: invalidToken })
      .expect(429)
    expect(inspectLimited.body.code).toBe('PASSWORD_RESET_RATE_LIMITED')

    for (let index = 0; index < 5; index += 1) {
      const credential = await getCredential(app, 'password-reset-link', {
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123'
      })
      await request(app).post('/api/auth/password-reset/consume').send({ token: invalidToken, credential }).expect(400)
    }
    const credential = await getCredential(app, 'password-reset-link', {
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123'
    })
    const consumeLimited = await request(app)
      .post('/api/auth/password-reset/consume')
      .send({ token: invalidToken, credential })
      .expect(429)
    expect(consumeLimited.body.code).toBe('PASSWORD_RESET_RATE_LIMITED')
  })

  it('keeps multiple direct reset audit records without a token hash collision', async () => {
    const app = createApp()
    const admin = await createUser('owner@example.com', USER_ROLES.SUPER_ADMIN)
    const user = await createUser('reader@example.com')
    let adminToken = signAccessToken(admin)

    for (const password of ['firstPassword123', 'secondPassword123']) {
      const credential = await getCredential(app, 'admin-reset-password', {
        newPassword: password,
        confirmPassword: password
      })
      await request(app).post(`/api/admin/users/${user._id}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`).send({ credential }).expect(200)
      adminToken = signAccessToken(await User.findById(admin._id))
    }

    expect(await PasswordResetRecord.countDocuments({ targetUser: user._id, mode: 'direct' })).toBe(2)
  })

  it('returns only whitelisted public profile and enabled recovery contacts', async () => {
    const app = createApp()
    await Setting.create([
      { key: 'mediaMaxFileSizeMB', value: 900 },
      { key: 'accountRecovery', value: {
        enabled: true,
        instructions: '人工核验',
        qq: { enabled: false, account: '10001', allowLaunch: true, qrCode: { url: '/uploads/private-qq.png' } },
        wechat: { enabled: true, account: 'wechat-owner', qrCode: { url: '/uploads/wechat.png' } },
        email: { enabled: true, address: 'help@example.com' }
      } }
    ])

    const response = await request(app).get('/api/public/site/profile').expect(200)
    expect(response.body.data.mediaMaxFileSizeMB).toBeUndefined()
    expect(response.body.data.accountRecovery.qq).toMatchObject({ enabled: false, account: '', qrCodeUrl: '' })
    expect(response.body.data.accountRecovery.wechat).toMatchObject({ enabled: true, account: 'wechat-owner', qrCodeUrl: '/uploads/wechat.png' })

    await Setting.updateOne(
      { key: 'accountRecovery' },
      { $set: { 'value.enabled': false } }
    )
    const disabledResponse = await request(app).get('/api/public/site/profile').expect(200)
    expect(disabledResponse.body.data.accountRecovery).toMatchObject({
      enabled: false,
      instructions: '',
      contactHours: '',
      qq: { enabled: false, account: '', qrCodeUrl: '' },
      wechat: { enabled: false, account: '', qrCodeUrl: '' },
      email: { enabled: false, address: '' }
    })
  })
})
