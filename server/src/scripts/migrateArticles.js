/**
 * 旧博客文章正式迁移脚本
 *
 * 原则：
 * - 不修改 Markdown 正文内容，只去除 frontmatter 元数据块后存正文。
 * - 用 sourcePath/sourceHash 建立幂等迁移，可重复执行。
 * - 旧目录层级迁移为 Category 树，文章挂到最末级分类。
 * - 旧静态博客默认视为已公开内容，迁移后发布为 published。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ARTICLE_STATUS } from '@blog/shared'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { Article } from '../models/Article.js'
import { Category } from '../models/Category.js'
import { Tag } from '../models/Tag.js'
import { User } from '../models/User.js'
import {
  analyzeLegacyNotes,
  buildLegacyArticleRecord,
  generateAsciiSlug,
  scanLegacyNotes,
  shortHash
} from '../services/legacyMigration.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const args = new Set(process.argv.slice(2))
const MODE = args.has('--audit')
  ? 'audit'
  : args.has('--dry-run')
    ? 'dry-run'
    : args.has('--repair-existing')
      ? 'repair-existing'
      : 'migrate'
const UPDATE_EXISTING = args.has('--update-existing')
const PUBLISH_STATUS = args.has('--draft') ? ARTICLE_STATUS.DRAFT : ARTICLE_STATUS.PUBLISHED
const OLD_NOTES_DIR = process.env.OLD_NOTES_DIR || path.resolve(__dirname, '../../../../个人技术博客网站/public/notes')

function logSection(title) {
  console.log('')
  console.log('========================================')
  console.log(`  ${title}`)
  console.log('========================================')
}

async function ensureUniqueSlug(Model, baseSlug, excludeId = null) {
  const query = { slug: baseSlug }
  if (excludeId) query._id = { $ne: excludeId }

  const exists = await Model.exists(query)
  if (!exists) return baseSlug

  let index = 1
  while (index < 1000) {
    const candidate = `${baseSlug}-${index}`
    const candidateQuery = { slug: candidate }
    if (excludeId) candidateQuery._id = { $ne: excludeId }
    const candidateExists = await Model.exists(candidateQuery)
    if (!candidateExists) return candidate
    index++
  }

  return `${baseSlug}-${shortHash(Date.now(), 8)}`
}

async function createBackup() {
  const backupDir = path.join(env.rootDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const backupPath = path.join(backupDir, `legacy-migration-${Date.now()}.json`)
  const [articles, categories, tags] = await Promise.all([
    Article.find({}).lean(),
    Category.find({}).lean(),
    Tag.find({}).lean()
  ])

  fs.writeFileSync(backupPath, JSON.stringify({
    createdAt: new Date().toISOString(),
    articles,
    categories,
    tags
  }, null, 2), 'utf8')

  return backupPath
}

async function getAdminUser() {
  const adminUser = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 })
  if (!adminUser) {
    throw new Error('数据库中没有管理员用户，请先运行 npm run create:admin')
  }

  return adminUser
}

async function ensureCategoryPath(categoryPath) {
  let parent = null
  let current = null

  for (let index = 0; index < categoryPath.length; index++) {
    const name = categoryPath[index]
    current = await Category.findOne({ name, parent })

    if (!current) {
      const baseSlug = generateAsciiSlug(categoryPath.slice(0, index + 1), categoryPath.slice(0, index + 1).join('/'), 70)
      current = await Category.create({
        name,
        slug: await ensureUniqueSlug(Category, baseSlug),
        description: '',
        parent,
        sortOrder: index,
        status: 'active'
      })
    }

    parent = current._id
  }

  return current?._id || null
}

async function ensureTags(tagNames) {
  const tagIds = []

  for (const name of tagNames) {
    let tag = await Tag.findOne({ name })
    if (!tag) {
      const baseSlug = generateAsciiSlug([name], name, 50)
      tag = await Tag.create({
        name,
        slug: await ensureUniqueSlug(Tag, baseSlug),
        description: '',
        color: '#2852b8'
      })
    }
    tagIds.push(tag._id)
  }

  return tagIds
}

async function rebuildCounts() {
  await Promise.all([
    Category.updateMany({}, { $set: { articleCount: 0 } }),
    Tag.updateMany({}, { $set: { articleCount: 0 } })
  ])

  const articles = await Article.find({ deletedAt: null }).select('category tags').lean()

  for (const article of articles) {
    if (article.category) {
      await Category.updateOne({ _id: article.category }, { $inc: { articleCount: 1 } })
    }

    if (article.tags?.length) {
      await Tag.updateMany({ _id: { $in: article.tags } }, { $inc: { articleCount: 1 } })
    }
  }
}

async function repairExistingLegacyDrafts(records, adminUser) {
  const oldDrafts = await Article.find({
    sourcePath: { $in: [null, ''] },
    status: ARTICLE_STATUS.DRAFT,
    deletedAt: null
  }).sort({ createdAt: 1 })

  let repaired = 0
  const byTitle = new Map()
  for (const article of oldDrafts) {
    const key = article.title
    if (!byTitle.has(key)) byTitle.set(key, [])
    byTitle.get(key).push(article)
  }

  for (const record of records) {
    const candidates = byTitle.get(record.title) || []
    const article = candidates.shift()
    if (!article) continue

    const categoryId = await ensureCategoryPath(record.categoryPath)
    const tagIds = await ensureTags(record.tags)
    article.slug = await ensureUniqueSlug(Article, record.slug, article._id)
    article.category = categoryId
    article.tags = tagIds
    article.source = 'legacy-notes'
    article.sourcePath = record.sourcePath
    article.sourceHash = record.sourceHash
    article.importedAt = article.importedAt || new Date()
    article.status = PUBLISH_STATUS
    article.publishedAt = PUBLISH_STATUS === ARTICLE_STATUS.PUBLISHED
      ? (record.legacyDate || article.createdAt || new Date())
      : null
    article.wordCount = record.wordCount
    article.readingMinutes = record.readingMinutes
    article.updatedBy = adminUser._id
    await article.save()
    repaired++
  }

  return repaired
}

async function migrateRecord(record, adminUser) {
  const existing = await Article.findOne({ sourcePath: record.sourcePath })

  if (existing && !UPDATE_EXISTING) {
    return { status: 'skipped', title: record.title, reason: 'sourcePath 已存在' }
  }

  const categoryId = await ensureCategoryPath(record.categoryPath)
  const tagIds = await ensureTags(record.tags)
  const payload = {
    title: record.title.slice(0, 120),
    slug: await ensureUniqueSlug(Article, record.slug, existing?._id),
    summary: record.summary.slice(0, 300),
    contentMarkdown: record.contentMarkdown,
    cover: '',
    category: categoryId,
    tags: tagIds,
    status: PUBLISH_STATUS,
    isRecommended: false,
    wordCount: record.wordCount,
    readingMinutes: record.readingMinutes,
    source: record.source,
    sourcePath: record.sourcePath,
    sourceHash: record.sourceHash,
    importedAt: existing?.importedAt || new Date(),
    publishedAt: PUBLISH_STATUS === ARTICLE_STATUS.PUBLISHED ? record.legacyDate : null,
    updatedBy: adminUser._id
  }

  if (existing) {
    Object.assign(existing, payload)
    await existing.save()
    return { status: 'updated', title: record.title }
  }

  await Article.create({
    ...payload,
    createdBy: adminUser._id
  })

  return { status: 'created', title: record.title }
}

async function main() {
  logSection('旧博客文章迁移')
  console.log(`模式: ${MODE}`)
  console.log(`旧笔记目录: ${OLD_NOTES_DIR}`)
  console.log(`发布状态: ${PUBLISH_STATUS}`)

  if (!fs.existsSync(OLD_NOTES_DIR)) {
    throw new Error(`旧笔记目录不存在: ${OLD_NOTES_DIR}`)
  }

  const audit = analyzeLegacyNotes(OLD_NOTES_DIR)
  console.log(`Markdown 总数: ${audit.totalMarkdown}`)
  console.log(`待迁移文章: ${audit.migratableCount}`)
  console.log(`跳过: ${audit.skipped.length}`)
  console.log(`有 frontmatter: ${audit.withFrontmatter}`)
  console.log(`无 frontmatter: ${audit.withoutFrontmatter}`)
  console.log(`疑似乱码: ${audit.suspiciousEncoding.length}`)

  if (MODE === 'audit' || MODE === 'dry-run') {
    console.log('')
    console.log('样例:')
    audit.records.slice(0, 10).forEach((record, index) => {
      console.log(`${index + 1}. ${record.sourcePath}`)
      console.log(`   标题: ${record.title}`)
      console.log(`   slug: ${record.slug}`)
      console.log(`   分类: ${record.categoryPath.join(' / ')}`)
      console.log(`   标签: ${record.tags.join(', ') || '(无)'}`)
      console.log(`   字数: ${record.wordCount}`)
    })
    return
  }

  await connectDatabase()
  const adminUser = await getAdminUser()
  const backupPath = await createBackup()
  console.log(`数据库备份: ${backupPath}`)

  let repaired = 0
  let created = 0
  let updated = 0
  let skipped = 0
  const errors = []

  if (MODE === 'repair-existing') {
    repaired = await repairExistingLegacyDrafts(audit.records, adminUser)
  } else {
    const scan = scanLegacyNotes(OLD_NOTES_DIR)
    for (const file of scan.files) {
      try {
        const record = buildLegacyArticleRecord(file, OLD_NOTES_DIR)
        const result = await migrateRecord(record, adminUser)
        if (result.status === 'created') created++
        if (result.status === 'updated') updated++
        if (result.status === 'skipped') skipped++
      } catch (error) {
        errors.push(`${file.relPath}: ${error.message}`)
      }
    }
  }

  await rebuildCounts()

  logSection('迁移完成')
  console.log(`修复: ${repaired}`)
  console.log(`新增: ${created}`)
  console.log(`更新: ${updated}`)
  console.log(`跳过: ${skipped}`)
  console.log(`失败: ${errors.length}`)

  if (errors.length > 0) {
    errors.forEach((error, index) => console.log(`${index + 1}. ${error}`))
  }
}

main()
  .catch((error) => {
    console.error('迁移脚本出错:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectDatabase()
  })
