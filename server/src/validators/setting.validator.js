import { z } from 'zod'

export const settingSchema = z.object({
  siteTitle: z.string().trim().min(1, '站点标题不能为空').max(60, '站点标题不能超过 60 个字符').optional(),
  siteDescription: z.string().trim().max(200, '站点描述不能超过 200 个字符').optional(),
  authorName: z.string().trim().min(1, '作者名称不能为空').max(32, '作者名称不能超过 32 个字符').optional(),
  commentEnabled: z.boolean({ invalid_type_error: '评论功能开关必须是布尔值' }).optional(),
  defaultTheme: z.enum(['light', 'dark'], {
    errorMap: () => ({ message: '默认主题只能是 light 或 dark' })
  }).optional(),
  systemVersion: z.string().trim().min(1, '系统版本不能为空').max(20, '系统版本不能超过 20 个字符').optional()
}).strict('存在不支持的设置项')
