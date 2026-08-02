import fs from 'node:fs'
import path from 'node:path'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { USER_ROLES } from '#constants/domain'
import { Menu } from '#modules/rbac/models/Menu.js'
import { Role } from '#modules/rbac/models/Role.js'
import { Resume } from '#modules/resume/models/Resume.js'
import { ResumeExportRecord } from '#modules/resume/models/ResumeExportRecord.js'
import { ResumeInterview } from '#modules/resume/models/ResumeInterview.js'
import { ResumeMaterial } from '#modules/resume/models/ResumeMaterial.js'
import { User } from '#modules/user/models/User.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { HN246_BOSS_RESUME } from '../src/data/resume/hn246BossResume.js'
import { createApp } from '../src/app.js'
import { replaceBossResume } from '../src/scripts/replaceBossResume.js'
import { signAccessToken } from '../src/utils/jwt.js'
import { resolveUploadRoot } from '../src/utils/uploadPath.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function createResumeUser(email) {
  const menus = await Menu.find({ code: /^resume\./ })
  const role = await Role.create({
    name: 'Boss 简历测试角色',
    code: `boss-resume-${Date.now()}`,
    menuIds: menus.map((menu) => menu._id),
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

function oldResume(ownerId, title) {
  return Resume.create({
    ownerId,
    title,
    targetRole: '前端开发工程师',
    templateKey: 'classic',
    sections: {
      profile: { name: '陈浩南' },
      advantages: [],
      skills: [],
      education: [],
      workExperiences: [],
      projects: [],
      selfEvaluation: []
    }
  })
}

describe('Boss resume replacement and photo upload', () => {
  let app
  let user
  let token

  beforeAll(async () => {
    await connectTestDatabase()
  })

  beforeEach(async () => {
    await clearTestDatabase()
    app = createApp()
    await ensureRbacSeed()
    user = await createResumeUser('boss-resume@example.com')
    token = signAccessToken(user)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('uploads only JPG resume photos and persists the owned photo URL', async () => {
    const resume = await oldResume(user._id, '证件照上传测试')
    let uploadedPath = ''
    try {
      const response = await request(app)
        .post(`/api/resumes/${resume._id}/photo`)
        .set('Authorization', `Bearer ${token}`)
        .attach('photo', Buffer.from([0xff, 0xd8, 0xff, 0xd9]), {
          filename: 'resume-photo.jpg',
          contentType: 'image/jpeg'
        })
        .expect(200)

      const photoUrl = response.body.data.sections.profile.photoUrl
      expect(photoUrl).toMatch(/^\/uploads\/resumes\/.+\.jpg$/)
      uploadedPath = path.join(resolveUploadRoot(), photoUrl.replace('/uploads/', ''))
      expect(fs.existsSync(uploadedPath)).toBe(true)

      await request(app)
        .post(`/api/resumes/${resume._id}/photo`)
        .set('Authorization', `Bearer ${token}`)
        .attach('photo', Buffer.from('not-a-jpeg'), {
          filename: 'resume-photo.png',
          contentType: 'image/png'
        })
        .expect(400)
    } finally {
      if (uploadedPath) await fs.promises.unlink(uploadedPath).catch(() => {})
    }
  })

  it('replaces old resumes idempotently while preserving materials and valid interview links', async () => {
    const first = await oldResume(user._id, '旧简历一')
    const second = await oldResume(user._id, '旧简历二')
    await ResumeExportRecord.create({
      ownerId: user._id,
      resumeId: first._id,
      resumeTitle: first.title,
      format: 'pdf',
      templateKey: 'classic',
      filename: 'old.pdf',
      contentType: 'application/pdf',
      fileData: Buffer.from('%PDF-old'),
      fileSize: 8
    })
    await ResumeMaterial.create({
      ownerId: user._id,
      sourceKey: 'boss-material-1',
      title: '保留的简历资料',
      relativePath: 'materials/keep.md',
      checksum: 'keep-material-checksum'
    })
    const interview = await ResumeInterview.create({
      ownerId: user._id,
      question: '如何介绍旧项目？',
      links: [
        { resumeId: first._id, sectionKey: 'projects', entryId: 'old-1' },
        { resumeId: second._id, sectionKey: 'projects', entryId: 'old-2' }
      ]
    })

    const dryRun = await replaceBossResume({ ownerEmail: user.email })
    expect(dryRun.mode).toBe('dry-run')
    expect(dryRun.before.resumes).toHaveLength(2)
    expect(dryRun.before.exports).toBe(1)
    expect(dryRun.before.materialsPreserved).toBe(1)
    expect(await Resume.countDocuments({ ownerId: user._id })).toBe(2)

    const applied = await replaceBossResume({ ownerEmail: user.email, apply: true })
    expect(applied.result).toMatchObject({
      removedResumes: 2,
      removedExports: 1,
      interviewsUnlinked: 1,
      materialsPreserved: 1
    })
    const current = await Resume.findOne({ ownerId: user._id })
    expect(current.title).toBe(HN246_BOSS_RESUME.title)
    expect(current.sections.projects).toHaveLength(5)
    expect(await ResumeExportRecord.countDocuments({ ownerId: user._id })).toBe(0)
    expect(await ResumeMaterial.countDocuments({ ownerId: user._id })).toBe(1)
    expect((await ResumeInterview.findById(interview._id)).links).toHaveLength(0)

    await ResumeInterview.updateOne(
      { _id: interview._id },
      { $set: { links: [{ resumeId: current._id, sectionKey: 'projects', entryId: 'boss-project-pc' }] } }
    )
    const repeated = await replaceBossResume({ ownerEmail: user.email, apply: true })
    expect(repeated.result.removedResumes).toBe(0)
    expect(repeated.result.interviewsUnlinked).toBe(0)
    expect((await ResumeInterview.findById(interview._id)).links).toHaveLength(1)
  })
})
