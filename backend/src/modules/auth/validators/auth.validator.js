import { z } from 'zod'
import { USER_GENDERS } from '#constants/domain'

export const registerSchema = z.object({
  username: z.string().trim().min(2, '用户名至少需要 2 个字符').max(32, '用户名不能超过 32 个字符'),
  email: z.string().trim().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少需要 8 个字符').max(72, '密码不能超过 72 个字符'),
  gender: z.enum(Object.values(USER_GENDERS), { errorMap: () => ({ message: '性别选项不支持' }) }).optional(),
  permissionRequestReason: z.string().trim().max(500, '权限申请说明不能超过 500 个字符').optional()
})

export const loginSchema = z.object({
  email: z.string().trim().email('邮箱格式不正确'),
  password: z.string().min(1, '请输入密码')
})

export const credentialChallengeSchema = z.object({
  purpose: z.enum(['login', 'register', 'password-reset-link', 'change-password', 'admin-reset-password', 'admin-create-user'], {
    errorMap: () => ({ message: '安全校验场景不正确' })
  })
})

export const encryptedCredentialSchema = z.object({
  challengeId: z.string().min(1, '缺少安全校验编号'),
  payload: z.string().min(1, '缺少安全凭据密文')
}).strict('存在不支持的安全凭据字段')

export const secureRegisterSchema = z.object({
  username: z.string().trim().min(2, '用户名至少需要 2 个字符').max(32, '用户名不能超过 32 个字符'),
  email: z.string().trim().email('邮箱格式不正确'),
  gender: z.enum(Object.values(USER_GENDERS), { errorMap: () => ({ message: '性别选项不支持' }) }).optional(),
  permissionRequestReason: z.string().trim().max(500, '权限申请说明不能超过 500 个字符').optional(),
  credential: encryptedCredentialSchema
}).strict('存在不支持的注册字段')

export const secureLoginSchema = z.object({
  email: z.string().trim().email('邮箱格式不正确'),
  credential: encryptedCredentialSchema
}).strict('存在不支持的登录字段')

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
