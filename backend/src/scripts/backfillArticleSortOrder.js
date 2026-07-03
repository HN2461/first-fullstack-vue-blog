/**
 * 回填文章目录排序字段。
 *
 * 用途：
 * - 为已有文章补齐 sortOrder，启用目录人工排序前先固化当前展示顺序。
 * - 默认 dry-run 只打印影响范围；传入 --apply 才写入数据库。
 *
 * 排序策略：
 * - 按分类分组；
 * - 每组内沿用当前目录常见展示顺序：publishedAt 降序、createdAt 降序；
 * - 写入 10、20、30...，为后续插入留出间隔。
 */

import fs from 'node:fs'
import path from 'node:path'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'

const args = new Set(process.argv.slice(2))
const DRY_RUN = !args.has('--apply')

function formatCategoryName(categoryId, categoryMap) {
  if (!categoryId) {
    return '未分类'
  }

  return categoryMap.get(String(categoryId))?.name || `分类 ${categoryId}`
}

function compareArticles(left, right) {
  const leftPublished = new Date(left.publishedAt || left.createdAt || 0).getTime()
  const rightPublished = new Date(right.publishedAt || right.createdAt || 0).getTime()
  if (rightPublished !== leftPublished) {
    return rightPublished - leftPublished
  }

  const leftCreated = new Date(left.createdAt || 0).getTime()
  const rightCreated = new Date(right.createdAt || 0).getTime()
  if (rightCreated !== leftCreated) {
    return rightCreated - leftCreated
  }

  return String(left._id).localeCompare(String(right._id))
}

async function createBackup() {
  const backupDir = path.join(env.rootDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const backupPath = path.join(backupDir, `article-sort-order-${Date.now()}.json`)
  const articles = await Article.find({}).lean()

  fs.writeFileSync(backupPath, JSON.stringify({
    reason: 'backfillArticleSortOrder 执行前备份',
    createdAt: new Date().toISOString(),
    totalArticles: articles.length,
    articles
  }, null, 2), 'utf8')

  return backupPath
}

async function main() {
  console.log('')
  console.log('文章目录排序回填')
  console.log(`模式：${DRY_RUN ? 'dry-run，只打印不修改' : 'apply，将写入数据库'}`)

  await connectDatabase()

  try {
    const [categories, articles] = await Promise.all([
      Category.find({}).select('name').lean(),
      Article.find({ deletedAt: null })
        .select('title category sortOrder publishedAt createdAt')
        .lean()
    ])
    const categoryMap = new Map(categories.map((category) => [String(category._id), category]))
    const groups = new Map()

    for (const article of articles) {
      const key = article.category ? String(article.category) : ''
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key).push(article)
    }

    const operations = []
    const previews = []

    for (const [categoryId, groupArticles] of groups.entries()) {
      const sorted = [...groupArticles].sort(compareArticles)
      sorted.forEach((article, index) => {
        const nextSortOrder = (index + 1) * 10
        if (Number(article.sortOrder || 0) === nextSortOrder) {
          return
        }

        operations.push({
          updateOne: {
            filter: { _id: article._id },
            update: { $set: { sortOrder: nextSortOrder } }
          }
        })

        if (previews.length < 30) {
          previews.push({
            category: formatCategoryName(categoryId, categoryMap),
            title: article.title,
            from: Number(article.sortOrder || 0),
            to: nextSortOrder
          })
        }
      })
    }

    console.log(`扫描文章：${articles.length} 篇`)
    console.log(`需要回填：${operations.length} 篇`)

    if (previews.length > 0) {
      console.log('')
      console.log('预览前 30 条：')
      previews.forEach((item) => {
        console.log(`- [${item.category}] ${item.title}: ${item.from} -> ${item.to}`)
      })
    }

    if (DRY_RUN) {
      console.log('')
      console.log('未写入数据库。正式执行请运行：node src/scripts/backfillArticleSortOrder.js --apply')
      return
    }

    const backupPath = await createBackup()
    console.log(`已备份：${backupPath}`)

    if (operations.length > 0) {
      await Article.bulkWrite(operations, { ordered: false, timestamps: false })
    }

    console.log(`完成，已更新 ${operations.length} 篇文章。`)
  } finally {
    await disconnectDatabase()
  }
}

main().catch((error) => {
  console.error('脚本执行失败：', error)
  process.exitCode = 1
})
