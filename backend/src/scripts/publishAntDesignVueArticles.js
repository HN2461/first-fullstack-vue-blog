/**
 * 将 Ant Design Vue 学习系列作为新文章发布。
 * 默认只预览；只有同时传入 --apply --publish 才会写入数据库。
 * 已存在的 slug 只允许内容完全一致时跳过，不会覆盖已有文章。
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
import {
  calculateReadingMinutes,
  calculateWordCount,
  contentHash,
  generateAsciiSlug
} from '#modules/content/services/legacyMigration.service.js'
import { findPreferredArticleAuthor } from '#utils/articleAuthor.js'

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const PUBLISH = args.includes('--publish')
const TARGET = args.find((item) => item.startsWith('--target='))?.slice('--target='.length) || 'local'
const CONFIRM_PRODUCTION = args.includes('--confirm-production-content-sync')
const CATEGORY_PATH = ['前端技术', '组件库', 'Ant Design Vue']
const UNIMPORTED_SOURCE_ROOT = path.resolve(
  path.join(env.rootDir, '../output/未导入线上/前端技术/组件库/Ant Design Vue')
)
const PUBLISHED_SOURCE_ROOT = path.resolve(
  path.join(env.rootDir, '../output/线上文章/前端技术/组件库/Ant-Design-Vue')
)
const SOURCE_ROOT = path.resolve(
  process.env.ANT_DESIGN_VUE_SOURCE_ROOT ||
  args.find((item) => item.startsWith('--source-root='))?.slice('--source-root='.length) ||
  (fs.existsSync(UNIMPORTED_SOURCE_ROOT) ? UNIMPORTED_SOURCE_ROOT : PUBLISHED_SOURCE_ROOT)
)
const EXPECTED_UNIMPORTED_FILES = [
  '01-快速认识与学习路线.md',
  '02-安装注册与按需导入.md',
  '03-组件模板语法与数据绑定.md',
  '04-ConfigProvider国际化与主题.md',
  '05-App组件与上下文消息弹窗通知.md',
  '06-表单校验与提交流程.md',
  '07-表格分页筛选与排序.md',
  '08-Modal与Drawer交互和表单组合.md',
  '09-常用数据展示组件指南.md',
  '10-项目落地规范常见错误与练习.md',
  'README.md'
]
const EXPECTED_SLUGS = [
  'ant-design-vue-overview-learning-roadmap',
  'ant-design-vue-install-registration-on-demand',
  'ant-design-vue-template-props-events-data-binding',
  'ant-design-vue-config-provider-locale-theme',
  'ant-design-vue-app-useapp-context-feedback',
  'ant-design-vue-form-validation-submit',
  'ant-design-vue-table-pagination-filter-sort',
  'ant-design-vue-modal-drawer-form',
  'ant-design-vue-data-display-components',
  'ant-design-vue-project-practices-exercises'
]
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

if (APPLY !== PUBLISH) {
  throw new Error('写入发布必须同时传入 --apply --publish；无参数时只执行 dry-run')
}
if (!['local', 'production'].includes(TARGET)) {
  throw new Error('--target 只支持 local 或 production')
}
if (TARGET === 'production' && (env.nodeEnv !== 'production' || !CONFIRM_PRODUCTION)) {
  throw new Error('生产发布必须在 NODE_ENV=production 的服务器上同时传入 --target=production --confirm-production-content-sync')
}
if (env.nodeEnv === 'production' && TARGET !== 'production') {
  throw new Error('检测到生产运行环境；必须明确传入 --target=production')
}

function normalizeTags(value) {
  const values = Array.isArray(value) ? value : String(value || '').split(/[,，、\n]/)
  return [...new Set(values.map((item) => String(item || '').trim()).filter(Boolean))]
}

function listSourceFiles() {
  if (!fs.existsSync(SOURCE_ROOT)) throw new Error(`文章目录不存在：${SOURCE_ROOT}`)

  const files = fs.readdirSync(SOURCE_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.md$/i.test(entry.name))
    .map((entry) => entry.name)
  const articleFiles = files.filter((name) => name !== 'README.md')
  if (files.length !== 11 || articleFiles.length !== EXPECTED_SLUGS.length || !files.includes('README.md')) {
    throw new Error(`文章文件清单与预期不一致：${files.sort().join('、')}`)
  }

  if (SOURCE_ROOT === UNIMPORTED_SOURCE_ROOT) {
    const actual = new Set(files)
    if (EXPECTED_UNIMPORTED_FILES.some((name) => !actual.has(name))) {
      throw new Error(`未导入目录文件清单与预期不一致：${files.sort().join('、')}`)
    }
  }

  return articleFiles.map((name) => path.join(SOURCE_ROOT, name))
}

function parseSourceRecord(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')
  const parsed = matter(raw)
  const data = parsed.data || {}
  const title = String(data.title || '').trim()
  const slug = String(data.slug || '').trim().toLowerCase()
  const summary = String(data.summary || '').trim()
  const categoryPath = Array.isArray(data.categoryPath)
    ? data.categoryPath.map((item) => String(item).trim())
    : []
  const tags = normalizeTags(data.tags)
  const sortOrder = Number(data.sortOrder)
  const expectedSortOrder = (EXPECTED_SLUGS.indexOf(slug) + 1) * 10
  const contentMarkdown = String(parsed.content || '').trim()
  const relativePath = path.basename(filePath)
  const errors = []

  if (!title || title.length > 120) errors.push('title 为空或超过 120 个字符')
  if (!SLUG_PATTERN.test(slug)) errors.push(`slug 不合法：${slug || '空'}`)
  if (!summary || summary.length > 300) errors.push('summary 为空或超过 300 个字符')
  if (!contentMarkdown) errors.push('正文为空')
  if (JSON.stringify(categoryPath) !== JSON.stringify(CATEGORY_PATH)) errors.push('categoryPath 不符合指定分类')
  if (String(data.category || '').trim() !== CATEGORY_PATH.at(-1)) errors.push('category 与分类路径末级不一致')
  if (tags.length === 0 || tags.some((tag) => tag.length > 32)) errors.push('tags 为空或包含超过 32 个字符的标签')
  if (expectedSortOrder < 10 || sortOrder !== expectedSortOrder) {
    errors.push(`文章 slug 不在预期系列中，或 sortOrder 不为 ${expectedSortOrder}`)
  }
  if (data.status !== 'published') errors.push('status 必须是 published')

  try {
    assertArticlePublishable({
      title,
      summary,
      contentMode: 'markdown',
      contentMarkdown,
      category: new mongoose.Types.ObjectId()
    })
  } catch (error) {
    errors.push(error.message)
  }

  if (errors.length > 0) throw new Error(`${relativePath}: ${errors.join('；')}`)

  return {
    title,
    slug,
    summary,
    tags,
    sortOrder,
    contentMarkdown,
    sourceHash: contentHash(contentMarkdown),
    sourcePath: `前端技术/组件库/Ant Design Vue/${relativePath}`
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
  return {
    pathById,
    byPath: new Map(categories.map((category) => [resolve(category).join('/'), category]))
  }
}

function sameValues(left, right) {
  return [...left].sort().join('\n') === [...right].sort().join('\n')
}

function auditRecords(records, articles, categoryMaps, tags) {
  const bySlug = new Map(articles.map((article) => [article.slug, article]))
  const tagNamesById = new Map(tags.map((tag) => [String(tag._id), tag.name]))
  const titles = new Map()

  articles.forEach((article) => {
    if (!titles.has(article.title)) titles.set(article.title, [])
    titles.get(article.title).push(article)
  })

  const seenSlugs = new Set()
  return records.map((record) => {
    if (seenSlugs.has(record.slug)) throw new Error(`专题内 slug 重复：${record.slug}`)
    seenSlugs.add(record.slug)

    const existing = bySlug.get(record.slug)
    const sameTitle = titles.get(record.title) || []
    if (!existing && sameTitle.length > 0) {
      throw new Error(`${record.title}: 标题已存在但 slug 不同，停止自动发布`)
    }
    if (existing?.deletedAt) throw new Error(`${record.slug}: 存在已删除的同 slug 文章，需人工确认`)

    const currentPath = existing?.category
      ? categoryMaps.pathById.get(String(existing.category)) || []
      : []
    const currentTags = (existing?.tags || [])
      .map((id) => tagNamesById.get(String(id)))
      .filter(Boolean)
    const unchanged = existing &&
      existing.status === 'published' &&
      existing.title === record.title &&
      String(existing.summary || '') === record.summary &&
      String(existing.contentMarkdown || '').trim() === record.contentMarkdown &&
      String(existing.sourceHash || '') === record.sourceHash &&
      Number(existing.sortOrder || 0) === record.sortOrder &&
      currentPath.join('/') === CATEGORY_PATH.join('/') &&
      sameValues(currentTags, record.tags)

    if (existing && !unchanged) {
      throw new Error(`${record.slug}: 已存在内容不一致的文章，停止发布以保护现有内容`)
    }

    return { record, existing: existing || null, action: unchanged ? 'unchanged' : 'create-and-publish' }
  })
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

async function ensureCategory(categories) {
  const maps = buildCategoryPaths(categories)
  const fullPath = CATEGORY_PATH.join('/')
  const existingCategory = maps.byPath.get(fullPath)
  if (existingCategory) {
    if (existingCategory.status !== 'active') {
      throw new Error(`目标分类当前不是 active 状态：${fullPath}`)
    }
    return existingCategory
  }

  const parentPath = CATEGORY_PATH.slice(0, -1).join('/')
  const parent = maps.byPath.get(parentPath)
  if (!parent) throw new Error(`缺少上级分类：${parentPath}`)
  if (parent.status !== 'active') throw new Error(`上级分类当前不是 active 状态：${parentPath}`)
  const siblings = categories.filter((category) => String(category.parent || '') === String(parent._id))
  const sortOrder = Math.max(0, ...siblings.map((category) => Number(category.sortOrder) || 0)) + 10

  return Category.create({
    name: CATEGORY_PATH.at(-1),
    slug: await ensureUniqueSlug(Category, generateAsciiSlug(CATEGORY_PATH, fullPath, 70)),
    description: 'Ant Design Vue 4.x 组件库入门、常用组件与 Vue 项目实践。',
    parent: parent._id,
    sortOrder,
    status: 'active'
  })
}

async function ensureTags(records) {
  const names = [...new Set(records.flatMap((item) => item.tags))]
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

async function createBackup(category, tags, articles) {
  const backupDir = path.join(env.rootDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, `ant-design-vue-before-${stamp}.ejson`)
  const data = {
    createdAt: new Date(),
    sourceRoot: SOURCE_ROOT,
    collections: {
      articles: articles.map((article) => article.toObject()),
      categories: category ? [category.toObject()] : [],
      tags: tags.map((tag) => tag.toObject())
    }
  }
  fs.writeFileSync(backupPath, mongoose.mongo.BSON.EJSON.stringify(data, null, 2, { relaxed: false }), 'utf8')
  return backupPath
}

async function main() {
  const records = listSourceFiles().map((filePath) => parseSourceRecord(filePath))
    .sort((left, right) => left.sortOrder - right.sortOrder)
  if (JSON.stringify(records.map((record) => record.slug)) !== JSON.stringify(EXPECTED_SLUGS)) {
    throw new Error('文章 slug 集合与 Ant Design Vue 专题预期不一致')
  }
  const duplicateSlugs = records.map((record) => record.slug)
    .filter((slug, index, values) => values.indexOf(slug) !== index)
  if (duplicateSlugs.length > 0) throw new Error(`专题内存在重复 slug：${[...new Set(duplicateSlugs)].join('、')}`)

  await connectDatabase()
  const slugs = records.map((record) => record.slug)
  const [categories, tags, articles] = await Promise.all([
    Category.find({}),
    Tag.find({}),
    Article.find({
      $or: [
        { slug: { $in: slugs } },
        { title: { $in: records.map((record) => record.title) } }
      ]
    })
  ])
  const categoryMaps = buildCategoryPaths(categories)
  if (!categoryMaps.byPath.has(CATEGORY_PATH.slice(0, -1).join('/'))) {
    throw new Error(`缺少上级分类：${CATEGORY_PATH.slice(0, -1).join('/')}`)
  }

  const items = auditRecords(records, articles, categoryMaps, tags)
  const missingCategory = !categoryMaps.byPath.has(CATEGORY_PATH.join('/'))
  const existingTagNames = new Set(tags.map((tag) => tag.name))
  const missingTags = [...new Set(records.flatMap((record) => record.tags))]
    .filter((name) => !existingTagNames.has(name))
  const report = {
    mode: APPLY ? 'publish' : 'dry-run',
    target: TARGET,
    sourceRoot: SOURCE_ROOT,
    categoryPath: CATEGORY_PATH,
    summary: {
      sourceArticles: records.length,
      createAndPublish: items.filter((item) => item.action === 'create-and-publish').length,
      unchanged: items.filter((item) => item.action === 'unchanged').length,
      createCategory: Number(missingCategory),
      createTags: missingTags.length
    },
    items: items.map(({ record, action }) => ({
      title: record.title,
      slug: record.slug,
      sortOrder: record.sortOrder,
      action
    })),
    missingTags
  }
  console.log(JSON.stringify(report, null, 2))
  if (!APPLY) {
    console.log('dry-run 完成，未写入数据库')
    return
  }

  const toCreate = items.filter((item) => item.action === 'create-and-publish')
  const adminUser = toCreate.length > 0 ? await findPreferredArticleAuthor() : null
  if (toCreate.length > 0 && !adminUser) {
    throw new Error('数据库中没有可用的管理员账号，不能记录发布人')
  }

  const targetTagNames = [...new Set(records.flatMap((record) => record.tags))]
  const targetTags = await Tag.find({ name: { $in: targetTagNames } })
  const targetCategory = categoryMaps.byPath.get(CATEGORY_PATH.join('/')) || null
  const backupPath = await createBackup(targetCategory, targetTags, articles)
  const category = await ensureCategory(categories)
  const tagByName = await ensureTags(records)
  const now = new Date()

  for (const { record } of toCreate) {
    const wordCount = calculateWordCount(record.contentMarkdown)
    const article = await Article.create({
      title: record.title,
      slug: record.slug,
      summary: record.summary,
      contentMarkdown: record.contentMarkdown,
      contentMode: 'markdown',
      category: category._id,
      tags: record.tags.map((name) => tagByName.get(name)._id),
      sortOrder: record.sortOrder,
      wordCount,
      readingMinutes: calculateReadingMinutes(wordCount),
      source: 'manual',
      sourcePath: record.sourcePath,
      sourceHash: record.sourceHash,
      importedAt: now,
      updatedBy: adminUser._id,
      createdBy: adminUser._id,
      deletedAt: null,
      status: 'published',
      publishedAt: now
    })
    assertArticlePublishable(article)
  }

  const publishedArticles = await Article.find({
    slug: { $in: slugs },
    deletedAt: null,
    status: 'published'
  }).select('_id tags').lean()
  const categoryCount = await Article.countDocuments({ category: category._id, deletedAt: null })
  await Category.updateOne({ _id: category._id }, { $set: { articleCount: categoryCount } })
  const tagIds = [...new Set(publishedArticles.flatMap((article) => article.tags.map(String)))]
  for (const tagId of tagIds) {
    const articleCount = await Article.countDocuments({ tags: tagId, deletedAt: null })
    await Tag.updateOne({ _id: tagId }, { $set: { articleCount } })
  }

  const publishedCount = await Article.countDocuments({
    slug: { $in: slugs },
    deletedAt: null,
    status: 'published'
  })
  if (publishedCount !== records.length) {
    throw new Error(`发布后数量校验失败：期望 ${records.length}，实际 ${publishedCount}`)
  }
  console.log(`核验完成：新增 ${toCreate.length} 篇，专题共 ${publishedCount} 篇；发布前备份：${backupPath}`)
}

main()
  .catch((error) => {
    console.error('Ant Design Vue 专题发布失败:', error)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
