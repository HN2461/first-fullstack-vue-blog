import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { Menu, MENU_PARENT_TYPES } from '#modules/rbac/models/Menu.js'
import { MENU_OPEN_MODES, MENU_TYPES } from '#constants/domain'

const applyChanges = process.argv.includes('--apply')
const snapshotArg = process.argv.find((arg) => arg.startsWith('--snapshot='))
const snapshotPath = snapshotArg
  ? path.resolve(snapshotArg.slice('--snapshot='.length))
  : path.resolve(process.cwd(), 'src/data/menuConfig/local-menu-snapshot-2026-06-21.json')

function readSnapshot(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`菜单配置快照不存在：${filePath}`)
  }

  const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (!Array.isArray(payload.menus)) {
    throw new Error('菜单配置快照格式错误：缺少 menus 数组')
  }

  return payload.menus
}

function normalizeCode(code = '') {
  return String(code || '').trim().toLowerCase()
}

function isSameValue(left, right) {
  return String(left ?? '') === String(right ?? '')
}

function buildPatch(menu, target, parent) {
  const parentType = target.parentCode ? MENU_PARENT_TYPES.CHILD : (target.parentType || MENU_PARENT_TYPES.ROOT)
  const parentId = parentType === MENU_PARENT_TYPES.ROOT ? null : parent?._id || null

  return {
    name: target.name,
    icon: target.icon || '',
    routePath: target.routePath || '',
    routeKey: target.routeKey || '',
    activeMenuCode: target.activeMenuCode || '',
    directoryAutoExpandWhenNested: target.directoryAutoExpandWhenNested !== false,
    openMode: target.openMode || MENU_OPEN_MODES.CURRENT,
    hidden: !!target.hidden,
    enabled: target.enabled !== false,
    parentType,
    parentId,
    level: parentId ? (parent?.level || 1) + 1 : 1,
    sortOrder: Number(target.sortOrder || 0),
    type: target.type || MENU_TYPES.CUSTOM
  }
}

function diffMenu(menu, patch) {
  const fields = [
    'name',
    'icon',
    'routePath',
    'routeKey',
    'activeMenuCode',
    'directoryAutoExpandWhenNested',
    'openMode',
    'hidden',
    'enabled',
    'parentType',
    'level',
    'sortOrder',
    'type'
  ]
  const changes = []

  fields.forEach((field) => {
    if (!isSameValue(menu?.[field], patch[field])) {
      changes.push(`${field}: ${JSON.stringify(menu?.[field] ?? '')} -> ${JSON.stringify(patch[field] ?? '')}`)
    }
  })

  const currentParentId = menu?.parentId ? menu.parentId.toString() : ''
  const nextParentId = patch.parentId ? patch.parentId.toString() : ''
  if (currentParentId !== nextParentId) {
    changes.push(`parentId: ${currentParentId || 'null'} -> ${nextParentId || 'null'}`)
  }

  return changes
}

async function syncMenuSnapshot({ apply = applyChanges, filePath = snapshotPath } = {}) {
  const targets = readSnapshot(filePath)
  await connectDatabase()

  try {
    const menus = await Menu.find().sort({ sortOrder: 1, createdAt: 1 })
    const codeMap = new Map(menus.map((menu) => [normalizeCode(menu.code), menu]))
    let changedCount = 0
    let createdCount = 0
    let skippedCount = 0

    console.log(`菜单快照：${filePath}`)
    console.log(`模式：${apply ? '写入数据库' : 'dry-run'}`)
    console.log(`快照菜单：${targets.length} 项`)

    for (const target of targets) {
      const code = normalizeCode(target.code)
      if (!code) {
        skippedCount += 1
        console.log('[skip] 缺少菜单 code')
        continue
      }

      const parent = target.parentCode ? codeMap.get(normalizeCode(target.parentCode)) : null
      if (target.parentCode && !parent) {
        skippedCount += 1
        console.log(`[skip] ${code} 上级菜单不存在：${target.parentCode}`)
        continue
      }

      const menu = codeMap.get(code)
      const patch = buildPatch(menu, target, parent)

      if (!menu) {
        createdCount += 1
        console.log(`[create] ${code} ${target.name}`)
        if (apply) {
          const created = await Menu.create({ ...patch, code })
          codeMap.set(code, created)
        }
        continue
      }

      const changes = diffMenu(menu, patch)
      if (!changes.length) {
        console.log(`[keep] ${code}`)
        continue
      }

      changedCount += 1
      console.log(`[change] ${code} ${target.name}`)
      changes.forEach((change) => console.log(`  - ${change}`))

      if (apply) {
        await Menu.updateOne({ _id: menu._id }, { $set: patch })
        Object.assign(menu, patch)
      }
    }

    console.log(`待新增：${createdCount} 项`)
    console.log(`待更新：${changedCount} 项`)
    console.log(`跳过：${skippedCount} 项`)
    console.log(apply ? '菜单配置快照同步完成。' : 'dry-run 完成；传入 --apply 才会写入数据库。')
  } finally {
    await disconnectDatabase()
  }
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isCli) {
  syncMenuSnapshot().catch(async (error) => {
    console.error(error)
    await disconnectDatabase()
    process.exitCode = 1
  })
}
