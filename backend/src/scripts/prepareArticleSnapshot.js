/**
 * 将 output/线上文章整理为可重复同步的本地权威快照。
 * 默认只生成排序与发布状态预览；只有 --apply 才会备份并改写快照。
 */

import fs from 'node:fs'
import path from 'node:path'
import { createWriteStream } from 'node:fs'
import { once } from 'node:events'
import archiver from 'archiver'
import { env } from '../config/env.js'
import { buildNormalizedArticleOrder } from '#modules/content/services/articleSequenceOrder.service.js'

const args = new Set(process.argv.slice(2))
const APPLY = args.has('--apply')
const PUBLISH_ALL = args.has('--publish-all')
const EXPORT_ROOT = path.resolve(process.env.ARTICLE_EXPORT_DIR || path.join(env.rootDir, '../output/线上文章'))
const REPORT_ROOT = path.resolve(
  process.env.ARTICLE_REPORT_DIR || path.join(env.rootDir, '../docs/02-开发指南/文章同步报告')
)

function readManifest() {
  const manifestPath = path.join(EXPORT_ROOT, 'manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, ''))
  if (!Array.isArray(manifest.articles) || manifest.total !== manifest.articles.length) {
    throw new Error('manifest.json 的文章数量与 articles 清单不一致')
  }
  return { manifest, manifestPath }
}

function replaceScalar(lines, key, value, beforeKey = 'exportedAt') {
  const expression = new RegExp(`^${key}:`)
  const index = lines.findIndex((line) => expression.test(line))
  const nextLine = `${key}: ${typeof value === 'number' ? value : JSON.stringify(String(value ?? ''))}`
  if (index >= 0) {
    lines[index] = nextLine
    return
  }
  const beforeIndex = lines.findIndex((line) => line.startsWith(`${beforeKey}:`))
  lines.splice(beforeIndex >= 0 ? beforeIndex : lines.length, 0, nextLine)
}

function replaceCategoryPath(lines, categoryPath) {
  const existingIndex = lines.findIndex((line) => line === 'categoryPath:')
  if (existingIndex >= 0) {
    let deleteCount = 1
    while (/^\s+-\s/.test(lines[existingIndex + deleteCount] || '')) deleteCount += 1
    lines.splice(existingIndex, deleteCount)
  }
  const categoryIndex = lines.findIndex((line) => line.startsWith('category:'))
  const insertAt = categoryIndex >= 0 ? categoryIndex + 1 : lines.length
  lines.splice(insertAt, 0, 'categoryPath:', ...categoryPath.map((item) => `  - ${JSON.stringify(item)}`))
}

function rewriteMarkdown(filePath, article) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n)?/)
  if (!match) throw new Error(`Markdown 缺少 Front Matter: ${filePath}`)
  const eol = raw.includes('\r\n') ? '\r\n' : '\n'
  const lines = match[1].split(/\r?\n/)
  replaceCategoryPath(lines, article.categoryPath || [])
  replaceScalar(lines, 'status', article.status)
  replaceScalar(lines, 'sortOrder', article.sortOrder)
  replaceScalar(lines, 'originalStatus', article.status)
  replaceScalar(lines, 'publishedAt', article.publishedAt || '')
  replaceScalar(lines, 'updatedAt', article.updatedAt || '')
  const body = raw.slice(match[0].length)
  fs.writeFileSync(filePath, `---${eol}${lines.join(eol)}${eol}---${eol}${body}`, 'utf8')
}

function rewriteDocumentMetadata(filePath, article) {
  const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''))
  Object.assign(metadata, {
    status: article.status,
    categoryPath: article.categoryPath || [],
    tags: article.tags || [],
    sortOrder: article.sortOrder,
    publishedAt: article.publishedAt || null,
    updatedAt: article.updatedAt || null
  })
  fs.writeFileSync(filePath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8')
}

function buildPlan(manifest) {
  const order = buildNormalizedArticleOrder(manifest.articles)
  const now = new Date().toISOString()
  const articles = manifest.articles.map((article) => ({
    ...article,
    status: PUBLISH_ALL ? 'published' : article.status,
    sortOrder: order.sortOrderById.get(String(article.originalId)),
    publishedAt: PUBLISH_ALL
      ? (article.publishedAt || article.updatedAt || manifest.exportedAt || now)
      : article.publishedAt
  }))
  return {
    articles,
    order,
    publishedCount: articles.filter((item) => item.status === 'published').length,
    publishChangeCount: articles.filter((item, index) => item.status !== manifest.articles[index].status).length,
    sortChangeCount: articles.filter((item, index) => item.sortOrder !== Number(manifest.articles[index].sortOrder || 0)).length
  }
}

function writeReport(plan) {
  fs.mkdirSync(REPORT_ROOT, { recursive: true })
  const report = {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? 'apply' : 'dry-run',
    publishAll: PUBLISH_ALL,
    total: plan.articles.length,
    publishedCount: plan.publishedCount,
    publishChangeCount: plan.publishChangeCount,
    sortChangeCount: plan.sortChangeCount,
    sequenceCategories: plan.order.categoryPlans.filter((item) => item.useSequence),
    changedCategories: plan.order.categoryPlans.filter((item) => item.changedCount > 0)
  }
  const jsonPath = path.join(REPORT_ROOT, 'article-authority-preparation-latest.json')
  const markdownPath = path.join(REPORT_ROOT, 'article-authority-preparation-latest.md')
  const lines = [
    '# 本地权威文章快照整理报告',
    '',
    `- 模式：${report.mode}`,
    `- 文章总数：${report.total}`,
    `- 整理后已发布：${report.publishedCount}`,
    `- 需转为已发布：${report.publishChangeCount}`,
    `- 需规范排序值：${report.sortChangeCount}`,
    `- 按明确章节号重排的分类：${report.sequenceCategories.length}`,
    '',
    '## 章节系列',
    '',
    '| 分类 | 文章 | 识别章节 | 位置调整 |',
    '| --- | ---: | ---: | ---: |',
    ...report.sequenceCategories.map((item) => `| ${item.categoryPath || '未分类'} | ${item.total} | ${item.numberedCount} | ${item.reorderedCount} |`),
    ''
  ]
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(markdownPath, lines.join('\n'), 'utf8')
  return { jsonPath, markdownPath }
}

async function createBackup() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(env.rootDir, 'backups', `output-online-before-authority-preparation-${stamp}.zip`)
  fs.mkdirSync(path.dirname(backupPath), { recursive: true })
  const output = createWriteStream(backupPath, { flags: 'wx' })
  const archive = archiver('zip', { store: true })
  archive.on('error', (error) => output.destroy(error))
  archive.pipe(output)
  archive.directory(EXPORT_ROOT, false)
  const completed = once(output, 'close')
  await archive.finalize()
  await completed
  return backupPath
}

async function applyPlan(manifest, manifestPath, plan) {
  const backupPath = await createBackup()
  const byId = new Map(plan.articles.map((article) => [String(article.originalId), article]))
  for (const article of plan.articles) {
    const filePath = path.join(EXPORT_ROOT, ...String(article.fileName).replace(/\\/g, '/').split('/'))
    if (article.contentMode === 'document') rewriteDocumentMetadata(filePath, article)
    else rewriteMarkdown(filePath, article)
  }
  manifest.articles = manifest.articles.map((article) => byId.get(String(article.originalId)))
  manifest.total = manifest.articles.length
  manifest.authorityPreparedAt = new Date().toISOString()
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  return backupPath
}

async function main() {
  const { manifest, manifestPath } = readManifest()
  const plan = buildPlan(manifest)
  const report = writeReport(plan)
  console.log(`模式: ${APPLY ? 'apply' : 'dry-run'}`)
  console.log(`文章: ${plan.articles.length}，发布状态调整: ${plan.publishChangeCount}，排序值调整: ${plan.sortChangeCount}`)
  console.log(`章节排序分类: ${plan.order.categoryPlans.filter((item) => item.useSequence).length}`)
  console.log(`报告: ${report.markdownPath}`)
  if (!APPLY) {
    console.log('未改写快照；确认后使用 --apply 执行')
    return
  }
  const backupPath = await applyPlan(manifest, manifestPath, plan)
  console.log(`快照整理完成，备份: ${backupPath}`)
}

main().catch((error) => {
  console.error('文章快照整理失败:', error)
  process.exitCode = 1
})
