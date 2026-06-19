/**
 * 分类树清理工具 - 方案B：将深层分类的文章提升到中间父级
 *
 * 原则：
 * - 深度 >= 4 的分类：将其下的文章移动到该分类路径的第3层祖先
 * - 深度 <= 3 的分类：保持不变
 * - 移动后清理空分类（可选）
 * - 不修改文章内容，只修改 category 字段
 *
 * 用法：
 *   node src/scripts/fixCategoryTree.js              # 预览模式
 *   node src/scripts/fixCategoryTree.js --apply       # 正式执行
 *   node src/scripts/fixCategoryTree.js --apply --clean  # 执行并清空无文章的叶子分类
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
  const backupPath = path.join(backupDir, `category-tree-fix-${Date.now()}.json`)
  const [articles, categories] = await Promise.all([
    Article.find({}).lean(),
    Category.find({}).lean()
  ])
  fs.writeFileSync(backupPath, JSON.stringify({
    createdAt: new Date().toISOString(),
    description: '方案B：分类树清理前备份',
    articles,
    categories
  }, null, 2), 'utf8')
  return backupPath
}

async function main() {
  logSection(
    DRY_RUN
      ? '分类树清理工具 - 预览模式 (Plan B)'
      : '分类树清理工具 - 正式执行 (Plan B)'
  )
  console.log(`模式: ${DRY_RUN ? '预览 (不写入数据库)' : '正式执行 (将写入数据库)'}`)
  console.log(`清理空分类: ${CLEAN_EMPTY ? '是' : '否'}`)

  await connectDatabase()

  if (!DRY_RUN) {
    const backupPath = await createBackup()
    console.log(`数据库备份: ${backupPath}`)
  }

  // ──── 1. 构建分类树 ────
  const categories = await Category.find({}).lean()
  const catMap = {}
  for (const c of categories) {
    catMap[c._id.toString()] = c
  }

  function getFullPath(catId, visited = new Set()) {
    if (visited.has(catId)) return '[CYCLE]'
    visited.add(catId)
    const cat = catMap[catId]
    if (!cat) return '(unknown)'
    if (!cat.parent) return cat.name
    return getFullPath(cat.parent.toString(), visited) + ' > ' + cat.name
  }

  function getAncestorChain(catId) {
    const chain = []
    let current = catMap[catId]
    while (current) {
      chain.unshift({ id: current._id.toString(), name: current.name })
      current = current.parent ? catMap[current.parent.toString()] : null
    }
    return chain
  }

  // ──── 2. 找出需要提升的分类（深度 >= 4）────
  console.log('\n分析分类树...')

  const liftPlan = [] // { fromCatId, fromPath, toCatId, toName, articleIds }

  for (const cat of categories) {
    const cid = cat._id.toString()
    const chain = getAncestorChain(cid)
    const depth = chain.length

    if (depth < 4) continue

    // 检查这个分类下是否有文章
    const articleCount = await Article.countDocuments({
      category: cat._id,
      deletedAt: null
    })
    if (articleCount === 0) continue

    // 提升目标：第3层（索引2）
    const targetLevel = Math.min(2, chain.length - 1) // 至少保留1层
    const target = chain[targetLevel]

    const articles = await Article.find({
      category: cat._id,
      deletedAt: null
    }).select('_id title').lean()

    liftPlan.push({
      fromCatId: cid,
      fromCatName: cat.name,
      fromPath: getFullPath(cid),
      fromDepth: depth,
      toCatId: target.id,
      toCatName: target.name,
      toDepth: targetLevel + 1,
      articleCount: articles.length,
      articleIds: articles.map(a => ({ id: a._id.toString(), title: a.title }))
    })
  }

  // 按 fromPath 排序
  liftPlan.sort((a, b) => a.fromPath.localeCompare(b.fromPath, 'zh-CN'))

  // ──── 3. 输出报告 ────
  logSection('提升计划')
  console.log(`共需处理 ${liftPlan.length} 个深层分类:\n`)

  let totalArticlesToMove = 0
  for (const plan of liftPlan) {
    totalArticlesToMove += plan.articleCount
    console.log(`  [${plan.fromDepth}L -> ${plan.toDepth}L] ${plan.fromPath}`)
    console.log(`     (${plan.articleCount} 篇) --> 提升到: [${plan.toCatName}]`)
    console.log('')
  }
  console.log(`合计影响: ${liftPlan.length} 个分类, ${totalArticlesToMove} 篇文章`)

  if (DRY_RUN) {
    console.log('\n以上为预览结果，数据未被修改。')
    console.log('如需正式执行，请运行:')
    console.log('  node src/scripts/fixCategoryTree.js --apply')
    console.log('  node src/scripts/fixCategoryTree.js --apply --clean  (同时清理空分类)')
    await disconnectDatabase()
    return
  }

  // ──── 4. 正式执行：移动文章 ────
  logSection('开始迁移文章')
  let movedCount = 0
  const errors = []

  for (const plan of liftPlan) {
    try {
      const result = await Article.updateMany(
        {
          category: plan.fromCatId,
          deletedAt: null
        },
        { $set: { category: plan.toCatId } }
      )
      movedCount += result.modifiedCount
      console.log(`  OK ${plan.fromPath} --> ${plan.toCatName} (${result.modifiedCount} 篇)`)
    } catch (error) {
      errors.push(`${plan.fromPath}: ${error.message}`)
      console.log(`  FAIL ${plan.fromPath}: ${error.message}`)
    }
  }

  console.log(`\n文章迁移完成: ${movedCount} 篇已移动`)
  if (errors.length > 0) {
    console.log(`失败: ${errors.length} 个`)
    errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`))
  }

  // ──── 5. 重建分类文章计数 ────
  logSection('重建分类计数')
  await Category.updateMany({}, { $set: { articleCount: 0 } })

  const allArticles = await Article.find({ deletedAt: null }).select('category').lean()
  for (const art of allArticles) {
    if (art.category) {
      await Category.updateOne({ _id: art.category }, { $inc: { articleCount: 1 } })
    }
  }
  console.log('分类计数已重建')

  // ──── 6. 可选：清理空分类 ────
  if (CLEAN_EMPTY) {
    logSection('清理空分类')

    // 找出所有没有子分类且没有文章的叶子分类
    const emptyLeafCategories = []
    for (const cat of categories) {
      const cid = cat._id.toString()
      const hasChildren = categories.some(c => String(c.parent) === cid)
      const hasArticles = await Article.countDocuments({
        category: cat._id,
        deletedAt: null
      })

      if (!hasChildren && hasArticles === 0) {
        emptyLeafCategories.push(cat)
      }
    }

    console.log(`发现 ${emptyLeafCategories.length} 个空的叶子分类`)

    // 从最深的开始删，避免约束问题
    emptyLeafCategories.sort((a, b) => {
      const depthA = getAncestorChain(a._id.toString()).length
      const depthB = getAncestorChain(b._id.toString()).length
      return depthB - depthA
    })

    let deletedCount = 0
    for (const cat of emptyLeafCategories) {
      try {
        // 再次确认没有文章和子分类
        const hasChildren = await Category.exists({ parent: cat._id })
        const hasArticles = await Article.exists({
          category: cat._id,
          deletedAt: null
        })
        if (!hasChildren && !hasArticles) {
          await Category.findByIdAndDelete(cat._id)
          deletedCount++
          console.log(`  已删除: ${getFullPath(cat._id.toString())}`)
        }
      } catch (error) {
        console.log(`  删除失败: ${cat.name} - ${error.message}`)
      }
    }
    console.log(`已删除 ${deletedCount} 个空分类`)
  }

  // ──── 7. 最终报告 ────
  logSection('完成')
  const remainingCats = await Category.countDocuments({})
  const remainingArts = await Article.countDocuments({ deletedAt: null })
  console.log(`剩余分类数: ${remainingCats}`)
  console.log(`文章总数: ${remainingArts}`)
  console.log(`文章迁移: ${movedCount}`)

  await disconnectDatabase()
}

main()
  .catch((error) => {
    console.error('脚本执行出错:', error)
    process.exitCode = 1
  })
