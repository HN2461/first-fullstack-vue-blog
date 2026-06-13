import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string().trim().min(2, '用户名至少需要 2 个字符').max(32, '用户名不能超过 32 个字符'),
  email: z.string().trim().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少需要 8 个字符').max(72, '密码不能超过 72 个字符')
})

export const loginSchema = z.object({
  email: z.string().trim().email('邮箱格式不正确'),
  password: z.string().min(1, '请输入密码')
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
