import { z } from 'zod'

export const settingSchema = z.object({
  siteTitle: z.string().trim().min(1, '站点标题不能为空').max(60, '站点标题不能超过 60 个字符').optional(),
  siteDescription: z.string().trim().max(200, '站点描述不能超过 200 个字符').optional(),
  authorName: z.string().trim().min(1, '作者名称不能为空').max(32, '作者名称不能超过 32 个字符').optional(),
  commentEnabled: z.boolean({ invalid_type_error: '评论功能开关必须是布尔值' }).optional(),
  defaultTheme: z.enum(['light', 'dark'], {
    errorMap: () => ({ message: '默认主题只能是 light 或 dark' })
  }).optional(),
  systemVersion: z.string().trim().min(1, '系统版本不能为空').max(20, '系统版本不能超过 20 个字符').optional(),
  mediaMaxFilesPerUpload: z.number({ invalid_type_error: '单次最大上传文件数量必须是数字' })
    .int('单次最大上传文件数量必须是整数')
    .min(1, '单次至少允许上传 1 个文件')
    .max(20, '单次最大上传文件数量不能超过 20 个')
    .optional(),
  mediaMaxFileSizeMB: z.number({ invalid_type_error: '单文件上传最大容量必须是数字' })
    .int('单文件上传最大容量必须是整数')
    .min(1, '单文件上传最大容量不能小于 1MB')
    .max(200, '单文件上传最大容量不能超过 200MB')
    .optional()
}).strict('存在不支持的设置项')
