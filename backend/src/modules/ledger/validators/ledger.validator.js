import { z } from 'zod'
import { LEDGER_BOOK_STATUSES } from '#modules/ledger/models/LedgerBook.js'
import { LEDGER_CATEGORY_TYPES } from '#modules/ledger/models/LedgerCategory.js'
import { LEDGER_ENTRY_TYPES } from '#modules/ledger/models/LedgerEntry.js'
import { LEDGER_MOMENT_SCOPES } from '#modules/ledger/models/LedgerMoment.js'

const objectIdPattern = /^[a-f\d]{24}$/i
const colorPattern = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

export const ledgerBookCreateSchema = z.object({
  name: z.string().trim().min(1, '账本名称不能为空').max(60, '账本名称不能超过 60 个字符'),
  currency: z.string().trim().min(1).max(8).optional().default('CNY'),
  description: z.string().trim().max(240, '账本说明不能超过 240 个字符').optional().default(''),
  status: z.enum(LEDGER_BOOK_STATUSES).optional().default('active'),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0)
}).strict('存在不支持的账本字段')

export const ledgerBookUpdateSchema = ledgerBookCreateSchema.partial().strict('存在不支持的账本字段')

export const ledgerCategoryCreateSchema = z.object({
  bookId: z.string().regex(objectIdPattern, '账本 id 不正确'),
  name: z.string().trim().min(1, '分类名称不能为空').max(40, '分类名称不能超过 40 个字符'),
  type: z.enum(LEDGER_CATEGORY_TYPES, {
    errorMap: () => ({ message: '分类类型不正确' })
  }),
  color: z.string().trim().regex(colorPattern, '分类颜色格式不正确').optional().default('#1677ff'),
  icon: z.string().trim().max(60, '分类图标不能超过 60 个字符').optional().default(''),
  aliases: z.array(z.string().trim().max(40, '分类别名不能超过 40 个字符')).max(10).optional().default([]),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
  archived: z.boolean().optional().default(false)
}).strict('存在不支持的分类字段')

export const ledgerCategoryUpdateSchema = ledgerCategoryCreateSchema
  .omit({ bookId: true })
  .partial()
  .strict('存在不支持的分类字段')

export const ledgerEntryCreateSchema = z.object({
  bookId: z.string().regex(objectIdPattern, '账本 id 不正确'),
  occurredAt: z.coerce.date({ invalid_type_error: '记账日期不正确' }),
  type: z.enum(LEDGER_ENTRY_TYPES, {
    errorMap: () => ({ message: '记账类型不正确' })
  }),
  categoryId: z.string().regex(objectIdPattern, '分类 id 不正确'),
  amount: z.coerce.number().positive('金额必须大于 0').max(999999999, '金额过大'),
  note: z.string().trim().max(500, '备注不能超过 500 个字符').optional().default(''),
  dailyNote: z.string().trim().max(1000, '当日备注不能超过 1000 个字符').optional().default('')
}).strict('存在不支持的流水字段')

export const ledgerEntryUpdateSchema = ledgerEntryCreateSchema
  .omit({ bookId: true })
  .partial()
  .strict('存在不支持的流水字段')

export const ledgerEntryQuerySchema = z.object({
  bookId: z.string().regex(objectIdPattern, '账本 id 不正确').optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  type: z.enum(LEDGER_ENTRY_TYPES).optional(),
  categoryId: z.string().regex(objectIdPattern, '分类 id 不正确').optional(),
  keyword: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional()
})

export const ledgerEntryBatchUpdateSchema = z.object({
  ids: z.array(z.string().regex(objectIdPattern, '流水 id 不正确')).min(1, '请选择要修改的流水').max(200, '单次最多修改 200 条流水'),
  patch: z.object({
    occurredAt: z.coerce.date({ invalid_type_error: '记账日期不正确' }).optional(),
    type: z.enum(LEDGER_ENTRY_TYPES).optional(),
    categoryId: z.string().regex(objectIdPattern, '分类 id 不正确').optional(),
    note: z.string().trim().max(500, '备注不能超过 500 个字符').optional(),
    dailyNote: z.string().trim().max(1000, '当日备注不能超过 1000 个字符').optional()
  }).strict('存在不支持的批量修改字段')
    .refine((value) => Object.keys(value).length > 0, '请填写要修改的内容')
}).strict('存在不支持的批量修改字段')

export const ledgerSummaryQuerySchema = z.object({
  bookId: z.string().regex(objectIdPattern, '账本 id 不正确').optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  groupBy: z.enum(['day', 'month', 'year', 'all']).optional().default('month')
})

export const ledgerDailyQuerySchema = z.object({
  bookId: z.string().regex(objectIdPattern, '账本 id 不正确').optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional()
})

export const ledgerImportPreviewSchema = z.object({
  bookId: z.string().regex(objectIdPattern, '账本 id 不正确')
}).strict('存在不支持的导入字段')

export const ledgerImportQuerySchema = z.object({
  bookId: z.string().regex(objectIdPattern, '账本 id 不正确').optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional()
})

export const ledgerMomentCreateSchema = z.object({
  bookId: z.string().regex(objectIdPattern, '账本 id 不正确'),
  title: z.string().trim().min(1, '重要记录标题不能为空').max(80, '标题不能超过 80 个字符'),
  scope: z.enum(LEDGER_MOMENT_SCOPES).optional().default('day'),
  occurredAt: z.coerce.date({ invalid_type_error: '记录日期不正确' }),
  amount: z.coerce.number().min(0, '金额不能小于 0').max(999999999, '金额过大').optional().default(0),
  categoryId: z.string().regex(objectIdPattern, '分类 id 不正确').nullable().optional(),
  entryId: z.string().regex(objectIdPattern, '流水 id 不正确').nullable().optional(),
  mood: z.string().trim().max(40, '心情不能超过 40 个字符').optional().default(''),
  content: z.string().trim().max(2000, '记录内容不能超过 2000 个字符').optional().default(''),
  tags: z.array(z.string().trim().max(24, '标签不能超过 24 个字符')).max(12, '最多 12 个标签').optional().default([]),
  pinned: z.boolean().optional().default(false)
}).strict('存在不支持的重要记录字段')

export const ledgerMomentUpdateSchema = ledgerMomentCreateSchema
  .omit({ bookId: true })
  .partial()
  .strict('存在不支持的重要记录字段')

export const ledgerMomentQuerySchema = z.object({
  bookId: z.string().regex(objectIdPattern, '账本 id 不正确').optional(),
  scope: z.enum(LEDGER_MOMENT_SCOPES).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  keyword: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional()
})

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
