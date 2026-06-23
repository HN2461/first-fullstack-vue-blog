import { Router } from 'express'
import { requireAdmin, requireAuth, requireMenuAccess, requireSuperAdmin } from '#middlewares/auth.js'
import {
  batchDeleteRoles,
  batchUpdateRoleMenus,
  createMenu,
  createPermissionRequest,
  createRole,
  deleteMenu,
  deleteRole,
  hydrateUserPermissions,
  listPermissionMenus,
  listMenus,
  listPermissionRequestRoles,
  listPermissionRequests,
  listRootMenus,
  listRoles,
  reorderMenus,
  reviewPermissionRequest,
  updateMenu,
  updateRole,
  updateRoleMenus
} from '#modules/rbac/services/rbac.service.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import {
  menuSchema,
  menuReorderSchema,
  menuUpdateSchema,
  parseBody,
  permissionRequestQuerySchema,
  permissionRequestSchema,
  permissionReviewSchema,
  roleMenuSchema,
  roleBatchDeleteSchema,
  roleBatchMenuSchema,
  roleQuerySchema,
  roleSchema,
  roleUpdateSchema
} from '#modules/rbac/validators/rbac.validator.js'

export const rbacRouter = Router()

rbacRouter.get('/me/permissions', requireAuth, asyncHandler(async (req, res) => {
  res.json(ok(await hydrateUserPermissions(req.user)))
}))

rbacRouter.post('/permission-requests', requireAuth, asyncHandler(async (req, res) => {
  const input = parseBody(permissionRequestSchema, req.body)
  const request = await createPermissionRequest(req.user, input)
  res.status(201).json(ok(request, '权限申请已提交'))
}))

rbacRouter.get('/permission-request-roles', requireAuth, asyncHandler(async (req, res) => {
  res.json(ok(await listPermissionRequestRoles(req.user)))
}))

rbacRouter.use(requireAuth, requireAdmin)

const canAccessRoles = requireMenuAccess('/console/manage/roles')
const canAccessMenus = requireMenuAccess('/console/manage/menus')
const canAccessApprovals = requireMenuAccess('/console/manage/approvals')

rbacRouter.get('/roles', canAccessRoles, asyncHandler(async (req, res) => {
  const input = parseBody(roleQuerySchema, req.query)
  res.json(ok(await listRoles(input)))
}))

rbacRouter.post('/roles', canAccessRoles, requireSuperAdmin, asyncHandler(async (req, res) => {
  const input = parseBody(roleSchema, req.body)
  res.status(201).json(ok(await createRole(input), '角色已创建'))
}))

rbacRouter.post('/roles/batch/menus', canAccessRoles, requireSuperAdmin, asyncHandler(async (req, res) => {
  const input = parseBody(roleBatchMenuSchema, req.body)
  res.json(ok(await batchUpdateRoleMenus(input.ids, input), '角色菜单权限已批量更新'))
}))

rbacRouter.post('/roles/batch/delete', canAccessRoles, requireSuperAdmin, asyncHandler(async (req, res) => {
  const input = parseBody(roleBatchDeleteSchema, req.body)
  res.json(ok(await batchDeleteRoles(input.ids), '角色已批量删除'))
}))

rbacRouter.patch('/roles/:id', canAccessRoles, requireSuperAdmin, asyncHandler(async (req, res) => {
  const input = parseBody(roleUpdateSchema, req.body)
  res.json(ok(await updateRole(req.params.id, input), '角色已更新'))
}))

rbacRouter.patch('/roles/:id/menus', canAccessRoles, requireSuperAdmin, asyncHandler(async (req, res) => {
  const input = parseBody(roleMenuSchema, req.body)
  res.json(ok(await updateRoleMenus(req.params.id, input), '角色菜单权限已更新'))
}))

rbacRouter.delete('/roles/:id', canAccessRoles, requireSuperAdmin, asyncHandler(async (req, res) => {
  res.json(ok(await deleteRole(req.params.id), '角色已删除'))
}))

rbacRouter.get('/roles/permission-menus', canAccessRoles, asyncHandler(async (req, res) => {
  res.json(ok(await listPermissionMenus()))
}))

rbacRouter.get('/menus', canAccessMenus, asyncHandler(async (req, res) => {
  res.json(ok(await listMenus()))
}))

rbacRouter.get('/menus/roots', canAccessMenus, asyncHandler(async (req, res) => {
  res.json(ok(await listRootMenus()))
}))

rbacRouter.post('/menus', canAccessMenus, requireSuperAdmin, asyncHandler(async (req, res) => {
  const input = parseBody(menuSchema, req.body)
  res.status(201).json(ok(await createMenu(input), '菜单已创建'))
}))

rbacRouter.patch('/menus/:id', canAccessMenus, requireSuperAdmin, asyncHandler(async (req, res) => {
  const input = parseBody(menuUpdateSchema, req.body)
  res.json(ok(await updateMenu(req.params.id, input), '菜单已更新'))
}))

rbacRouter.post('/menus/reorder', canAccessMenus, requireSuperAdmin, asyncHandler(async (req, res) => {
  const input = parseBody(menuReorderSchema, req.body)
  res.json(ok(await reorderMenus(input), '菜单顺序已更新'))
}))

rbacRouter.delete('/menus/:id', canAccessMenus, requireSuperAdmin, asyncHandler(async (req, res) => {
  res.json(ok(await deleteMenu(req.params.id), '菜单已删除'))
}))

rbacRouter.get('/permission-requests', canAccessApprovals, asyncHandler(async (req, res) => {
  const input = parseBody(permissionRequestQuerySchema, req.query)
  res.json(ok(await listPermissionRequests(input)))
}))

rbacRouter.post('/permission-requests/:id/review', canAccessApprovals, requireSuperAdmin, asyncHandler(async (req, res) => {
  const input = parseBody(permissionReviewSchema, req.body)
  const request = await reviewPermissionRequest(req.params.id, req.user, input)
  res.json(ok(request, '审批结果已保存'))
}))
