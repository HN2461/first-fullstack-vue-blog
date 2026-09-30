import { z } from 'zod'

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD')
const timeSchema = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, '时间格式应为 HH:mm')
const optionalTimeSchema = z.union([z.literal(''), timeSchema]).optional()
const optionalText = (max) => z.string().trim().max(max).optional()

export const employmentCreateSchema = z.object({
  company: z.string().trim().min(1, '请输入公司名称').max(120),
  department: z.string().trim().max(120).optional(),
  position: z.string().trim().min(1, '请输入岗位名称').max(120),
  startedOn: dateSchema,
  endedOn: z.union([z.literal(''), dateSchema]).optional(),
  probationSalary: optionalText(80),
  regularSalary: optionalText(80),
  salaryUnit: z.enum(['', '月薪', '年薪', '时薪', '面议', '其他']).optional(),
  workSchedule: z.enum(['', '双休', '单休', '大小周', '轮班制', '不固定', '其他']).optional(),
  workStartTime: optionalTimeSchema,
  workEndTime: optionalTimeSchema,
  departureContactName: optionalText(80),
  departureContactPhone: optionalText(40),
  departureContactEmail: z.string().trim().email('请输入正确的联系人邮箱').max(160).optional().or(z.literal('')),
  workContent: optionalText(5000),
  companyAddress: optionalText(300),
  note: z.string().trim().max(1000).optional()
}).strict()

export const employmentUpdateSchema = employmentCreateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: '请提供需要更新的字段'
})

export const workLogCreateSchema = z.object({
  employmentId: z.string().min(1),
  workDate: dateSchema,
  title: z.string().trim().min(1, '请输入日记标题').max(160),
  summary: z.string().trim().max(500).optional(),
  accomplishments: z.string().max(10000).optional(),
  blockers: z.string().max(5000).optional(),
  nextPlan: z.string().max(5000).optional(),
  contentMarkdown: z.string().max(30000).optional(),
  status: z.enum(['draft', 'final']).optional()
}).strict()

export const workLogUpdateSchema = workLogCreateSchema.omit({ employmentId: true, workDate: true }).partial().extend({
  status: z.enum(['draft', 'final']).optional()
}).strict().refine((value) => Object.keys(value).length > 0, { message: '请提供需要更新的字段' })

export const workReportCreateSchema = z.object({
  employmentId: z.string().min(1),
  period: z.enum(['week', 'month']),
  date: dateSchema,
  title: z.string().trim().max(160).optional(),
  contentMarkdown: z.string().max(60000).optional()
}).strict()

export const workReportUpdateSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  contentMarkdown: z.string().max(60000).optional(),
  status: z.enum(['draft', 'final']).optional()
}).strict().refine((value) => Object.keys(value).length > 0, { message: '请提供需要更新的字段' })

export function parseWorkJournalPayload(schema, body) {
  const result = schema.safeParse(body)
  if (!result.success) {
    const error = new Error(result.error.issues[0]?.message || '参数不正确')
    error.statusCode = 400
    error.code = 'VALIDATION_ERROR'
    throw error
  }
  return result.data
}
