import { Menu, MENU_PARENT_TYPES } from '#modules/rbac/models/Menu.js'
import { Role } from '#modules/rbac/models/Role.js'
import { BUILTIN_ROLE_CODES, MENU_TYPES } from '#constants/domain'

export const FEEDBACK_MENUS = [
  {
    code: 'knowledge.feedback',
    name: '意见反馈',
    icon: 'MessageOutlined',
    routePath: '/console/feedback',
    routeKey: 'knowledge.feedback',
    parentCode: 'knowledge.root',
    parentType: MENU_PARENT_TYPES.CHILD,
    sortOrder: 35,
    type: MENU_TYPES.SYSTEM
  },
  {
    code: 'governance.feedback',
    name: '反馈管理',
    icon: 'MessageOutlined',
    routePath: '/console/manage/feedback',
    routeKey: 'admin.feedback',
    parentCode: 'operation.group',
    parentType: MENU_PARENT_TYPES.CHILD,
    sortOrder: 25,
    type: MENU_TYPES.SYSTEM
  }
]

/** 首次上线时赋予已有知识库角色个人反馈入口；以后保留管理员在数据库中的撤权结果。 */
export async function grantInitialFeedbackAccess(menuId, rootId) {
  return Role.updateMany(
    { $or: [{ menuIds: rootId }, { code: { $in: [BUILTIN_ROLE_CODES.VISITOR, BUILTIN_ROLE_CODES.ADMIN_BASE] } }] },
    { $addToSet: { menuIds: menuId } }
  )
}

/** 定向初始化两个反馈菜单；dry-run 只返回计划，apply 不调整其他菜单挂载和现有业务角色。 */
export async function initializeFeedbackMenus(apply = false) {
  const report = { createdMenus: 0, grantRoles: 0 }
  for (const input of FEEDBACK_MENUS) {
    const existing = await Menu.findOne({ code: input.code })
    if (existing) continue
    const parent = await Menu.findOne({ code: input.parentCode })
    if (!parent) throw new Error(`缺少菜单父节点 ${input.parentCode}，请先检查当前权限数据`)
    report.createdMenus += 1
    if (input.code === 'knowledge.feedback') {
      report.grantRoles = await Role.countDocuments({
        $or: [{ menuIds: parent._id }, { code: { $in: [BUILTIN_ROLE_CODES.VISITOR, BUILTIN_ROLE_CODES.ADMIN_BASE] } }]
      })
    }
    if (!apply) continue
    const { parentCode, ...fields } = input
    const menu = await Menu.create({ ...fields, parentId: parent._id, level: parent.level + 1, enabled: true })
    if (input.code === 'knowledge.feedback') await grantInitialFeedbackAccess(menu._id, parent._id)
    await Role.updateMany({ isSuperAdmin: true }, { $addToSet: { menuIds: menu._id } })
  }
  return report
}
