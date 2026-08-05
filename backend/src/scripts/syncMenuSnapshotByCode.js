/**
 * 按稳定的菜单 code 将外部菜单快照同步到当前数据库。
 * 保留已有本地菜单 ID，避免破坏 Role.menuIds 关联；不会同步用户、角色或权限数据。
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { Menu, MENU_PARENT_TYPES } from '#modules/rbac/models/Menu.js'
import { MENU_OPEN_MODES, MENU_TYPES } from '#constants/domain'

const rawArgs = process.argv.slice(2)
const APPLY = rawArgs.includes('--apply')
const snapshotArg = rawArgs.find((item) => item.startsWith('--snapshot='))
const snapshotPath = snapshotArg ? path.resolve(snapshotArg.slice('--snapshot='.length)) : ''
const BACKUP_ROOT = path.resolve(env.rootDir, 'backups')

const MENU_FIELDS = [
  'name',
  'icon',
  'routePath',
  'routeKey',
  'activeMenuCode',
  'directoryAutoExpandWhenNested',
  'openMode',
  'pageCacheEnabled',
  'hidden',
  'enabled',
  'parentType',
  'parentId',
  'level',
  'sortOrder',
  'type'
]

function normalizeCode(value = '') {
  return String(value || '').trim().toLowerCase()
}

function readSnapshot(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('必须通过 --snapshot=菜单快照路径 指定可读取的 JSON 文件')
  }

  const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const menus = Array.isArray(payload) ? payload : payload.menus
  if (!Array.isArray(menus)) throw new Error('菜单快照格式错误：应为菜单数组或包含 menus 数组的对象')
  return menus
}

function buildRemoteRecords(menus) {
  const remoteIdToCode = new Map()
  const records = new Map()

  for (const item of menus) {
    const code = normalizeCode(item.code)
    if (!code) throw new Error('菜单快照存在缺少 code 的记录')
    if (records.has(code)) throw new Error(`菜单快照存在重复 code：${code}`)
    if (item._id) remoteIdToCode.set(String(item._id), code)
    records.set(code, { ...item, code })
  }

  return { records, remoteIdToCode }
}

function resolveParentCode(item, remoteIdToCode) {
  if (!item.parentId) return ''
  const parentCode = remoteIdToCode.get(String(item.parentId))
  if (!parentCode) throw new Error(`菜单 ${item.code} 的父菜单未包含在快照中：${item.parentId}`)
  return parentCode
}

function normalizePatch(item, parent) {
  const parentId = parent?._id || null
  return {
    name: String(item.name || '').trim(),
    icon: String(item.icon || '').trim(),
    routePath: String(item.routePath || '').trim(),
    routeKey: String(item.routeKey || '').trim(),
    activeMenuCode: normalizeCode(item.activeMenuCode),
    directoryAutoExpandWhenNested: item.directoryAutoExpandWhenNested !== false,
    openMode: item.openMode || MENU_OPEN_MODES.CURRENT,
    pageCacheEnabled: !!item.pageCacheEnabled,
    hidden: !!item.hidden,
    enabled: item.enabled !== false,
    parentType: parentId ? MENU_PARENT_TYPES.CHILD : MENU_PARENT_TYPES.ROOT,
    parentId,
    level: parentId ? (parent?.level || 1) + 1 : 1,
    sortOrder: Number(item.sortOrder || 0),
    type: item.type || MENU_TYPES.CUSTOM
  }
}

function isSameValue(left, right) {
  if (left && typeof left.toString === 'function' && right && typeof right.toString === 'function') {
    return left.toString() === right.toString()
  }
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null)
}

function diffMenu(menu, patch) {
  return MENU_FIELDS.filter((field) => !isSameValue(menu?.[field], patch[field]))
}

function createBackup(menus) {
  fs.mkdirSync(BACKUP_ROOT, { recursive: true })
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filePath = path.join(BACKUP_ROOT, `menu-before-code-sync-${timestamp}.json`)
  fs.writeFileSync(filePath, `${JSON.stringify(menus, null, 2)}\n`, 'utf8')
  return filePath
}

async function buildPlan(snapshotMenus, localMenus) {
  const { records, remoteIdToCode } = buildRemoteRecords(snapshotMenus)
  const localByCode = new Map(localMenus.map((item) => [normalizeCode(item.code), item]))
  const plan = []
  const pending = new Map(records)
  const resolvedCodes = new Set()

  while (pending.size > 0) {
    let progressed = false
    for (const [code, item] of pending) {
      const parentCode = resolveParentCode(item, remoteIdToCode)
      if (parentCode && !records.has(parentCode)) {
        throw new Error(`菜单 ${code} 的父菜单不在快照记录中：${parentCode}`)
      }
      if (parentCode && !resolvedCodes.has(parentCode)) continue

      const parent = parentCode ? localByCode.get(parentCode) : null
      if (parentCode && !parent) throw new Error(`菜单 ${code} 的父菜单无法解析：${parentCode}`)

      const current = localByCode.get(code)
      const patch = normalizePatch(item, parent)
      const fields = current ? diffMenu(current, patch) : MENU_FIELDS
      plan.push({ code, current, patch, fields, parentCode })

      // Dry-run 也把计划中的菜单放入索引，确保子菜单可继续解析父级。
      localByCode.set(code, current ? { ...current, ...patch } : { _id: `planned:${code}`, ...patch })
      resolvedCodes.add(code)
      pending.delete(code)
      progressed = true
    }

    if (!progressed) {
      throw new Error(`菜单快照存在循环引用或父级缺失：${[...pending.keys()].join(', ')}`)
    }
  }

  const remoteCodes = new Set(records.keys())
  const localOnly = localMenus.filter((item) => !remoteCodes.has(normalizeCode(item.code)))
  return { plan, localOnly }
}

async function syncMenuSnapshotByCode({ apply = APPLY, filePath = snapshotPath } = {}) {
  const snapshotMenus = readSnapshot(filePath)
  await connectDatabase()

  try {
    const localMenus = await Menu.find({}).sort({ sortOrder: 1, createdAt: 1 }).lean()
    const { plan, localOnly } = await buildPlan(snapshotMenus, localMenus)
    const creates = plan.filter((item) => !item.current)
    const changes = plan.filter((item) => item.current && item.fields.length)

    console.log(`菜单快照：${filePath}`)
    console.log(`模式：${apply ? '写入本地数据库' : 'dry-run'}`)
    console.log(`线上快照：${snapshotMenus.length} 项；本地现有：${localMenus.length} 项`)
    console.log(`待新增：${creates.length} 项；待更新：${changes.length} 项；本地额外：${localOnly.length} 项`)

    for (const item of [...creates, ...changes]) {
      console.log(`[${item.current ? 'update' : 'create'}] ${item.code}${item.parentCode ? ` <- ${item.parentCode}` : ''}`)
      if (item.current) console.log(`  ${item.fields.join(', ')}`)
    }
    localOnly.forEach((item) => console.log(`[keep-local] ${item.code}`))

    if (!apply) {
      console.log('dry-run 完成；传入 --apply 才会写入。本地额外菜单不会自动删除。')
      return { creates: creates.length, changes: changes.length, localOnly: localOnly.length }
    }

    const backupPath = createBackup(localMenus)
    const currentByCode = new Map(localMenus.map((item) => [normalizeCode(item.code), item]))
    for (const item of plan) {
      const parent = item.parentCode ? currentByCode.get(item.parentCode) : null
      const patch = normalizePatch(snapshotMenus.find((menu) => normalizeCode(menu.code) === item.code), parent)
      const current = currentByCode.get(item.code)
      if (!current) {
        const created = await Menu.create({ code: item.code, ...patch })
        currentByCode.set(item.code, created.toObject())
      } else if (diffMenu(current, patch).length) {
        await Menu.updateOne({ _id: current._id }, { $set: patch })
        currentByCode.set(item.code, { ...current, ...patch })
      }
    }

    const finalCount = await Menu.countDocuments({})
    console.log(`菜单同步完成：新增 ${creates.length} 项，更新 ${changes.length} 项，当前 ${finalCount} 项`)
    console.log(`写入前备份：${backupPath}`)
    return { creates: creates.length, changes: changes.length, localOnly: localOnly.length, backupPath, finalCount }
  } finally {
    await disconnectDatabase()
  }
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isCli) {
  syncMenuSnapshotByCode().catch(async (error) => {
    console.error('菜单快照同步失败:', error)
    await disconnectDatabase()
    process.exitCode = 1
  })
}

export { syncMenuSnapshotByCode }
