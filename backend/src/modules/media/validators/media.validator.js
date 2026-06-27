import { z } from 'zod'

export const mediaRenameSchema = z.object({
  originalName: z.string().trim().min(1, '资源名称不能为空').max(160, '资源名称不能超过 160 个字符')
})

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
