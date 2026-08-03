/**
 * 导入用户选定的本地文章目录。默认 dry-run；新文章只创建为草稿，不自动发布或删除文章。
 */

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import mongoose from 'mongoose'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { USER_ROLES } from '#constants/domain'
import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'
import { Tag } from '#modules/content/models/Tag.js'
import { User } from '#modules/user/models/User.js'
import {
  calculateReadingMinutes,
  calculateWordCount,
  contentHash,
  generateAsciiSlug
} from '#modules/content/services/legacyMigration.service.js'

const rawArgs = process.argv.slice(2)
const args = new Set(rawArgs)
const APPLY = args.has('--apply')
const sourceFilter = rawArgs.find((item) => item.startsWith('--source='))?.slice('--source='.length).trim()
const OUTPUT_ROOT = path.resolve(process.env.SELECTED_ARTICLE_OUTPUT_ROOT || path.join(env.rootDir, '../output'))
const REPORT_PATH = process.env.SELECTED_ARTICLE_SYNC_REPORT || (
  env.nodeEnv === 'production'
    ? ''
    : path.join(env.rootDir, '../docs/02-开发指南/文章同步报告/selected-article-import-latest.json')
)
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const NAVIGATION_NAMES = new Set(['readme.md', 'index.md', '目录.md'])
const SOURCES = [
  {
    key: 'computer',
    label: '电脑',
    root: ['未导入线上', '电脑'],
    categoryPrefix: ['电脑'],
    metadata: 'front-matter'
  },
  {
    key: 'ai-platform',
    label: 'AI应用开发平台',
    root: ['未导入线上', 'AI 应用开发平台'],
    categoryPrefix: ['AI相关', 'AI开发', 'AI应用开发平台'],
    metadata: 'derived'
  },
  {
    key: 'ai-tool',
    label: 'AI工具',
    root: ['未导入线上', 'AI工具'],
    categoryPrefix: ['AI相关', 'AI工具'],
    metadata: 'front-matter'
  },
  {
    key: 'mysql',
    label: 'MySQL',
    root: ['未导入线上', 'MySQL'],
    categoryPrefix: ['后端技术', '数据库', 'MySQL'],
    metadata: 'front-matter',
    includeDirectoriesInCategory: false
  }
]

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/')
}

function cleanDirectoryName(value) {
  return String(value || '')
    .replace(/^(?:第)?\d+(?:[篇章节])?[._\-、\s]+/u, '')
    .trim()
}

function scanMarkdown(currentDir, result = []) {
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    const fullPath = path.join(currentDir, entry.name)
    if (entry.isDirectory()) scanMarkdown(fullPath, result)
    else if (/\.md$/i.test(entry.name)) result.push(fullPath)
  }
  return result
}

function normalizeTags(value) {
  const values = Array.isArray(value) ? value : String(value || '').split(/[,，、\n]/)
  return [...new Set(values.map((item) => String(item || '').trim()).filter(Boolean))]
}

function stableSlug(data) {
  return String(data.originalSlug || data.slug || '')
    .trim()
    .toLowerCase()
    .replace(/-revision-\d{8}$/i, '')
}

function firstHeading(content) {
  return String(content || '').match(/^#\s+(.+)$/m)?.[1]?.trim() || ''
}

function derivedSummary(title, categoryPath) {
  const topic = categoryPath.at(-1) || '开发实践'
  return `本文整理 ${title}，归纳 MaxKB ${topic}相关的配置方法、实践步骤、边界条件与常见注意事项。`
}

function derivedTags(title, categoryPath) {
  const tags = ['MaxKB', 'AI应用开发', categoryPath.at(-1)]
  if (/节点|智能体/.test(title)) tags.push('智能体')
  if (/API|MCP|工具/.test(title)) tags.push('API与工具')
  return normalizeTags(tags)
}

function parseRecord(source, sourceRoot, fullPath) {
  const relativePath = normalizePath(path.relative(sourceRoot, fullPath))
  const raw = fs.readFileSync(fullPath, 'utf8').replace(/^\uFEFF/, '')
  const parsed = matter(raw)
  const data = parsed.data || {}
  const directoryParts = source.includeDirectoriesInCategory === false
    ? []
    : path.dirname(relativePath)
      .split('/')
      .filter((item) => item && item !== '.')
      .map(cleanDirectoryName)
      .filter(Boolean)
  const categoryPath = [...source.categoryPrefix, ...directoryParts]
  const isDerived = source.metadata === 'derived'
  const title = isDerived ? firstHeading(parsed.content) : String(data.title || '').trim()
  const slug = isDerived
    ? generateAsciiSlug(['maxkb', title], `${source.label}/${relativePath}`, 90)
    : stableSlug(data)
  const summary = isDerived ? derivedSummary(title, categoryPath) : String(data.summary || '').trim()
  const tags = isDerived ? derivedTags(title, categoryPath) : normalizeTags(data.tags)
  const contentMarkdown = String(parsed.content || '').trim()
  const orderPrefix = path.basename(relativePath).match(/^\s*(\d+)/)?.[1]
  const rawSortOrder = data.sortOrder
  const sortOrder = orderPrefix
    ? Number(orderPrefix) * 10
    : (rawSortOrder === undefined || rawSortOrder === null || rawSortOrder === '' ? 0 : Number(rawSortOrder))
  const wordCount = calculateWordCount(contentMarkdown)
  return {
    sourceKey: source.key,
    sourceLabel: source.label,
    relativePath,
    title,
    slug,
    originalId: String(data.originalId || '').trim(),
    summary,
    tags,
    cover: String(data.cover || '').trim(),
    categoryPath,
    sortOrder,
    contentMarkdown,
    contentHash: contentHash(contentMarkdown),
    wordCount,
    readingMinutes: calculateReadingMinutes(wordCount)
  }
}

function parseSources() {
  const records = []
  const skippedNavigation = []
  const errors = []
  let sourceFiles = 0
  const selectedSources = sourceFilter
    ? SOURCES.filter((source) => source.key === sourceFilter)
    : SOURCES

  if (sourceFilter && selectedSources.length === 0) {
    throw new Error(`未知文章源：${sourceFilter}`)
  }

  for (const source of selectedSources) {
    const sourceRoot = path.join(OUTPUT_ROOT, ...source.root)
    if (!fs.existsSync(sourceRoot)) {
      errors.push(`${source.label}: 目录不存在 ${sourceRoot}`)
      continue
    }
    for (const fullPath of scanMarkdown(sourceRoot).sort()) {
      sourceFiles += 1
      const relativePath = normalizePath(path.relative(sourceRoot, fullPath))
      if (source.metadata === 'derived' && NAVIGATION_NAMES.has(path.basename(fullPath).toLowerCase())) {
        skippedNavigation.push(`${source.label}/${relativePath}`)
        continue
      }
      let record
      try {
        record = parseRecord(source, sourceRoot, fullPath)
      } catch (error) {
        errors.push(`${source.label}/${relativePath}: 解析失败: ${error.message}`)
        continue
      }
      if (!record.title) errors.push(`${source.label}/${relativePath}: 缺少一级标题或 title`)
      if (record.title.length > 120) errors.push(`${source.label}/${relativePath}: title 超过 120 个字符`)
      if (!SLUG_PATTERN.test(record.slug)) errors.push(`${source.label}/${relativePath}: slug 不合法: ${record.slug}`)
      if (!record.summary) errors.push(`${source.label}/${relativePath}: 缺少 summary`)
      if (record.summary.length > 300) errors.push(`${source.label}/${relativePath}: summary 超过 300 个字符`)
      if (record.tags.length === 0) errors.push(`${source.label}/${relativePath}: tags 不能为空`)
      if (record.tags.some((item) => item.length > 32)) errors.push(`${source.label}/${relativePath}: tag 超过 32 个字符`)
      if (!record.contentMarkdown) errors.push(`${source.label}/${relativePath}: 正文为空`)
      if (!Number.isFinite(record.sortOrder)) errors.push(`${source.label}/${relativePath}: sortOrder 不合法`)
      if (record.originalId && !mongoose.isValidObjectId(record.originalId)) {
        errors.push(`${source.label}/${relativePath}: originalId 不合法`)
      }
      records.push(record)
    }
  }
  const slugFiles = new Map()
  records.forEach((record) => {
    if (!slugFiles.has(record.slug)) slugFiles.set(record.slug, [])
    slugFiles.get(record.slug).push(`${record.sourceLabel}/${record.relativePath}`)
  })
  slugFiles.forEach((files, slug) => {
    if (files.length > 1) errors.push(`slug 重复 ${slug}: ${files.join('、')}`)
  })
  if (errors.length > 0) {
    throw new Error(`选定文章源文件校验失败:\n${errors.map((item) => `- ${item}`).join('\n')}`)
  }
  return { records, skippedNavigation, sourceFiles }
}

function buildCategoryMaps(categories) {
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

function buildPlan(records, articles, categoryMaps, tags) {
  const byId = new Map(articles.map((item) => [String(item._id), item]))
  const bySlug = new Map(articles.map((item) => [item.slug, item]))
  const titleGroups = new Map()
  articles.forEach((item) => {
    if (!titleGroups.has(item.title)) titleGroups.set(item.title, [])
    titleGroups.get(item.title).push(item)
  })
  const tagNameById = new Map(tags.map((item) => [String(item._id), item.name]))
  const matchedIds = new Set()
  const items = records.map((record) => {
    const idMatch = record.originalId ? byId.get(record.originalId) : null
    const slugMatch = bySlug.get(record.slug)
    if (idMatch && slugMatch && String(idMatch._id) !== String(slugMatch._id)) {
      throw new Error(`${record.title}: originalId 与 slug 匹配到不同文章`)
    }
    const existing = idMatch || slugMatch || null
    const titleMatches = titleGroups.get(record.title) || []
    if (!existing && titleMatches.length > 0) {
      throw new Error(`${record.title}: 标题已存在但 slug 不同，请先人工确认身份`)
    }
    if (existing && matchedIds.has(String(existing._id))) {
      throw new Error(`多个源文件匹配到同一篇文章: ${existing.title}`)
    }
    if (existing) matchedIds.add(String(existing._id))
    const currentCategoryPath = existing?.category
      ? categoryMaps.pathById.get(String(existing.category)) || []
      : []
    const currentTags = (existing?.tags || []).map((id) => tagNameById.get(String(id))).filter(Boolean).sort()
    const expectedTags = [...record.tags].sort()
    const unchanged = existing &&
      existing.title === record.title &&
      existing.slug === record.slug &&
      String(existing.summary || '') === record.summary &&
      String(existing.cover || '') === record.cover &&
      String(existing.contentMarkdown || '').trim() === record.contentMarkdown &&
      Number(existing.sortOrder || 0) === record.sortOrder &&
      currentCategoryPath.join('/') === record.categoryPath.join('/') &&
      currentTags.join('\n') === expectedTags.join('\n')
    return { record, existing, action: existing ? (unchanged ? 'unchanged' : 'update') : 'create' }
  })
  return { items }
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

async function ensureCategories(records, initialCategories) {
  const categories = [...initialCategories]
  const maps = buildCategoryMaps(categories)
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
    articleTags.forEach((id) => tagCounts.set(String(id), (tagCounts.get(String(id)) || 0) + 1))
  })
  await Promise.all([
    ...[...categoryCounts].map(([id, count]) => Category.updateOne({ _id: id }, { $set: { articleCount: count } })),
    ...[...tagCounts].map(([id, count]) => Tag.updateOne({ _id: id }, { $set: { articleCount: count } }))
  ])
}

async function createBackup(plan) {
  const backupDir = path.join(env.rootDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, `selected-articles-before-${stamp}.ejson`)
  const existingIds = plan.items.filter((item) => item.existing).map((item) => item.existing._id)
  const data = {
    createdAt: new Date(),
    outputRoot: OUTPUT_ROOT,
    collections: {
      articles: await Article.find({ _id: { $in: existingIds } }).lean(),
      categories: await Category.find({}).lean(),
      tags: await Tag.find({}).lean()
    }
  }
  fs.writeFileSync(backupPath, mongoose.mongo.BSON.EJSON.stringify(data, null, 2, { relaxed: false }), 'utf8')
  return backupPath
}

function buildReport(sourceAudit, plan, categoryMaps, tags) {
  const requiredPaths = [...new Set(sourceAudit.records.map((item) => item.categoryPath.join('/')))]
  const tagNames = new Set(tags.map((item) => item.name))
  return {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? 'apply' : 'dry-run',
    outputRoot: OUTPUT_ROOT,
    summary: {
      sourceFiles: sourceAudit.sourceFiles,
      navigationSkipped: sourceAudit.skippedNavigation.length,
      sourceArticles: sourceAudit.records.length,
      unchanged: plan.items.filter((item) => item.action === 'unchanged').length,
      update: plan.items.filter((item) => item.action === 'update').length,
      createDraft: plan.items.filter((item) => item.action === 'create').length,
      missingCategories: requiredPaths.filter((item) => !categoryMaps.byPath.has(item)).length,
      missingTags: [...new Set(sourceAudit.records.flatMap((item) => item.tags))].filter((item) => !tagNames.has(item)).length
    },
    skippedNavigation: sourceAudit.skippedNavigation,
    items: plan.items.map((item) => ({
      sourcePath: `${item.record.sourceLabel}/${item.record.relativePath}`,
      title: item.record.title,
      slug: item.record.slug,
      categoryPath: item.record.categoryPath,
      tags: item.record.tags,
      sortOrder: item.record.sortOrder,
      action: item.action,
      existingId: item.existing?._id?.toString() || null,
      existingStatus: item.existing?.status || null
    }))
  }
}

async function applyPlan(sourceAudit, plan, categories, writeUser) {
  const backupPath = await createBackup(plan)
  const categoryByPath = await ensureCategories(sourceAudit.records, categories)
  const tagByName = await ensureTags(sourceAudit.records)
  const now = new Date()
  for (const item of plan.items) {
    const record = item.record
    const payload = {
      title: record.title,
      slug: record.slug,
      summary: record.summary,
      cover: record.cover,
      contentMarkdown: record.contentMarkdown,
      contentMode: 'markdown',
      category: categoryByPath.get(record.categoryPath.join('/'))._id,
      tags: record.tags.map((name) => tagByName.get(name)._id),
      sortOrder: record.sortOrder,
      wordCount: record.wordCount,
      readingMinutes: record.readingMinutes,
      source: 'manual',
      sourcePath: `${record.sourceLabel}/${record.relativePath}`,
      sourceHash: record.contentHash,
      importedAt: now,
      updatedBy: writeUser._id,
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
        createdBy: writeUser._id
      })
    }
  }
  await rebuildCounts()
  return backupPath
}

async function main() {
  console.log(`模式: ${APPLY ? 'apply' : 'dry-run'}`)
  console.log(`output 根目录: ${OUTPUT_ROOT}`)
  console.log(`文章源: ${sourceFilter || '全部已配置源'}`)
  const sourceAudit = parseSources()
  await connectDatabase()
  const [categories, tags, articles, adminUser] = await Promise.all([
    Category.find({}),
    Tag.find({}),
    Article.find({ deletedAt: null }),
    User.findOne({ role: { $in: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN] } }).sort({ createdAt: 1 })
  ])
  const categoryMaps = buildCategoryMaps(categories)
  const plan = buildPlan(sourceAudit.records, articles, categoryMaps, tags)
  const report = buildReport(sourceAudit, plan, categoryMaps, tags)
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
  if (!adminUser) throw new Error('数据库中没有可用的管理员文章创建者账号')
  const backupPath = await applyPlan(sourceAudit, plan, categories, adminUser)
  console.log(`导入完成，备份: ${backupPath}`)
}

main()
  .catch((error) => {
    console.error('选定文章导入失败:', error)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
