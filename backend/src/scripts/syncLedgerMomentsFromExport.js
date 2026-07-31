import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import { connectDatabase, disconnectDatabase } from '#config/database'
import { env } from '#config/env'
import { LedgerBook } from '#modules/ledger/models/LedgerBook.js'
import { LedgerCategory } from '#modules/ledger/models/LedgerCategory.js'
import { LEDGER_MOMENT_SCOPES, LedgerMoment } from '#modules/ledger/models/LedgerMoment.js'
import { User } from '#modules/user/models/User.js'

const scriptPath = fileURLToPath(import.meta.url)
const validScopes = new Set(LEDGER_MOMENT_SCOPES)

function readArg(name, args = process.argv.slice(2)) {
  const prefix = `--${name}=`
  return args.find((item) => item.startsWith(prefix))?.slice(prefix.length) || ''
}

function normalizeText(value, maxLength, fieldName) {
  const text = String(value || '').trim()
  if (text.length > maxLength) {
    throw new Error(`${fieldName}超过最大长度 ${maxLength}`)
  }
  return text
}

function normalizeTags(tags = []) {
  const seen = new Set()
  return (Array.isArray(tags) ? tags : [])
    .map((item) => normalizeText(item, 24, '标签'))
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 12)
}

export function normalizeSourceMoment(item) {
  if (!mongoose.Types.ObjectId.isValid(item?.sourceId)) {
    throw new Error(`线上重要记录 ID 不正确: ${item?.sourceId || '-'}`)
  }

  const occurredAt = new Date(item.occurredAt)
  if (Number.isNaN(occurredAt.getTime())) {
    throw new Error(`重要记录日期不正确: ${item?.title || item?.sourceId}`)
  }

  const amount = Number(item.amount || 0)
  if (!Number.isFinite(amount) || amount < 0 || amount > 999999999) {
    throw new Error(`重要记录金额不正确: ${item?.title || item?.sourceId}`)
  }

  const scope = validScopes.has(item.scope) ? item.scope : 'day'
  return {
    sourceId: String(item.sourceId),
    title: normalizeText(item.title, 80, '标题'),
    scope,
    occurredAt,
    amount,
    categoryName: normalizeText(item.categoryName, 40, '分类名称'),
    categoryText: normalizeText(item.categoryText, 40, '自定义分类'),
    mood: normalizeText(item.mood, 40, '心情'),
    content: normalizeText(item.content, 2000, '记录内容'),
    tags: normalizeTags(item.tags),
    pinned: Boolean(item.pinned),
    createdAt: item.createdAt ? new Date(item.createdAt) : occurredAt,
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : occurredAt
  }
}

export function buildSemanticKey(item) {
  return [
    String(item.title || '').trim().toLowerCase(),
    Number(item.amount || 0).toFixed(2),
    String(item.content || '').trim().toLowerCase()
  ].join('|')
}

function comparableMoment(item) {
  return {
    title: item.title,
    scope: item.scope,
    occurredAt: new Date(item.occurredAt).toISOString(),
    amount: Number(item.amount || 0),
    categoryId: item.categoryId ? String(item.categoryId) : null,
    categoryText: item.categoryText || '',
    entryId: null,
    mood: item.mood || '',
    content: item.content || '',
    tags: item.tags || [],
    pinned: Boolean(item.pinned)
  }
}

function momentsEqual(left, right) {
  return JSON.stringify(comparableMoment(left)) === JSON.stringify(comparableMoment(right))
}

function buildPayload(source, target, categoryId) {
  return {
    _id: new mongoose.Types.ObjectId(source.sourceId),
    userId: target.userId,
    bookId: target.bookId,
    title: source.title,
    scope: source.scope,
    occurredAt: source.occurredAt,
    amount: source.amount,
    categoryId,
    categoryText: source.categoryText,
    entryId: null,
    mood: source.mood,
    content: source.content,
    tags: source.tags,
    pinned: source.pinned,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt
  }
}

export function planMomentSync({ sourceItems, existingTargetItems, existingBySourceId, target, categories }) {
  const semanticIndex = new Map()
  existingTargetItems.forEach((item) => {
    const key = buildSemanticKey(item)
    const matches = semanticIndex.get(key) || []
    matches.push(item)
    semanticIndex.set(key, matches)
  })

  const categoryByName = new Map(categories.map((item) => [item.name.trim().toLowerCase(), item]))
  const actions = []
  const conflicts = []

  sourceItems.forEach((source) => {
    const sourceIdMatch = existingBySourceId.get(source.sourceId)
    if (sourceIdMatch && (
      String(sourceIdMatch.userId) !== String(target.userId)
      || String(sourceIdMatch.bookId) !== String(target.bookId)
    )) {
      conflicts.push({ source, reason: '线上 ID 已被本地其他用户或账本占用' })
      return
    }

    const category = source.categoryName
      ? categoryByName.get(source.categoryName.toLowerCase())
      : null
    const payload = buildPayload(source, target, category?._id || null)

    if (sourceIdMatch) {
      actions.push({
        type: momentsEqual(sourceIdMatch, payload) ? 'unchanged' : 'update',
        source,
        payload,
        localId: sourceIdMatch._id
      })
      return
    }

    const semanticMatches = semanticIndex.get(buildSemanticKey(source)) || []
    if (semanticMatches.length > 1) {
      conflicts.push({ source, reason: '本地存在多条语义相同记录，无法自动选择替换目标' })
      return
    }

    if (semanticMatches.length === 1) {
      actions.push({
        type: 'replace',
        source,
        payload,
        localId: semanticMatches[0]._id
      })
      return
    }

    actions.push({ type: 'insert', source, payload, localId: null })
  })

  return { actions, conflicts }
}

function printPlan(plan, sourcePath, targetUser, targetBook, apply) {
  const count = (type) => plan.actions.filter((item) => item.type === type).length
  console.log(`模式: ${apply ? '正式同步' : '预览'}`)
  console.log(`来源文件: ${sourcePath}`)
  console.log(`目标账号: ${targetUser.email}`)
  console.log(`目标账本: ${targetBook.name}`)
  console.log(`线上记录: ${plan.actions.length + plan.conflicts.length}`)
  console.log(`新增: ${count('insert')}`)
  console.log(`更新: ${count('update')}`)
  console.log(`替换语义重复记录: ${count('replace')}`)
  console.log(`无需修改: ${count('unchanged')}`)
  console.log(`冲突: ${plan.conflicts.length}`)

  plan.actions
    .filter((item) => item.type !== 'unchanged')
    .forEach((item) => console.log(`- ${item.type}: ${item.source.title} (${item.source.sourceId})`))
  plan.conflicts.forEach((item) => console.log(`- conflict: ${item.source.title} - ${item.reason}`))
}

async function writeBackup(items) {
  const backupDir = path.resolve(env.rootDir, '../backups/ledger-moment-sync')
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, `ledger-moments-before-${stamp}.json`)
  await fs.mkdir(backupDir, { recursive: true })
  await fs.writeFile(backupPath, `${JSON.stringify({
    backedUpAt: new Date().toISOString(),
    records: items
  }, null, 2)}\n`, 'utf8')
  return backupPath
}

async function applyPlan(plan, existingTargetItems) {
  const writes = plan.actions.filter((item) => item.type !== 'unchanged')
  if (!writes.length) return { backupPath: '', changed: 0 }

  const backupPath = await writeBackup(existingTargetItems)
  const operations = []
  writes.forEach((item) => {
    if (item.type === 'replace') {
      operations.push({ deleteOne: { filter: { _id: item.localId } } })
      operations.push({ insertOne: { document: item.payload } })
      return
    }
    if (item.type === 'insert') {
      operations.push({ insertOne: { document: item.payload } })
      return
    }

    const { _id, ...update } = item.payload
    operations.push({
      updateOne: {
        filter: { _id },
        update: { $set: update }
      }
    })
  })

  await LedgerMoment.collection.bulkWrite(operations, { ordered: true })
  return { backupPath, changed: writes.length }
}

export async function main(args = process.argv.slice(2)) {
  const apply = args.includes('--apply')
  const sourceArg = readArg('source', args)
  if (!sourceArg) throw new Error('必须通过 --source=文件路径 指定线上重要记录导出文件')

  const sourcePath = path.resolve(sourceArg)
  const sourceDocument = JSON.parse(await fs.readFile(sourcePath, 'utf8'))
  const sourceItems = (sourceDocument.moments || []).map(normalizeSourceMoment)
  if (!sourceItems.length) throw new Error('来源文件没有可同步的重要记录')

  const duplicateSourceIds = sourceItems.filter((item, index) => (
    sourceItems.findIndex((other) => other.sourceId === item.sourceId) !== index
  ))
  if (duplicateSourceIds.length) throw new Error('来源文件存在重复的重要记录 ID')

  await connectDatabase()
  try {
    const targetEmail = readArg('target-user', args) || env.adminEmail
    const targetBookName = readArg('target-book', args) || '默认账本'
    if (!targetEmail) throw new Error('未配置目标账号，请传入 --target-user=邮箱')

    const targetUser = await User.findOne({ email: targetEmail })
    if (!targetUser) throw new Error(`本地目标账号不存在: ${targetEmail}`)
    const targetBook = await LedgerBook.findOne({ userId: targetUser._id, name: targetBookName })
    if (!targetBook) throw new Error(`本地目标账本不存在: ${targetBookName}`)

    const sourceIds = sourceItems.map((item) => new mongoose.Types.ObjectId(item.sourceId))
    const [existingTargetItems, existingSourceItems, categories] = await Promise.all([
      LedgerMoment.find({ userId: targetUser._id, bookId: targetBook._id }).lean(),
      LedgerMoment.find({ _id: { $in: sourceIds } }).lean(),
      LedgerCategory.find({ userId: targetUser._id, bookId: targetBook._id }).lean()
    ])
    const existingBySourceId = new Map(existingSourceItems.map((item) => [String(item._id), item]))
    const target = { userId: targetUser._id, bookId: targetBook._id }
    const plan = planMomentSync({ sourceItems, existingTargetItems, existingBySourceId, target, categories })
    printPlan(plan, sourcePath, targetUser, targetBook, apply)

    if (plan.conflicts.length) throw new Error('存在同步冲突，拒绝写入')
    if (!apply) return { ...plan, applied: false }

    const result = await applyPlan(plan, existingTargetItems)
    const syncedCount = await LedgerMoment.countDocuments({
      _id: { $in: sourceIds },
      userId: targetUser._id,
      bookId: targetBook._id
    })
    if (syncedCount !== sourceItems.length) {
      throw new Error(`同步后校验失败: 期望 ${sourceItems.length} 条，实际 ${syncedCount} 条`)
    }

    console.log(`正式写入完成: ${result.changed} 条`)
    if (result.backupPath) console.log(`本地备份: ${result.backupPath}`)
    console.log(`线上 ID 校验: ${syncedCount}/${sourceItems.length}`)
    return { ...plan, applied: true, ...result, syncedCount }
  } finally {
    await disconnectDatabase()
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  main().catch((error) => {
    console.error(`ERR: ${error.message}`)
    process.exitCode = 1
  })
}
