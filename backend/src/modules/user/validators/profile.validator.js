import { z } from 'zod'
import { ENTRANCE_EFFECT_KEYS, ENTRANCE_TRIGGER_PAGES } from '#modules/user/constants/entranceEffects.js'

const optionalText = (max, message) => z.string().trim().max(max, message).optional()
const optionalBirthday = z.union([
  z.literal(''),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '生日格式应为 YYYY-MM-DD')
]).optional()
const entranceEffectSchema = z.object({
  enabled: z.boolean({ invalid_type_error: '页面动效总开关必须是布尔值' }).optional(),
  effectKey: z.enum(ENTRANCE_EFFECT_KEYS, {
    errorMap: () => ({ message: '页面动效不支持' })
  }).optional(),
  duration: z.number({ invalid_type_error: '页面动效时长必须是数字' }).min(2, '页面动效时长不能少于 2 秒').max(8, '页面动效时长不能超过 8 秒').optional(),
  triggerPages: z.array(z.enum(ENTRANCE_TRIGGER_PAGES, {
    errorMap: () => ({ message: '页面动效触发页面不支持' })
  })).max(4, '页面动效触发页面数量不正确').optional()
}).strict('存在不支持的页面动效字段')

export const profileUpdateSchema = z.object({
  username: z.string().trim().min(2, '昵称长度需在 2-32 个字符之间').max(32, '昵称长度需在 2-32 个字符之间').optional(),
  bio: optionalText(240, '简介不能超过 240 个字符'),
  website: z.union([
    z.literal(''),
    z.string().trim().url('个人网站地址格式不正确').max(120, '个人网站不能超过 120 个字符')
  ]).optional(),
  location: optionalText(60, '所在地不能超过 60 个字符'),
  birthday: optionalBirthday,
  closeBirthEffect: z.boolean({ invalid_type_error: '生日特效开关必须是布尔值' }).optional(),
  closeSiteEntranceEffect: z.boolean({ invalid_type_error: '网站入场欢迎屏蔽开关必须是布尔值' }).optional(),
  entranceEffect: entranceEffectSchema.optional()
}).strict('存在不支持的个人资料字段')

export const festivalEffectActionSchema = z.object({
  action: z.enum(['birth-shown', 'close-birth-effect'], {
    errorMap: () => ({ message: '不支持的节日特效操作' })
  })
}).strict('存在不支持的节日特效字段')

export const passwordUpdateSchema = z.object({
  oldPassword: z.string().min(1, '请输入原密码'),
  newPassword: z.string().min(8, '新密码至少需要 8 个字符').max(72, '新密码不能超过 72 个字符')
}).strict('存在不支持的密码字段')

export const notificationSettingsSchema = z.object({
  email: z.boolean({ invalid_type_error: '邮件通知开关必须是布尔值' }).optional(),
  site: z.boolean({ invalid_type_error: '站内消息开关必须是布尔值' }).optional(),
  comment: z.boolean({ invalid_type_error: '评论提醒开关必须是布尔值' }).optional(),
  like: z.boolean({ invalid_type_error: '点赞提醒开关必须是布尔值' }).optional()
}).strict('存在不支持的通知设置字段')

export const quickActionsSchema = z.object({
  routes: z.array(
    z.string().trim().min(1, '快捷功能路径不能为空').max(160, '快捷功能路径不能超过 160 个字符')
  ).max(60, '快捷功能数量不能超过 60 个')
}).strict('存在不支持的快捷功能字段')

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
