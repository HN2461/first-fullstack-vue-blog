/**
 * 将本地 Redis 入门专题创建或更新为已发布文章。
 * 默认 dry-run；只有同时传入 --apply --publish 才会写入数据库。
 */

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import mongoose from 'mongoose'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'
import { Tag } from '#modules/content/models/Tag.js'
import { assertArticlePublishable } from '#modules/content/services/articleContent.service.js'
import { calculateReadingMinutes, calculateWordCount, contentHash, generateAsciiSlug } from '#modules/content/services/legacyMigration.service.js'
import { findPreferredArticleAuthor } from '#utils/articleAuthor.js'

const args = new Set(process.argv.slice(2))
const APPLY = args.has('--apply')
const PUBLISH = args.has('--publish')
const SOURCE_ROOT = path.resolve(process.env.REDIS_ARTICLE_SOURCE || path.join(env.rootDir, '../output/未导入线上/Redis'))
const REPORT_PATH = process.env.REDIS_ARTICLE_REPORT || (env.nodeEnv === 'production'
  ? ''
  : path.join(env.rootDir, '../docs/02-开发指南/文章同步报告/redis-beginner-publish-latest.json'))
const CATEGORY_PATH = ['后端技术', '数据库', 'Redis']
const CATEGORY_SORT_ORDER = 40
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const CANONICAL_SOURCE_PATHS = {
  'redis-practical-beginner-guide': 'Redis/README.md',
  'redis-01-overview-fast-key-ttl': 'Redis/notes/01-认识Redis为什么快与Key生命周期.md',
  'redis-02-core-data-structures': 'Redis/notes/02-核心数据结构与常见场景.md',
  'redis-03-extended-types-internals-complexity': 'Redis/notes/03-扩展能力底层结构与复杂度.md',
  'redis-04-atomicity-memory-performance': 'Redis/notes/04-原子操作内存管理与性能问题.md',
  'redis-05-cache-consistency': 'Redis/notes/05-缓存问题与数据库一致性.md',
  'redis-06-business-lock-idempotency': 'Redis/notes/06-常见业务场景分布式锁与幂等.md',
  'redis-07-messaging-persistence-high-availability': 'Redis/notes/07-消息持久化与高可用.md',
  'redis-08-security-monitoring-ioredis-case': 'Redis/notes/08-安全监控ioredis与项目应用.md'
}

if (PUBLISH && !APPLY) throw new Error('发布必须同时传入 --apply --publish')

function normalizeTags(value) {
  const values = Array.isArray(value) ? value : String(value || '').split(/[,，、\n]/)
  return [...new Set(values.map((item) => String(item || '').trim()).filter(Boolean))]
}

function listSourceFiles() {
  const readmePath = path.join(SOURCE_ROOT, 'README.md')
  const notesRoot = path.join(SOURCE_ROOT, 'notes')
  if (!fs.existsSync(readmePath)) throw new Error(`缺少专题总目录：${readmePath}`)
  if (!fs.existsSync(notesRoot)) throw new Error(`缺少专题章节目录：${notesRoot}`)

  const notes = fs.readdirSync(notesRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.md$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'zh-CN'))

  if (notes.length !== 8 || notes.some((name, index) => !name.startsWith(`${String(index + 1).padStart(2, '0')}-`))) {
    throw new Error('Redis 专题必须包含按 01 至 08 排列的 8 篇章节文章')
  }

  return [readmePath, ...notes.map((name) => path.join(notesRoot, name))]
}

function parseSourceRecord(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')
  const parsed = matter(raw)
  const data = parsed.data || {}
  const title = String(data.title || '').trim()
  const slug = String(data.slug || '').trim().toLowerCase()
  const summary = String(data.summary || '').trim()
  const category = String(data.category || '').trim()
  const categoryPath = Array.isArray(data.categoryPath) ? data.categoryPath.map((item) => String(item).trim()) : []
  const tags = normalizeTags(data.tags)
  const sortOrder = Number(data.sortOrder)
  const contentMarkdown = String(parsed.content || '').trim()
  const sourcePath = CANONICAL_SOURCE_PATHS[slug] || `Redis/${path.relative(SOURCE_ROOT, filePath).replace(/\\/g, '/')}`
  const errors = []

  if (!title || title.length > 120) errors.push('title 为空或超过 120 个字符')
  if (!SLUG_PATTERN.test(slug)) errors.push(`slug 不合法：${slug || '空'}`)
  if (!summary || summary.length > 300) errors.push('summary 为空或超过 300 个字符')
  if (!contentMarkdown) errors.push('正文为空')
  if (category !== 'Redis') errors.push('category 必须是 Redis')
  if (JSON.stringify(categoryPath) !== JSON.stringify(CATEGORY_PATH)) errors.push('categoryPath 不符合专题分类路径')
  if (tags.length === 0 || tags.some((tag) => tag.length > 32)) errors.push('tags 为空或包含超过 32 个字符的标签')
  if (!Number.isInteger(sortOrder) || sortOrder < 10) errors.push('sortOrder 必须是大于等于 10 的整数')
  if (data.status !== 'published') errors.push('status 必须是 published')
  if (errors.length > 0) throw new Error(`${sourcePath}: ${errors.join('；')}`)

  return {
    title,
    slug,
    summary,
    tags,
    sortOrder,
    contentMarkdown,
    sourceHash: contentHash(contentMarkdown),
    sourcePath
  }
}

function buildCategoryPaths(categories) {
  const byId = new Map(categories.map((category) => [String(category._id), category]))
  const pathById = new Map()

  function resolve(category, seen = new Set()) {
    const id = String(category._id)
    if (pathById.has(id)) return pathById.get(id)
    if (seen.has(id)) return []
    seen.add(id)
    const parent = category.parent ? byId.get(String(category.parent)) : null
    const categoryPath = [...(parent ? resolve(parent, seen) : []), category.name]
    pathById.set(id, categoryPath)
    return categoryPath
  }

  categories.forEach((category) => resolve(category))
  return { byId, pathById }
}

function sameValues(left, right) {
  return [...left].sort().join('\n') === [...right].sort().join('\n')
}

function auditArticle(record, article, categoryPaths, tagNamesById) {
  if (!article) return { ...record, state: 'create-and-publish', mismatches: [], blockers: [] }

  const currentCategoryPath = article.category ? categoryPaths.get(String(article.category)) || [] : []
  const currentTags = (article.tags || []).map((tagId) => tagNamesById.get(String(tagId))).filter(Boolean)
  const mismatches = []
  if (article.title !== record.title) mismatches.push('title')
  if (String(article.summary || '') !== record.summary) mismatches.push('summary')
  if (String(article.contentMarkdown || '').trim() !== record.contentMarkdown) mismatches.push('正文')
  if (String(article.sourceHash || '') !== record.sourceHash) mismatches.push('正文哈希')
  if (String(article.sourcePath || '') !== record.sourcePath) mismatches.push('sourcePath')
  if (Number(article.sortOrder || 0) !== record.sortOrder) mismatches.push('sortOrder')
  if (!sameValues(currentCategoryPath, CATEGORY_PATH)) mismatches.push('分类')
  if (!sameValues(currentTags, record.tags)) mismatches.push('标签')
  if (article.status !== 'published') mismatches.push('发布状态')

  const blockers = []
  try {
    assertArticlePublishable(article)
  } catch (error) {
    blockers.push(error.message)
  }
  return { ...record, id: String(article._id), state: mismatches.length === 0 ? 'unchanged' : 'update-and-publish', mismatches, blockers }
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

async function ensureRedisCategory(categories) {
  const categoryPaths = buildCategoryPaths(categories)
  const existing = categories.find((category) => categoryPaths.pathById.get(String(category._id))?.join('/') === CATEGORY_PATH.join('/'))
  if (existing) return existing

  const databaseCategory = categories.find((category) => categoryPaths.pathById.get(String(category._id))?.join('/') === '后端技术/数据库')
  if (!databaseCategory) throw new Error('缺少父分类：后端技术/数据库')

  return Category.create({
    name: 'Redis',
    slug: await ensureUniqueSlug(Category, generateAsciiSlug(CATEGORY_PATH, CATEGORY_PATH.join('/'), 70)),
    description: 'Redis 缓存、数据结构、高可用与项目实践文章。',
    parent: databaseCategory._id,
    sortOrder: CATEGORY_SORT_ORDER,
    status: 'active'
  })
}

async function ensureTags(records) {
  const names = [...new Set(records.flatMap((record) => record.tags))]
  const existing = await Tag.find({ name: { $in: names } })
  const byName = new Map(existing.map((tag) => [tag.name, tag]))
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
  await Promise.all([Category.updateMany({}, { $set: { articleCount: 0 } }), Tag.updateMany({}, { $set: { articleCount: 0 } })])
  const articles = await Article.find({ deletedAt: null }).select('category tags').lean()
  const categoryCounts = new Map()
  const tagCounts = new Map()
  articles.forEach((article) => {
    if (article.category) categoryCounts.set(String(article.category), (categoryCounts.get(String(article.category)) || 0) + 1)
    for (const tagId of article.tags || []) {
      tagCounts.set(String(tagId), (tagCounts.get(String(tagId)) || 0) + 1)
    }
  })
  await Promise.all([
    ...[...categoryCounts].map(([id, count]) => Category.updateOne({ _id: id }, { $set: { articleCount: count } })),
    ...[...tagCounts].map(([id, count]) => Tag.updateOne({ _id: id }, { $set: { articleCount: count } }))
  ])
}

async function createBackup(articles, categories, tags) {
  const backupDir = path.join(env.rootDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, `redis-beginner-before-publish-${stamp}.ejson`)
  const data = { createdAt: new Date(), sourceRoot: SOURCE_ROOT, articles: articles.map((article) => article.toObject()), categories, tags }
  fs.writeFileSync(backupPath, mongoose.mongo.BSON.EJSON.stringify(data, null, 2, { relaxed: false }), 'utf8')
  return backupPath
}

function writeReport(report) {
  if (!REPORT_PATH) return
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(`分析报告: ${REPORT_PATH}`)
}

async function main() {
  const records = listSourceFiles().map(parseSourceRecord)
  const duplicateSlugs = records.map((record) => record.slug).filter((slug, index, values) => values.indexOf(slug) !== index)
  if (duplicateSlugs.length > 0) throw new Error(`专题内存在重复 slug：${[...new Set(duplicateSlugs)].join('、')}`)

  await connectDatabase()
  const [categories, tags, articles] = await Promise.all([
    Category.find({}),
    Tag.find({}).select('name'),
    Article.find({ slug: { $in: records.map((record) => record.slug) }, deletedAt: null })
  ])
  const categoryMaps = buildCategoryPaths(categories)
  const articleBySlug = new Map(articles.map((article) => [article.slug, article]))
  const tagNamesById = new Map(tags.map((tag) => [String(tag._id), tag.name]))
  const items = records.map((record) => auditArticle(record, articleBySlug.get(record.slug), categoryMaps.pathById, tagNamesById))
  const report = {
    generatedAt: new Date().toISOString(),
    mode: APPLY && PUBLISH ? 'publish' : 'dry-run',
    sourceRoot: SOURCE_ROOT,
    summary: {
      sourceArticles: records.length,
      unchanged: items.filter((item) => item.state === 'unchanged').length,
      createAndPublish: items.filter((item) => item.state === 'create-and-publish').length,
      updateAndPublish: items.filter((item) => item.state === 'update-and-publish').length,
      publishBlockers: items.filter((item) => item.blockers.length > 0).length,
      redisCategoryExists: categories.some((category) => categoryMaps.pathById.get(String(category._id))?.join('/') === CATEGORY_PATH.join('/'))
    },
    items: items.map(({ contentMarkdown, sourceHash, ...item }) => item)
  }
  console.log(JSON.stringify(report, null, 2))
  writeReport(report)
  if (!APPLY || !PUBLISH) return

  const blocked = items.filter((item) => item.blockers.length > 0)
  if (blocked.length > 0) throw new Error(`发布前校验未通过：${blocked.map((item) => item.slug).join('、')}`)
  const adminUser = await findPreferredArticleAuthor()
  if (!adminUser) throw new Error('数据库中没有可用的管理员账号，不能记录发布人')

  const backupPath = await createBackup(articles, categories, tags)
  const category = await ensureRedisCategory(categories)
  const tagByName = await ensureTags(records)
  const now = new Date()
  for (const record of records) {
    const payload = {
      title: record.title,
      slug: record.slug,
      summary: record.summary,
      contentMarkdown: record.contentMarkdown,
      contentMode: 'markdown',
      category: category._id,
      tags: record.tags.map((name) => tagByName.get(name)._id),
      sortOrder: record.sortOrder,
      wordCount: calculateWordCount(record.contentMarkdown),
      readingMinutes: calculateReadingMinutes(calculateWordCount(record.contentMarkdown)),
      source: 'manual',
      sourcePath: record.sourcePath,
      sourceHash: record.sourceHash,
      importedAt: now,
      updatedBy: adminUser._id,
      deletedAt: null,
      status: 'published',
      publishedAt: now
    }
    const article = articleBySlug.get(record.slug)
    if (article) {
      Object.assign(article, payload)
      await article.save()
    } else {
      await Article.create({ ...payload, createdBy: adminUser._id })
    }
  }
  await rebuildCounts()
  const publishedCount = await Article.countDocuments({ slug: { $in: records.map((record) => record.slug) }, deletedAt: null, status: 'published' })
  if (publishedCount !== records.length) throw new Error(`发布后数量校验失败：期望 ${records.length}，实际 ${publishedCount}`)
  console.log(`发布完成：${publishedCount} 篇，发布前备份：${backupPath}`)
}

main()
  .catch((error) => {
    console.error('Redis 专题发布失败:', error)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
