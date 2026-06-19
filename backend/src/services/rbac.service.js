import bcrypt from 'bcryptjs'
import { BUILTIN_ROLE_CODES, MENU_OPEN_MODES, MENU_TYPES, PERMISSION_REQUEST_STATUS, USER_ROLES, USER_STATUS } from '#constants/domain'
import { Menu } from '../models/Menu.js'
import { PermissionRequest } from '../models/PermissionRequest.js'
import { Role } from '../models/Role.js'
import { User } from '../models/User.js'
import { env } from '../config/env.js'
import { createSystemNotification } from './notification.service.js'

const DEFAULT_MENUS = [
  { code: 'console.dashboard', name: '管理工作台', icon: 'DashboardOutlined', routePath: '/console', sortOrder: 10 },
  { code: 'content.root', name: '内容资产', icon: 'FileTextOutlined', routePath: '/console/manage/articles', sortOrder: 20 },
  { code: 'content.articles', name: '文章管理', icon: 'FileTextOutlined', routePath: '/console/manage/articles', parentCode: 'content.root', sortOrder: 21 },
  { code: 'content.categories', name: '分类体系', icon: 'FolderOutlined', routePath: '/console/manage/categories', parentCode: 'content.root', sortOrder: 22 },
  { code: 'content.migration', name: '迁移配置', icon: 'SwapOutlined', routePath: '/console/manage/migration', parentCode: 'content.root', sortOrder: 23 },
  { code: 'content.tags', name: '标签体系', icon: 'TagsOutlined', routePath: '/console/manage/tags', parentCode: 'content.root', sortOrder: 24 },
  { code: 'content.media', name: '媒体资产', icon: 'PictureOutlined', routePath: '/console/manage/media', parentCode: 'content.root', sortOrder: 25 },
  { code: 'governance.root', name: '运营治理', icon: 'SettingOutlined', routePath: '/console/manage/comments', sortOrder: 30 },
  { code: 'governance.comments', name: '评论审核', icon: 'AuditOutlined', routePath: '/console/manage/comments', parentCode: 'governance.root', sortOrder: 31 },
  { code: 'governance.users', name: '用户管理', icon: 'UserOutlined', routePath: '/console/manage/users', parentCode: 'governance.root', sortOrder: 32 },
  { code: 'governance.roles', name: '角色管理', icon: 'TeamOutlined', routePath: '/console/manage/roles', parentCode: 'governance.root', sortOrder: 33 },
  { code: 'governance.menus', name: '菜单管理', icon: 'MenuOutlined', routePath: '/console/manage/menus', parentCode: 'governance.root', sortOrder: 34 },
  { code: 'governance.approvals', name: '权限审批', icon: 'SafetyOutlined', routePath: '/console/manage/approvals', parentCode: 'governance.root', sortOrder: 35 },
  { code: 'governance.notifications', name: '公告管理', icon: 'BellOutlined', routePath: '/console/manage/notifications', parentCode: 'governance.root', sortOrder: 36 },
  { code: 'governance.settings', name: '系统设置', icon: 'SettingOutlined', routePath: '/console/manage/settings', parentCode: 'governance.root', sortOrder: 37 },
  { code: 'governance.monitor', name: '服务监控', icon: 'MonitorOutlined', routePath: '/console/manage/monitor', parentCode: 'governance.root', sortOrder: 38 },
  { code: 'governance.trash', name: '回收站', icon: 'DeleteOutlined', routePath: '/console/manage/trash', parentCode: 'governance.root', sortOrder: 39 }
]

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function assertEditableRole(role, options = {}) {
  if (!role) {
    throw createHttpError(404, 'ROLE_NOT_FOUND', '角色不存在')
  }

  if (role.isSuperAdmin || role.code === BUILTIN_ROLE_CODES.SUPER_ADMIN) {
    throw createHttpError(403, 'SUPER_ROLE_PROTECTED', '超级管理员角色不允许修改')
  }

  if (options.delete && role.isBuiltin) {
    throw createHttpError(403, 'BUILTIN_ROLE_PROTECTED', '内置角色不允许删除')
  }
}

async function assertMenuIdsExist(menuIds = []) {
  const ids = [...new Set(menuIds)]
  if (!ids.length) return []

  const count = await Menu.countDocuments({ _id: { $in: ids } })
  if (count !== ids.length) {
    throw createHttpError(400, 'MENU_NOT_FOUND', '包含不存在的菜单权限')
  }

  return ids
}

async function normalizeRoleMenuIds(menuIds = []) {
  const ids = await assertMenuIdsExist(menuIds)
  if (!ids.length) return []

  const menus = await Menu.find({ _id: { $in: ids } })
  const menuMap = new Map(menus.map((menu) => [menu._id.toString(), menu]))
  const normalizedIds = new Set(ids.map((id) => id.toString()))

  // 只保存子菜单会让控制台侧栏丢失父级层级，因此授权时同步补齐所有祖先菜单。
  for (const menu of menus) {
    let parentId = menu.parentId?.toString()
    while (parentId && !normalizedIds.has(parentId)) {
      const parent = menuMap.get(parentId) || await Menu.findById(parentId)
      if (!parent) break
      menuMap.set(parent._id.toString(), parent)
      normalizedIds.add(parent._id.toString())
      parentId = parent.parentId?.toString()
    }
  }

  return [...normalizedIds]
}

async function assertBatchEditableRoles(ids = [], options = {}) {
  const uniqueIds = [...new Set(ids.map((id) => id.toString()))]
  const roles = await Role.find({ _id: { $in: uniqueIds } })
  const roleMap = new Map(roles.map((role) => [role._id.toString(), role]))

  for (const id of uniqueIds) {
    assertEditableRole(roleMap.get(id), options)
  }

  return uniqueIds.map((id) => roleMap.get(id))
}

async function assertValidParent(menuId, parentId) {
  if (!parentId) return null

  if (menuId && parentId === menuId.toString()) {
    throw createHttpError(400, 'MENU_PARENT_SELF', '上级菜单不能选择自身')
  }

  const parent = await Menu.findById(parentId)
  if (!parent) {
    throw createHttpError(400, 'MENU_PARENT_NOT_FOUND', '上级菜单不存在')
  }

  let cursor = parent
  while (cursor?.parentId) {
    const ancestorId = cursor.parentId.toString()
    if (menuId && ancestorId === menuId.toString()) {
      throw createHttpError(400, 'MENU_PARENT_DESCENDANT', '上级菜单不能选择自身的下级')
    }
    cursor = await Menu.findById(cursor.parentId)
  }

  return parent._id
}

function buildTree(items) {
  const normalized = items
    .map((item) => ({
      ...item,
      id: item.id || item._id?.toString?.(),
      children: []
    }))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  const map = new Map(normalized.map((item) => [item.id, item]))
  const roots = []

  for (const item of normalized) {
    const parentId = item.parentId || null
    if (parentId && map.has(parentId)) {
      map.get(parentId).children.push(item)
    } else {
      roots.push(item)
    }
  }

  return roots
}

export async function ensureRbacSeed() {
  const codeToMenu = new Map()

  for (const menuInput of DEFAULT_MENUS) {
    const parent = menuInput.parentCode
      ? codeToMenu.get(menuInput.parentCode) || await Menu.findOne({ code: menuInput.parentCode })
      : null

    let menu = await Menu.findOne({ code: menuInput.code })
    if (!menu) {
      menu = await Menu.create({
        name: menuInput.name,
        code: menuInput.code,
        icon: menuInput.icon,
        routePath: menuInput.routePath,
        openMode: MENU_OPEN_MODES.CURRENT,
        hidden: false,
        enabled: true,
        parentId: parent?._id || null,
        sortOrder: menuInput.sortOrder,
        type: MENU_TYPES.CUSTOM
      })
    }

    codeToMenu.set(menu.code, menu)
  }

  const allMenus = await Menu.find({ enabled: true })
  const adminMenuIds = allMenus.map((menu) => menu._id)

  const superRole = await Role.findOneAndUpdate(
    { code: BUILTIN_ROLE_CODES.SUPER_ADMIN },
    {
      $set: {
        name: '超级管理员',
        description: '系统唯一全局配置与权限审批主体，拥有全部菜单与操作权限。',
        menuIds: adminMenuIds,
        isBuiltin: true,
        isSuperAdmin: true,
        status: 'active',
        sortOrder: 0
      }
    },
    { upsert: true, new: true }
  )

  await Role.findOneAndUpdate(
    { code: BUILTIN_ROLE_CODES.VISITOR },
    {
      $set: {
        name: '访客角色',
        description: '仅可访问知识库阅读能力，无后台管理菜单权限。',
        menuIds: [],
        isBuiltin: true,
        isSuperAdmin: false,
        sortOrder: 10
      },
      $setOnInsert: {
        status: 'active'
      }
    },
    { upsert: true, new: true }
  )

  await Role.findOneAndUpdate(
    { code: BUILTIN_ROLE_CODES.ADMIN_BASE },
    {
      $set: {
        name: '管理员基础角色',
        description: '默认开放基础管理菜单，可由超级管理员按需调整。',
        menuIds: adminMenuIds,
        isBuiltin: true,
        isSuperAdmin: false,
        sortOrder: 20
      },
      $setOnInsert: {
        status: 'active'
      }
    },
    { upsert: true, new: true }
  )

  if (env.nodeEnv !== 'test' && env.adminEmail && env.adminPassword && env.adminUsername) {
    const email = env.adminEmail.trim().toLowerCase()
    const passwordHash = await bcrypt.hash(env.adminPassword, 12)
    await User.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          username: env.adminUsername.trim(),
          email,
          passwordHash
        },
        $set: {
          role: USER_ROLES.SUPER_ADMIN,
          roles: [superRole._id],
          status: USER_STATUS.ACTIVE
        }
      },
      { upsert: true, new: true }
    )
  }
}

export async function getVisitorRole() {
  await ensureRbacSeed()
  return Role.findOne({ code: BUILTIN_ROLE_CODES.VISITOR })
}

export async function getAdminBaseRole() {
  await ensureRbacSeed()
  return Role.findOne({ code: BUILTIN_ROLE_CODES.ADMIN_BASE })
}

export async function hydrateUserPermissions(user) {
  await ensureRbacSeed()

  const freshUser = await User.findById(user._id || user.id).populate('roles')
  if (!freshUser) return null

  let roles = (freshUser.roles || []).filter((role) => role?.status === 'active')

  if (!roles.length && freshUser.role) {
    const fallbackCode = freshUser.role === USER_ROLES.ADMIN ? BUILTIN_ROLE_CODES.ADMIN_BASE : BUILTIN_ROLE_CODES.VISITOR
    const fallbackRole = await Role.findOne({ code: fallbackCode })
    if (fallbackRole) {
      freshUser.roles = [fallbackRole._id]
      await freshUser.save()
      roles = [fallbackRole]
    }
  }

  const isSuperAdmin = roles.some((role) => role.isSuperAdmin) || freshUser.role === USER_ROLES.SUPER_ADMIN
  const menus = isSuperAdmin
    ? await Menu.find({ enabled: true }).sort({ sortOrder: 1 })
    : await Menu.find({
        enabled: true,
        _id: {
          $in: roles.flatMap((role) => role.menuIds || [])
        }
      }).sort({ sortOrder: 1 })

  const safeMenus = menus.map((menu) => menu.toSafeJSON())
  const permissions = {
    menus: buildTree(safeMenus),
    flatMenus: safeMenus,
    menuPaths: safeMenus.map((menu) => menu.routePath)
  }

  return freshUser.toSafeJSON({ roles, permissions })
}

export async function listRoles(options = {}) {
  await ensureRbacSeed()
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 10))
  const query = {}

  if (options.keyword) {
    const regex = new RegExp(escapeRegExp(options.keyword.trim()), 'i')
    query.$or = [
      { name: regex },
      { code: regex },
      { description: regex }
    ]
  }

  if (options.status && options.status !== 'all') {
    query.status = options.status
  }

  if (options.type === 'builtin') {
    query.isBuiltin = true
  } else if (options.type === 'custom') {
    query.isBuiltin = false
  }

  const skip = (page - 1) * pageSize
  const [roles, total] = await Promise.all([
    Role.find(query)
      .sort({ sortOrder: 1, createdAt: 1 })
      .skip(skip)
      .limit(pageSize),
    Role.countDocuments(query)
  ])
  const roleIds = roles.map((role) => role._id)
  const userCounts = roleIds.length
    ? await User.aggregate([
        { $match: { roles: { $in: roleIds } } },
        { $unwind: '$roles' },
        { $match: { roles: { $in: roleIds } } },
        { $group: { _id: '$roles', count: { $sum: 1 } } }
      ])
    : []
  const countMap = new Map(userCounts.map((item) => [item._id.toString(), item.count]))

  return {
    items: roles.map((role) => ({
      ...role.toSafeJSON(),
      userCount: countMap.get(role._id.toString()) || 0
    })),
    total,
    page,
    pageSize
  }
}

export async function createRole(input) {
  await ensureRbacSeed()
  const existing = await Role.exists({ code: input.code })
  if (existing) {
    throw createHttpError(409, 'ROLE_CODE_EXISTS', '角色编码已存在')
  }

  const menuIds = await normalizeRoleMenuIds(input.menuIds)
  const role = await Role.create({
    name: input.name,
    code: input.code,
    description: input.description || '',
    menuIds,
    isBuiltin: false,
    isSuperAdmin: false,
    status: input.status,
    sortOrder: input.sortOrder
  })

  return role.toSafeJSON()
}

export async function updateRole(id, input) {
  await ensureRbacSeed()
  const role = await Role.findById(id)
  assertEditableRole(role)

  if (input.code && input.code !== role.code) {
    const existing = await Role.exists({ code: input.code, _id: { $ne: role._id } })
    if (existing) {
      throw createHttpError(409, 'ROLE_CODE_EXISTS', '角色编码已存在')
    }
    if (role.isBuiltin) {
      throw createHttpError(403, 'BUILTIN_ROLE_CODE_PROTECTED', '内置角色编码不允许修改')
    }
    role.code = input.code
  }

  if (input.name !== undefined) role.name = input.name
  if (input.description !== undefined) role.description = input.description
  if (input.status !== undefined) role.status = input.status
  if (input.sortOrder !== undefined) role.sortOrder = input.sortOrder
  if (input.menuIds !== undefined) {
    role.menuIds = await normalizeRoleMenuIds(input.menuIds)
  }

  await role.save()
  return role.toSafeJSON()
}

export async function updateRoleMenus(id, input) {
  return updateRole(id, { menuIds: input.menuIds })
}

export async function batchUpdateRoleMenus(ids, input) {
  const menuIds = await normalizeRoleMenuIds(input.menuIds)
  const roles = await assertBatchEditableRoles(ids)
  const roleIds = roles.map((role) => role._id)
  const result = await Role.updateMany(
    { _id: { $in: roleIds } },
    { $set: { menuIds } }
  )

  return { updatedCount: result.modifiedCount || 0 }
}

export async function deleteRole(id) {
  await ensureRbacSeed()
  const role = await Role.findById(id)
  assertEditableRole(role, { delete: true })

  const used = await User.exists({ roles: role._id })
  if (used) {
    throw createHttpError(409, 'ROLE_IN_USE', '该角色已被用户使用，不能删除')
  }

  await Role.deleteOne({ _id: role._id })
  return { deletedCount: 1 }
}

export async function batchDeleteRoles(ids) {
  const roles = await assertBatchEditableRoles(ids, { delete: true })
  const roleIds = roles.map((role) => role._id)
  const used = await User.findOne({ roles: { $in: roleIds } }).select('_id')
  if (used) {
    throw createHttpError(409, 'ROLE_IN_USE', '选中的角色中存在已被用户使用的角色，不能批量删除')
  }

  const result = await Role.deleteMany({ _id: { $in: roleIds } })
  return { deletedCount: result.deletedCount || 0 }
}

export async function listMenus() {
  await ensureRbacSeed()
  const menus = await Menu.find().sort({ sortOrder: 1, createdAt: 1 })
  const items = menus.map((menu) => menu.toSafeJSON())
  return {
    items,
    tree: buildTree(items)
  }
}

export async function listPermissionMenus() {
  await ensureRbacSeed()
  const menus = await Menu.find().sort({ sortOrder: 1, createdAt: 1 })
  const items = menus.map((menu) => menu.toSafeJSON())
  return {
    items,
    tree: buildTree(items)
  }
}

export async function createMenu(input) {
  await ensureRbacSeed()
  const existing = await Menu.exists({ code: input.code })
  if (existing) {
    throw createHttpError(409, 'MENU_CODE_EXISTS', '菜单编码已存在')
  }

  const parentId = await assertValidParent(null, input.parentId)
  const menu = await Menu.create({
    name: input.name,
    code: input.code,
    icon: input.icon || '',
    routePath: input.routePath,
    openMode: input.openMode,
    hidden: !!input.hidden,
    enabled: input.enabled !== false,
    parentId,
    sortOrder: input.sortOrder,
    type: input.type
  })

  return menu.toSafeJSON()
}

export async function updateMenu(id, input) {
  await ensureRbacSeed()
  const menu = await Menu.findById(id)
  if (!menu) {
    throw createHttpError(404, 'MENU_NOT_FOUND', '菜单不存在')
  }

  if (input.code && input.code !== menu.code) {
    const existing = await Menu.exists({ code: input.code, _id: { $ne: menu._id } })
    if (existing) {
      throw createHttpError(409, 'MENU_CODE_EXISTS', '菜单编码已存在')
    }
    menu.code = input.code
  }

  if (input.name !== undefined) menu.name = input.name
  if (input.icon !== undefined) menu.icon = input.icon
  if (input.routePath !== undefined) menu.routePath = input.routePath
  if (input.openMode !== undefined) menu.openMode = input.openMode
  if (input.hidden !== undefined) menu.hidden = input.hidden
  if (input.enabled !== undefined) menu.enabled = input.enabled
  if (input.sortOrder !== undefined) menu.sortOrder = input.sortOrder
  if (input.type !== undefined) menu.type = input.type
  if (input.parentId !== undefined) {
    menu.parentId = await assertValidParent(menu._id, input.parentId)
  }

  await menu.save()
  return menu.toSafeJSON()
}

export async function reorderMenus(input) {
  await ensureRbacSeed()
  const items = input.items || []
  const ids = [...new Set(items.map((item) => item.id))]

  if (ids.length !== items.length) {
    throw createHttpError(400, 'MENU_REORDER_DUPLICATED', '菜单重排数据存在重复项')
  }

  const menus = await Menu.find({ _id: { $in: ids } })
  if (menus.length !== ids.length) {
    throw createHttpError(404, 'MENU_NOT_FOUND', '存在不存在的菜单')
  }

  for (const item of items) {
    await assertValidParent(item.id, item.parentId)
  }

  const operations = items.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: {
        $set: {
          parentId: item.parentId || null,
          sortOrder: item.sortOrder
        }
      }
    }
  }))

  if (operations.length) {
    await Menu.bulkWrite(operations)
  }

  return { updatedCount: operations.length }
}

export async function deleteMenu(id) {
  await ensureRbacSeed()
  const menu = await Menu.findById(id)
  if (!menu) {
    throw createHttpError(404, 'MENU_NOT_FOUND', '菜单不存在')
  }

  const hasChildren = await Menu.exists({ parentId: menu._id })
  if (hasChildren) {
    throw createHttpError(409, 'MENU_HAS_CHILDREN', '请先删除或调整下级菜单')
  }

  await Role.updateMany({}, { $pull: { menuIds: menu._id } })
  await Menu.deleteOne({ _id: menu._id })
  return { deletedCount: 1 }
}

export async function createPermissionRequest(user, input) {
  await ensureRbacSeed()
  const targetRole = input.targetRoleId
    ? await Role.findById(input.targetRoleId)
    : await getAdminBaseRole()

  if (!targetRole || targetRole.isSuperAdmin) {
    throw createHttpError(400, 'INVALID_TARGET_ROLE', '申请的目标角色不正确')
  }

  if (targetRole.status !== 'active') {
    throw createHttpError(400, 'TARGET_ROLE_DISABLED', '申请的目标角色已禁用')
  }

  const existing = await PermissionRequest.findOne({
    user: user._id,
    targetRole: targetRole._id,
    status: PERMISSION_REQUEST_STATUS.PENDING
  })

  if (existing) {
    throw createHttpError(409, 'PERMISSION_REQUEST_PENDING', '已有待审批的权限申请')
  }

  const request = await PermissionRequest.create({
    user: user._id,
    targetRole: targetRole._id,
    reason: input.reason
  })

  await request.populate(['user', 'targetRole'])
  return request.toSafeJSON()
}

export async function listPermissionRequests(options = {}) {
  const page = Math.max(1, Number(options.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(options.pageSize) || 20))
  const query = options.status && options.status !== 'all' ? { status: options.status } : {}
  if (options.userId) {
    query.user = options.userId
  }
  const skip = (page - 1) * pageSize

  const [items, total] = await Promise.all([
    PermissionRequest.find(query)
      .populate(['user', 'targetRole'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    PermissionRequest.countDocuments(query)
  ])

  return {
    items: items.map((item) => item.toSafeJSON()),
    total,
    page,
    pageSize
  }
}

export async function reviewPermissionRequest(id, reviewer, input) {
  const request = await PermissionRequest.findById(id)
  if (!request) {
    throw createHttpError(404, 'PERMISSION_REQUEST_NOT_FOUND', '权限申请不存在')
  }

  if (request.status !== PERMISSION_REQUEST_STATUS.PENDING) {
    throw createHttpError(400, 'PERMISSION_REQUEST_REVIEWED', '该申请已处理')
  }

  if (input.action === 'approve') {
    const targetRole = await Role.findById(request.targetRole)
    if (!targetRole || targetRole.status !== 'active' || targetRole.isSuperAdmin) {
      throw createHttpError(400, 'TARGET_ROLE_DISABLED', '目标角色不可用，无法通过申请')
    }
  }

  request.status = input.action === 'approve'
    ? PERMISSION_REQUEST_STATUS.APPROVED
    : PERMISSION_REQUEST_STATUS.REJECTED
  request.rejectReason = input.action === 'reject' ? input.rejectReason || '' : ''
  request.reviewedBy = reviewer._id
  request.reviewedAt = new Date()
  await request.save()

  if (request.status === PERMISSION_REQUEST_STATUS.APPROVED) {
    await User.updateOne(
      { _id: request.user },
      { $addToSet: { roles: request.targetRole } }
    )
  }

  await request.populate(['user', 'targetRole'])
  const safeRequest = request.toSafeJSON()
  const approved = request.status === PERMISSION_REQUEST_STATUS.APPROVED
  await createSystemNotification({
    title: approved ? '权限申请已通过' : '权限申请已驳回',
    content: approved
      ? `你的「${safeRequest.targetRole?.name || '管理员权限'}」申请已通过，系统已自动授予对应角色。`
      : `你的「${safeRequest.targetRole?.name || '管理员权限'}」申请已驳回。原因：${request.rejectReason || '未填写原因'}`,
    level: approved ? 'info' : 'warning',
    link: '/console/profile',
    autoPopup: true,
    authorId: reviewer._id
  }, request.user._id || request.user)
  return safeRequest
}
