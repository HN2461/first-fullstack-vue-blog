import { z } from 'zod'

const objectIdPattern = /^[a-f\d]{24}$/i
const nullableFutureDateSchema = z.union([
  z.string().datetime({ offset: true }),
  z.null()
]).optional()

export const articleShareCreateSchema = z.object({
  scopeType: z.enum(['article', 'category']),
  articleId: z.string().regex(objectIdPattern, '文章 ID 格式不正确').optional(),
  categoryId: z.string().regex(objectIdPattern, '分类 ID 格式不正确').optional(),
  includeDescendants: z.boolean().optional().default(false),
  title: z.string().trim().max(120, '分享标题不能超过 120 个字符').optional(),
  description: z.string().trim().max(500, '分享说明不能超过 500 个字符').optional().default(''),
  mode: z.enum(['public', 'password']).default('public'),
  expiresAt: nullableFutureDateSchema
}).superRefine((value, ctx) => {
  if (value.scopeType === 'article' && !value.articleId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: '请选择要分享的文章', path: ['articleId'] })
  }
  if (value.scopeType === 'category' && !value.categoryId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: '请选择要分享的分类', path: ['categoryId'] })
  }
})

export const articleShareUpdateSchema = z.object({
  title: z.string().trim().min(1, '分享标题不能为空').max(120, '分享标题不能超过 120 个字符').optional(),
  description: z.string().trim().max(500, '分享说明不能超过 500 个字符').optional(),
  expiresAt: nullableFutureDateSchema
}).refine((value) => Object.keys(value).length > 0, '没有可更新的分享配置')

export const articleSharePasswordSchema = z.object({
  code: z.string().regex(/^\d{4}$/, '请输入 4 位数字提取码')
})

export function parseArticleShareBody(schema, value) {
  const result = schema.safeParse(value)
  if (result.success) return result.data

  const error = new Error(result.error.issues[0]?.message || '请求参数不正确')
  error.statusCode = 400
  error.code = 'VALIDATION_ERROR'
  throw error
}
