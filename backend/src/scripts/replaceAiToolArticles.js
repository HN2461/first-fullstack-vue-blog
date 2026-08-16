/**
 * 使用 output/AI工具 的本地版本更新数据库中现有 AI 工具文章。
 * 默认 dry-run；只更新已唯一匹配的文章，不创建本地独有文章，也不自动删除数据库文章。
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
import {
  calculateReadingMinutes,
  calculateWordCount,
  generateAsciiSlug
} from '#modules/content/services/legacyMigration.service.js'
import { findPreferredArticleAuthor } from '#utils/articleAuthor.js'

const APPLY = new Set(process.argv.slice(2)).has('--apply')
const SOURCE_ROOT = path.resolve(process.env.AI_TOOL_ARTICLE_ROOT || path.join(env.rootDir, '../output/AI工具'))
const REPORT_PATH = process.env.AI_TOOL_SYNC_REPORT || (
  env.nodeEnv === 'production'
    ? ''
    : path.join(env.rootDir, '../docs/02-开发指南/文章同步报告/ai-tool-replacement-latest.json')
)
const CATEGORY_PREFIX = ['AI相关', 'AI工具']
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const IDENTITY_OVERRIDES = new Map([
  ['ai-ai-kiro-kiro-hooks-a4ec7a90', {
    targetSlug: 'ai-ai-kiro-kiro-hooks-4b92a74f',
    reason: '本地 Kiro Hooks 来自已替换的早期线上文章，更新到当前第四篇并保留当前地址'
  }]
])

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/')
}

function scanMarkdown(currentDir = SOURCE_ROOT, result = []) {
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

function hashContent(content) {
  return crypto.createHash('sha256').update(String(content || '')).digest('hex')
}

function parseSourceArticles() {
  if (!fs.existsSync(SOURCE_ROOT)) throw new Error(`AI 工具文章目录不存在: ${SOURCE_ROOT}`)
  const records = []
  const errors = []

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
    const title = String(data.title || '').trim()
    const sourceSlug = stableSlug(data)
    const identityOverride = IDENTITY_OVERRIDES.get(sourceSlug) || null
    const targetSlug = identityOverride?.targetSlug || sourceSlug
    const summary = String(data.summary || '').trim()
    const tags = normalizeTags(data.tags)
    const contentMarkdown = String(parsed.content || '').trim()
    const directoryParts = path.dirname(relativePath).split('/').filter((item) => item && item !== '.')
    const rawSortOrder = data.sortOrder
    const sortOrder = rawSortOrder === undefined || rawSortOrder === null || rawSortOrder === ''
      ? null
      : Number(rawSortOrder)

    if (!title) errors.push(`${relativePath}: 缺少 title`)
    if (title.length > 120) errors.push(`${relativePath}: title 超过 120 个字符`)
    if (!SLUG_PATTERN.test(sourceSlug)) errors.push(`${relativePath}: slug 不合法: ${sourceSlug}`)
    if (!SLUG_PATTERN.test(targetSlug)) errors.push(`${relativePath}: 目标 slug 不合法: ${targetSlug}`)
    if (!summary) errors.push(`${relativePath}: 缺少 summary`)
    if (summary.length > 300) errors.push(`${relativePath}: summary 超过 300 个字符`)
    if (tags.length === 0) errors.push(`${relativePath}: tags 不能为空`)
    if (!contentMarkdown) errors.push(`${relativePath}: 正文为空`)
    if (sortOrder !== null && !Number.isFinite(sortOrder)) errors.push(`${relativePath}: sortOrder 不合法`)

    const wordCount = calculateWordCount(contentMarkdown)
    records.push({
      relativePath,
      title,
      sourceSlug,
      targetSlug,
      summary,
      tags,
      cover: String(data.cover || '').trim(),
      categoryPath: [...CATEGORY_PREFIX, ...directoryParts],
      sortOrder,
      contentMarkdown,
      contentHash: hashContent(contentMarkdown),
      wordCount,
      readingMinutes: calculateReadingMinutes(wordCount),
      originalId: String(data.originalId || '').trim(),
      identityOverride
    })
  }

  const duplicateTargets = new Map()
  records.forEach((item) => {
    if (!duplicateTargets.has(item.targetSlug)) duplicateTargets.set(item.targetSlug, [])
    duplicateTargets.get(item.targetSlug).push(item)
  })
  duplicateTargets.forEach((items, slug) => {
    if (items.length > 1) errors.push(`目标 slug 重复 ${slug}: ${items.map((item) => item.relativePath).join('、')}`)
  })
  if (errors.length > 0) {
    throw new Error(`AI 工具文章源文件校验失败:\n${errors.map((item) => `- ${item}`).join('\n')}`)
  }
  return records.sort((left, right) => left.relativePath.localeCompare(right.relativePath, 'zh-Hans-CN'))
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

function collectBranchIds(categories, rootId) {
  const children = new Map()
  categories.forEach((item) => {
    const parentId = item.parent ? String(item.parent) : null
    if (!children.has(parentId)) children.set(parentId, [])
    children.get(parentId).push(String(item._id))
  })
  const ids = new Set(rootId ? [String(rootId)] : [])
  const queue = [...ids]
  while (queue.length > 0) {
    for (const childId of children.get(queue.shift()) || []) {
      if (ids.has(childId)) continue
      ids.add(childId)
      queue.push(childId)
    }
  }
  return ids
}

function currentTagNames(article) {
  return (article.tags || []).map((item) => item.name || '').filter(Boolean).sort()
}

function changedFields(record, article, categoryMaps) {
  const changed = []
  if (record.title !== article.title) changed.push('title')
  if (record.summary !== String(article.summary || '')) changed.push('summary')
  if (record.cover !== String(article.cover || '')) changed.push('cover')
  if (record.contentMarkdown !== String(article.contentMarkdown || '').trim()) changed.push('contentMarkdown')
  if (record.categoryPath.join('/') !== (categoryMaps.pathById.get(String(article.category)) || []).join('/')) {
    changed.push('category')
  }
  if (JSON.stringify([...record.tags].sort()) !== JSON.stringify(currentTagNames(article))) changed.push('tags')
  if (record.sortOrder !== null && record.sortOrder !== Number(article.sortOrder || 0)) changed.push('sortOrder')
  return changed
}

function buildPlan(records, aiArticles, categoryMaps) {
  const byId = new Map(aiArticles.map((item) => [String(item._id), item]))
  const bySlug = new Map(aiArticles.map((item) => [item.slug, item]))
  const matchedIds = new Set()
  const localOnly = []
  const items = []

  for (const record of records) {
    if (!record.originalId && !record.identityOverride) {
      localOnly.push(record)
      continue
    }
    const idMatch = record.originalId ? byId.get(record.originalId) : null
    const slugMatch = bySlug.get(record.targetSlug)
    if (!record.identityOverride && idMatch && slugMatch && String(idMatch._id) !== String(slugMatch._id)) {
      throw new Error(`ID 与 slug 指向不同文章: ${record.relativePath}`)
    }
    const existing = record.identityOverride ? slugMatch : (idMatch || slugMatch)
    if (!existing) throw new Error(`找不到目标数据库文章: ${record.relativePath} -> ${record.targetSlug}`)
    if (matchedIds.has(String(existing._id))) throw new Error(`多个源文件匹配同一文章: ${existing.title}`)
    matchedIds.add(String(existing._id))
    const fields = changedFields(record, existing, categoryMaps)
    items.push({ record, existing, changedFields: fields, action: fields.length > 0 ? 'update' : 'unchanged' })
  }
  return {
    items,
    localOnly,
    unmatchedDatabase: aiArticles.filter((item) => !matchedIds.has(String(item._id)))
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

async function createBackup(aiArticles) {
  const backupDir = path.join(env.rootDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, `ai-tool-articles-before-${stamp}.ejson`)
  const data = {
    createdAt: new Date(),
    sourceRoot: SOURCE_ROOT,
    collections: {
      articles: aiArticles.map((item) => item.toObject({ depopulate: true })),
      categories: await Category.find({}).lean(),
      tags: await Tag.find({}).lean()
    }
  }
  fs.writeFileSync(backupPath, mongoose.mongo.BSON.EJSON.stringify(data, null, 2, { relaxed: false }), 'utf8')
  return backupPath
}

function buildReport(records, plan, categoryMaps, allTags) {
  const syncRecords = plan.items.map((item) => item.record)
  const requiredCategories = [...new Set(syncRecords.map((item) => item.categoryPath.join('/')))]
  const currentTagNames = new Set(allTags.map((item) => item.name))
  return {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? 'apply' : 'dry-run',
    sourceRoot: SOURCE_ROOT,
    summary: {
      sourceArticles: records.length,
      matchedArticles: plan.items.length,
      unchanged: plan.items.filter((item) => item.action === 'unchanged').length,
      update: plan.items.filter((item) => item.action === 'update').length,
      localOnly: plan.localOnly.length,
      unmatchedDatabase: plan.unmatchedDatabase.length,
      identityOverrides: plan.items.filter((item) => item.record.identityOverride).length,
      missingCategories: requiredCategories.filter((item) => !categoryMaps.byPath.has(item)).length,
      missingTags: [...new Set(syncRecords.flatMap((item) => item.tags))].filter((item) => !currentTagNames.has(item)).length
    },
    items: plan.items.map((item) => ({
      sourcePath: item.record.relativePath,
      sourceSlug: item.record.sourceSlug,
      targetSlug: item.record.targetSlug,
      existingId: item.existing._id.toString(),
      existingStatus: item.existing.status,
      action: item.action,
      changedFields: item.changedFields,
      identityOverrideReason: item.record.identityOverride?.reason || ''
    })),
    localOnly: plan.localOnly.map((item) => ({ sourcePath: item.relativePath, title: item.title, slug: item.sourceSlug })),
    unmatchedDatabase: plan.unmatchedDatabase.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      slug: item.slug,
      status: item.status
    }))
  }
}

async function applyPlan(plan, categoryMaps, adminUser, aiArticles) {
  if (plan.unmatchedDatabase.length > 0) throw new Error('数据库存在未匹配 AI 工具文章，拒绝 apply')
  const backupPath = await createBackup(aiArticles)
  const tagByName = await ensureTags(plan.items.map((item) => item.record))
  const now = new Date()
  for (const item of plan.items) {
    if (item.action === 'unchanged') continue
    const { record, existing } = item
    existing.title = record.title
    existing.summary = record.summary
    existing.cover = record.cover
    existing.contentMarkdown = record.contentMarkdown
    existing.contentMode = 'markdown'
    existing.category = categoryMaps.byPath.get(record.categoryPath.join('/'))._id
    existing.tags = record.tags.map((name) => tagByName.get(name)._id)
    if (record.sortOrder !== null) existing.sortOrder = record.sortOrder
    existing.wordCount = record.wordCount
    existing.readingMinutes = record.readingMinutes
    existing.source = 'manual'
    existing.sourcePath = `AI工具/${record.relativePath}`
    existing.sourceHash = record.contentHash
    existing.importedAt = now
    existing.updatedBy = adminUser._id
    existing.deletedAt = null
    await existing.save()
  }
  await rebuildCounts()
  return backupPath
}

async function main() {
  console.log(`模式: ${APPLY ? 'apply' : 'dry-run'}`)
  console.log(`AI 工具本地源: ${SOURCE_ROOT}`)
  const records = parseSourceArticles()
  await connectDatabase()
  const [categories, allTags, allArticles, adminUser] = await Promise.all([
    Category.find({}),
    Tag.find({}),
    Article.find({ deletedAt: null }).populate('tags', 'name'),
    findPreferredArticleAuthor()
  ])
  const categoryMaps = buildCategoryMaps(categories)
  const rootCategory = categoryMaps.byPath.get(CATEGORY_PREFIX.join('/'))
  if (!rootCategory) throw new Error(`数据库缺少分类: ${CATEGORY_PREFIX.join('/')}`)
  const branchIds = collectBranchIds(categories, rootCategory._id)
  const aiArticles = allArticles.filter((item) => branchIds.has(String(item.category)))
  const existingWriterId = aiArticles.find((item) => item.updatedBy || item.createdBy)?.updatedBy ||
    aiArticles.find((item) => item.createdBy)?.createdBy
  const writeUser = adminUser || (existingWriterId ? await User.findById(existingWriterId) : null)
  const plan = buildPlan(records, aiArticles, categoryMaps)
  const report = buildReport(records, plan, categoryMaps, allTags)
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
  if (!writeUser) throw new Error('数据库中没有可用的文章维护账号')
  if (report.summary.missingCategories > 0) throw new Error('本地分类路径在线上不存在，拒绝 apply')
  const backupPath = await applyPlan(plan, categoryMaps, writeUser, aiArticles)
  console.log(`替换完成，备份: ${backupPath}`)
}

main()
  .catch((error) => {
    console.error('AI 工具文章替换失败:', error)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
