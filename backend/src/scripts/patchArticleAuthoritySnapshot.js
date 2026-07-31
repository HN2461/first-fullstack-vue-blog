/**
 * 将本地权威快照以“增量补丁”方式应用到目标数据库。
 * 只更新既有文章的内容与运营展示字段，不创建/删除文章或分类，不触碰 RBAC 菜单。
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import mongoose from 'mongoose'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'
import { Tag } from '#modules/content/models/Tag.js'
import { readArticleExportSnapshot } from '#modules/content/services/articleSnapshot.service.js'
import { calculateReadingMinutes, calculateWordCount, generateAsciiSlug } from '#modules/content/services/legacyMigration.service.js'

const rawArgs = process.argv.slice(2)
const APPLY = rawArgs.includes('--apply')
const TARGET = rawArgs.find((item) => item.startsWith('--target='))?.slice(9) || 'local'
const CONFIRM = rawArgs.includes('--confirm-production-article-patch')
const PATCH_TAGS = !rawArgs.includes('--skip-tags')
const SLUGS = [...new Set((rawArgs.find((item) => item.startsWith('--slugs='))?.slice(8) || '').split(',').filter(Boolean))]
const EXPORT_ROOT = path.resolve(process.env.ARTICLE_EXPORT_DIR || path.join(env.rootDir, '../output/线上文章'))
const REPORT_ROOT = path.resolve(
  process.env.ARTICLE_REPORT_DIR || path.join(env.rootDir, '../docs/02-开发指南/文章同步报告')
)
const REPORT_BASENAME = process.env.ARTICLE_PATCH_REPORT || 'article-authority-patch-latest'

function hash(value) {
  return crypto.createHash('sha256').update(String(value || '').trim()).digest('hex')
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function normalizeTags(value) {
  return [...new Set((value || []).map((item) => String(item || '').trim()).filter(Boolean))].sort()
}

function buildCategoryPathMap(categories) {
  const byId = new Map(categories.map((item) => [String(item._id), item]))
  const result = new Map()
  function resolve(item, seen = new Set()) {
    const id = String(item._id)
    if (result.has(id)) return result.get(id)
    if (seen.has(id)) return []
    seen.add(id)
    const parent = item.parent ? byId.get(String(item.parent)) : null
    const value = [...(parent ? resolve(parent, seen) : []), item.name]
    result.set(id, value)
    return value
  }
  categories.forEach((item) => resolve(item))
  return result
}

function getRemoteValues(article, categoryPathMap, tagById) {
  return {
    title: String(article.title || ''),
    summary: String(article.summary || ''),
    cover: String(article.cover || ''),
    contentHash: article.contentMode === 'markdown' ? hash(article.contentMarkdown) : null,
    categoryPath: categoryPathMap.get(String(article.category)) || [],
    tags: normalizeTags((article.tags || []).map((id) => tagById.get(String(id))).filter(Boolean)),
    status: article.status,
    sortOrder: Number(article.sortOrder) || 0
  }
}

function getLocalValues(record) {
  return {
    title: String(record.title || ''),
    summary: String(record.metadata?.summary ?? record.data?.summary ?? ''),
    cover: String(record.metadata?.cover ?? record.data?.cover ?? ''),
    contentHash: record.contentMode === 'markdown' ? hash(record.contentMarkdown) : null,
    contentMarkdown: record.contentMode === 'markdown' ? String(record.contentMarkdown || '') : '',
    categoryPath: record.categoryPath || [],
    tags: normalizeTags(record.tags || []),
    status: record.status,
    sortOrder: Number(record.sortOrder) || 0
  }
}

function diffFields(local, remote, contentMode) {
  const fields = ['title', 'summary', 'cover', 'status', 'sortOrder']
  if (PATCH_TAGS) fields.push('tags')
  if (contentMode === 'markdown') fields.push('contentHash')
  return fields.filter((field) => !same(local[field], remote[field]))
}

function createSlugFactory(tags) {
  const used = new Set(tags.map((item) => item.slug).filter(Boolean))
  return (name) => {
    const base = generateAsciiSlug([name], name, 48)
    let candidate = base
    let index = 1
    while (used.has(candidate)) {
      index += 1
      candidate = `${base}-${index}`
    }
    used.add(candidate)
    return candidate
  }
}

function assertTarget() {
  if (!['local', 'production'].includes(TARGET)) throw new Error(`不支持的目标: ${TARGET}`)
  if (!APPLY) return
  if (env.nodeEnv === 'production' && TARGET !== 'production') throw new Error('生产写入必须指定 --target=production')
  if (TARGET === 'production' && (env.nodeEnv !== 'production' || !CONFIRM)) {
    throw new Error('生产文章补丁必须传入 --confirm-production-article-patch')
  }
}

function buildPlan(snapshot, articles, categories, tags) {
  const categoryPathMap = buildCategoryPathMap(categories)
  const tagById = new Map(tags.map((item) => [String(item._id), item.name]))
  const tagByName = new Map(tags.map((item) => [item.name, item]))
  const byId = new Map(articles.map((item) => [String(item._id), item]))
  const bySlug = new Map(articles.map((item) => [item.slug, item]))
  const missingTagNames = new Set()
  const items = snapshot.records.map((record) => {
    const idMatch = byId.get(String(record.originalId)) || null
    const slugMatch = bySlug.get(record.originalSlug) || null
    const identityConflict = idMatch && slugMatch && String(idMatch._id) !== String(slugMatch._id)
    const remoteArticle = idMatch || slugMatch || null
    const local = getLocalValues(record)
    const remote = remoteArticle ? getRemoteValues(remoteArticle, categoryPathMap, tagById) : null
    if (PATCH_TAGS) {
      local.tags.forEach((name) => {
        if (!tagByName.has(name)) missingTagNames.add(name)
      })
    }
    const categoryMismatch = remote ? !same(local.categoryPath, remote.categoryPath) : false
    const changedFields = remote ? diffFields(local, remote, record.contentMode) : []
    return {
      originalId: String(record.originalId),
      slug: record.originalSlug,
      title: record.title,
      fileName: record.fileName,
      contentMode: record.contentMode,
      existing: remoteArticle ? { id: String(remoteArticle._id), updatedAt: remoteArticle.updatedAt } : null,
      local,
      remote,
      changedFields,
      blocked: identityConflict || !remoteArticle || categoryMismatch,
      blockReason: identityConflict
        ? '文章身份冲突'
        : !remoteArticle
          ? '目标数据库缺少文章'
          : categoryMismatch
            ? '分类路径不一致，拒绝由文章补丁脚本处理'
            : ''
    }
  })
  const snapshotIds = new Set(snapshot.records.map((item) => String(item.originalId)))
  const remoteOnly = articles.filter((item) => !snapshotIds.has(String(item._id)) && !item.deletedAt).map((item) => ({
    id: String(item._id),
    slug: item.slug,
    title: item.title
  }))
  return {
    generatedAt: new Date().toISOString(),
    target: env.nodeEnv === 'production' ? 'production' : 'local',
    snapshotRoot: EXPORT_ROOT,
    summary: {
      inspected: items.length,
      updates: items.filter((item) => item.changedFields.length > 0 && !item.blocked).length,
      markdownUpdates: items.filter((item) => item.contentMode === 'markdown' && item.changedFields.length > 0 && !item.blocked).length,
      documentUpdates: items.filter((item) => item.contentMode === 'document' && item.changedFields.length > 0 && !item.blocked).length,
      blocked: items.filter((item) => item.blocked).length,
      remoteOnly: remoteOnly.length,
      missingTags: PATCH_TAGS ? missingTagNames.size : 0
    },
    patchTags: PATCH_TAGS,
    missingTags: PATCH_TAGS ? [...missingTagNames].sort() : [],
    items,
    remoteOnly
  }
}

function writeReport(plan) {
  fs.mkdirSync(REPORT_ROOT, { recursive: true })
  const jsonPath = path.join(REPORT_ROOT, `${REPORT_BASENAME}.json`)
  const markdownPath = path.join(REPORT_ROOT, `${REPORT_BASENAME}.md`)
  const rows = plan.items
    .filter((item) => item.changedFields.length > 0 || item.blocked)
    .slice(0, 300)
    .map((item) => `| ${item.slug} | ${item.title} | ${item.changedFields.join('、') || '-'} | ${item.blockReason || '-'} |`)
  const lines = [
    '# 文章权威快照增量补丁预览',
    '',
    `- 生成时间：${plan.generatedAt}`,
    `- 目标：${plan.target}`,
    `- 已核验：${plan.summary.inspected}`,
    `- 待更新：${plan.summary.updates}`,
    `- Markdown 待更新：${plan.summary.markdownUpdates}`,
    `- 文档型待更新：${plan.summary.documentUpdates}`,
    `- 阻断：${plan.summary.blocked}`,
    `- 仅目标数据库存在：${plan.summary.remoteOnly}`,
    `- 待创建标签：${plan.summary.missingTags}`,
    `- 是否同步标签：${plan.patchTags ? '是' : '否'}`,
    '',
    '## 变更明细',
    '',
    '| slug | 标题 | 字段 | 阻断原因 |',
    '| --- | --- | --- | --- |',
    ...rows,
    ''
  ]
  fs.writeFileSync(jsonPath, `${JSON.stringify(plan, null, 2)}\n`, 'utf8')
  fs.writeFileSync(markdownPath, lines.join('\n'), 'utf8')
  return { jsonPath, markdownPath }
}

async function backup(items, missingTags) {
  const directory = path.join(env.rootDir, 'backups')
  fs.mkdirSync(directory, { recursive: true })
  const file = path.join(directory, `article-patch-before-${new Date().toISOString().replace(/[:.]/g, '-')}.ejson`)
  const ids = items.map((item) => new mongoose.Types.ObjectId(item.existing.id))
  const tagNames = missingTags.map((name) => String(name))
  fs.writeFileSync(file, mongoose.mongo.BSON.EJSON.stringify({
    createdAt: new Date(),
    target: TARGET,
    articles: await Article.find({ _id: { $in: ids } }).lean(),
    tags: await Tag.find({ name: { $in: tagNames } }).lean()
  }, null, 2, { relaxed: false }), 'utf8')
  return file
}

async function ensureTags(tags, missingTags) {
  const tagByName = new Map(tags.map((item) => [item.name, item]))
  if (missingTags.length > 0) {
    const nextSlug = createSlugFactory(tags)
    const created = await Tag.insertMany(missingTags.map((name, index) => ({
      name,
      slug: nextSlug(name),
      color: '#2852b8',
      status: 'active',
      sortOrder: (tags.length + index) * 10,
      articleCount: 0
    })))
    created.forEach((tag) => tagByName.set(tag.name, tag))
  }
  return tagByName
}

function buildPayload(item, tagByName) {
  const payload = {
    title: item.local.title,
    summary: item.local.summary,
    cover: item.local.cover,
    status: item.local.status,
    sortOrder: item.local.sortOrder
  }
  if (PATCH_TAGS) payload.tags = item.local.tags.map((name) => tagByName.get(name)?._id).filter(Boolean)
  if (item.contentMode === 'markdown') {
    payload.contentMarkdown = item.local.contentMarkdown
    payload.sourceHash = item.local.contentHash
    const wordCount = calculateWordCount(item.local.contentMarkdown)
    payload.wordCount = wordCount
    payload.readingMinutes = calculateReadingMinutes(wordCount)
  }
  return payload
}

async function recalculateTagCounts() {
  const tags = await Tag.find({}).select('_id').lean()
  await Promise.all(tags.map(async (tag) => {
    const articleCount = await Article.countDocuments({ deletedAt: null, tags: tag._id })
    await Tag.updateOne({ _id: tag._id }, { $set: { articleCount } })
  }))
}

async function main() {
  assertTarget()
  const snapshot = readArticleExportSnapshot(EXPORT_ROOT)
  await connectDatabase()
  const [articles, categories, tags] = await Promise.all([
    Article.find({ deletedAt: null }).lean(),
    Category.find({}).lean(),
    Tag.find({}).lean()
  ])
  const plan = buildPlan(snapshot, articles, categories, tags)
  const selected = SLUGS.length > 0 ? plan.items.filter((item) => SLUGS.includes(item.slug)) : plan.items
  if (SLUGS.some((slug) => !selected.some((item) => item.slug === slug))) throw new Error('指定 slug 不在权威快照中')
  const blocked = selected.filter((item) => item.blocked)
  const updates = selected.filter((item) => item.changedFields.length > 0 && !item.blocked)
  plan.selected = { slugs: SLUGS, updates: updates.length, blocked: blocked.length }
  const paths = writeReport(plan)
  console.log(`模式: ${APPLY ? 'apply' : 'dry-run'}，待更新: ${updates.length}，阻断: ${blocked.length}，缺失标签: ${plan.missingTags.length}，仅目标: ${plan.remoteOnly.length}`)
  console.log(`报告: ${paths.markdownPath}`)
  if (!APPLY) {
    if (blocked.length > 0 || plan.remoteOnly.length > 0) process.exitCode = 2
    return
  }
  if (blocked.length > 0) throw new Error('存在身份冲突、缺失文章或分类路径不一致，拒绝写入')
  if (plan.remoteOnly.length > 0) throw new Error('目标数据库存在快照外文章，拒绝写入')
  const backupPath = await backup(updates, plan.missingTags)
  const tagByName = PATCH_TAGS ? await ensureTags(tags, plan.missingTags) : new Map(tags.map((tag) => [tag.name, tag]))
  for (const item of updates) {
    const result = await Article.updateOne(
      { _id: item.existing.id, updatedAt: new Date(item.existing.updatedAt) },
      { $set: buildPayload(item, tagByName) }
    )
    if (result.modifiedCount !== 1) throw new Error(`文章在预览后发生变化，拒绝覆盖: ${item.slug}`)
  }
  if (PATCH_TAGS) await recalculateTagCounts()
  console.log(`文章补丁完成: ${updates.length} 篇，备份: ${backupPath}`)
}

main()
  .catch((error) => {
    console.error('文章权威快照补丁失败:', error)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
