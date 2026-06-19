/**
 * 分类树清理工具 - 第二轮：处理剩余重复
 *
 * 处理三类问题：
 *   1. 父子同名 (ECharts > ECharts, Vue > Vue) -> 子文章提升到父级，删子
 *   2. 多路径同名 (两个 JS, 两个 uni-app) -> 合并到文章最多的那个
 *   3. 漏网的深度>=4的分类 -> 继续提升
 *
 * 用法：
 *   node src/scripts/fixCategoryTreeRound2.js              # 预览
 *   node src/scripts/fixCategoryTreeRound2.js --apply       # 执行
 *   node src/scripts/fixCategoryTreeRound2.js --apply --clean  # 执行+清空分类
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const args = new Set(process.argv.slice(2))
const DRY_RUN = !args.has('--apply')
const CLEAN_EMPTY = args.has('--clean')

function logSection(title) {
  console.log('')
  console.log('='.repeat(60))
  console.log(`  ${title}`)
  console.log('='.repeat(60))
}

async function createBackup() {
  const backupDir = path.join(env.rootDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const backupPath = path.join(backupDir, `category-fix-r2-${Date.now()}.json`)
  const [articles, categories] = await Promise.all([
    Article.find({}).lean(),
    Category.find({}).lean()
  ])
  fs.writeFileSync(backupPath, JSON.stringify({
    createdAt: new Date().toISOString(),
    description: '第二轮分类清理前备份',
    articles,
    categories
  }, null, 2), 'utf8')
  return backupPath
}

async function main() {
  logSection(
    DRY_RUN
      ? '分类树清理 - 第二轮 (预览)'
      : '分类树清理 - 第二轮 (正式执行)'
  )
  console.log(`模式: ${DRY_RUN ? '预览' : '正式'} | 清理空分类: ${CLEAN_EMPTY ? '是' : '否'}`)

  await connectDatabase()

  if (!DRY_RUN) {
    const bp = await createBackup()
    console.log(`备份: ${bp}`)
  }

  // ──── 构建树 ────
  const categories = await Category.find({}).lean()
  const catMap = {}
  for (const c of categories) catMap[c._id.toString()] = c

  function getPath(cid, visited = new Set()) {
    if (visited.has(cid)) return '[CYCLE]'
    visited.add(cid)
    const cat = catMap[cid]
    if (!cat) return '(?)'
    if (!cat.parent) return cat.name
    return getPath(cat.parent.toString(), visited) + ' > ' + cat.name
  }

  function getChain(cid) {
    const chain = []
    let cur = catMap[cid]
    while (cur) {
      chain.unshift({ id: cur._id.toString(), name: cur.name })
      cur = cur.parent ? catMap[cur.parent.toString()] : null
    }
    return chain
  }

  // ──── 问题1：父子同名 ────
  logStep('问题1：父子同名分类')

  const parentChildSameName = []
  for (const cat of categories) {
    if (!cat.parent) continue
    const parent = catMap[cat.parent]
    if (!parent) continue
    if (parent.name === cat.name) {
      const artCount = await Article.countDocuments({ category: cat._id, deletedAt: null })
      parentChildSameName.push({
        childId: cat._id.toString(),
        childName: cat.name,
        parentId: parent._id.toString(),
        parentPath: getPath(parent._id.toString()),
        childPath: getPath(cat._id.toString()),
        articleCount: artCount
      })
    }
  }

  console.log(`发现 ${parentChildSameName.length} 组父子同名:`)
  for (const item of parentChildSameName) {
    console.log(`  ${item.childPath} (${item.articleCount}篇) --> 合并到父级: ${item.parentPath}`)
  }

  // ──── 问题2：多路径同名（非父子关系）────
  logStep('问题2：多路径同名分类')

  const nameGroups = {}
  for (const c of categories) {
    if (!nameGroups[c.name]) nameGroups[c.name] = []
    nameGroups[c.name].push(c)
  }

  const multiPathDuplicates = []
  for (const [name, list] of Object.entries(nameGroups)) {
    if (list.length <= 1) continue

    // 过滤掉已经在问题1中处理的（父子同名）
    const nonParentChild = list.filter(c => {
      if (!c.parent) return true
      const parent = catMap[c.parent]
      return !parent || parent.name !== c.name
    })

    if (nonParentChild.length <= 1) continue

    // 获取每个的文章数
    const withCounts = await Promise.all(
      nonParentChild.map(async (c) => ({
        id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        path: getPath(c._id.toString()),
        articleCount: await Article.countDocuments({ category: c._id, deletedAt: null }),
        hasParent: !!c.parent
      }))
    )

    // 选文章最多的作为保留目标
    withCounts.sort((a, b) => b.articleCount - a.articleCount)
    const keep = withCounts[0]
    const merge = withCounts.slice(1).filter(m => m.articleCount > 0 || !m.hasParent)

    if (merge.length > 0) {
      multiPathDuplicates.push({
        name,
        keep,
        merge
      })
    }
  }

  console.log(`发现 ${multiPathDuplicates.length} 组多路径同名需要合并:`)
  for (const group of multiPathDuplicates) {
    console.log(`  [${group.name}] 保留: ${group.keep.path} (${group.keep.articleCount}篇)`)
    for (const m of group.merge) {
      console.log(`     合并: ${m.path} (${m.articleCount}篇) --> 到保留项`)
    }
  }

  // ──── 问题3：漏网的深度>=4 ────
  logStep('问题3：深度 >= 4 的分类')

  const deepCategories = []
  for (const cat of categories) {
    const chain = getChain(cat._id.toString())
    if (chain.length >= 4) {
      const artCount = await Article.countDocuments({ category: cat._id, deletedAt: null })
      if (artCount > 0) {
        const targetIdx = Math.min(2, chain.length - 1)
        deepCategories.push({
          catId: cat._id.toString(),
          path: getPath(cat._id.toString()),
          depth: chain.length,
          articleCount: artCount,
          targetId: chain[targetIdx].id,
          targetName: chain[targetIdx].name
        })
      }
    }
  }

  console.log(`发现 ${deepCategories.length} 个深层有文章的分类:`)
  for (const d of deepCategories) {
    console.log(`  [${d.depth}L] ${d.path} (${d.articleCount}篇) --> [${d.targetName}]`)
  }

  // ──── 汇总 ────
  const totalActions =
    parentChildSameName.length +
    multiPathDuplicates.reduce((s, g) => s + g.merge.length, 0) +
    deepCategories.length

  logSection('汇总')
  console.log(`父子同名合并: ${parentChildSameName.length} 组`)
  console.log(`多路径同名合并: ${multiPathDuplicates.reduce((s, g) => s + g.merge.length, 0)} 个`)
  console.log(`深层提升: ${deepCategories.length} 个`)
  console.log(`总计操作: ${totalActions} 项`)

  if (DRY_RUN) {
    console.log('\n以上为预览，数据未修改。')
    console.log('执行: node src/scripts/fixCategoryTreeRound2.js --apply --clean')
    await disconnectDatabase()
    return
  }

  // ═══════════════ 正式执行 ═══════════════

  // --- 执行1：父子同名 ---
  logStep('执行1：父子同名 - 子文章移到父级')
  for (const item of parentChildSameName) {
    try {
      const res = await Article.updateMany(
        { category: item.childId, deletedAt: null },
        { $set: { category: item.parentId } }
      )
      console.log(`  OK ${item.childName}: ${res.modifiedCount}篇 -> 父级`)
    } catch (e) {
      console.log(`  FAIL ${item.childName}: ${e.message}`)
    }
  }

  // --- 执行2：多路径同名 ---
  logStep('执行2：多路径同名 - 合并到保留项')
  for (const group of multiPathDuplicates) {
    for (const m of group.merge) {
      try {
        const res = await Article.updateMany(
          { category: m.id, deletedAt: null },
          { $set: { category: group.keep.id } }
        )
        console.log(`  OK [${group.name}] ${m.path}: ${res.modifiedCount}篇 -> ${group.keep.path}`)
      } catch (e) {
        console.log(`  FAIL [${group.name}] ${m.path}: ${e.message}`)
      }
    }
  }

  // --- 执行3：深层提升 ---
  logStep('执行3：深层分类 - 提升到第3层')
  for (const d of deepCategories) {
    try {
      const res = await Article.updateMany(
        { category: d.catId, deletedAt: null },
        { $set: { category: d.targetId } }
      )
      console.log(`  OK ${d.path}: ${res.modifiedCount}篇 -> [${d.targetName}]`)
    } catch (e) {
      console.log(`  FAIL ${d.path}: ${e.message}`)
    }
  }

  // --- 重建计数 ---
  logStep('重建分类计数')
  await Category.updateMany({}, { $set: { articleCount: 0 } })
  const allArts = await Article.find({ deletedAt: null }).select('category').lean()
  for (const a of allArts) {
    if (a.category) await Category.updateOne({ _id: a.category }, { $inc: { articleCount: 1 } })
  }
  console.log('Done.')

  // --- 清理空分类 ---
  if (CLEAN_EMPTY) {
    logStep('清理空分类')
    const catsNow = await Category.find({}).lean()
    const catMapNow = {}
    for (const c of catsNow) catMapNow[c._id.toString()] = c

    let delCnt = 0
    // 多轮删除，从深到浅
    let changed = true
    while (changed) {
      changed = false
      for (const cat of catsNow) {
        const cid = cat._id.toString()
        const stillExists = await Category.exists({ _id: cid })
        if (!stillExists) continue

        const hasChildren = await Category.exists({ parent: cid })
        const hasArts = await Article.exists({ category: cid, deletedAt: null })
        if (!hasChildren && !hasArts) {
          await Category.findByIdAndDelete(cid)
          delCnt++
          changed = true
          console.log(`  已删: ${getPath(cid)}`)
        }
      }
    }
    console.log(`共删除 ${delCnt} 个空分类`)
  }

  // --- 最终报告 ---
  logSection('完成')
  const finalCats = await Category.countDocuments({})
  const finalArts = await Article.countDocuments({ deletedAt: null })
  console.log(`剩余分类: ${finalCats}`)
  console.log(`文章总数: ${finalArts}`)

  await disconnectDatabase()
}

function logStep(title) {
  console.log('')
  console.log(`--- ${title} ---`)
}

main()
  .catch((e) => { console.error('ERR:', e); process.exitCode = 1 })
