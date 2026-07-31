/** 将线上后台运营字段回写到本地 Front Matter 与 manifest 基线。 */

import fs from 'node:fs'
import path from 'node:path'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'
import { Tag } from '#modules/content/models/Tag.js'
import { readArticleExportSnapshot } from '#modules/content/services/articleSnapshot.service.js'
import { buildArticleAuthorityMergePlan } from '#modules/content/services/articleAuthorityMerge.service.js'

const rawArgs = process.argv.slice(2)
const APPLY = rawArgs.includes('--apply')
const SLUGS = [...new Set((rawArgs.find((item) => item.startsWith('--slugs='))?.slice(8) || '').split(',').filter(Boolean))]
const EXPORT_ROOT = path.resolve(process.env.ARTICLE_EXPORT_DIR || path.join(env.rootDir, '../output/线上文章'))

function replaceField(lines, key, value) {
  const index = lines.findIndex((line) => line.startsWith(`${key}:`))
  const next = Array.isArray(value)
    ? [`${key}:`, ...value.map((item) => `  - ${JSON.stringify(item)}`)]
    : [`${key}: ${JSON.stringify(value ?? '')}`]
  if (index < 0) return lines.push(...next)
  let count = 1
  while (/^\s+-\s/.test(lines[index + count] || '')) count += 1
  lines.splice(index, count, ...next)
}

function rewriteFrontMatter(item) {
  const raw = fs.readFileSync(item.sourceFile, 'utf8').replace(/^\uFEFF/, '')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n)?/)
  if (!match) throw new Error(`缺少 Front Matter: ${item.fileName}`)
  const eol = raw.includes('\r\n') ? '\r\n' : '\n'
  const lines = match[1].split(/\r?\n/)
  item.pullFields.forEach((field) => replaceField(lines, field, item.remote[field]))
  fs.writeFileSync(item.sourceFile, `---${eol}${lines.join(eol)}${eol}---${eol}${raw.slice(match[0].length)}`, 'utf8')
}

function updateBaseline(manifest, item) {
  const target = manifest.articles.find((article) => String(article.originalId) === item.originalId)
  if (!target) throw new Error(`manifest 缺少文章: ${item.slug}`)
  Object.assign(target, {
    title: item.local.title,
    summary: item.local.summary,
    cover: item.local.cover,
    contentHash: item.local.contentHash,
    categoryPath: item.remote.categoryPath,
    tags: item.remote.tags,
    status: item.remote.status,
    sortOrder: item.remote.sortOrder,
    publishedAt: item.remote.publishedAt
  })
}

async function main() {
  if (APPLY && SLUGS.length === 0) throw new Error('回写必须显式指定 --slugs=slug-a,slug-b')
  const snapshot = readArticleExportSnapshot(EXPORT_ROOT)
  await connectDatabase()
  const [articles, categories, tags] = await Promise.all([
    Article.find({ deletedAt: null }).lean(), Category.find({}).lean(), Tag.find({}).lean()
  ])
  const plan = buildArticleAuthorityMergePlan(snapshot, articles, categories, tags)
  const selected = plan.items.filter((item) => SLUGS.includes(item.slug))
  if (SLUGS.some((slug) => !selected.some((item) => item.slug === slug))) throw new Error('指定 slug 不在权威快照中')
  const updates = selected.filter((item) => item.pullFields.length > 0 && !item.blocked)
  const blocked = selected.filter((item) => item.blocked || item.pushFields.length > 0)
  console.log(`模式: ${APPLY ? 'apply' : 'dry-run'}，运营信息待回写: ${updates.length}，阻断: ${blocked.length}`)
  if (!APPLY) return
  if (blocked.length > 0) throw new Error('存在本地正文修改、冲突或未知基线，拒绝回写')
  const backupPath = path.join(env.rootDir, 'backups', `output-metadata-before-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  fs.mkdirSync(path.dirname(backupPath), { recursive: true })
  fs.writeFileSync(backupPath, JSON.stringify(snapshot.manifest, null, 2), 'utf8')
  updates.forEach((item) => {
    rewriteFrontMatter(item)
    updateBaseline(snapshot.manifest, item)
  })
  fs.writeFileSync(path.join(EXPORT_ROOT, 'manifest.json'), `${JSON.stringify(snapshot.manifest, null, 2)}\n`, 'utf8')
  console.log(`本地运营信息回写完成: ${updates.length} 篇，备份: ${backupPath}`)
}

main().catch((error) => {
  console.error('线上运营信息回写失败:', error)
  process.exitCode = 1
}).finally(disconnectDatabase)
