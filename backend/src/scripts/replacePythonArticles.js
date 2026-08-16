/**
 * 使用 output/Python 作为权威源替换目标数据库中的 Python 文章。
 * 已存在文章保留原 ID、发布状态和发布时间；新文章创建为草稿。
 */

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import mongoose from 'mongoose'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'
import { Tag } from '#modules/content/models/Tag.js'
import { User } from '#modules/user/models/User.js'
import { Comment } from '#modules/interaction/models/Comment.js'
import { Reaction } from '#modules/interaction/models/Reaction.js'
import {
  calculateReadingMinutes,
  calculateWordCount,
  generateAsciiSlug
} from '#modules/content/services/legacyMigration.service.js'
import { findPreferredArticleAuthor } from '#utils/articleAuthor.js'

const APPLY = new Set(process.argv.slice(2)).has('--apply')
const SOURCE_ROOT = path.resolve(process.env.PYTHON_ARTICLE_ROOT || path.join(env.rootDir, '../output/Python'))
const REPORT_PATH = process.env.PYTHON_SYNC_REPORT || (
  env.nodeEnv === 'production'
    ? ''
    : path.join(env.rootDir, '../docs/02-开发指南/文章同步报告/python-article-replacement-latest.json')
)
const CATEGORY_PREFIX = ['后端技术', 'Python']
const NAVIGATION_NAMES = new Set(['readme.md', 'index.md', '目录.md'])
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/')
}
function cleanDirectoryName(value) {
  return String(value || '')
    .replace(/^(?:第)?\d+[篇章节._\-、\s]+/u, '')
    .trim()
}
function scanMarkdown(currentDir = SOURCE_ROOT, result = []) {
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    const fullPath = path.join(currentDir, entry.name)
    if (entry.isDirectory()) {
      scanMarkdown(fullPath, result)
    } else if (/\.md$/i.test(entry.name)) {
      result.push(fullPath)
    }
  }
  return result
}
function normalizeTags(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => String(item || '').trim()).filter(Boolean))]
  }
  return String(value || '')
    .split(/[,，、\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}
function stableSlug(data) {
  return String(data.originalSlug || data.slug || '')
    .trim()
    .toLowerCase()
    .replace(/-revision-\d{8}$/i, '')
}

function sourceHash(content) {
  return crypto.createHash('sha256').update(String(content || '')).digest('hex')
}

function parseSourceArticles() {
  if (!fs.existsSync(SOURCE_ROOT)) throw new Error(`Python 文章目录不存在: ${SOURCE_ROOT}`)
  const records = []
  const errors = []
  const seenSlugs = new Map()

  for (const fullPath of scanMarkdown()) {
    const relativePath = normalizePath(path.relative(SOURCE_ROOT, fullPath))
    let parsed
    try {
      parsed = matter(fs.readFileSync(fullPath, 'utf8').replace(/^\uFEFF/, ''))
    } catch (error) {
      errors.push(`${relativePath}: Front Matter 解析失败: ${error.message}`)
      continue
    }

    const data = parsed.data || {}
    const isNavigationFile = NAVIGATION_NAMES.has(path.basename(fullPath).toLowerCase())
    if (isNavigationFile && (!data.title || !stableSlug(data))) continue
    const title = String(data.title || '').trim()
    const slug = stableSlug(data)
    const summary = String(data.summary || '').trim()
    const tags = normalizeTags(data.tags)
    const contentMarkdown = String(parsed.content || '').trim()
    const directoryParts = path.dirname(relativePath).split('/').filter((item) => item && item !== '.')
    const categoryPath = [
      ...CATEGORY_PREFIX,
      ...directoryParts.map(cleanDirectoryName).filter(Boolean)
    ]
    const orderPrefix = path.basename(relativePath).match(/^\s*(\d+)/)?.[1]
    const sortOrder = orderPrefix ? Number(orderPrefix) * 10 : Number(data.sortOrder) || 0

    if (!title) errors.push(`${relativePath}: 缺少 title`)
    if (title.length > 120) errors.push(`${relativePath}: title 超过 120 个字符`)
    if (!SLUG_PATTERN.test(slug)) errors.push(`${relativePath}: slug 不合法: ${slug}`)
    if (!summary) errors.push(`${relativePath}: 缺少 summary`)
    if (summary.length > 300) errors.push(`${relativePath}: summary 超过 300 个字符`)
    if (tags.length === 0) errors.push(`${relativePath}: tags 不能为空`)
    if (!contentMarkdown) errors.push(`${relativePath}: 正文为空`)
    if (!seenSlugs.has(slug)) seenSlugs.set(slug, [])
    seenSlugs.get(slug).push(relativePath)

    const wordCount = calculateWordCount(contentMarkdown)
    records.push({
      relativePath,
      title,
      slug,
      summary,
      tags,
      categoryPath,
      sortOrder,
      contentMarkdown,
      contentHash: sourceHash(contentMarkdown),
      wordCount,
      readingMinutes: calculateReadingMinutes(wordCount),
      originalId: String(data.originalId || '').trim()
    })
  }

  seenSlugs.forEach((files, slug) => {
    if (files.length > 1) errors.push(`slug 重复 ${slug}: ${files.join('、')}`)
  })
  if (errors.length > 0) {
    throw new Error(`Python 文章源文件校验失败:\n${errors.map((item) => `- ${item}`).join('\n')}`)
  }
  return records.sort((left, right) => left.relativePath.localeCompare(right.relativePath, 'zh-Hans-CN'))
}

function buildCategoryPathMaps(categories) {
  const byId = new Map(categories.map((item) => [String(item._id), item]))
  const pathById = new Map()
  function resolve(item, seen = new Set()) {
    const id = String(item._id)
    if (pathById.has(id)) return pathById.get(id)
    if (seen.has(id)) return []
    seen.add(id)
    const parent = item.parent ? byId.get(String(item.parent)) : null
    const categoryPath = [...(parent ? resolve(parent, seen) : []), item.name]
    pathById.set(id, categoryPath)
    return categoryPath
  }
  categories.forEach((item) => resolve(item))
  return {
    pathById,
    byPath: new Map(categories.map((item) => [resolve(item).join('/'), item]))
  }
}

function collectBranchIds(categories, rootId) {
  const childMap = new Map()
  categories.forEach((item) => {
    const parentId = item.parent ? String(item.parent) : null
    if (!childMap.has(parentId)) childMap.set(parentId, [])
    childMap.get(parentId).push(String(item._id))
  })
  const ids = new Set(rootId ? [String(rootId)] : [])
  const queue = [...ids]
  while (queue.length > 0) {
    const current = queue.shift()
    for (const childId of childMap.get(current) || []) {
      if (ids.has(childId)) continue
      ids.add(childId)
      queue.push(childId)
    }
  }
  return [...ids]
}

function buildMatchPlan(records, pythonArticles, allArticles) {
  const byId = new Map(pythonArticles.map((item) => [String(item._id), item]))
  const bySlug = new Map(pythonArticles.map((item) => [item.slug, item]))
  const byTitle = new Map()
  pythonArticles.forEach((item) => {
    if (!byTitle.has(item.title)) byTitle.set(item.title, [])
    byTitle.get(item.title).push(item)
  })
  const outsideSlugMap = new Map(allArticles
    .filter((item) => !byId.has(String(item._id)))
    .map((item) => [item.slug, item]))
  const matchedIds = new Set()
  const items = records.map((record) => {
    const idMatch = record.originalId ? byId.get(record.originalId) : null
    const slugMatch = bySlug.get(record.slug)
    const titleMatches = byTitle.get(record.title) || []
    const existing = idMatch || slugMatch || (titleMatches.length === 1 ? titleMatches[0] : null)
    const outsideCollision = outsideSlugMap.get(record.slug)
    if (!existing && outsideCollision) {
      throw new Error(`slug 已被 Python 分类外文章占用: ${record.slug} (${outsideCollision.title})`)
    }
    if (existing && matchedIds.has(String(existing._id))) {
      throw new Error(`多个源文件匹配到同一篇文章: ${existing.title}`)
    }
    if (existing) matchedIds.add(String(existing._id))
    return {
      record,
      existing,
      action: existing
        ? (existing.sourceHash === record.contentHash || String(existing.contentMarkdown || '').trim() === record.contentMarkdown
            ? 'unchanged'
            : 'update')
        : 'create'
    }
  })
  return {
    items,
    remove: pythonArticles.filter((item) => !matchedIds.has(String(item._id)))
  }
}

async function ensureUniqueSlug(Model, baseSlug) {
  let candidate = baseSlug
  let index = 1
  while (await Model.exists({ slug: candidate })) {
    index += 1
    candidate = `${baseSlug}-${index}`
  }
  return candidate
}

async function ensureCategoryPaths(records, initialCategories) {
  const categories = [...initialCategories]
  const maps = buildCategoryPathMaps(categories)
  for (const record of records) {
    let parent = null
    for (let depth = 1; depth <= record.categoryPath.length; depth += 1) {
      const categoryPath = record.categoryPath.slice(0, depth)
      const key = categoryPath.join('/')
      let category = maps.byPath.get(key)
      if (!category) {
        category = await Category.create({
          name: categoryPath.at(-1),
          slug: await ensureUniqueSlug(Category, generateAsciiSlug(categoryPath, key, 70)),
          description: '',
          parent,
          sortOrder: depth * 10,
          status: 'active'
        })
        categories.push(category)
        maps.byPath.set(key, category)
      }
      parent = category._id
    }
  }
  return maps.byPath
}

async function ensureTags(records) {
  const names = [...new Set(records.flatMap((item) => item.tags))]
  const existing = await Tag.find({ name: { $in: names } })
  const byName = new Map(existing.map((item) => [item.name, item]))
  for (const name of names) {
    if (byName.has(name)) continue
    const tag = await Tag.create({
      name,
      slug: await ensureUniqueSlug(Tag, generateAsciiSlug([name], name, 50)),
      description: '',
      color: '#2852b8',
      status: 'active'
    })
    byName.set(name, tag)
  }
  return byName
}

async function rebuildCounts() {
  await Promise.all([
    Category.updateMany({}, { $set: { articleCount: 0 } }),
    Tag.updateMany({}, { $set: { articleCount: 0 } })
  ])
  const articles = await Article.find({ deletedAt: null }).select('category tags').lean()
  const categoryCounts = new Map()
  const tagCounts = new Map()
  articles.forEach((item) => {
    if (item.category) categoryCounts.set(String(item.category), (categoryCounts.get(String(item.category)) || 0) + 1)
    const articleTags = item.tags || []
    articleTags.forEach((tagId) => tagCounts.set(String(tagId), (tagCounts.get(String(tagId)) || 0) + 1))
  })
  await Promise.all([
    ...[...categoryCounts].map(([id, count]) => Category.updateOne({ _id: id }, { $set: { articleCount: count } })),
    ...[...tagCounts].map(([id, count]) => Tag.updateOne({ _id: id }, { $set: { articleCount: count } }))
  ])
}

async function createBackup(pythonArticles, removedIds) {
  const backupDir = path.join(env.rootDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, `python-articles-before-${stamp}.ejson`)
  const data = {
    createdAt: new Date(),
    sourceRoot: SOURCE_ROOT,
    collections: {
      articles: pythonArticles,
      categories: await Category.find({}).lean(),
      tags: await Tag.find({}).lean(),
      comments: await Comment.find({ article: { $in: removedIds } }).lean(),
      reactions: await Reaction.find({ targetType: 'article', targetId: { $in: removedIds } }).lean()
    }
  }
  fs.writeFileSync(backupPath, mongoose.mongo.BSON.EJSON.stringify(data, null, 2, { relaxed: false }), 'utf8')
  return backupPath
}

function buildReport(records, plan, categoryMaps) {
  const requiredCategoryPaths = [...new Set(records.map((item) => item.categoryPath.join('/')))]
  return {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? 'apply' : 'dry-run',
    sourceRoot: SOURCE_ROOT,
    summary: {
      sourceArticles: records.length,
      currentPythonArticles: plan.items.filter((item) => item.existing).length + plan.remove.length,
      currentPublished: plan.items.filter((item) => item.existing?.status === 'published').length +
        plan.remove.filter((item) => item.status === 'published').length,
      currentDrafts: plan.items.filter((item) => item.existing?.status === 'draft').length +
        plan.remove.filter((item) => item.status === 'draft').length,
      unchanged: plan.items.filter((item) => item.action === 'unchanged').length,
      update: plan.items.filter((item) => item.action === 'update').length,
      createDraft: plan.items.filter((item) => item.action === 'create').length,
      remove: plan.remove.length,
      missingCategories: requiredCategoryPaths.filter((item) => !categoryMaps.byPath.has(item)).length
    },
    items: plan.items.map((item) => ({
      sourcePath: item.record.relativePath,
      title: item.record.title,
      slug: item.record.slug,
      categoryPath: item.record.categoryPath,
      sortOrder: item.record.sortOrder,
      action: item.action,
      existingId: item.existing?._id?.toString() || null,
      existingStatus: item.existing?.status || null
    })),
    remove: plan.remove.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      slug: item.slug,
      status: item.status
    }))
  }
}

async function applyPlan(records, plan, categories, adminUser, pythonArticles) {
  const removedIds = plan.remove.map((item) => item._id)
  const backupPath = await createBackup(pythonArticles, removedIds)
  const categoryByPath = await ensureCategoryPaths(records, categories)
  const tagByName = await ensureTags(records)
  const now = new Date()

  for (const item of plan.items) {
    const record = item.record
    const payload = {
      title: record.title,
      slug: record.slug,
      summary: record.summary,
      contentMarkdown: record.contentMarkdown,
      contentMode: 'markdown',
      category: categoryByPath.get(record.categoryPath.join('/'))._id,
      tags: record.tags.map((name) => tagByName.get(name)._id),
      sortOrder: record.sortOrder,
      wordCount: record.wordCount,
      readingMinutes: record.readingMinutes,
      source: 'manual',
      sourcePath: `Python/${record.relativePath}`,
      sourceHash: record.contentHash,
      importedAt: now,
      updatedBy: adminUser._id,
      deletedAt: null
    }
    if (item.existing) {
      Object.assign(item.existing, payload)
      await item.existing.save()
    } else {
      await Article.create({
        ...payload,
        status: 'draft',
        publishedAt: null,
        createdBy: adminUser._id
      })
    }
  }

  if (removedIds.length > 0) {
    await Promise.all([
      Comment.deleteMany({ article: { $in: removedIds } }),
      Reaction.deleteMany({ targetType: 'article', targetId: { $in: removedIds } }),
      Article.deleteMany({ _id: { $in: removedIds } })
    ])
  }
  await rebuildCounts()
  return backupPath
}

async function main() {
  console.log(`模式: ${APPLY ? 'apply' : 'dry-run'}`)
  console.log(`Python 权威源: ${SOURCE_ROOT}`)
  const records = parseSourceArticles()
  await connectDatabase()
  const [categories, allArticles, adminUser] = await Promise.all([
    Category.find({}),
    Article.find({ deletedAt: null }),
    findPreferredArticleAuthor()
  ])
  const categoryMaps = buildCategoryPathMaps(categories)
  const pythonRoot = categoryMaps.byPath.get(CATEGORY_PREFIX.join('/'))
  const pythonCategoryIds = collectBranchIds(categories, pythonRoot?._id)
  const pythonArticles = allArticles.filter((item) => pythonCategoryIds.includes(String(item.category)))
  const existingCreatorId = pythonArticles.find((item) => item.createdBy)?.createdBy
  const writeUser = adminUser || (
    existingCreatorId
      ? await User.findById(existingCreatorId)
      : null
  )
  const plan = buildMatchPlan(records, pythonArticles, allArticles)
  const report = buildReport(records, plan, categoryMaps)
  console.log(JSON.stringify(report.summary, null, 2))
  if (REPORT_PATH) {
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
    fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    console.log(`分析报告: ${REPORT_PATH}`)
  }
  if (!APPLY) {
    console.log('dry-run 完成，未写入数据库')
    return
  }
  if (!writeUser) throw new Error('数据库中没有可用的文章创建者账号')
  const backupPath = await applyPlan(records, plan, categories, writeUser, pythonArticles)
  console.log(`替换完成，备份: ${backupPath}`)
}

main()
  .catch((error) => {
    console.error('Python 文章替换失败:', error)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
