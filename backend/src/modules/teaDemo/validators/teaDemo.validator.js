import { z } from 'zod'
import { TEA_DEMO_CATEGORIES, TEA_DEMO_PRODUCT_CATEGORY_CODES, TEA_DEMO_PRODUCT_STATUS } from '#modules/teaDemo/constants/teaDemo.constants.js'

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

export function parseBody(schema, input) {
  const result = schema.safeParse(input)
  if (!result.success) {
    throw createHttpError(400, 'VALIDATION_ERROR', result.error.issues[0]?.message || '参数校验失败')
  }
  return result.data
}

export const teaDemoChallengeQuerySchema = z.object({
  purpose: z.enum(['login', 'register']).default('login')
})

export const teaDemoEncryptedCredentialSchema = z.object({
  challengeId: z.string().trim().min(1, '缺少挑战编号'),
  payload: z.string().trim().min(1, '缺少加密内容')
})

export const teaDemoEncryptedAuthBodySchema = z.object({
  credential: teaDemoEncryptedCredentialSchema
})

export const teaDemoRegisterCredentialSchema = z.object({
  username: z.string().trim().min(2, '用户名长度至少 2 位').max(32, '用户名不能超过 32 个字符'),
  email: z.string().trim().email('邮箱格式不正确').max(254, '邮箱不能超过 254 个字符'),
  password: z.string().min(6, '密码长度至少 6 位').max(72, '密码不能超过 72 个字符'),
  nickname: z.string().trim().max(40, '昵称不能超过 40 个字符').optional(),
  avatar: z.string().trim().max(500, '头像地址不能超过 500 个字符').optional()
})

export const teaDemoLoginCredentialSchema = z.object({
  identifier: z.string().trim().min(1, '请输入用户名或邮箱').max(254, '账号不能超过 254 个字符'),
  password: z.string().min(1, '请输入密码').max(72, '密码不能超过 72 个字符')
})

const teaDemoBooleanQuerySchema = z.enum(['true', 'false']).transform((value) => value === 'true')

export const teaDemoProductListQuerySchema = z.object({
  page: z.coerce.number().int('page 必须是整数').min(1, 'page 不能小于 1').default(1),
  pageSize: z.coerce.number().int('pageSize 必须是整数').min(1, 'pageSize 不能小于 1').max(100, 'pageSize 不能超过 100').default(12),
  keyword: z.string().trim().max(80, 'keyword 不能超过 80 个字符').optional(),
  category: z.enum(['all', ...TEA_DEMO_PRODUCT_CATEGORY_CODES]).optional(),
  categoryCode: z.enum(['all', ...TEA_DEMO_PRODUCT_CATEGORY_CODES]).optional(),
  status: z.enum(Object.values(TEA_DEMO_PRODUCT_STATUS)).optional(),
  isHot: teaDemoBooleanQuerySchema.optional(),
  isNew: teaDemoBooleanQuerySchema.optional()
})

export const teaDemoProductSpecItemSchema = z.object({
  code: z.string().trim().min(1, '规格编码不能为空'),
  name: z.string().trim().min(1, '规格名称不能为空'),
  nameEn: z.string().trim().optional(),
  extraPrice: z.coerce.number().optional()
})

export const teaDemoToppingSpecSchema = z.object({
  code: z.string().trim().min(1, '配料编码不能为空'),
  name: z.string().trim().min(1, '配料名称不能为空'),
  nameEn: z.string().trim().optional(),
  price: z.coerce.number().optional()
})

export const teaDemoProductSpecsSchema = z.object({
  sizes: z.array(teaDemoProductSpecItemSchema).optional(),
  sweetness: z.array(
    z.object({
      code: z.string().trim().min(1, '甜度编码不能为空'),
      name: z.string().trim().min(1, '甜度名称不能为空'),
      nameEn: z.string().trim().optional()
    })
  ).optional(),
  toppings: z.array(teaDemoToppingSpecSchema).optional()
}).optional()

export const teaDemoProductCreateSchema = z.object({
  name: z.string().trim().min(1, '商品名称不能为空').max(80, '商品名称不能超过 80 个字符'),
  nameEn: z.string().trim().max(120, '英文名称不能超过 120 个字符').optional(),
  description: z.string().trim().max(300, '商品描述不能超过 300 个字符').optional(),
  descriptionEn: z.string().trim().max(300, '英文描述不能超过 300 个字符').optional(),
  price: z.coerce.number().min(0, '价格不能小于 0'),
  categoryCode: z.enum(TEA_DEMO_PRODUCT_CATEGORY_CODES),
  image: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
  bannerImages: z.array(z.string().trim().min(1)).optional(),
  isNew: z.boolean().optional(),
  isHot: z.boolean().optional(),
  status: z.enum(Object.values(TEA_DEMO_PRODUCT_STATUS)).optional(),
  stock: z.coerce.number().int().min(0, '库存不能小于 0').optional(),
  sortOrder: z.coerce.number().int().optional(),
  specs: teaDemoProductSpecsSchema
})

export const teaDemoProductUpdateSchema = teaDemoProductCreateSchema.partial().refine(
  (input) => Object.keys(input).length > 0,
  '至少提供一个待更新字段'
)

export const teaDemoProductStatusSchema = z.object({
  status: z.enum(Object.values(TEA_DEMO_PRODUCT_STATUS))
})

export const teaDemoProductIdSchema = z.object({
  id: z.string().trim().min(1, '商品 ID 不能为空')
})

export const teaDemoCategoryList = TEA_DEMO_CATEGORIES
