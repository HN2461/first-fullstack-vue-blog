import { z } from 'zod'
import { MEMO_PRIORITIES, MEMO_STATUSES, MEMO_TYPES } from '../models/Memo.js'

const tagSchema = z.string().trim().min(1, '标签不能为空').max(20, '单个标签不能超过 20 个字符')
const dueAtSchema = z.union([
  z.literal(''),
  z.string().trim().min(1, '提醒日期格式不正确'),
  z.null()
]).optional()

export const memoCreateSchema = z.object({
  title: z.string().trim().max(80, '标题不能超过 80 个字符').optional(),
  content: z.string().trim().min(1, '请输入备忘内容').max(5000, '备忘内容不能超过 5000 个字符'),
  type: z.enum(MEMO_TYPES, { invalid_type_error: '备忘类型不正确' }).optional(),
  status: z.enum(MEMO_STATUSES, { invalid_type_error: '备忘状态不正确' }).optional(),
  priority: z.enum(MEMO_PRIORITIES, { invalid_type_error: '优先级不正确' }).optional(),
  tags: z.array(tagSchema).max(8, '最多添加 8 个标签').optional(),
  isPinned: z.boolean({ invalid_type_error: '置顶状态必须是布尔值' }).optional(),
  dueAt: dueAtSchema
}).strict('存在不支持的备忘录字段')

export const memoUpdateSchema = memoCreateSchema.partial().refine(
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
