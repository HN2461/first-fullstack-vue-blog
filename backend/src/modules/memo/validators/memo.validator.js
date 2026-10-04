import { z } from 'zod'
import {
  MEMO_FIELD_TYPES,
  MEMO_KINDS,
  MEMO_PRIORITIES,
  MEMO_STATUSES,
  MEMO_TYPES
} from '#modules/memo/models/Memo.js'

const tagSchema = z.string().trim().min(1, '标签不能为空').max(20, '单个标签不能超过 20 个字符')
const dueAtSchema = z.union([
  z.literal(''),
  z.string().trim().min(1, '计划日期格式不正确'),
  z.null()
]).optional()

const memoFieldSchema = z.object({
  key: z.string().trim().min(1, '字段标识不能为空').max(64).regex(/^[a-zA-Z0-9_-]+$/, '字段标识格式不正确'),
  label: z.string().trim().min(1, '请输入字段名称').max(40, '字段名称不能超过 40 个字符'),
  type: z.enum(MEMO_FIELD_TYPES, { invalid_type_error: '字段类型不正确' }).optional(),
  value: z.string().max(2000, '字段内容不能超过 2000 个字符').optional(),
  isSensitive: z.boolean().optional(),
  order: z.number().int().min(0).max(100).optional()
}).strict('资料字段包含不支持的内容')

const memoFieldsSchema = z.array(memoFieldSchema).max(40, '一条资料最多添加 40 个字段').superRefine((fields, context) => {
  const keys = new Set()
  fields.forEach((field, index) => {
    if (keys.has(field.key)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: [index, 'key'], message: '字段标识不能重复' })
    }
    keys.add(field.key)
  })
})

const memoInputSchema = z.object({
  title: z.string().trim().max(80, '标题不能超过 80 个字符').optional(),
  content: z.string().trim().max(5000, '记录内容不能超过 5000 个字符').optional(),
  kind: z.enum(MEMO_KINDS, { invalid_type_error: '记录类型不正确' }).optional(),
  category: z.string().trim().max(60, '分类不能超过 60 个字符').optional(),
  fields: memoFieldsSchema.optional(),
  type: z.enum(MEMO_TYPES, { invalid_type_error: '记录类型不正确' }).optional(),
  status: z.enum(MEMO_STATUSES, { invalid_type_error: '记录状态不正确' }).optional(),
  priority: z.enum(MEMO_PRIORITIES, { invalid_type_error: '优先级不正确' }).optional(),
  tags: z.array(tagSchema).max(8, '最多添加 8 个标签').optional(),
  isPinned: z.boolean({ invalid_type_error: '置顶状态必须是布尔值' }).optional(),
  dueAt: dueAtSchema
}).strict('存在不支持的个人记录字段')

export const memoCreateSchema = memoInputSchema.superRefine((data, context) => {
  if ((data.kind || 'capture') === 'capture' && !data.content?.trim()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['content'], message: '请输入记录内容' })
  }
  if (data.kind === 'reference' && !data.title?.trim()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['title'], message: '请输入资料名称' })
  }
})

export const memoUpdateSchema = memoInputSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: '请提供需要更新的字段' }
)

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
