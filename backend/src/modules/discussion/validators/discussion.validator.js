import { z } from 'zod'
import { DISCUSSION_CONFIG, DISCUSSION_THREAD_TYPES } from '#modules/discussion/constants/discussion.constants.js'

const objectIdPattern = /^[a-f\d]{24}$/i

export const discussionCreateSchema = z.object({
  type: z.enum(Object.values(DISCUSSION_THREAD_TYPES), { invalid_type_error: '讨论类型不正确' }),
  title: z.string().trim().max(80, '讨论名称不能超过 80 个字符').optional(),
  memberIds: z.array(z.string().regex(objectIdPattern, '成员 id 不正确'))
    .min(1, '请选择讨论成员')
    .max(DISCUSSION_CONFIG.groupMemberLimit, `小组讨论最多 ${DISCUSSION_CONFIG.groupMemberLimit} 人`)
}).strict('存在不支持的讨论字段')

export const discussionMessageCreateSchema = z.object({
  content: z.string().trim().max(DISCUSSION_CONFIG.messageMaxLength, `单条内容不能超过 ${DISCUSSION_CONFIG.messageMaxLength} 个字符`).optional().default(''),
  attachment: z.object({
    filename: z.string().trim().min(1).max(180),
    originalName: z.string().trim().min(1).max(180),
    mimeType: z.string().trim().min(1).max(120),
    size: z.number().int().nonnegative(),
    url: z.string().trim().min(1).max(500),
    storagePath: z.string().trim().min(1).max(500)
  }).optional()
}).strict('存在不支持的讨论内容字段').refine((value) => {
  return !!value.content?.trim() || !!value.attachment
}, {
  message: '请输入讨论内容或选择附件'
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
