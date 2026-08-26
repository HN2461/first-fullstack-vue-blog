import { z } from 'zod'

export const readingProgressSaveSchema = z.object({
  progressPercent: z.number().finite().min(0).max(100),
  scrollRatio: z.number().finite().min(0).max(1),
  anchorSlug: z.string().trim().max(240).optional().default(''),
  anchorOffset: z.number().finite().min(0).max(10000000).optional().default(0)
}).strict('存在不支持的阅读进度字段')

export const readingProgressListSchema = z.object({
  status: z.enum(['unfinished', 'completed', 'all']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10)
}).default({})

export function parseReadingProgressBody(body) {
  const result = readingProgressSaveSchema.safeParse(body)

  if (!result.success) {
    const error = new Error(result.error.issues[0]?.message || '阅读进度参数不正确')
    error.statusCode = 400
    error.code = 'VALIDATION_ERROR'
    throw error
  }

  return result.data
}

export function parseReadingProgressQuery(query) {
  const result = readingProgressListSchema.safeParse(query || {})

  if (!result.success) {
    const error = new Error(result.error.issues[0]?.message || '阅读记录查询参数不正确')
    error.statusCode = 400
    error.code = 'VALIDATION_ERROR'
    throw error
  }

  return result.data
}
