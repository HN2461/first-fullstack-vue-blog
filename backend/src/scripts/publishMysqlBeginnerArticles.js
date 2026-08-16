/**
 * 仅发布已由 importSelectedArticles.js 导入的 MySQL 小白课程。
 * 默认只核验；必须同时传入 --apply --publish 才会修改文章状态。
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
import { contentHash } from '#modules/content/services/legacyMigration.service.js'
import { findPreferredArticleAuthor } from '#utils/articleAuthor.js'

const rawArgs = process.argv.slice(2)
const args = new Set(rawArgs)
const APPLY = args.has('--apply')
const PUBLISH = args.has('--publish')
const SOURCE_ROOT = path.resolve(
  process.env.MYSQL_ARTICLE_SOURCE || path.join(env.rootDir, '../output/未导入线上/MySQL')
)
const CATEGORY_PATH = ['后端技术', '数据库', 'MySQL']
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

if (PUBLISH && !APPLY) {
  throw new Error('发布必须同时传入 --apply --publish')
}

function normalizeTags(value) {
  const values = Array.isArray(value) ? value : String(value || '').split(/[,，、\n]/)
  return [...new Set(values.map((item) => String(item || '').trim()).filter(Boolean))]
}

function listSourceFiles() {
  const readmePath = path.join(SOURCE_ROOT, 'README.md')
  const notesRoot = path.join(SOURCE_ROOT, 'notes')
  if (!fs.existsSync(readmePath)) throw new Error(`缺少课程总目录：${readmePath}`)
  if (!fs.existsSync(notesRoot)) throw new Error(`缺少课程章节目录：${notesRoot}`)

  const notes = fs.readdirSync(notesRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.md$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'zh-CN'))

  if (notes.length !== 12 || notes.some((name, index) => !name.startsWith(`${String(index + 1).padStart(2, '0')}-`))) {
    throw new Error('MySQL 课程必须包含按 01 至 12 排列的 12 篇章节文章')
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
  const contentMarkdown = String(parsed.content || '').trim()
  const tags = normalizeTags(data.tags)
  const sortOrder = Number(data.sortOrder)
  const sourcePath = `MySQL/${path.relative(SOURCE_ROOT, filePath).replace(/\\/g, '/')}`
  const errors = []

  if (!title || title.length > 120) errors.push('title 为空或超过 120 个字符')
  if (!SLUG_PATTERN.test(slug)) errors.push(`slug 不合法：${slug || '空'}`)
  if (!summary || summary.length > 300) errors.push('summary 为空或超过 300 个字符')
  if (!contentMarkdown) errors.push('正文为空')
  if (tags.length === 0 || tags.some((tag) => tag.length > 32)) errors.push('tags 为空或包含超过 32 个字符的标签')
  if (!Number.isInteger(sortOrder) || sortOrder < 0) errors.push('sortOrder 必须是非负整数')
  if (String(data.category || '').trim() !== 'MySQL') errors.push('category 必须是 MySQL')
  if (JSON.stringify(data.categoryPath || []) !== JSON.stringify(CATEGORY_PATH)) errors.push('categoryPath 不符合课程分类路径')
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
  return pathById
}

function sameValues(left, right) {
  return [...left].sort().join('\n') === [...right].sort().join('\n')
}

function auditArticle(record, article, categoryPaths, tagNamesById) {
  if (!article) {
    return {
      slug: record.slug,
      title: record.title,
      sourcePath: record.sourcePath,
      state: 'missing',
      mismatches: [],
      blockers: []
    }
  }

  const mismatches = []
  const currentCategoryPath = article.category ? categoryPaths.get(String(article.category)) || [] : []
  const currentTags = (article.tags || []).map((tagId) => tagNamesById.get(String(tagId))).filter(Boolean)
  if (article.title !== record.title) mismatches.push('title')
  if (String(article.summary || '') !== record.summary) mismatches.push('summary')
  if (String(article.contentMarkdown || '').trim() !== record.contentMarkdown) mismatches.push('正文')
  if (String(article.sourceHash || '') !== record.sourceHash) mismatches.push('正文哈希')
  if (String(article.sourcePath || '') !== record.sourcePath) mismatches.push('sourcePath')
  if (Number(article.sortOrder || 0) !== record.sortOrder) mismatches.push('sortOrder')
  if (!sameValues(currentCategoryPath, CATEGORY_PATH)) mismatches.push('分类')
  if (!sameValues(currentTags, record.tags)) mismatches.push('标签')

  const blockers = []
  try {
    assertArticlePublishable(article)
  } catch (error) {
    blockers.push(error.message)
  }

  return {
    id: String(article._id),
    slug: record.slug,
    title: record.title,
    sourcePath: record.sourcePath,
    state: article.status === 'published' ? 'published' : 'draft',
    mismatches,
    blockers
  }
}

async function createBackup(articles) {
  const backupDir = path.join(env.rootDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, `mysql-beginner-before-publish-${stamp}.ejson`)
  const data = {
    createdAt: new Date(),
    sourceRoot: SOURCE_ROOT,
    articles: articles.map((article) => article.toObject())
  }
  fs.writeFileSync(backupPath, mongoose.mongo.BSON.EJSON.stringify(data, null, 2, { relaxed: false }), 'utf8')
  return backupPath
}

async function main() {
  const files = listSourceFiles()
  const records = files.map(parseSourceRecord)
  const duplicateSlugs = records.map((record) => record.slug).filter((slug, index, values) => values.indexOf(slug) !== index)
  if (duplicateSlugs.length > 0) throw new Error(`课程内存在重复 slug：${[...new Set(duplicateSlugs)].join('、')}`)

  await connectDatabase()
  const [categories, tags, articles] = await Promise.all([
    Category.find({}).select('name parent'),
    Tag.find({}).select('name'),
    Article.find({ slug: { $in: records.map((record) => record.slug) }, deletedAt: null })
  ])
  const articleBySlug = new Map(articles.map((article) => [article.slug, article]))
  const categoryPaths = buildCategoryPaths(categories)
  const tagNamesById = new Map(tags.map((tag) => [String(tag._id), tag.name]))
  const items = records.map((record) => auditArticle(record, articleBySlug.get(record.slug), categoryPaths, tagNamesById))
  const failedItems = items.filter((item) => item.state === 'missing' || item.mismatches.length > 0 || item.blockers.length > 0)
  const summary = {
    mode: APPLY && PUBLISH ? 'publish' : 'dry-run',
    sourceRoot: SOURCE_ROOT,
    sourceArticles: records.length,
    published: items.filter((item) => item.state === 'published').length,
    draft: items.filter((item) => item.state === 'draft').length,
    missing: items.filter((item) => item.state === 'missing').length,
    mismatched: items.filter((item) => item.mismatches.length > 0).length,
    blocked: items.filter((item) => item.blockers.length > 0).length
  }
  console.log(JSON.stringify({ summary, failedItems, items }, null, 2))

  if (!APPLY || !PUBLISH) {
    console.log('核验完成，未发布任何文章')
    return
  }

  if (failedItems.length > 0) {
    throw new Error('发布前核验未通过，未修改文章状态')
  }

  const adminUser = await findPreferredArticleAuthor()
  if (!adminUser) throw new Error('数据库中没有可用的管理员账号，不能记录发布人')

  const backupPath = await createBackup(articles)
  const now = new Date()
  for (const article of articles) {
    if (article.status === 'published') continue
    article.status = 'published'
    article.publishedAt = now
    article.updatedBy = adminUser._id
    await article.save()
  }

  const publishedCount = await Article.countDocuments({
    slug: { $in: records.map((record) => record.slug) },
    deletedAt: null,
    status: 'published'
  })
  if (publishedCount !== records.length) throw new Error(`发布后数量校验失败：期望 ${records.length}，实际 ${publishedCount}`)
  console.log(`发布完成：${publishedCount} 篇，发布前备份：${backupPath}`)
}

main()
  .catch((error) => {
    console.error('MySQL 课程发布失败:', error)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
