/**
 * 仅将三方合并确认后的本地正文类字段推送到指定文章。
 * 分类、标签、状态、排序等运营字段永远不由此命令覆盖。
 */

import fs from 'node:fs'
import path from 'node:path'
import mongoose from 'mongoose'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'
import { Tag } from '#modules/content/models/Tag.js'
import { readArticleExportSnapshot } from '#modules/content/services/articleSnapshot.service.js'
import { buildArticleAuthorityMergePlan, buildContentPushPayload } from '#modules/content/services/articleAuthorityMerge.service.js'

const rawArgs = process.argv.slice(2)
const APPLY = rawArgs.includes('--apply')
const TARGET = rawArgs.find((item) => item.startsWith('--target='))?.slice(9) || 'local'
const CONFIRM = rawArgs.includes('--confirm-production-content-sync')
const SLUGS = [...new Set((rawArgs.find((item) => item.startsWith('--slugs='))?.slice(8) || '').split(',').filter(Boolean))]
const EXPORT_ROOT = path.resolve(process.env.ARTICLE_EXPORT_DIR || path.join(env.rootDir, '../output/线上文章'))

function assertTarget() {
  if (!['local', 'production'].includes(TARGET)) throw new Error(`不支持的目标: ${TARGET}`)
  if (!APPLY) return
  if (SLUGS.length === 0) throw new Error('写入必须显式指定 --slugs=slug-a,slug-b')
  if (env.nodeEnv === 'production' && TARGET !== 'production') throw new Error('生产写入必须指定 --target=production')
  if (TARGET === 'production' && (env.nodeEnv !== 'production' || !CONFIRM)) {
    throw new Error('生产正文同步必须传入 --confirm-production-content-sync')
  }
}

async function backup(items) {
  const directory = path.join(env.rootDir, 'backups')
  fs.mkdirSync(directory, { recursive: true })
  const file = path.join(directory, `article-content-before-${new Date().toISOString().replace(/[:.]/g, '-')}.ejson`)
  const ids = items.map((item) => new mongoose.Types.ObjectId(item.existing.id))
  fs.writeFileSync(file, mongoose.mongo.BSON.EJSON.stringify({
    createdAt: new Date(),
    target: TARGET,
    articles: await Article.find({ _id: { $in: ids } }).lean()
  }, null, 2, { relaxed: false }), 'utf8')
  return file
}

async function main() {
  assertTarget()
  const snapshot = readArticleExportSnapshot(EXPORT_ROOT)
  await connectDatabase()
  const [articles, categories, tags] = await Promise.all([
    Article.find({ deletedAt: null }).lean(), Category.find({}).lean(), Tag.find({}).lean()
  ])
  const plan = buildArticleAuthorityMergePlan(snapshot, articles, categories, tags)
  const selected = plan.items.filter((item) => SLUGS.length === 0 || SLUGS.includes(item.slug))
  if (SLUGS.some((slug) => !selected.some((item) => item.slug === slug))) throw new Error('指定 slug 不在权威快照中')
  const blocked = selected.filter((item) => item.blocked || item.pullFields.length > 0)
  const updates = selected.filter((item) => item.pushFields.length > 0 && !item.blocked)
  console.log(`模式: ${APPLY ? 'apply' : 'dry-run'}，正文待推送: ${updates.length}，阻断: ${blocked.length}`)
  if (!APPLY) return
  if (blocked.length > 0) throw new Error('存在冲突、未知基线或线上运营字段变化，拒绝写入')
  const backupPath = await backup(updates)
  for (const item of updates) {
    const result = await Article.updateOne(
      { _id: item.existing.id, updatedAt: new Date(item.existing.updatedAt) },
      { $set: buildContentPushPayload(item) }
    )
    if (result.modifiedCount !== 1) throw new Error(`文章在预览后发生变化，拒绝覆盖: ${item.slug}`)
    const manifestArticle = snapshot.manifest.articles.find((article) => String(article.originalId) === item.originalId)
    if (!manifestArticle) throw new Error(`manifest 缺少文章: ${item.slug}`)
    item.pushFields.forEach((field) => {
      manifestArticle[field] = item.local[field]
    })
  }
  fs.writeFileSync(path.join(EXPORT_ROOT, 'manifest.json'), `${JSON.stringify(snapshot.manifest, null, 2)}\n`, 'utf8')
  console.log(`正文同步完成: ${updates.length} 篇，备份: ${backupPath}`)
}

main().catch((error) => {
  console.error('文章正文同步失败:', error)
  process.exitCode = 1
}).finally(disconnectDatabase)
