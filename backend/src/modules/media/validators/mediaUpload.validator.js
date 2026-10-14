import { z } from 'zod'

export const mediaUploadIdSchema = z.string().uuid('上传任务 ID 不正确').transform((value) => value.toLowerCase())

export const mediaUploadSessionSchema = z.object({
  uploadId: mediaUploadIdSchema,
  name: z.string().min(1, '文件名不能为空').max(240, '文件名过长').regex(/^[^/\\\u0000-\u001f]+$/, '文件名包含非法字符'),
  size: z.number().int().min(0).max(1024 * 1024 * 1024, '单文件不能超过 1024MB'),
  mimeType: z.string().max(120).default('application/octet-stream'),
  lastModified: z.number().int().nonnegative().default(0),
  category: z.string().trim().max(40).default('默认素材'),
  categoryId: z.string().regex(/^[a-f\d]{24}$/i, '分类 ID 不正确').optional()
})

export const mediaUploadOffsetSchema = z.coerce.number().int().nonnegative().max(1024 * 1024 * 1024)
