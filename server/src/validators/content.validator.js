import { z } from 'zod'
import { ARTICLE_STATUS } from '@blog/shared'

const objectIdPattern = /^[a-f\d]{24}$/i
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const articleResourceSchema = z.object({
  mediaId: z.string().regex(objectIdPattern, '资源 media id 不正确').nullable().optional().default(null),
  name: z.string().trim().min(1, '资源名称不能为空').max(120, '资源名称不能超过 120 个字符'),
  url: z.string().trim().min(1, '资源地址不能为空'),
  kind: z.enum(['image', 'attachment']).optional().default('attachment'),
  description: z.string().trim().max(240, '资源说明不能超过 240 个字符').optional().default(''),
  fileSize: z.number().int().nonnegative().optional().default(0),
  mimeType: z.string().trim().optional().default('')
})

export const categorySchema = z.object({
  name: z.string().trim().min(1, '分类名称不能为空').max(40, '分类名称不能超过 40 个字符'),
  slug: z.string().trim().toLowerCase().regex(slugPattern, '分类 slug 只能包含小写字母、数字和短横线'),
  description: z.string().trim().max(240, '分类描述不能超过 240 个字符').optional().default(''),
  parent: z.string().regex(objectIdPattern, '父级分类 id 不正确').nullable().optional().default(null),
  sortOrder: z.number().int().optional().default(0),
  status: z.enum(['active', 'hidden']).optional().default('active')
})

export const tagSchema = z.object({
  name: z.string().trim().min(1, '标签名称不能为空').max(32, '标签名称不能超过 32 个字符'),
  slug: z.string().trim().toLowerCase().regex(slugPattern, '标签 slug 只能包含小写字母、数字和短横线'),
  description: z.string().trim().max(180, '标签描述不能超过 180 个字符').optional().default(''),
  color: z.string().trim().optional().default('#2852b8'),
  sortOrder: z.number().int().optional().default(0),
  status: z.enum(['active', 'hidden']).optional().default('active')
})

export const articleSchema = z.object({
  title: z.string().trim().min(1, '文章标题不能为空').max(120, '文章标题不能超过 120 个字符'),
  slug: z.string().trim().toLowerCase().regex(slugPattern, '文章 slug 只能包含小写字母、数字和短横线').optional().default(''),
  summary: z.string().trim().max(300, '文章摘要不能超过 300 个字符').optional().default(''),
  contentMarkdown: z.string().optional().default(''),
  cover: z.string().trim().optional().default(''),
  resources: z.array(articleResourceSchema).optional().default([]),
  category: z.string().regex(objectIdPattern, '分类 id 不正确').nullable().optional().default(null),
  tags: z.array(z.string().regex(objectIdPattern, '标签 id 不正确')).optional().default([]),
  status: z.enum(Object.values(ARTICLE_STATUS)).optional().default(ARTICLE_STATUS.DRAFT),
  isRecommended: z.boolean().optional().default(false)
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
