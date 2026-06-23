import { z } from 'zod'
import { PERMISSION_REQUEST_STATUS } from '#constants/domain'
import { encryptedCredentialSchema } from '#modules/auth/validators/auth.validator.js'

const objectIdPattern = /^[a-f\d]{24}$/i

const roleCodePattern = /^[a-z][a-z0-9-]{1,59}$/
const menuCodePattern = /^[a-z][a-z0-9.-]{1,79}$/
const routeKeyPattern = /^[a-z][a-z0-9._-]{1,119}$/
const routePathPattern = /^\/[A-Za-z0-9_./:-]*$/

export const roleSchema = z.object({
  name: z.string().trim().min(2, '角色名称至少需要 2 个字符').max(40, '角色名称不能超过 40 个字符'),
  code: z.string().trim().toLowerCase().regex(roleCodePattern, '角色编码只能包含小写字母、数字和连字符'),
  description: z.string().trim().max(240, '角色说明不能超过 240 个字符').optional().default(''),
  remarkName: z.string().trim().max(60, '备注名不能超过 60 个字符').optional().default(''),
  menuIds: z.array(z.string().regex(objectIdPattern, '菜单 id 不正确')).optional().default([]),
  status: z.enum(['active', 'disabled']).optional().default('active'),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0)
}).strict('存在不支持的角色字段')

export const roleUpdateSchema = roleSchema.partial().extend({
  code: z.string().trim().toLowerCase().regex(roleCodePattern, '角色编码只能包含小写字母、数字和连字符').optional()
}).strict('存在不支持的角色字段')

export const roleMenuSchema = z.object({
  menuIds: z.array(z.string().regex(objectIdPattern, '菜单 id 不正确')).default([])
}).strict('存在不支持的角色菜单字段')

export const roleBatchMenuSchema = z.object({
  ids: z.array(z.string().regex(objectIdPattern, '角色 id 不正确')).min(1, '请选择要操作的角色'),
  menuIds: z.array(z.string().regex(objectIdPattern, '菜单 id 不正确')).default([])
}).strict('存在不支持的批量角色菜单字段')

export const roleBatchDeleteSchema = z.object({
  ids: z.array(z.string().regex(objectIdPattern, '角色 id 不正确')).min(1, '请选择要删除的角色')
}).strict('存在不支持的批量角色删除字段')

export const roleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  keyword: z.string().trim().max(60, '搜索关键词不能超过 60 个字符').optional(),
  status: z.enum(['all', 'active', 'disabled']).optional(),
  type: z.enum(['all', 'builtin', 'custom']).optional()
})

const menuBaseSchema = z.object({
  name: z.string().trim().min(2, '菜单名称至少需要 2 个字符').max(40, '菜单名称不能超过 40 个字符'),
  code: z.string().trim().toLowerCase().regex(menuCodePattern, '菜单编码只能包含小写字母、数字、点号和连字符'),
  icon: z.string().trim().max(60, '图标名称不能超过 60 个字符').optional().default(''),
  routePath: z.union([
    z.literal(''),
    z.string().trim().regex(routePathPattern, '路由路径格式不正确')
  ]).optional().default(''),
  routeKey: z.union([
    z.literal(''),
    z.string().trim().toLowerCase().regex(routeKeyPattern, '页面标识只能包含小写字母、数字、点号、下划线和连字符')
  ]).optional().default(''),
  activeMenuCode: z.union([
    z.literal(''),
    z.string().trim().toLowerCase().regex(menuCodePattern, '高亮菜单编码格式不正确')
  ]).optional().default(''),
  directoryAutoExpandWhenNested: z.boolean().optional().default(true),
  openMode: z.enum(['current', 'blank']).optional().default('current'),
  hidden: z.boolean().optional().default(false),
  enabled: z.boolean().optional().default(true),
  parentType: z.enum(['root', 'child']).optional(),
  parent_type: z.enum(['root', 'child']).optional(),
  parentId: z.string().regex(objectIdPattern, '父级菜单 id 不正确').nullable().optional().default(null),
  parent_id: z.union([
    z.literal('0'),
    z.string().regex(objectIdPattern, '父级菜单 id 不正确')
  ]).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
  type: z.enum(['system', 'custom']).optional().default('custom')
}).strict('存在不支持的菜单字段')

function normalizeMenuPayload(data, options = {}) {
  const hasParentField =
    data.parentType !== undefined ||
    data.parent_type !== undefined ||
    data.parentId !== undefined ||
    data.parent_id !== undefined

  if (options.partial && !hasParentField) {
    return data
  }

  const parentType = data.parentType || data.parent_type || (data.parentId || (data.parent_id && data.parent_id !== '0') ? 'child' : 'root')
  const parentId = data.parentId ?? (data.parent_id && data.parent_id !== '0' ? data.parent_id : null)

  return {
    ...data,
    parentType,
    parentId: parentType === 'root' ? null : parentId
  }
}

export const menuSchema = menuBaseSchema.transform((data) => normalizeMenuPayload(data))

export const menuUpdateSchema = menuBaseSchema.partial().extend({
  code: z.string().trim().toLowerCase().regex(menuCodePattern, '菜单编码只能包含小写字母、数字、点号和连字符').optional()
}).strict('存在不支持的菜单字段').transform((data) => normalizeMenuPayload(data, { partial: true }))

export const menuReorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().regex(objectIdPattern, '菜单 id 不正确'),
    parentId: z.union([
      z.literal('0'),
      z.string().regex(objectIdPattern, '父级菜单 id 不正确')
    ]).nullable().optional().default(null),
    sortOrder: z.coerce.number().int().min(0).max(9999)
  }).strict('存在不支持的菜单排序字段')).min(1, '请提供至少一个菜单排序项')
}).strict('存在不支持的菜单重排字段')

export const userRoleAssignSchema = z.object({
  roleIds: z.array(z.string().regex(objectIdPattern, '角色 id 不正确')).min(1, '请选择至少一个角色')
}).strict('存在不支持的用户角色字段')

export const userBatchResetPasswordSchema = z.object({
  userIds: z.array(z.string().regex(objectIdPattern, '用户 id 不正确')).min(1, '请选择要重置密码的用户'),
  credential: encryptedCredentialSchema
}).strict('存在不支持的批量密码重置字段')

export const userCreateSchema = z.object({
  username: z.string().trim().min(2, '用户名至少需要 2 个字符').max(32, '用户名不能超过 32 个字符'),
  email: z.string().trim().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少需要 8 个字符').max(72, '密码不能超过 72 个字符'),
  remarkName: z.string().trim().max(60, '用户备注名不能超过 60 个字符').optional().default(''),
  roleIds: z.array(z.string().regex(objectIdPattern, '角色 id 不正确')).default([]),
  status: z.enum(['active', 'muted', 'disabled']).optional().default('active')
}).strict('存在不支持的用户创建字段')

export const userRemarkSchema = z.object({
  remarkName: z.string().trim().max(60, '用户备注名不能超过 60 个字符').default('')
}).strict('存在不支持的用户备注字段')

export const permissionRequestSchema = z.object({
  targetRoleId: z.string().regex(objectIdPattern, '目标角色 id 不正确').optional(),
  reason: z.string().trim().min(1, '请填写申请说明').max(500, '申请说明不能超过 500 个字符')
}).strict('存在不支持的权限申请字段')

export const permissionRequestQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  userId: z.string().regex(objectIdPattern, '用户 id 不正确').optional(),
  status: z.union([
    z.literal('all'),
    z.enum(Object.values(PERMISSION_REQUEST_STATUS))
  ]).optional()
})

export const permissionReviewSchema = z.object({
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: '审批动作不正确' })
  }),
  rejectReason: z.string().trim().max(500, '驳回原因不能超过 500 个字符').optional()
}).strict('存在不支持的审批字段').refine((data) => data.action === 'approve' || !!data.rejectReason, {
  message: '驳回时必须填写驳回原因',
  path: ['rejectReason']
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
