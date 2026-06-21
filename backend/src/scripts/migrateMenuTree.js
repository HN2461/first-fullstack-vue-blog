import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { Menu } from '#modules/rbac/models/Menu.js'

const applyChanges = process.argv.includes('--apply')

function toId(value) {
  return value ? value.toString() : null
}

function cloneMenuTree(items = []) {
  return items.map((item) => ({
    ...item,
    children: cloneMenuTree(item.children || [])
  }))
}

function flattenTree(items = [], parentId = null, result = []) {
  items.forEach((item, index) => {
    result.push({
      id: item._id.toString(),
      parentId,
      sortOrder: (index + 1) * 10
    })
    flattenTree(item.children || [], item._id.toString(), result)
  })
  return result
}

function buildTree(items = []) {
  const nodeMap = new Map(items.map((item) => [item._id.toString(), { ...item, children: [] }]))
  const roots = []

  for (const item of nodeMap.values()) {
    const parentId = toId(item.parentId)
    if (parentId && nodeMap.has(parentId)) {
      nodeMap.get(parentId).children.push(item)
    } else {
      roots.push(item)
    }
  }

  const sortNodes = (nodes) => nodes
    .sort((left, right) => {
      const sortDiff = Number(left.sortOrder || 0) - Number(right.sortOrder || 0)
      if (sortDiff !== 0) return sortDiff
      return new Date(left.createdAt || 0) - new Date(right.createdAt || 0)
    })
    .map((node) => ({
      ...node,
      children: sortNodes(node.children || [])
    }))

  return sortNodes(roots)
}

function collectDepthMap(items = [], level = 1, depthMap = new Map()) {
  items.forEach((item) => {
    const id = item._id?.toString?.() || item.id?.toString?.()
    if (!id) return
    depthMap.set(id, level)
    collectDepthMap(item.children || [], level + 1, depthMap)
  })
  return depthMap
}

const DEFAULT_MENU_STRUCTURE = Object.freeze({
  'management.root': {
    parentCode: null,
    sortOrder: 20,
    routePath: '/console'
  },
  'console.dashboard': {
    parentCode: 'management.root',
    sortOrder: 10,
    routePath: '/console'
  },
  'content.group': {
    parentCode: 'management.root',
    sortOrder: 20,
    routePath: ''
  },
  'content.articles': {
    parentCode: 'content.group',
    sortOrder: 10,
    routePath: '/console/manage/articles'
  },
  'content.categories': {
    parentCode: 'content.group',
    sortOrder: 20,
    routePath: '/console/manage/categories'
  },
  'content.tags': {
    parentCode: 'content.group',
    sortOrder: 30,
    routePath: '/console/manage/tags'
  },
  'content.media': {
    parentCode: 'content.group',
    sortOrder: 40,
    routePath: '/console/manage/media'
  },
  'content.migration': {
    parentCode: 'content.group',
    sortOrder: 50,
    routePath: '/console/manage/migration'
  },
  'operation.group': {
    parentCode: 'management.root',
    sortOrder: 30,
    routePath: ''
  },
  'governance.comments': {
    parentCode: 'operation.group',
    sortOrder: 10,
    routePath: '/console/manage/comments'
  },
  'governance.notifications': {
    parentCode: 'operation.group',
    sortOrder: 20,
    routePath: '/console/manage/notifications'
  },
  'access.group': {
    parentCode: 'management.root',
    sortOrder: 40,
    routePath: ''
  },
  'governance.users': {
    parentCode: 'access.group',
    sortOrder: 10,
    routePath: '/console/manage/users'
  },
  'governance.roles': {
    parentCode: 'access.group',
    sortOrder: 20,
    routePath: '/console/manage/roles'
  },
  'governance.menus': {
    parentCode: 'access.group',
    sortOrder: 30,
    routePath: '/console/manage/menus'
  },
  'governance.approvals': {
    parentCode: 'access.group',
    sortOrder: 40,
    routePath: '/console/manage/approvals'
  },
  'system.group': {
    parentCode: 'management.root',
    sortOrder: 50,
    routePath: ''
  },
  'governance.settings': {
    parentCode: 'system.group',
    sortOrder: 10,
    routePath: '/console/manage/settings'
  },
  'governance.monitor': {
    parentCode: 'system.group',
    sortOrder: 20,
    routePath: '/console/manage/monitor'
  },
  'governance.projectTimeline': {
    parentCode: 'system.group',
    sortOrder: 25,
    routePath: '/console/manage/project-timeline'
  },
  'governance.trash': {
    parentCode: 'system.group',
    sortOrder: 30,
    routePath: '/console/manage/trash'
  }
})

async function main() {
  await connectDatabase()

  try {
    const menus = await Menu.find().sort({ sortOrder: 1, createdAt: 1 }).lean()
    const menuMap = new Map(menus.map((menu) => [menu._id.toString(), { ...menu, children: [] }]))

    const codeMap = new Map(menus.map((menu) => [menu.code, menu]))
    const structurePatchMap = new Map()
    for (const [code, config] of Object.entries(DEFAULT_MENU_STRUCTURE)) {
      const menu = codeMap.get(code)
      if (!menu) continue
      const targetParent = config.parentCode ? codeMap.get(config.parentCode) : null
      structurePatchMap.set(menu._id.toString(), {
        id: menu._id.toString(),
        parentId: targetParent?._id?.toString?.() || null,
        sortOrder: config.sortOrder,
        routePath: config.routePath
      })
    }

    const configuredIds = new Set([...structurePatchMap.keys()])
    const normalizedMenus = menus.map((menu) => {
      const patch = structurePatchMap.get(menu._id.toString())
      return patch
        ? {
          ...menu,
          parentId: patch.parentId,
          routePath: patch.routePath,
          sortOrder: patch.sortOrder
        }
        : menu
    })
    const tree = buildTree(normalizedMenus)
    const payload = flattenTree(cloneMenuTree(tree))
    const payloadMap = new Map(payload.map((item) => [item.id, item]))
    const mergedPayload = normalizedMenus.map((menu) => {
      const flattened = payloadMap.get(menu._id.toString())
      const patch = structurePatchMap.get(menu._id.toString())
      return {
        id: menu._id.toString(),
        parentId: patch?.parentId ?? flattened?.parentId ?? toId(menu.parentId),
        sortOrder: patch?.sortOrder ?? flattened?.sortOrder ?? Number(menu.sortOrder || 0),
        routePath: patch?.routePath ?? menu.routePath ?? ''
      }
    })
    const depthTree = buildTree(mergedPayload.map((item) => ({
      _id: item.id,
      parentId: item.parentId,
      sortOrder: item.sortOrder
    })))
    const depthMap = collectDepthMap(depthTree)
    const orphanGroups = menus.filter((menu) => menu.groupKey || menu.groupName || menu.groupOrder)
    const invalidDepth = menus.filter((menu) => {
      let depth = 1
      let pointer = menu
      const visited = new Set([menu._id.toString()])
      while (pointer?.parentId) {
        const parentId = pointer.parentId.toString()
        if (visited.has(parentId)) {
          return true
        }
        visited.add(parentId)
        pointer = menuMap.get(parentId)
        depth += 1
        if (depth > 64) return true
      }
      return false
    })

    console.log(applyChanges ? 'Applying menu tree migration...' : 'Dry-run menu tree migration...')
    console.log(`Menus: ${menus.length}`)
    console.log(`Roots: ${tree.length}`)
    console.log(`Tree updates: ${mergedPayload.length}`)
    console.log(`Group fields to clear: ${orphanGroups.length}`)
    console.log(`Potential invalid depth/cycle records: ${invalidDepth.length}`)

    for (const item of mergedPayload) {
      const current = menuMap.get(item.id)
      const currentParentId = toId(current?.parentId)
      if (currentParentId !== item.parentId || Number(current?.sortOrder || 0) !== Number(item.sortOrder || 0)) {
        console.log(`- ${current?.code || item.id}: parent ${currentParentId || 'null'} -> ${item.parentId || 'null'}, sort ${current?.sortOrder || 0} -> ${item.sortOrder}`)
      }
    }

    if (applyChanges) {
      for (const item of mergedPayload) {
        await Menu.updateOne(
          { _id: item.id },
          {
            $set: {
              parentId: item.parentId,
              parentType: item.parentId ? 'child' : 'root',
              level: depthMap.get(item.id) || 1,
              routePath: item.routePath ?? menuMap.get(item.id)?.routePath ?? '',
              sortOrder: item.sortOrder
            },
            $unset: {
              groupKey: '',
              groupName: '',
              groupOrder: ''
            }
          }
        )
      }

      for (const menu of menus) {
        if (menu.code === 'management.root') continue
        if (!configuredIds.has(menu._id.toString()) && !menu.parentId) {
          await Menu.updateOne(
            { _id: menu._id },
            {
              $set: {
                parentType: 'root',
                level: 1
              },
              $unset: {
                groupKey: '',
                groupName: '',
                groupOrder: ''
              }
            }
          )
        }
      }
    }

    console.log(applyChanges ? 'Done.' : 'Dry-run only. Re-run with --apply to write changes.')
  } finally {
    await disconnectDatabase()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
