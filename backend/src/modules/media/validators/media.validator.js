import { z } from 'zod'

export const mediaRenameSchema = z.object({
  originalName: z.string().trim().min(1, '资源名称不能为空').max(160, '资源名称不能超过 160 个字符')
})
