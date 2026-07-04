import { ResumeTemplate } from '#modules/resume/models/ResumeTemplate.js'
import { createResumeError } from './resume.utils.js'

const SYSTEM_TEMPLATES = [
  {
    key: 'classic',
    name: '经典投递',
    description: '适合通用技术岗位，结构清晰，信息密度适中。',
    accentColor: '#1677ff',
    sortOrder: 10
  },
  {
    key: 'compact',
    name: '紧凑工程',
    description: '突出技能栈和项目成果，适合经验较多的候选人。',
    accentColor: '#0f766e',
    sortOrder: 20
  },
  {
    key: 'executive',
    name: '资深管理',
    description: '强调业务影响、团队协作和关键成果。',
    accentColor: '#7c3aed',
    sortOrder: 30
  }
]

export async function ensureResumeTemplates() {
  for (const template of SYSTEM_TEMPLATES) {
    await ResumeTemplate.findOneAndUpdate(
      { ownerId: null, key: template.key },
      {
        $set: {
          ...template,
          ownerId: null,
          isSystem: true,
          enabled: true
        }
      },
      { upsert: true, new: true }
    )
  }
}

export async function listResumeTemplates(userId) {
  await ensureResumeTemplates()
  const templates = await ResumeTemplate.find({
    enabled: true,
    $or: [
      { ownerId: null },
      { ownerId: userId }
    ]
  }).sort({ sortOrder: 1, createdAt: 1 })

  return templates.map((item) => item.toSafeJSON())
}

export async function getResumeTemplate(key, userId) {
  await ensureResumeTemplates()
  const template = await ResumeTemplate.findOne({
    key,
    enabled: true,
    $or: [
      { ownerId: null },
      { ownerId: userId }
    ]
  })

  if (!template) {
    throw createResumeError(404, 'RESUME_TEMPLATE_NOT_FOUND', '简历模板不存在')
  }

  return template.toSafeJSON()
}
