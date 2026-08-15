import { z } from 'zod'

export const mediaRenameSchema = z.object({
  originalName: z.string().trim().min(1, '资源名称不能为空').max(160, '资源名称不能超过 160 个字符')
})

export const mediaIdSchema = z.string().trim().regex(/^[a-f\d]{24}$/i, '资源 ID 不正确')

export const mediaBatchDownloadSchema = z.object({
  ids: z.array(mediaIdSchema).min(1, '请选择要下载的媒体文件').max(100, '单次最多下载 100 个媒体文件'),
  namingMode: z.enum(['original', 'prefix', 'sequence']).default('original'),
  prefix: z.string().trim().max(80, '文件名前缀不能超过 80 个字符').optional(),
  archiveName: z.string().trim().max(80, '压缩包名称不能超过 80 个字符').optional()
}).superRefine((value, context) => {
  if (value.namingMode === 'prefix' && !value.prefix) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['prefix'],
      message: '使用统一前缀时必须填写文件名前缀'
    })
  }
})

export function parseMediaPayload(schema, value) {
  const result = schema.safeParse(value)
  if (!result.success) {
    const error = new Error(result.error.issues[0]?.message || '媒体请求参数不正确')
    error.statusCode = 400
    error.code = 'VALIDATION_ERROR'
    throw error
  }
  return result.data
}

const mediaCategoryMoveFields = {
  category: z.string().trim().max(40, '分类名称不能超过 40 个字符').optional(),
  categoryId: z.string().trim().regex(/^[a-f\d]{24}$/i, '资源分类 ID 不正确').optional()
}

function requireMediaCategoryTarget(schema) {
  return schema.refine((value) => value.category || value.categoryId, {
    message: '目标资源分类不能为空'
  })
}

export const mediaCategoryMoveSchema = requireMediaCategoryTarget(z.object(mediaCategoryMoveFields))

export const mediaCategoryBatchMoveSchema = requireMediaCategoryTarget(z.object({
  ...mediaCategoryMoveFields,
  ids: z.array(z.string().trim().min(1, '资源 ID 不能为空')).min(1, '请选择要迁移的媒体文件').max(100, '单次最多迁移 100 个媒体文件')
}))

const mediaInventoryItemSchema = z.object({
  id: z.string().optional(),
  relativePath: z.string().optional(),
  url: z.string().optional()
}).refine((value) => value.id || value.relativePath || value.url, {
  message: '资源路径不能为空'
})

export const mediaRegisterUntrackedSchema = z.object({
  mode: z.enum(['selected', 'all']).default('selected'),
  items: z.array(mediaInventoryItemSchema).max(500, '单次最多登记 500 个资源').optional(),
  paths: z.array(z.string().trim().min(1, '资源路径不能为空')).max(500, '单次最多登记 500 个资源').optional(),
  category: z.string().trim().max(40, '分类名称不能超过 40 个字符').optional(),
  keyword: z.string().trim().max(120, '搜索关键词不能超过 120 个字符').optional(),
  fileClass: z.enum(['image', 'code', 'document', 'archive', 'other']).optional()
})
