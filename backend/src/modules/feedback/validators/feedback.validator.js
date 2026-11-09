import { z } from 'zod'
import { FEEDBACK_STATUSES, FEEDBACK_TYPES } from '../models/Feedback.js'

const requestId = z.string().uuid('提交标识不正确，请刷新后重试')
export const feedbackCreateSchema = z.object({
  requestId,
  type: z.enum(FEEDBACK_TYPES),
  title: z.string().trim().min(1, '请填写标题').max(120),
  content: z.string().trim().min(1, '请描述问题或建议').max(10000),
  sourcePath: z.string().max(2000).optional().default(''),
  environment: z.string().trim().max(300).optional().default('')
})

export const feedbackEventSchema = z.object({
  requestId,
  version: z.coerce.number().int().positive(),
  content: z.string().trim().max(10000).optional().default(''),
  status: z.enum(FEEDBACK_STATUSES).optional()
})

/** 校验反馈请求；参数为 schema 和正文，返回规范输入，字段不合法时返回 400。 */
export function parseFeedbackPayload(schema, body) {
  const result = schema.safeParse(body)
  if (!result.success) {
    throw Object.assign(new Error(result.error.issues[0]?.message || '反馈内容不正确'), {
      statusCode: 400,
      code: 'FEEDBACK_VALIDATION_ERROR'
    })
  }
  return result.data
}
