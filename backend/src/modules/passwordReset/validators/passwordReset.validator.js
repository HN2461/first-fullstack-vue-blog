import { z } from 'zod'
import { encryptedCredentialSchema } from '#modules/auth/validators/auth.validator.js'

export const passwordResetLinkCreateSchema = z.object({
  expiresInMinutes: z.coerce.number().int().refine((value) => [15, 30, 60, 1440].includes(value), '重置链接有效期不正确'),
  note: z.string().trim().max(200, '核验备注不能超过 200 个字符').optional().default('')
}).strict('存在不支持的重置链接字段')

export const passwordResetTokenSchema = z.object({
  token: z.string().min(32, '重置链接无效').max(256, '重置链接无效')
}).strict('存在不支持的链接检查字段')

export const passwordResetConsumeSchema = z.object({
  token: z.string().min(32, '重置链接无效').max(256, '重置链接无效'),
  credential: encryptedCredentialSchema
}).strict('存在不支持的密码重置字段')

export const directPasswordResetSchema = z.object({
  credential: encryptedCredentialSchema,
  note: z.string().trim().max(200, '操作备注不能超过 200 个字符').optional().default('')
}).strict('存在不支持的直接重置字段')

export const passwordResetCredentialSchema = z.object({
  newPassword: z.string().min(8, '新密码至少需要 8 个字符').max(72, '新密码不能超过 72 个字符'),
  confirmPassword: z.string().min(1, '请确认新密码')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次输入的新密码不一致',
  path: ['confirmPassword']
})
