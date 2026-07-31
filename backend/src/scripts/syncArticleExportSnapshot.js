/**
 * 将本地权威文章快照重建到指定数据库。
 * 默认只生成差异报告和数据库变更预览；只有 --apply 才会备份并写库。
 */

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import mongoose from 'mongoose'
import mammoth from 'mammoth'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { USER_ROLES } from '#constants/domain'
import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'
import { Tag } from '#modules/content/models/Tag.js'
import { User } from '#modules/user/models/User.js'
import { Media } from '#modules/media/models/Media.js'
import { Comment } from '#modules/interaction/models/Comment.js'
import { Reaction } from '#modules/interaction/models/Reaction.js'
import { SYSTEM_UNCATEGORIZED_CATEGORY } from '#modules/content/services/category.service.js'
import { calculateReadingMinutes, calculateWordCount, generateAsciiSlug } from '#modules/content/services/legacyMigration.service.js'
import { buildSnapshotDatabasePreview } from '#modules/content/services/articleSnapshotDatabasePreview.service.js'
import {
  buildArticleIdRemaps,
  createArticleSnapshotBackup,
  remapArticleRelations,
  removeOrphanArticleInteractions
} from '#modules/content/services/articleSnapshotRelations.service.js'
import {
  analyzeArticleRepository,
  buildRepositoryAnalysisMarkdown,
  readArticleExportSnapshot
} from '#modules/content/services/articleSnapshot.service.js'

const rawArgs = process.argv.slice(2)
const args = new Set(rawArgs)
const APPLY = args.has('--apply')
const PUBLISH_ALL = args.has('--publish-all')
const CLEAN_ORPHANS = args.has('--clean-orphans')
const CONFIRM_PRODUCTION = args.has('--confirm-production-replace')
const TARGET = rawArgs.find((item) => item.startsWith('--target='))?.slice('--target='.length) || 'local'
const EXPORT_ROOT = path.resolve(process.env.ARTICLE_EXPORT_DIR || path.join(env.rootDir, '../output/线上文章'))
const REPOSITORY_ROOT = path.resolve(process.env.ARTICLE_REPOSITORY_DIR || path.join(env.rootDir, '../output'))
const REPORT_ROOT = path.resolve(
  process.env.ARTICLE_REPORT_DIR || path.join(env.rootDir, '../docs/02-开发指南/文章同步报告')
)
const REPORT_BASENAME = process.env.ARTICLE_REPORT_BASENAME || 'article-sync-analysis-latest'
const SNAPSHOT_MEDIA_CATEGORY = '文章快照原始文档'

function makeObjectId(seed) {
  const hex = crypto.createHash('sha256').update(String(seed)).digest('hex').slice(0, 24)
  return new mongoose.Types.ObjectId(hex)
}

function safeFilename(value) {
  return String(value || 'document.docx')
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 120)
}

function createSlugFactory(existingSlugs = []) {
  const used = new Set(existingSlugs.filter(Boolean))
  return (base) => {
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

function buildCategoryDocuments(snapshot, localCategories) {
  const localPathMap = buildCategoryPathMap(localCategories)
  const localByPath = new Map(localCategories.map((item) => [
    localPathMap.get(String(item._id))?.join('/') || '',
    item
  ]))
  const paths = []
  const seen = new Set()
  snapshot.records.forEach((item) => {
    for (let depth = 1; depth <= item.categoryPath.length; depth += 1) {
      const categoryPath = item.categoryPath.slice(0, depth)
      const key = categoryPath.join('/')
      if (!seen.has(key)) {
        seen.add(key)
        paths.push(categoryPath)
      }
    }
  })

  const retainedSlugs = paths.map((item) => localByPath.get(item.join('/'))?.slug).filter(Boolean)
  const nextSlug = createSlugFactory([...retainedSlugs, SYSTEM_UNCATEGORIZED_CATEGORY.slug])
  const idByPath = new Map()
  const siblingOrder = new Map()
  const snapshotCategoryByPath = new Map((snapshot.manifest.categories || []).map((item) => [
    (item.categoryPath || []).join('/'),
    item
  ]))
  const now = new Date()
  const documents = paths.map((categoryPath) => {
    const key = categoryPath.join('/')
    const parentKey = categoryPath.slice(0, -1).join('/')
    const existing = localByPath.get(key)
    const metadata = snapshotCategoryByPath.get(key)
    const siblingIndex = siblingOrder.get(parentKey) || 0
    siblingOrder.set(parentKey, siblingIndex + 1)
    const _id = existing?._id || new mongoose.Types.ObjectId()
    idByPath.set(key, _id)
    return {
      _id,
      name: categoryPath.at(-1),
      slug: existing?.slug || nextSlug(generateAsciiSlug(categoryPath, key, 70)),
      description: metadata?.description ?? existing?.description ?? '',
      parent: parentKey ? idByPath.get(parentKey) : null,
      sortOrder: metadata?.sortOrder ?? existing?.sortOrder ?? siblingIndex * 10,
      status: metadata?.status || existing?.status || 'active',
      isSystem: false,
      articleCount: 0,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    }
  })

  const existingDefault = localByPath.get(SYSTEM_UNCATEGORIZED_CATEGORY.name)
  documents.unshift({
    _id: existingDefault?._id || new mongoose.Types.ObjectId(),
    ...SYSTEM_UNCATEGORIZED_CATEGORY,
    articleCount: 0,
    createdAt: existingDefault?.createdAt || now,
    updatedAt: now
  })
  return { documents, idByPath }
}

function buildTagDocuments(snapshot, localTags) {
  const names = [...new Set(snapshot.records.flatMap((item) => item.tags || []))]
  const localByName = new Map(localTags.map((item) => [item.name, item]))
  const retainedSlugs = names.map((name) => localByName.get(name)?.slug).filter(Boolean)
  const nextSlug = createSlugFactory(retainedSlugs)
  const idByName = new Map()
  const now = new Date()
  const documents = names.map((name, index) => {
    const existing = localByName.get(name)
    const _id = existing?._id || new mongoose.Types.ObjectId()
    idByName.set(name, _id)
    return {
      _id,
      name,
      slug: existing?.slug || nextSlug(generateAsciiSlug([name], name, 50)),
      description: existing?.description || '',
      color: existing?.color || '#2852b8',
      sortOrder: existing?.sortOrder ?? index * 10,
      status: 'active',
      articleCount: 0,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    }
  })
  return { documents, idByName }
}

async function buildDocumentPayload(record, adminUser, uploadRoot) {
  const originalName = record.metadata.originalName || path.basename(record.sourceFile)
  const mediaId = makeObjectId(`${record.originalId}:original-document`)
  const relativeDir = path.join('article-snapshot', String(record.manifestDate || '').slice(0, 10).replace(/-/g, '') || 'latest')
  const destinationDir = path.join(uploadRoot, relativeDir)
  const filename = `${record.originalId}-${safeFilename(originalName)}`
  const destination = path.join(destinationDir, filename)
  fs.mkdirSync(destinationDir, { recursive: true })
  fs.copyFileSync(record.sourceFile, destination)
  const stats = fs.statSync(destination)
  const extracted = await mammoth.extractRawText({ path: destination })
  const extractedText = String(extracted.value || '').replace(/\s+/g, ' ').trim()
  const url = `/${path.relative(env.rootDir, destination).replace(/\\/g, '/')}`
  return {
    media: {
      _id: mediaId,
      filename,
      originalName,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: stats.size,
      url,
      storagePath: destination.replace(/\\/g, '/'),
      kind: 'attachment',
      category: SNAPSHOT_MEDIA_CATEGORY,
      fileClass: 'document',
      uploader: adminUser._id,
      article: new mongoose.Types.ObjectId(record.originalId),
      deletedAt: null,
      deletedBy: null,
      createdAt: new Date(record.publishedAt || record.updatedAt || Date.now()),
      updatedAt: new Date(record.updatedAt || Date.now())
    },
    articleDocument: {
      originalMediaId: mediaId,
      originalName,
      originalUrl: url,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      previewMediaId: null,
      previewUrl: '',
      previewMimeType: '',
      extractedText,
      conversionStatus: 'ready',
      conversionMessage: '导出包未包含 PDF 阅读版，本地使用 DOCX 只读模式',
      convertedAt: new Date()
    }
  }
}

async function buildDatabaseDocuments(snapshot, localArticles, localCategories, localTags, adminUser) {
  const categories = buildCategoryDocuments(snapshot, localCategories)
  const tags = buildTagDocuments(snapshot, localTags)
  const uploadRoot = path.resolve(env.rootDir, env.uploadDir)
  const media = []
  const articles = []
  const localById = new Map(localArticles.map((item) => [String(item._id), item]))
  const localBySlug = new Map(localArticles.map((item) => [item.slug, item]))

  for (const record of snapshot.records) {
    const category = categories.idByPath.get((record.categoryPath || []).join('/')) || null
    const tagIds = (record.tags || []).map((name) => tags.idByName.get(name)).filter(Boolean)
    const isDocument = record.contentMode === 'document'
    const existing = localById.get(String(record.originalId)) || localBySlug.get(record.originalSlug)
    const content = isDocument ? '' : record.contentMarkdown
    const documentPayload = isDocument
      ? await buildDocumentPayload({ ...record, manifestDate: snapshot.manifest.exportedAt }, adminUser, uploadRoot)
      : null
    if (documentPayload) media.push(documentPayload.media)
    const wordCount = calculateWordCount(isDocument ? documentPayload.articleDocument.extractedText : content)
    const createdAt = existing?.createdAt || new mongoose.Types.ObjectId(record.originalId).getTimestamp()
    articles.push({
      _id: new mongoose.Types.ObjectId(record.originalId),
      title: String(record.title || '').slice(0, 120),
      slug: record.originalSlug,
      summary: String(record.metadata?.summary ?? record.data?.summary ?? '').slice(0, 300),
      contentMarkdown: content,
      contentMode: isDocument ? 'document' : 'markdown',
      document: documentPayload?.articleDocument,
      cover: String(record.data?.cover || ''),
      resources: existing?.resources || [],
      category,
      tags: tagIds,
      status: PUBLISH_ALL ? 'published' : record.status,
      isRecommended: Boolean(existing?.isRecommended),
      viewCount: Number(existing?.viewCount) || 0,
      likeCount: Number(existing?.likeCount) || 0,
      favoriteCount: Number(existing?.favoriteCount) || 0,
      commentCount: Number(existing?.commentCount) || 0,
      wordCount,
      readingMinutes: calculateReadingMinutes(wordCount),
      sortOrder: Number(record.sortOrder) || 0,
      source: isDocument || !record.sourcePath ? 'manual' : 'legacy-notes',
      sourcePath: record.sourcePath || '',
      sourceHash: crypto.createHash('sha256').update(content).digest('hex'),
      importedAt: new Date(snapshot.manifest.exportedAt),
      publishedAt: record.publishedAt
        ? new Date(record.publishedAt)
        : (PUBLISH_ALL ? new Date(record.updatedAt || snapshot.manifest.exportedAt) : null),
      createdBy: existing?.createdBy || adminUser._id,
      updatedBy: existing?.updatedBy || adminUser._id,
      deletedAt: null,
      createdAt,
      updatedAt: new Date(record.updatedAt || snapshot.manifest.exportedAt)
    })
  }

  const categoryCounts = new Map()
  const tagCounts = new Map()
  articles.forEach((article) => {
    if (article.category) categoryCounts.set(String(article.category), (categoryCounts.get(String(article.category)) || 0) + 1)
    article.tags.forEach((tagId) => tagCounts.set(String(tagId), (tagCounts.get(String(tagId)) || 0) + 1))
  })
  categories.documents.forEach((item) => { item.articleCount = categoryCounts.get(String(item._id)) || 0 })
  tags.documents.forEach((item) => { item.articleCount = tagCounts.get(String(item._id)) || 0 })
  return { articles, categories: categories.documents, tags: tags.documents, media }
}

async function replaceArticles(snapshot) {
  const [adminUser, localArticles, localCategories, localTags] = await Promise.all([
    User.findOne({ role: { $in: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN] } }).sort({ createdAt: 1 }),
    Article.find({}).lean(),
    Category.find({}).lean(),
    Tag.find({}).lean()
  ])
  if (!adminUser) throw new Error('目标数据库没有管理员用户，无法设置文章创建人')

  const relatedMediaIds = [...new Set(localArticles.flatMap((item) => [
    item.document?.originalMediaId,
    item.document?.previewMediaId,
    ...(item.resources || []).map((resource) => resource.mediaId)
  ]).filter(Boolean).map(String))].map((id) => new mongoose.Types.ObjectId(id))
  const backupPath = await createArticleSnapshotBackup(relatedMediaIds)
  const documents = await buildDatabaseDocuments(snapshot, localArticles, localCategories, localTags, adminUser)
  const idRemaps = buildArticleIdRemaps(snapshot, localArticles)
  const remappedRelations = await remapArticleRelations(idRemaps)
  const articleIds = documents.articles.map((item) => item._id)
  const cleanup = CLEAN_ORPHANS
    ? await removeOrphanArticleInteractions(articleIds)
    : { comments: 0, articleReactions: 0, commentReactions: 0 }
  await Article.deleteMany({})
  const replacementMediaIds = documents.media.map((item) => item._id)
  if (replacementMediaIds.length > 0) await Media.deleteMany({ _id: { $in: replacementMediaIds } })
  await Category.deleteMany({})
  await Tag.deleteMany({})
  await Category.insertMany(documents.categories)
  if (documents.tags.length > 0) await Tag.insertMany(documents.tags)
  if (documents.media.length > 0) await Media.insertMany(documents.media)
  await Article.insertMany(documents.articles)
  return { backupPath, documents, cleanup, idRemaps, remappedRelations }
}

function assertWriteTarget() {
  if (!['local', 'production'].includes(TARGET)) throw new Error(`不支持的目标: ${TARGET}`)
  if (!APPLY) return
  if (env.nodeEnv === 'production' && TARGET !== 'production') {
    throw new Error('生产环境写入必须显式传入 --target=production')
  }
  if (TARGET === 'production' && (env.nodeEnv !== 'production' || !CONFIRM_PRODUCTION)) {
    throw new Error('生产覆盖必须在生产环境传入 --confirm-production-replace')
  }
}

async function writeReport(snapshot) {
  const report = analyzeArticleRepository(snapshot, REPOSITORY_ROOT, EXPORT_ROOT)
  fs.mkdirSync(REPORT_ROOT, { recursive: true })
  const jsonPath = path.join(REPORT_ROOT, `${REPORT_BASENAME}.json`)
  const markdownPath = path.join(REPORT_ROOT, `${REPORT_BASENAME}.md`)
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(markdownPath, buildRepositoryAnalysisMarkdown(report), 'utf8')
  return { report, jsonPath, markdownPath }
}

async function main() {
  assertWriteTarget()
  console.log(`模式: ${APPLY ? `apply（重建 ${TARGET} 文章）` : 'dry-run（只读）'}`)
  console.log(`本地权威快照: ${EXPORT_ROOT}`)
  const snapshot = readArticleExportSnapshot(EXPORT_ROOT)
  const reportResult = await writeReport(snapshot)
  console.log(`导出文章: ${snapshot.records.length}`)
  console.log(`output 新增未上线: ${reportResult.report.summary.repositoryOnly}`)
  console.log(`线上文章本地有修改: ${reportResult.report.summary.locallyModified}`)
  console.log(`建议更新分类: ${reportResult.report.summary.categoryUpdateRecommended}`)
  console.log(`报告: ${reportResult.markdownPath}`)

  await connectDatabase()
  const [localArticles, localCategories, localTags, localComments, localReactions] = await Promise.all([
    Article.find({}).lean(),
    Category.find({}).lean(),
    Tag.find({}).lean(),
    Comment.countDocuments({}),
    Reaction.countDocuments({ targetType: 'article' })
  ])
  const preview = buildSnapshotDatabasePreview(snapshot, localArticles, localCategories, localTags, {
    publishAll: PUBLISH_ALL
  })
  console.log(`目标现状: 文章 ${localArticles.length}，分类 ${localCategories.length}，标签 ${localTags.length}，评论 ${localComments}，文章互动 ${localReactions}`)
  console.log(`变更预览: 新增 ${preview.createCount}，更新 ${preview.updateCount}，移除 ${preview.removeCount}，统一文章 ID ${preview.rekeyCount}，转为已发布 ${preview.publishCount}`)
  console.log(`分类元数据更新: ${preview.categoryUpdateCount}`)
  console.log(`同步后: 文章 ${snapshot.records.length}，已发布 ${preview.finalPublishedCount}`)
  if (!APPLY) {
    console.log('dry-run 完成；确认后使用 --apply 执行全量重建')
    return
  }

  const result = await replaceArticles(snapshot)
  console.log(`重建完成: 文章 ${result.documents.articles.length}，分类 ${result.documents.categories.length}，标签 ${result.documents.tags.length}，文档媒体 ${result.documents.media.length}`)
  console.log(`统一文章 ID: ${result.idRemaps.length}，迁移评论 ${result.remappedRelations.comments}，文章互动 ${result.remappedRelations.reactions}，媒体引用 ${result.remappedRelations.media}`)
  console.log(`清理孤立引用: 评论 ${result.cleanup.comments}，文章互动 ${result.cleanup.articleReactions}，评论互动 ${result.cleanup.commentReactions}`)
  if (!CLEAN_ORPHANS) console.log('孤立评论和互动已保留；只有显式 --clean-orphans 才会清理')
  console.log(`重建前备份: ${result.backupPath}`)
}

main()
  .catch((error) => {
    console.error('文章快照同步失败:', error)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
