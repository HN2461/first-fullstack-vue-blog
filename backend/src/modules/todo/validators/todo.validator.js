import { z } from 'zod'
import { TODO_ITEM_PRIORITIES } from '#modules/todo/models/TodoItem.js'
import { TODO_LIST_STATUSES, TODO_LIST_TYPES } from '#modules/todo/models/TodoList.js'

const dateSchema = z.union([
  z.literal(''),
  z.string().trim().min(1, '日期格式不正确'),
  z.null()
]).optional()

export const todoListCreateSchema = z.object({
  title: z.string().trim().min(1, '请输入清单名称').max(80, '清单名称不能超过 80 个字符'),
  type: z.enum(TODO_LIST_TYPES, { invalid_type_error: '清单类型不正确' }).optional(),
  planDate: dateSchema,
  isPinned: z.boolean({ invalid_type_error: '置顶状态必须是布尔值' }).optional()
}).strict('存在不支持的待办清单字段')

export const todoListUpdateSchema = todoListCreateSchema.extend({
  status: z.enum(TODO_LIST_STATUSES, { invalid_type_error: '清单状态不正确' }).optional()
}).partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: '请提供需要更新的字段' }
)

export const todoItemCreateSchema = z.object({
  title: z.string().trim().min(1, '请输入待办事项').max(160, '待办事项不能超过 160 个字符'),
  note: z.string().trim().max(1000, '事项说明不能超过 1000 个字符').optional(),
  priority: z.enum(TODO_ITEM_PRIORITIES, { invalid_type_error: '优先级不正确' }).optional(),
  sortOrder: z.number({ invalid_type_error: '排序值必须是数字' }).finite().optional()
}).strict('存在不支持的待办事项字段')

export const todoItemUpdateSchema = todoItemCreateSchema.extend({
  completed: z.boolean({ invalid_type_error: '完成状态必须是布尔值' }).optional()
}).partial().refine(
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
