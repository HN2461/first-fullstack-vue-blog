import { z } from 'zod'

const nullableFutureDateSchema = z.union([
  z.string().datetime({ offset: true }),
  z.null()
]).optional()

const nullableAccessCountSchema = z.union([
  z.number().int().min(1, '最大访问次数不能小于 1').max(100000, '最大访问次数不能超过 100000'),
  z.null()
]).optional()

export const mediaShareCreateSchema = z.object({
  name: z.string().trim().min(1, '请输入资源包名称').max(80, '资源包名称不能超过 80 个字符'),
  description: z.string().trim().max(500, '资源包说明不能超过 500 个字符').optional().default(''),
  mediaIds: z.array(z.string().regex(/^[a-f\d]{24}$/i, '资源 ID 格式不正确')).min(1, '请选择要分享的资源').max(50, '单个资源包最多包含 50 个资源'),
  mode: z.enum(['public', 'password']),
  expiresAt: nullableFutureDateSchema,
  maxAccessCount: nullableAccessCountSchema
})

export const mediaShareUpdateSchema = z.object({
  name: z.string().trim().min(1, '请输入资源包名称').max(80, '资源包名称不能超过 80 个字符').optional(),
  description: z.string().trim().max(500, '资源包说明不能超过 500 个字符').optional(),
  expiresAt: nullableFutureDateSchema,
  maxAccessCount: nullableAccessCountSchema
}).refine((value) => Object.keys(value).length > 0, '没有可更新的分享配置')

export const mediaSharePasswordSchema = z.object({
  code: z.string().regex(/^\d{4}$/, '请输入 4 位数字提取码')
})

export function parseMediaShareBody(schema, value) {
  const result = schema.safeParse(value)
  if (result.success) return result.data

  const error = new Error(result.error.issues[0]?.message || '请求参数不正确')
  error.statusCode = 400
  error.code = 'VALIDATION_ERROR'
  throw error
}
