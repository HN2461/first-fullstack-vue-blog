import { z } from 'zod'
import { RESUME_EXPORT_FORMATS } from '#modules/resume/models/ResumeExportRecord.js'
import { RESUME_STATUSES } from '#modules/resume/models/Resume.js'

const text = (max, message) => z.string().trim().max(max, message).optional().default('')
const tagSchema = z.string().trim().min(1, '标签不能为空').max(24, '单个标签不能超过 24 个字符')
const difficultySchema = z.enum(['low', 'medium', 'high'], { invalid_type_error: '难度不正确' })
const itemIdSchema = z.string().trim().max(80, '条目标识不能超过 80 个字符').optional()

const highlightSchema = z.object({
  id: itemIdSchema,
  content: z.string().trim().min(1, '亮点内容不能为空').max(500, '亮点内容不能超过 500 个字符'),
  sortOrder: z.number().int().min(0).max(9999).optional().default(0)
}).passthrough()

const skillSchema = z.object({
  id: itemIdSchema,
  name: z.string().trim().min(1, '技能名称不能为空').max(80, '技能名称不能超过 80 个字符'),
  level: text(40, '熟练度不能超过 40 个字符'),
  description: text(500, '技能说明不能超过 500 个字符'),
  sortOrder: z.number().int().min(0).max(9999).optional().default(0)
}).passthrough()

const educationSchema = z.object({
  id: itemIdSchema,
  school: text(100, '学校名称不能超过 100 个字符'),
  degree: text(80, '学历不能超过 80 个字符'),
  major: text(100, '专业不能超过 100 个字符'),
  startDate: text(20, '开始时间不能超过 20 个字符'),
  endDate: text(20, '结束时间不能超过 20 个字符'),
  description: text(1000, '教育经历说明不能超过 1000 个字符'),
  sortOrder: z.number().int().min(0).max(9999).optional().default(0)
}).passthrough()

const workSchema = z.object({
  id: itemIdSchema,
  company: text(100, '公司名称不能超过 100 个字符'),
  role: text(100, '职位不能超过 100 个字符'),
  startDate: text(20, '开始时间不能超过 20 个字符'),
  endDate: text(20, '结束时间不能超过 20 个字符'),
  description: text(1200, '工作说明不能超过 1200 个字符'),
  achievements: z.array(highlightSchema).max(30, '单段工作成果最多 30 条').optional().default([]),
  sortOrder: z.number().int().min(0).max(9999).optional().default(0)
}).passthrough()

const projectSchema = z.object({
  id: itemIdSchema,
  name: text(120, '项目名称不能超过 120 个字符'),
  role: text(100, '项目角色不能超过 100 个字符'),
  techStack: text(300, '技术栈不能超过 300 个字符'),
  startDate: text(20, '开始时间不能超过 20 个字符'),
  endDate: text(20, '结束时间不能超过 20 个字符'),
  description: text(1200, '项目说明不能超过 1200 个字符'),
  highlights: z.array(highlightSchema).max(40, '单个项目亮点最多 40 条').optional().default([]),
  sortOrder: z.number().int().min(0).max(9999).optional().default(0)
}).passthrough()

const evaluationSchema = z.object({
  id: itemIdSchema,
  content: z.string().trim().min(1, '自我评价不能为空').max(500, '自我评价不能超过 500 个字符'),
  sortOrder: z.number().int().min(0).max(9999).optional().default(0)
}).passthrough()

const sectionsSchema = z.object({
  profile: z.object({
    name: text(60, '姓名不能超过 60 个字符'),
    phone: text(40, '手机号不能超过 40 个字符'),
    email: text(120, '邮箱不能超过 120 个字符'),
    location: text(80, '所在地不能超过 80 个字符'),
    website: text(200, '个人链接不能超过 200 个字符'),
    summary: text(1000, '个人简介不能超过 1000 个字符')
  }).optional().default({}),
  skills: z.array(skillSchema).max(80, '技能条目最多 80 条').optional().default([]),
  education: z.array(educationSchema).max(30, '教育经历最多 30 条').optional().default([]),
  workExperiences: z.array(workSchema).max(50, '工作经历最多 50 条').optional().default([]),
  projects: z.array(projectSchema).max(80, '项目经历最多 80 条').optional().default([]),
  selfEvaluation: z.array(evaluationSchema).max(30, '自我评价最多 30 条').optional().default([])
}).strict('存在不支持的简历模块字段')

export const resumeCreateSchema = z.object({
  title: z.string().trim().min(1, '简历标题不能为空').max(80, '简历标题不能超过 80 个字符'),
  targetRole: text(80, '目标岗位不能超过 80 个字符'),
  templateKey: z.string().trim().max(40, '模板标识不能超过 40 个字符').optional(),
  status: z.enum(RESUME_STATUSES, { invalid_type_error: '简历状态不正确' }).optional(),
  sections: sectionsSchema.optional()
}).strict('存在不支持的简历字段')

export const resumeUpdateSchema = resumeCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: '请提供需要更新的简历字段' }
)

export const resumeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  keyword: z.string().trim().max(80).optional(),
  status: z.enum([...RESUME_STATUSES, 'all']).optional(),
  templateKey: z.string().trim().max(40).optional()
}).passthrough()

export const interviewLinkSchema = z.object({
  resumeId: z.string().trim().min(1, '请选择简历'),
  sectionKey: z.string().trim().min(1, '请选择简历模块').max(40),
  entryId: z.string().trim().max(80).optional().default(''),
  highlightId: z.string().trim().max(80).optional().default(''),
  excerpt: z.string().trim().max(300, '原文摘录不能超过 300 个字符').optional().default('')
}).strict('存在不支持的关联字段')

export const interviewCreateSchema = z.object({
  question: z.string().trim().min(1, '问题不能为空').max(300, '问题不能超过 300 个字符'),
  answerOutline: text(5000, '回答思路不能超过 5000 个字符'),
  polishedAnswer: text(8000, '优化话术不能超过 8000 个字符'),
  tags: z.array(tagSchema).max(12, '最多添加 12 个标签').optional().default([]),
  difficulty: difficultySchema.optional().default('medium'),
  links: z.array(interviewLinkSchema).max(20, '最多关联 20 条简历原文').optional().default([])
}).strict('存在不支持的问答字段')

export const interviewUpdateSchema = interviewCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: '请提供需要更新的问答字段' }
)

export const interviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  keyword: z.string().trim().max(80).optional(),
  tag: z.string().trim().max(24).optional(),
  resumeId: z.string().trim().max(80).optional(),
  sectionKey: z.string().trim().max(40).optional(),
  entryId: z.string().trim().max(80).optional(),
  highlightId: z.string().trim().max(80).optional()
}).passthrough()

export const materialQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  keyword: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
  tag: z.string().trim().max(24).optional()
}).passthrough()

export const exportCreateSchema = z.object({
  resumeId: z.string().trim().min(1, '请选择简历'),
  format: z.enum(RESUME_EXPORT_FORMATS, { invalid_type_error: '导出格式不正确' }),
  templateKey: z.string().trim().max(40, '模板标识不能超过 40 个字符').optional()
}).strict('存在不支持的导出字段')

export const exportQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  resumeId: z.string().trim().max(80).optional(),
  format: z.enum([...RESUME_EXPORT_FORMATS, 'all']).optional()
}).passthrough()

export function parseBody(schema, body) {
  const result = schema.safeParse(body)

  if (!result.success) {
    const error = new Error(result.error.issues[0]?.message || '参数不正确')
    error.statusCode = 400
    error.code = 'VALIDATION_ERROR'
    throw error
  }

  return result.data
}
