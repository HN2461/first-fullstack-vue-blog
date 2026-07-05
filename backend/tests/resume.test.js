import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { BUILTIN_ROLE_CODES, USER_ROLES } from '#constants/domain'
import { createApp } from '../src/app.js'
import { Menu } from '#modules/rbac/models/Menu.js'
import { Role } from '#modules/rbac/models/Role.js'
import { User } from '#modules/user/models/User.js'
import { ResumeMaterial } from '#modules/resume/models/ResumeMaterial.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { signAccessToken } from '../src/utils/jwt.js'
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase
} from './helpers/testDatabase.js'

async function createUser(email, role) {
  return User.create({
    username: email.split('@')[0],
    email,
    passwordHash: 'hashed-password',
    role: USER_ROLES.USER,
    roles: role ? [role._id] : []
  })
}

async function createResumeRole() {
  const menus = await Menu.find({ code: /^resume\./ })
  return Role.create({
    name: '简历使用者',
    code: 'resume-user',
    menuIds: menus.map((menu) => menu._id),
    status: 'active'
  })
}

function resumePayload(title = '前端工程师投递版') {
  return {
    title,
    targetRole: 'Vue 全栈开发工程师',
    templateKey: 'classic',
    sections: {
      profile: {
        name: '韩宁',
        email: 'han@example.com',
        summary: '长期维护知识库和后台系统。'
      },
      skills: [
        { id: 'skill-1', name: 'Vue 3', level: '熟练', sortOrder: 10 }
      ],
      education: [],
      workExperiences: [],
      projects: [
        {
          id: 'project-1',
          name: '个人知识库系统',
          role: '全栈开发',
          techStack: 'Vue, Express, MongoDB',
          highlights: [
            { id: 'highlight-1', content: '设计动态菜单和 RBAC 权限体系', sortOrder: 10 }
          ],
          sortOrder: 10
        }
      ],
      selfEvaluation: [
        { id: 'eval-1', content: '重视工程质量和长期维护。', sortOrder: 10 }
      ]
    }
  }
}

describe('resume module', () => {
  let app
  let resumeRole
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
    resumeRole = await createResumeRole()
    user = await createUser('resume-user@example.com', resumeRole)
    otherUser = await createUser('other-resume-user@example.com', resumeRole)
    token = signAccessToken(user)
    otherToken = signAccessToken(otherUser)
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('seeds resume menus for super admin only by default', async () => {
    const resumeRoot = await Menu.findOne({ code: 'resume.root' })
    const resumeList = await Menu.findOne({ code: 'resume.list' })
    const resumeEditor = await Menu.findOne({ code: 'resume.editor' })
    const superRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.SUPER_ADMIN })
    const visitorRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR })
    const adminBaseRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.ADMIN_BASE })

    expect(resumeRoot).toMatchObject({ name: '简历模块', parentType: 'root' })
    expect(resumeList).toMatchObject({ routePath: '/console/resumes' })
    expect(resumeEditor).toBeNull()
    expect(superRole.menuIds.map(String)).toContain(resumeRoot._id.toString())
    expect(superRole.menuIds.map(String)).toContain(resumeList._id.toString())
    expect(visitorRole.menuIds.map(String)).not.toContain(resumeRoot._id.toString())
    expect(adminBaseRole.menuIds.map(String)).not.toContain(resumeRoot._id.toString())
  })

  it('requires resume menu permission', async () => {
    const visitorRole = await Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR })
    const visitor = await createUser('resume-visitor@example.com', visitorRole)
    const visitorToken = signAccessToken(visitor)

    const response = await request(app)
      .get('/api/resumes')
      .set('Authorization', `Bearer ${visitorToken}`)
      .expect(403)

    expect(response.body.code).toBe('MENU_PERMISSION_REQUIRED')
  })

  it('creates, updates, duplicates and lists owned resumes', async () => {
    const createResponse = await request(app)
      .post('/api/resumes')
      .set('Authorization', `Bearer ${token}`)
      .send(resumePayload())
      .expect(201)

    expect(createResponse.body.data.sections.projects[0].highlights[0]).toMatchObject({
      id: 'highlight-1',
      content: '设计动态菜单和 RBAC 权限体系'
    })

    const updateResponse = await request(app)
      .patch(`/api/resumes/${createResponse.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '高级前端工程师投递版',
        sections: {
          ...createResponse.body.data.sections,
          skills: [
            { name: 'Node.js', level: '熟练', sortOrder: 20 }
          ]
        }
      })
      .expect(200)

    expect(updateResponse.body.data.title).toBe('高级前端工程师投递版')
    expect(updateResponse.body.data.sections.skills[0].id).toBeTruthy()

    await request(app)
      .post(`/api/resumes/${createResponse.body.data.id}/duplicate`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)

    const listResponse = await request(app)
      .get('/api/resumes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(listResponse.body.data.total).toBe(2)
  })

  it('keeps resume data isolated by owner', async () => {
    const createResponse = await request(app)
      .post('/api/resumes')
      .set('Authorization', `Bearer ${token}`)
      .send(resumePayload('我的简历'))
      .expect(201)

    await request(app)
      .get(`/api/resumes/${createResponse.body.data.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404)

    await request(app)
      .patch(`/api/resumes/${createResponse.body.data.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: '越权修改' })
      .expect(404)
  })

  it('links interview materials to resume highlights and supports reverse lookup', async () => {
    const resumeResponse = await request(app)
      .post('/api/resumes')
      .set('Authorization', `Bearer ${token}`)
      .send(resumePayload())
      .expect(201)

    const link = {
      resumeId: resumeResponse.body.data.id,
      sectionKey: 'projects',
      entryId: 'project-1',
      highlightId: 'highlight-1',
      excerpt: '设计动态菜单和 RBAC 权限体系'
    }
    const interviewResponse = await request(app)
      .post('/api/resume-interviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        question: '你是如何设计菜单权限的？',
        answerOutline: '先说明后端菜单树，再说明路由和接口权限。',
        polishedAnswer: '我会从 RBAC 数据模型、菜单树和接口守卫三个层面展开。',
        tags: ['RBAC'],
        links: [link]
      })
      .expect(201)

    expect(interviewResponse.body.data.links[0]).toMatchObject(link)

    const reverseResponse = await request(app)
      .get('/api/resume-interviews')
      .query(link)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(reverseResponse.body.data.total).toBe(1)
    expect(reverseResponse.body.data.items[0].question).toBe('你是如何设计菜单权限的？')
  })

  it('reads interview detail only for the owner', async () => {
    const interviewResponse = await request(app)
      .post('/api/resume-interviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        question: '你如何优化复杂表单保存体验？',
        answerOutline: '说明 debounce 自动保存、失败提示和服务端持久化。',
        polishedAnswer: '我会先拆分表单状态，再用后端保存结果作为最终可信数据。',
        tags: ['表单']
      })
      .expect(201)

    const detailResponse = await request(app)
      .get(`/api/resume-interviews/${interviewResponse.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(detailResponse.body.data.question).toBe('你如何优化复杂表单保存体验？')

    await request(app)
      .get(`/api/resume-interviews/${interviewResponse.body.data.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404)
  })

  it('lists imported resume materials and keeps detail isolated by owner', async () => {
    const material = await ResumeMaterial.create({
      ownerId: user._id,
      sourceKey: 'test-material-1',
      title: '面试问答参考',
      category: '面试准备',
      format: 'markdown',
      relativePath: 'resume/05-面试准备/面试问答参考.md',
      content: '你如何介绍项目？\n先说业务背景，再说职责和结果。',
      excerpt: '你如何介绍项目？',
      tags: ['resume', '面试准备'],
      checksum: 'checksum-1',
      fileSize: 42
    })
    await ResumeMaterial.create({
      ownerId: otherUser._id,
      sourceKey: 'test-material-2',
      title: '其他人的资料',
      category: '面试准备',
      format: 'markdown',
      relativePath: 'other.md',
      content: '不可见',
      excerpt: '不可见',
      tags: ['private'],
      checksum: 'checksum-2',
      fileSize: 12
    })

    const listResponse = await request(app)
      .get('/api/resume-materials')
      .query({ keyword: '项目' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(listResponse.body.data.total).toBe(1)
    expect(listResponse.body.data.items[0]).toMatchObject({
      title: '面试问答参考',
      category: '面试准备'
    })
    expect(listResponse.body.data.items[0].content).toBeUndefined()

    const detailResponse = await request(app)
      .get(`/api/resume-materials/${material._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(detailResponse.body.data.content).toContain('先说业务背景')

    await request(app)
      .get(`/api/resume-materials/${material._id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404)
  })

  it('exports markdown, pdf and word files as owned download records', async () => {
    const resumeResponse = await request(app)
      .post('/api/resumes')
      .set('Authorization', `Bearer ${token}`)
      .send(resumePayload())
      .expect(201)

    for (const format of ['markdown', 'pdf', 'word']) {
      const exportResponse = await request(app)
        .post('/api/resume-exports')
        .set('Authorization', `Bearer ${token}`)
        .send({ resumeId: resumeResponse.body.data.id, format })
        .expect(201)

      expect(exportResponse.body.data.format).toBe(format)
      expect(exportResponse.body.data.fileSize).toBeGreaterThan(0)

      const downloadResponse = await request(app)
        .get(`/api/resume-exports/${exportResponse.body.data.id}/download`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(downloadResponse.headers['content-disposition']).toContain('filename*=')
      expect(Number(downloadResponse.headers['content-length'])).toBeGreaterThan(0)
    }
  })
})
