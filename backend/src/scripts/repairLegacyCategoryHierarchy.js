/**
 * 旧笔记目录层级修复脚本
 *
 * 目标：
 * - 把当前数据库里明显挂错的分类父子关系拉回到更接近旧目录树的状态
 * - 不修改文章正文，只修正分类层级、名称和排序
 * - 通过数据库树的修复，让前端左侧菜单自然回到更熟悉的路径位置
 *
 * 运行方式：
 *   node src/scripts/repairLegacyCategoryHierarchy.js
 *   node src/scripts/repairLegacyCategoryHierarchy.js --apply
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

const ROOT_SORT_ORDER = new Map([
  ['常用缺易忘', 0],
  ['电脑', 1],
  ['面试', 2],
  ['我的总结', 3],
  ['项目复用技术', 4],
  ['组件库', 5],
  ['AI工具', 6],
  ['CSS', 7],
  ['HTML', 8],
  ['JavaScriptES6+', 9],
  ['JS', 10],
  ['Node.js', 11],
  ['uni-app', 12],
  ['Vue', 13],
  ['Web安全', 14]
])

const CHILD_SORT_ORDER = new Map([
  ['常用缺易忘', new Map([
    ['工具速查', 1],
    ['浏览器与网络', 2],
    ['数据类型', 3],
    ['网络请求', 4]
  ])],
  ['电脑', new Map([
    ['电脑网络', 1],
    ['网站部署', 2],
    ['系统与文件', 3]
  ])],
  ['我的总结', new Map([
    ['JS', 1],
    ['Vue', 3]
  ])],
  ['项目复用技术', new Map([
    ['第三方登录对接', 1],
    ['前端工程化与安全', 2],
    ['Git', 3],
    ['JS库', 4],
    ['uni-app', 5],
    ['Vue后台管理', 6],
    ['WebSocket', 7]
  ])],
  ['组件库', new Map([
    ['ECharts', 1],
    ['ElementPlus', 2],
    ['uvui', 3]
  ])],
  ['AI工具', new Map([
    ['AI编辑器流', 1],
    ['终端Agent流', 2],
    ['规则机制层', 3],
    ['Agent框架层', 4],
    ['辅助工具层', 5]
  ])],
  ['uni-app', new Map([
    ['通用基础', 1],
    ['微信小程序', 2]
  ])]
])

function logSection(title) {
  console.log('')
  console.log('='.repeat(72))
  console.log(`  ${title}`)
  console.log('='.repeat(72))
}

async function createBackup() {
  const backupDir = path.join(env.rootDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const backupPath = path.join(backupDir, `legacy-category-hierarchy-${Date.now()}.json`)
  const [articles, categories] = await Promise.all([
    Article.find({}).lean(),
    Category.find({}).lean()
  ])
  fs.writeFileSync(backupPath, JSON.stringify({
    createdAt: new Date().toISOString(),
    description: '旧笔记目录层级修复前备份',
    articles,
    categories
  }, null, 2), 'utf8')
  return backupPath
}

function buildCategoryIndex(categories) {
  const byId = new Map()
  const byName = new Map()

  for (const category of categories) {
    byId.set(String(category._id), category)
    if (!byName.has(category.name)) {
      byName.set(category.name, [])
    }
    byName.get(category.name).push(category)
  }

  return { byId, byName }
}

function fullPathOf(categoryId, byId, visited = new Set()) {
  const id = String(categoryId)
  if (visited.has(id)) return '[CYCLE]'
  visited.add(id)

  const category = byId.get(id)
  if (!category) return '(unknown)'
  if (!category.parent) return category.name

  return `${fullPathOf(category.parent.toString(), byId, visited)} > ${category.name}`
}

async function getFreshCategories() {
  return Category.find({}).lean()
}

async function findOneByName(name) {
  return Category.findOne({ name })
}

async function findOneByNameAndParent(name, parentId) {
  return Category.findOne({
    name,
    parent: parentId === null ? null : parentId
  })
}

async function ensureParent(childName, parentName, sortOrder) {
  const child = await findOneByName(childName)
  const parent = await findOneByName(parentName)

  if (!child || !parent) {
    return { changed: false, reason: `缺少节点: ${childName} 或 ${parentName}` }
  }

  const patch = {}
  if (!child.parent || String(child.parent) !== String(parent._id)) {
    patch.parent = parent._id
  }
  if (typeof sortOrder === 'number' && child.sortOrder !== sortOrder) {
    patch.sortOrder = sortOrder
  }

  if (Object.keys(patch).length === 0) {
    return { changed: false, reason: `已正确: ${childName}` }
  }

  if (!DRY_RUN) {
    await Category.updateOne({ _id: child._id }, { $set: patch })
  }

  return {
    changed: true,
    reason: `${childName} -> ${parentName}`,
    patch
  }
}

async function renameCategory(name, nextName, sortOrder) {
  const category = await findOneByName(name)
  if (!category) {
    return { changed: false, reason: `缺少节点: ${name}` }
  }

  const patch = {}
  if (category.name !== nextName) {
    patch.name = nextName
  }
  if (typeof sortOrder === 'number' && category.sortOrder !== sortOrder) {
    patch.sortOrder = sortOrder
  }

  if (Object.keys(patch).length === 0) {
    return { changed: false, reason: `已正确: ${name}` }
  }

  if (!DRY_RUN) {
    await Category.updateOne({ _id: category._id }, { $set: patch })
  }

  return {
    changed: true,
    reason: `${name} -> ${nextName}`,
    patch
  }
}

async function deleteIfEmpty(name) {
  const category = await findOneByName(name)
  if (!category) {
    return { changed: false, reason: `缺少节点: ${name}` }
  }

  const [articleCount, childCount] = await Promise.all([
    Article.countDocuments({ category: category._id, deletedAt: null }),
    Category.countDocuments({ parent: category._id })
  ])

  if (articleCount > 0 || childCount > 0) {
    return {
      changed: false,
      reason: `${name} 仍有内容，跳过删除`,
      articleCount,
      childCount
    }
  }

  if (!DRY_RUN) {
    await Category.findByIdAndDelete(category._id)
  }

  return {
    changed: true,
    reason: `${name} 已删除`,
    articleCount,
    childCount
  }
}

async function hideIfEmpty(name) {
  const category = await findOneByName(name)
  if (!category) {
    return { changed: false, reason: `缺少节点: ${name}` }
  }

  const [articleCount, childCount] = await Promise.all([
    Article.countDocuments({ category: category._id, deletedAt: null }),
    Category.countDocuments({ parent: category._id })
  ])

  if (articleCount > 0 || childCount > 0) {
    return {
      changed: false,
      reason: `${name} 仍有内容，跳过隐藏`,
      articleCount,
      childCount
    }
  }

  if (!DRY_RUN) {
    await Category.updateOne(
      { _id: category._id },
      { $set: { status: 'hidden' } }
    )
  }

  return {
    changed: true,
    reason: `${name} 已隐藏`,
    articleCount,
    childCount
  }
}

async function rebuildCounts() {
  if (DRY_RUN) return

  await Category.updateMany({}, { $set: { articleCount: 0 } })
  const articles = await Article.find({ deletedAt: null }).select('category').lean()
  for (const article of articles) {
    if (!article.category) continue
    await Category.updateOne(
      { _id: article.category },
      { $inc: { articleCount: 1 } }
    )
  }
}

async function main() {
  logSection(DRY_RUN ? '旧笔记目录层级修复（预览）' : '旧笔记目录层级修复（正式执行）')
  console.log(`模式: ${DRY_RUN ? '预览（不写库）' : '正式执行（写入数据库）'}`)

  await connectDatabase()

  if (!DRY_RUN) {
    const backupPath = await createBackup()
    console.log(`备份文件: ${backupPath}`)
  }

  const before = await getFreshCategories()
  const beforeIndex = buildCategoryIndex(before)

  logSection('当前关键路径')
  for (const name of ['我的总结', 'JS', 'uni-app 通用基础', 'Element Plus', 'uv-ui', '开发的基础知识', '常用缺易忘']) {
    const items = beforeIndex.byName.get(name) || []
    for (const item of items) {
      console.log(`- ${fullPathOf(item._id.toString(), beforeIndex.byId)} | sort=${item.sortOrder} | status=${item.status}`)
    }
  }

  const actions = []

  // 1. 修复“我的总结 > JS”
  actions.push(await ensureParent('JS', '我的总结', ROOT_SORT_ORDER.get('JS')))

  // 2. 把顶层 uni-app 通用基础 收口成“uni-app”
  actions.push(await renameCategory('uni-app 通用基础', 'uni-app', ROOT_SORT_ORDER.get('uni-app')))

  // 3. 把组件库相关分类收口到“组件库”
  actions.push(await renameCategory('Element Plus', '组件库', ROOT_SORT_ORDER.get('组件库')))
  actions.push(await ensureParent('ECharts', '组件库', 1))
  actions.push(await ensureParent('uvui', '组件库', 3))

  // 4. 把网络请求放回“常用缺易忘”
  actions.push(await ensureParent('网络请求', '常用缺易忘', 4))

  // 5. 清理明显的空壳节点
  actions.push(await deleteIfEmpty('我的总结/JS/辅助资料'))
  actions.push(await deleteIfEmpty('uv-ui'))
  actions.push(await deleteIfEmpty('开发的基础知识'))
  actions.push(await deleteIfEmpty('images'))

  // 6. 测试分类不参与公共菜单，直接隐藏
  const testCategory = await findOneByName('联调发布分类')
  if (testCategory && testCategory.status !== 'hidden') {
    if (!DRY_RUN) {
      await Category.updateOne({ _id: testCategory._id }, { $set: { status: 'hidden' } })
    }
    actions.push({ changed: true, reason: '联调发布分类 已隐藏' })
  } else if (testCategory) {
    actions.push({ changed: false, reason: '联调发布分类 已隐藏' })
  }

  // 7. 补一轮关键排序，避免菜单继续按字母乱跳
  if (!DRY_RUN) {
    for (const [name, order] of ROOT_SORT_ORDER.entries()) {
      const category = await findOneByNameAndParent(name, null)
      if (category && category.sortOrder !== order) {
        await Category.updateOne({ _id: category._id }, { $set: { sortOrder: order } })
      }
    }

    for (const [parentName, children] of CHILD_SORT_ORDER.entries()) {
      const parent = await findOneByNameAndParent(parentName, null)
      if (!parent) continue
      for (const [childName, order] of children.entries()) {
        const child = await Category.findOne({ name: childName, parent: parent._id })
        if (!child) continue
        if (child.sortOrder !== order) {
          await Category.updateOne({ _id: child._id }, { $set: { sortOrder: order } })
        }
      }
    }
  }

  await rebuildCounts()

  const after = await getFreshCategories()
  const afterIndex = buildCategoryIndex(after)

  logSection('执行结果')
  for (const item of actions) {
    console.log(`- ${item.reason}`)
  }

  console.log('')
  console.log('关键节点复查:')
  for (const name of ['我的总结', 'JS', 'uni-app', '组件库', '常用缺易忘', '网络请求']) {
    const items = afterIndex.byName.get(name) || []
    for (const item of items) {
      console.log(`- ${fullPathOf(item._id.toString(), afterIndex.byId)} | sort=${item.sortOrder} | status=${item.status} | count=${item.articleCount}`)
    }
  }

  await disconnectDatabase()
}

main().catch((error) => {
  console.error('ERR:', error)
  process.exitCode = 1
})
