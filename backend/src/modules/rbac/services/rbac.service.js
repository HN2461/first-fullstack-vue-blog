import bcrypt from 'bcryptjs'
import { BUILTIN_ROLE_CODES, MENU_OPEN_MODES, MENU_TYPES, PERMISSION_REQUEST_STATUS, USER_ROLES, USER_STATUS } from '#constants/domain'
import { Menu, MENU_PARENT_TYPES } from '#modules/rbac/models/Menu.js'
import { PermissionRequest } from '#modules/rbac/models/PermissionRequest.js'
import { Role } from '#modules/rbac/models/Role.js'
import { User } from '#modules/user/models/User.js'
import { env } from '#config/env'
import { createSystemNotification } from '#modules/notification/services/notification.service.js'

const DEFAULT_MENUS = [
  { code: 'knowledge.root', name: '知识库', icon: 'BookOutlined', routePath: '', routeKey: 'knowledge.root', parentType: MENU_PARENT_TYPES.ROOT, sortOrder: 10, type: MENU_TYPES.SYSTEM },
  { code: 'knowledge.articles', name: '全部文章', icon: 'FileTextOutlined', routePath: '/console/articles', routeKey: 'knowledge.article.list', parentCode: 'knowledge.root', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 10, type: MENU_TYPES.SYSTEM },
  { code: 'knowledge.directory', name: '文章目录', icon: 'FolderOutlined', routePath: '/console/article-directory', routeKey: 'knowledge.article.directory', directoryAutoExpandWhenNested: true, parentCode: 'knowledge.root', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 15, type: MENU_TYPES.SYSTEM },
  { code: 'knowledge.memos', name: '备忘录', icon: 'BulbOutlined', routePath: '/console/memos', routeKey: 'knowledge.memo.list', parentCode: 'knowledge.root', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 20, type: MENU_TYPES.SYSTEM },
  { code: 'collaboration.discussions', name: '项目讨论', icon: 'MessageOutlined', routePath: '/console/discussions', routeKey: 'collaboration.discussion.list', parentCode: 'knowledge.root', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 22, type: MENU_TYPES.SYSTEM },
  { code: 'knowledge.ledger', name: '账本', icon: 'WalletOutlined', routePath: '', routeKey: 'knowledge.ledger', parentCode: 'knowledge.root', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 25, type: MENU_TYPES.SYSTEM },
  { code: 'knowledge.ledger.overview', name: '汇总图表', icon: 'BarChartOutlined', routePath: '/console/ledger/overview', routeKey: 'knowledge.ledger.overview', parentCode: 'knowledge.ledger', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 10, type: MENU_TYPES.SYSTEM },
  { code: 'knowledge.ledger.entries', name: '流水明细', icon: 'TableOutlined', routePath: '/console/ledger/entries', routeKey: 'knowledge.ledger.entries', parentCode: 'knowledge.ledger', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 20, type: MENU_TYPES.SYSTEM },
  { code: 'knowledge.ledger.daily', name: '日表格', icon: 'CalendarOutlined', routePath: '/console/ledger/daily', routeKey: 'knowledge.ledger.daily', parentCode: 'knowledge.ledger', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 30, type: MENU_TYPES.SYSTEM },
  { code: 'knowledge.ledger.moments', name: '重要记录', icon: 'StarOutlined', routePath: '/console/ledger/moments', routeKey: 'knowledge.ledger.moments', parentCode: 'knowledge.ledger', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 40, type: MENU_TYPES.SYSTEM },
  { code: 'knowledge.ledger.categories', name: '分类字段', icon: 'TagsOutlined', routePath: '', routeKey: 'knowledge.ledger.categories', parentCode: 'knowledge.ledger', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 90, hidden: true, type: MENU_TYPES.SYSTEM },
  { code: 'knowledge.ledger.imports', name: '导入记录', icon: 'ImportOutlined', routePath: '', routeKey: 'knowledge.ledger.imports', parentCode: 'knowledge.ledger', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 100, hidden: true, type: MENU_TYPES.SYSTEM },
  { code: 'knowledge.search', name: '全文检索', icon: 'SearchOutlined', routePath: '/console/search', routeKey: 'knowledge.search', parentCode: 'knowledge.root', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 30, hidden: true, type: MENU_TYPES.SYSTEM },
  { code: 'knowledge.profile', name: '个人信息', icon: 'UserOutlined', routePath: '/console/profile', routeKey: 'knowledge.profile', parentCode: 'knowledge.root', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 40, hidden: true, type: MENU_TYPES.SYSTEM },
  { code: 'knowledge.categories', name: '分类文章', icon: 'FolderOutlined', routePath: '/console/categories', routeKey: 'knowledge.category.articles', parentCode: 'knowledge.root', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 50, hidden: true, type: MENU_TYPES.SYSTEM },
  { code: 'knowledge.tags', name: '标签文章', icon: 'TagsOutlined', routePath: '/console/tags', routeKey: 'knowledge.tag.articles', parentCode: 'knowledge.root', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 60, hidden: true, type: MENU_TYPES.SYSTEM },
  { code: 'management.root', name: '后台管理', icon: 'ControlOutlined', routePath: '/console', routeKey: 'admin.dashboard', parentType: MENU_PARENT_TYPES.ROOT, sortOrder: 20 },
  { code: 'console.dashboard', name: '管理工作台', icon: 'DashboardOutlined', routePath: '/console', routeKey: 'admin.dashboard', parentCode: 'management.root', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 10 },
  { code: 'content.group', name: '内容管理', icon: 'FolderOutlined', routePath: '', parentCode: 'management.root', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 20 },
  { code: 'content.articles', name: '文章管理', icon: 'FileTextOutlined', routePath: '/console/manage/articles', routeKey: 'admin.article.list', parentCode: 'content.group', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 10 },
  { code: 'content.articleImport', name: '文章导入', icon: 'ImportOutlined', routePath: '/console/manage/articles/import', routeKey: 'admin.article.import', parentCode: 'content.group', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 15 },
  { code: 'content.categories', name: '分类体系', icon: 'FolderOutlined', routePath: '/console/manage/categories', routeKey: 'admin.category.list', parentCode: 'content.group', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 20 },
  { code: 'content.tags', name: '标签体系', icon: 'TagsOutlined', routePath: '/console/manage/tags', routeKey: 'admin.tag.list', parentCode: 'content.group', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 30 },
  { code: 'content.media', name: '媒体资产', icon: 'PictureOutlined', routePath: '/console/manage/media', routeKey: 'admin.media.list', parentCode: 'content.group', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 40 },
  { code: 'content.migration', name: '迁移配置', icon: 'SwapOutlined', routePath: '/console/manage/migration', routeKey: 'admin.migration', parentCode: 'content.group', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 50 },
  { code: 'operation.group', name: '互动运营', icon: 'BellOutlined', routePath: '', parentCode: 'management.root', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 30 },
  { code: 'governance.comments', name: '评论审核', icon: 'AuditOutlined', routePath: '/console/manage/comments', routeKey: 'admin.comment.list', parentCode: 'operation.group', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 10 },
  { code: 'governance.notifications', name: '公告管理', icon: 'BellOutlined', routePath: '/console/manage/notifications', routeKey: 'admin.notification.list', parentCode: 'operation.group', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 20 },
  { code: 'access.group', name: '权限治理', icon: 'SafetyOutlined', routePath: '', parentCode: 'management.root', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 40 },
  { code: 'governance.users', name: '用户管理', icon: 'UserOutlined', routePath: '/console/manage/users', routeKey: 'admin.user.list', parentCode: 'access.group', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 10 },
  { code: 'governance.roles', name: '角色管理', icon: 'TeamOutlined', routePath: '/console/manage/roles', routeKey: 'admin.role.list', parentCode: 'access.group', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 20 },
  { code: 'governance.menus', name: '菜单管理', icon: 'MenuOutlined', routePath: '/console/manage/menus', routeKey: 'admin.menu.list', parentCode: 'access.group', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 30 },
  { code: 'governance.approvals', name: '权限审批', icon: 'SafetyOutlined', routePath: '/console/manage/approvals', routeKey: 'admin.approval.list', parentCode: 'access.group', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 40 },
  { code: 'system.group', name: '系统运维', icon: 'ToolOutlined', routePath: '', parentCode: 'management.root', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 50 },
  { code: 'governance.settings', name: '系统设置', icon: 'SettingOutlined', routePath: '/console/manage/settings', routeKey: 'admin.setting.list', parentCode: 'system.group', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 10 },
  { code: 'governance.monitor', name: '服务监控', icon: 'MonitorOutlined', routePath: '/console/manage/monitor', routeKey: 'admin.monitor.list', parentCode: 'system.group', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 20 },
  { code: 'governance.projectTimeline', name: '项目记录台账', icon: 'ClockCircleOutlined', routePath: '/console/manage/project-timeline', routeKey: 'admin.project.timeline', parentCode: 'system.group', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 25 },
  { code: 'governance.trash', name: '回收站', icon: 'DeleteOutlined', routePath: '/console/manage/trash', routeKey: 'admin.trash.list', parentCode: 'system.group', parentType: MENU_PARENT_TYPES.CHILD, sortOrder: 30 }
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

function normalizeRoleId(role) {
  return (role?._id || role)?.toString()
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

async function collectMenuTree(menuId) {
  const root = await Menu.findById(menuId)
  if (!root) {
    throw createHttpError(404, 'MENU_NOT_FOUND', '菜单不存在')
  }

  const items = [root]
  const queue = [root._id]

  while (queue.length > 0) {
    const parentId = queue.shift()
    const children = await Menu.find({ parentId }).sort({ sortOrder: 1, createdAt: 1 })
    for (const child of children) {
      items.push(child)
      queue.push(child._id)
    }
  }

  return items
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

  if (parent.code === 'knowledge.directory') {
    throw createHttpError(400, 'MENU_PARENT_NOT_CONTAINER', '文章目录是系统内置模块，不能作为其他菜单的上级菜单')
  }

  if (menuId) {
    let pointer = parent
    while (pointer?.parentId) {
      const ancestorId = pointer.parentId.toString()
      if (ancestorId === menuId.toString()) {
        throw createHttpError(400, 'MENU_PARENT_CYCLE', '上级菜单不能选择自己的下级菜单')
      }
      pointer = await Menu.findById(pointer.parentId)
    }
  }

  return parent
}

function resolveMenuLevel(parent) {
  return parent ? (parent.level || 1) + 1 : 1
}

function buildTree(items) {
  const normalized = items
    .map((item) => ({
      ...item,
      id: item.id || item._id?.toString?.(),
      children: []
    }))
    .sort(compareMenuSort)
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

function buildMenuGroups(items) {
  return buildTree(items)
}

function sortMenus(items = []) {
  return [...items].sort(compareMenuSort)
}

function assertSystemMenuSafeUpdate(menu, input) {
  if (menu.type !== MENU_TYPES.SYSTEM) return

  const immutableFields = ['code', 'routePath', 'routeKey', 'type']
  const hasImmutableChange = immutableFields.some((field) => input[field] !== undefined && input[field] !== menu[field])
  if (hasImmutableChange) {
    throw createHttpError(403, 'SYSTEM_MENU_FIELD_PROTECTED', '系统菜单不允许修改编码、路由和类型')
  }
}

function compareMenuSort(left, right) {
  const itemSort = (left.sortOrder || 0) - (right.sortOrder || 0)
  const createdSort = new Date(left.createdAt || 0) - new Date(right.createdAt || 0)
  return itemSort || createdSort || String(left.name || '').localeCompare(String(right.name || ''), 'zh-Hans-CN')
}

export async function ensureRbacSeed(options = {}) {
  const forceBuiltinSync = options.forceBuiltinSync === true
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
        routePath: menuInput.routePath || '',
        routeKey: menuInput.routeKey || '',
        activeMenuCode: menuInput.activeMenuCode || '',
        directoryAutoExpandWhenNested: menuInput.directoryAutoExpandWhenNested !== false,
        openMode: MENU_OPEN_MODES.CURRENT,
        hidden: !!menuInput.hidden,
        enabled: true,
        parentType: menuInput.parentType || (parent ? MENU_PARENT_TYPES.CHILD : MENU_PARENT_TYPES.ROOT),
        parentId: parent?._id || null,
        level: resolveMenuLevel(parent),
        sortOrder: menuInput.sortOrder,
        type: menuInput.type || MENU_TYPES.CUSTOM
      })
    } else {
      const patch = {}
      if (forceBuiltinSync) {
        patch.name = menuInput.name
        patch.icon = menuInput.icon
        patch.routePath = menuInput.routePath || ''
        patch.routeKey = menuInput.routeKey || ''
        patch.activeMenuCode = menuInput.activeMenuCode || ''
        patch.directoryAutoExpandWhenNested = menuInput.directoryAutoExpandWhenNested !== false
        patch.hidden = !!menuInput.hidden
        patch.enabled = true
        patch.type = menuInput.type || MENU_TYPES.CUSTOM
        patch.sortOrder = menuInput.sortOrder
        patch.parentType = menuInput.parentType || (parent ? MENU_PARENT_TYPES.CHILD : MENU_PARENT_TYPES.ROOT)
        patch.parentId = patch.parentType === MENU_PARENT_TYPES.ROOT ? null : (parent?._id || null)
        patch.level = resolveMenuLevel(patch.parentId ? parent : null)
      } else {
        if (!menu.parentType) patch.parentType = menuInput.parentType || (parent ? MENU_PARENT_TYPES.CHILD : MENU_PARENT_TYPES.ROOT)
        if (!menu.routeKey && menuInput.routeKey) patch.routeKey = menuInput.routeKey
        if (!menu.activeMenuCode && menuInput.activeMenuCode) patch.activeMenuCode = menuInput.activeMenuCode
        if (menu.directoryAutoExpandWhenNested === undefined) {
          patch.directoryAutoExpandWhenNested = menuInput.directoryAutoExpandWhenNested !== false
        }
        if (menu.hidden === undefined) patch.hidden = !!menuInput.hidden
        if (menu.enabled === undefined) patch.enabled = true
        if (!menu.parentId && menu.parentType !== MENU_PARENT_TYPES.ROOT && parent) {
          patch.parentId = parent._id
          patch.level = resolveMenuLevel(parent)
        }
        if (!menu.level) patch.level = menu.parentId ? 2 : 1
      }

      if (menuInput.code === 'knowledge.ledger') {
        patch.routePath = ''
      }
      if (['knowledge.ledger.categories', 'knowledge.ledger.imports'].includes(menuInput.code)) {
        patch.routePath = ''
        patch.hidden = true
      }

      if (Object.keys(patch).length > 0) {
        await Menu.updateOne({ _id: menu._id }, { $set: patch })
        Object.assign(menu, patch)
      }
    }

    codeToMenu.set(menu.code, menu)
  }

  await Menu.deleteMany({ code: { $in: ['content.root', 'governance.root'] } })

  const allMenus = await Menu.find({ enabled: true })
  const ledgerMenu = allMenus.find((menu) => menu.code === 'knowledge.ledger')
  const ledgerChildMenuIds = allMenus
    .filter((menu) => menu.code?.startsWith('knowledge.ledger.'))
    .map((menu) => menu._id)
  if (ledgerMenu && ledgerChildMenuIds.length) {
    await Role.updateMany(
      {
        $and: [
          { menuIds: ledgerMenu._id },
          { menuIds: { $nin: ledgerChildMenuIds } }
        ]
      },
      { $addToSet: { menuIds: { $each: ledgerChildMenuIds } } }
    )
  }
  const adminMenuIds = allMenus.map((menu) => menu._id)
  const knowledgeMenuIds = allMenus
    .filter((menu) => menu.code?.startsWith('knowledge.'))
    .map((menu) => menu._id)
  const adminBaseMenuIds = allMenus
    .filter((menu) => menu.code?.startsWith('knowledge.') || ['management.root', 'console.dashboard'].includes(menu.code))
    .map((menu) => menu._id)

  const superRole = await Role.findOneAndUpdate(
    { code: BUILTIN_ROLE_CODES.SUPER_ADMIN },
    {
      $set: {
        name: '超级管理员',
        description: '系统唯一全局配置与权限审批主体，拥有全部菜单与操作权限。',
        remarkName: '',
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
        remarkName: '',
        isBuiltin: true,
        isSuperAdmin: false,
        sortOrder: 10
      },
      $setOnInsert: {
        menuIds: knowledgeMenuIds,
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
        description: '默认仅开放知识库与管理工作台入口，具体后台业务菜单必须由超级管理员显式分配。',
        remarkName: '',
        isBuiltin: true,
        isSuperAdmin: false,
        sortOrder: 20
      },
      $setOnInsert: {
        menuIds: adminBaseMenuIds,
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
    ? await Menu.find({ enabled: true }).sort({ sortOrder: 1, createdAt: 1 })
    : await Menu.find({
        enabled: true,
        _id: {
          $in: roles.flatMap((role) => role.menuIds || [])
        }
      }).sort({ sortOrder: 1, createdAt: 1 })

  const safeMenus = sortMenus(menus.map((menu) => menu.toSafeJSON()))
  const groupedMenus = buildMenuGroups(safeMenus)
  const permissions = {
    menus: groupedMenus,
    menuGroups: groupedMenus,
    rootMenus: groupedMenus,
    flatMenus: safeMenus,
    menuPaths: safeMenus.map((menu) => menu.routePath).filter(Boolean)
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
      { description: regex },
      { remarkName: regex }
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
    remarkName: input.remarkName || '',
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
  if (input.remarkName !== undefined) role.remarkName = input.remarkName
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
  const items = sortMenus(menus.map((menu) => menu.toSafeJSON()))
  const groups = buildMenuGroups(items)
  return {
    items,
    tree: groups,
    groups,
    roots: groups
  }
}

export async function listPermissionMenus() {
  await ensureRbacSeed()
  const menus = await Menu.find().sort({ sortOrder: 1, createdAt: 1 })
  const items = sortMenus(menus.map((menu) => menu.toSafeJSON()))
  const groups = buildMenuGroups(items)
  return {
    items,
    tree: groups,
    groups,
    roots: groups
  }
}

export async function listRootMenus() {
  await ensureRbacSeed()
  const roots = await Menu.find({
    parentType: MENU_PARENT_TYPES.ROOT,
    enabled: true,
    hidden: { $ne: true }
  }).sort({ sortOrder: 1, createdAt: 1 })

  return {
    items: roots.map((menu) => menu.toSafeJSON())
  }
}

export async function createMenu(input) {
  await ensureRbacSeed()
  const existing = await Menu.exists({ code: input.code })
  if (existing) {
    throw createHttpError(409, 'MENU_CODE_EXISTS', '菜单编码已存在')
  }

  const parentId = input.parentId || null
  const parent = parentId ? await assertValidParent(null, parentId) : null
  const parentType = parent ? MENU_PARENT_TYPES.CHILD : MENU_PARENT_TYPES.ROOT
  if (input.parentType === MENU_PARENT_TYPES.CHILD && !parent) {
    throw createHttpError(400, 'MENU_PARENT_REQUIRED', '创建菜单必须选择上级菜单')
  }
  const menu = await Menu.create({
    name: input.name,
    code: input.code,
    icon: input.icon || '',
    routePath: input.routePath,
    routeKey: input.routeKey || '',
    activeMenuCode: input.activeMenuCode || '',
    directoryAutoExpandWhenNested: input.directoryAutoExpandWhenNested !== false,
    openMode: input.openMode,
    hidden: !!input.hidden,
    enabled: input.enabled !== false,
    parentType,
    parentId: parent?._id || null,
    level: resolveMenuLevel(parent),
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
  assertSystemMenuSafeUpdate(menu, input)

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
  if (input.routeKey !== undefined) menu.routeKey = input.routeKey || ''
  if (input.activeMenuCode !== undefined) menu.activeMenuCode = input.activeMenuCode || ''
  if (input.directoryAutoExpandWhenNested !== undefined && menu.code === 'knowledge.directory') {
    menu.directoryAutoExpandWhenNested = input.directoryAutoExpandWhenNested
  }
  if (input.openMode !== undefined) menu.openMode = input.openMode
  if (input.hidden !== undefined) menu.hidden = input.hidden
  if (input.enabled !== undefined) menu.enabled = input.enabled
  if (input.sortOrder !== undefined) menu.sortOrder = input.sortOrder
  if (input.type !== undefined) menu.type = input.type
  if (input.parentId !== undefined || input.parentType !== undefined) {
    const nextParentId = input.parentId || null
    if (!nextParentId) {
      menu.parentType = MENU_PARENT_TYPES.ROOT
      menu.parentId = null
      menu.level = 1
    } else {
      const parent = await assertValidParent(menu._id, nextParentId)
      menu.parentType = MENU_PARENT_TYPES.CHILD
      menu.parentId = parent._id
      menu.level = resolveMenuLevel(parent)
    }
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

  const menuMap = new Map(menus.map((menu) => [menu._id.toString(), menu]))
  const itemMap = new Map(items.map((item) => [item.id, item]))
  const parentMap = new Map()
  const parentDocMap = new Map()

  for (const item of items) {
    const nextParentId = item.parentId && item.parentId !== '0' ? item.parentId : null
    if (!nextParentId) {
      parentMap.set(item.id, null)
      continue
    }

    const parent = await assertValidParent(item.id, nextParentId)
    parentMap.set(item.id, parent._id)
    parentDocMap.set(parent._id.toString(), parent)
  }

  function resolveBatchLevel(menuId, visited = new Set()) {
    if (visited.has(menuId)) {
      throw createHttpError(400, 'MENU_PARENT_CYCLE', '菜单层级存在循环引用')
    }

    visited.add(menuId)
    const nextParentId = parentMap.get(menuId)?.toString?.() || null
    if (!nextParentId) return 1
    if (itemMap.has(nextParentId)) {
      return resolveBatchLevel(nextParentId, visited) + 1
    }

    const parent = menuMap.get(nextParentId) || parentDocMap.get(nextParentId)
    return (parent?.level || 1) + 1
  }

  const operations = items.map((item) => {
    const parentId = parentMap.get(item.id) || null
    const parentType = parentId ? MENU_PARENT_TYPES.CHILD : MENU_PARENT_TYPES.ROOT
    return {
      updateOne: {
        filter: { _id: item.id },
        update: {
          $set: {
            parentType,
            parentId,
            level: resolveBatchLevel(item.id),
            sortOrder: item.sortOrder
          }
        }
      }
    }
  })

  if (operations.length) {
    await Menu.bulkWrite(operations)
  }

  return {
    updatedCount: operations.length,
    ...await listMenus()
  }
}

export async function deleteMenu(id) {
  await ensureRbacSeed()
  const tree = await collectMenuTree(id)
  const root = tree[0]
  if (root.type === MENU_TYPES.SYSTEM || root.code === 'management.root') {
    throw createHttpError(403, 'BUILTIN_MENU_PROTECTED', '系统内置菜单不允许删除')
  }

  const ids = tree.map((item) => item._id)
  const routePaths = tree.map((item) => item.routePath).filter(Boolean)
  await Promise.all([
    Role.updateMany({}, { $pull: { menuIds: { $in: ids } } }),
    User.updateMany({}, { $pull: { quickActions: { $in: routePaths } } }),
    Menu.deleteMany({ _id: { $in: ids } })
  ])
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

  const ownedRoleIds = new Set((user.roles || []).map(normalizeRoleId).filter(Boolean))
  if (ownedRoleIds.has(targetRole._id.toString())) {
    throw createHttpError(409, 'ROLE_ALREADY_ASSIGNED', '你已拥有该角色，无需重复申请')
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

export async function listPermissionRequestRoles(user) {
  await ensureRbacSeed()
  const ownedRoleIds = new Set((user.roles || []).map(normalizeRoleId).filter(Boolean))
  const roles = await Role.find({
    status: 'active',
    isSuperAdmin: false,
    _id: { $nin: Array.from(ownedRoleIds) }
  }).sort({ sortOrder: 1, createdAt: 1 })

  return roles.map((role) => role.toSafeJSON())
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
