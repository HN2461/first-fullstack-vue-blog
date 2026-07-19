import { z } from 'zod'
import { BOOKMARK_BROWSER_TYPES } from '../models/BookmarkWorkspace.js'

const objectIdPattern = /^[a-f\d]{24}$/i
const objectIdSchema = z.string().regex(objectIdPattern, '数据 id 不正确')
const urlSchema = z.string().trim().min(1, '书签地址不能为空').max(2048, '书签地址不能超过 2048 个字符')
const optionalFolderIdSchema = z.union([
  objectIdSchema,
  z.literal(''),
  z.null()
]).optional().transform((value) => value || null)

export const bookmarkWorkspaceCreateSchema = z.object({
  name: z.string().trim().min(1, '书签库名称不能为空').max(80, '书签库名称不能超过 80 个字符'),
  browserType: z.enum(BOOKMARK_BROWSER_TYPES).optional().default('other'),
  isPrimary: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(999999).optional()
}).strict('存在不支持的书签库字段')

export const bookmarkWorkspaceUpdateSchema = bookmarkWorkspaceCreateSchema.partial().strict('存在不支持的书签库字段')

export const bookmarkWorkspaceReorderSchema = z.object({
  ids: z.array(objectIdSchema).min(1, '请选择要排序的书签库').max(30, '单次最多排序 30 个书签库')
}).strict('存在不支持的排序字段')

export const bookmarkFolderCreateSchema = z.object({
  name: z.string().trim().min(1, '文件夹名称不能为空').max(120, '文件夹名称不能超过 120 个字符'),
  parentId: optionalFolderIdSchema,
  sortOrder: z.coerce.number().int().min(0).max(999999).optional()
}).strict('存在不支持的文件夹字段')

export const bookmarkFolderUpdateSchema = bookmarkFolderCreateSchema.partial().strict('存在不支持的文件夹字段')

export const bookmarkCreateSchema = z.object({
  title: z.string().trim().max(240, '书签名称不能超过 240 个字符').optional().default(''),
  url: urlSchema,
  folderId: optionalFolderIdSchema,
  tags: z.array(z.string().trim().max(24, '标签不能超过 24 个字符')).max(12, '最多 12 个标签').optional().default([]),
  note: z.string().trim().max(1000, '备注不能超过 1000 个字符').optional().default(''),
  sortOrder: z.coerce.number().int().min(0).max(999999).optional()
}).strict('存在不支持的书签字段')

export const bookmarkUpdateSchema = bookmarkCreateSchema.partial().strict('存在不支持的书签字段')

export const bookmarkQuerySchema = z.object({
  folderId: z.union([objectIdSchema, z.literal('')]).optional(),
  keyword: z.string().trim().max(120, '搜索关键词不能超过 120 个字符').optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional()
})

export const bookmarkReorderSchema = z.object({
  folderId: optionalFolderIdSchema,
  ids: z.array(objectIdSchema).min(1, '请选择要排序的书签').max(200, '单次最多排序 200 条')
}).strict('存在不支持的排序字段')

export const bookmarkMoveSchema = z.object({
  folderId: optionalFolderIdSchema,
  ids: z.array(objectIdSchema).min(1, '请选择要移动的书签').max(200, '单次最多移动 200 条')
}).strict('存在不支持的移动字段')

export const bookmarkFolderReorderSchema = z.object({
  parentId: optionalFolderIdSchema,
  ids: z.array(objectIdSchema).min(1, '请选择要排序的文件夹').max(200, '单次最多排序 200 个文件夹')
}).strict('存在不支持的排序字段')

export const bookmarkImportSchema = z.object({
  mode: z.enum(['merge', 'replace']).optional().default('merge')
})

export const bookmarkComparisonQuerySchema = z.object({
  primaryWorkspaceId: objectIdSchema,
  secondaryWorkspaceId: objectIdSchema,
  status: z.enum(['all', 'differences', 'secondary_only', 'primary_only', 'folder_diff', 'title_diff', 'common']).optional(),
  keyword: z.string().trim().max(120, '搜索关键词不能超过 120 个字符').optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional()
})

export const bookmarkComparisonCopySchema = z.object({
  sourceWorkspaceId: objectIdSchema,
  targetWorkspaceId: objectIdSchema,
  targetFolderId: optionalFolderIdSchema,
  bookmarkIds: z.array(objectIdSchema).min(1, '请选择要添加的书签').max(200, '单次最多添加 200 条书签')
}).strict('存在不支持的复制字段')

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
