/**
 * 修复“我的总结/uni-app”分支
 *
 * 目标：
 * - 恢复旧目录路径：我的总结/uni-app
 * - 恢复旧目录路径：我的总结/uni-app/uni-app辅助
 * - 将 sourcePath 属于该分支的旧文章全部挪回正确分类
 * - 清理原先挂错位置的空分类
 */

import crypto from 'node:crypto'
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

function logSection(title) {
  console.log('')
  console.log('='.repeat(72))
  console.log(`  ${title}`)
  console.log('='.repeat(72))
}

function shortHash(input, length = 8) {
  return crypto.createHash('sha256').update(String(input)).digest('hex').slice(0, length)
}

function slugifyPath(parts, fallbackInput) {
  const normalized = parts
    .flatMap((part) => String(part || '').split('/'))
    .map((part) => part.normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, ''))
    .filter(Boolean)
    .join('-')
    .replace(/-+/g, '-')

  const hash = shortHash(fallbackInput, 8)
  const base = normalized || `cat-${hash}`
  return `${base.slice(0, Math.max(1, 50 - hash.length - 1)).replace(/^-+|-+$/g, '') || 'cat'}-${hash}`
}

async function createBackup() {
  const backupDir = path.join(env.rootDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const backupPath = path.join(backupDir, `repair-my-summary-uni-app-${Date.now()}.json`)
  const [articles, categories] = await Promise.all([
    Article.find({}).lean(),
    Category.find({}).lean()
  ])
  fs.writeFileSync(backupPath, JSON.stringify({
    createdAt: new Date().toISOString(),
    description: '修复“我的总结/uni-app”分支前备份',
    articles,
    categories
  }, null, 2), 'utf8')
  return backupPath
}

async function findCategoryByPath(pathParts) {
  const [rootName, ...rest] = pathParts
  let current = await Category.findOne({ name: rootName, parent: null })
  if (!current) return null

  for (const name of rest) {
    current = await Category.findOne({ name, parent: current._id })
    if (!current) return null
  }

  return current
}

async function ensureCategoryByPath(pathParts, sortOrder = 0) {
  const [rootName, ...rest] = pathParts
  let current = await Category.findOne({ name: rootName, parent: null })

  if (!current) {
    const slug = slugifyPath([rootName], pathParts.join('/'))
    current = DRY_RUN
      ? { _id: null, name: rootName, parent: null, sortOrder, slug }
      : await Category.create({
          name: rootName,
          slug,
          parent: null,
          sortOrder,
          status: 'active',
          articleCount: 0
        })
  }

  let parent = current
  for (let index = 0; index < rest.length; index++) {
    const name = rest[index]
    let child = await Category.findOne({ name, parent: parent._id })
    if (!child) {
      const slug = slugifyPath(pathParts.slice(0, index + 2), pathParts.join('/'))
      child = DRY_RUN
        ? { _id: null, name, parent: parent._id, sortOrder: index + 1, slug }
        : await Category.create({
            name,
            slug,
            parent: parent._id,
            sortOrder: index + 1,
            status: 'active',
            articleCount: 0
          })
    }
    parent = child
  }

  return parent
}

async function moveArticles(sourceRegex, targetPathParts, label) {
  const target = await ensureCategoryByPath(targetPathParts, targetPathParts.length === 1 ? 2 : 1)
  const articles = await Article.find({
    source: 'legacy-notes',
    sourcePath: { $regex: sourceRegex }
  }).select('_id title sourcePath category').lean()

  const updates = []
  for (const article of articles) {
    if (String(article.category || '') === String(target._id || article.category)) continue
    updates.push({
      sourcePath: article.sourcePath,
      title: article.title
    })
    if (!DRY_RUN) {
      await Article.updateOne(
        { _id: article._id },
        { $set: { category: target._id } }
      )
    }
  }

  return { label, targetPath: targetPathParts.join('/'), count: articles.length, updates }
}

async function deleteIfEmptyByPath(pathParts) {
  const category = await findCategoryByPath(pathParts)
  if (!category) {
    return { label: pathParts.join('/'), status: 'missing' }
  }

  const [articleCount, childCount] = await Promise.all([
    Article.countDocuments({ category: category._id, deletedAt: null }),
    Category.countDocuments({ parent: category._id })
  ])

  if (articleCount > 0 || childCount > 0) {
    return {
      label: pathParts.join('/'),
      status: 'skip',
      articleCount,
      childCount
    }
  }

  if (!DRY_RUN) {
    await Category.findByIdAndDelete(category._id)
  }

  return {
    label: pathParts.join('/'),
    status: 'deleted'
  }
}

async function rebuildCounts() {
  if (DRY_RUN) return

  await Category.updateMany({}, { $set: { articleCount: 0 } })
  const articles = await Article.find({ deletedAt: null }).select('category').lean()
  for (const article of articles) {
    if (!article.category) continue
    await Category.updateOne({ _id: article.category }, { $inc: { articleCount: 1 } })
  }
}

async function main() {
  logSection(DRY_RUN ? '修复我的总结/uni-app（预览）' : '修复我的总结/uni-app（正式执行）')
  console.log(`模式: ${DRY_RUN ? '预览（不写库）' : '正式执行（写入数据库）'}`)

  await connectDatabase()

  if (!DRY_RUN) {
    const backupPath = await createBackup()
    console.log(`备份文件: ${backupPath}`)
  }

  const actions = []

  actions.push(await moveArticles(
    '^我的总结/uni-app/uni-app\\.md$',
    ['我的总结', 'uni-app'],
    'root-note'
  ))

  actions.push(await moveArticles(
    '^我的总结/uni-app/uni-app辅助/',
    ['我的总结', 'uni-app', 'uni-app辅助'],
    'uni-app-guides'
  ))

  if (!DRY_RUN) {
    await rebuildCounts()
  }

  const cleanupTargets = [
    ['uni-app', 'uni-app辅助']
  ]

  for (const target of cleanupTargets) {
    actions.push(await deleteIfEmptyByPath(target))
  }

  if (!DRY_RUN) {
    const target = await findCategoryByPath(['我的总结', 'uni-app'])
    if (target) {
      await Category.updateOne({ _id: target._id }, { $set: { sortOrder: 2, status: 'active' } })
    }
    const child = await findCategoryByPath(['我的总结', 'uni-app', 'uni-app辅助'])
    if (child) {
      await Category.updateOne({ _id: child._id }, { $set: { sortOrder: 1, status: 'active' } })
    }
  }

  logSection('执行结果')
  for (const action of actions) {
    console.log(JSON.stringify(action, null, 2))
  }

  const roots = await Category.find({ parent: null }).sort({ sortOrder: 1, createdAt: -1 }).lean()
  console.log('')
  console.log('根目录：')
  for (const root of roots) {
    console.log(`- ${root.name} | sort=${root.sortOrder} | status=${root.status}`)
  }

  await disconnectDatabase()
}

main().catch((error) => {
  console.error('ERR:', error)
  process.exitCode = 1
})
