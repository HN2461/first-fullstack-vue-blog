/**
 * 将 output/线上文章 与当前连接的数据库逐篇比较。
 * 默认只读，适合在本地或生产环境核验权威快照是否仍与目标数据库一致。
 */

import fs from 'node:fs'
import path from 'node:path'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { Article } from '#modules/content/models/Article.js'
import { Category } from '#modules/content/models/Category.js'
import { Tag } from '#modules/content/models/Tag.js'
import { readArticleExportSnapshot } from '#modules/content/services/articleSnapshot.service.js'
import { buildArticleAuthorityMergePlan } from '#modules/content/services/articleAuthorityMerge.service.js'

const EXPORT_ROOT = path.resolve(process.env.ARTICLE_EXPORT_DIR || path.join(env.rootDir, '../output/线上文章'))
const REPORT_ROOT = path.resolve(
  process.env.ARTICLE_REPORT_DIR || path.join(env.rootDir, '../docs/02-开发指南/文章同步报告')
)
const REPORT_BASENAME = process.env.ARTICLE_AUTHORITY_COMPARE_REPORT || 'article-authority-compare-latest'

function writeReport(report) {
  fs.mkdirSync(REPORT_ROOT, { recursive: true })
  const jsonPath = path.join(REPORT_ROOT, `${REPORT_BASENAME}.json`)
  const markdownPath = path.join(REPORT_ROOT, `${REPORT_BASENAME}.md`)
  const lines = [
    '# 本地、线上与上次确认基线的文章三方合并报告',
    '',
    `- 生成时间：${report.generatedAt}`,
    `- 已核验：${report.summary.inspected}`,
    `- 本地正文待推送：${report.summary.contentPush}`,
    `- 线上运营信息待回写：${report.summary.metadataPull}`,
    `- 冲突或未知基线：${report.summary.conflicts}`,
    `- 仅目标数据库存在：${report.summary.remoteOnly}`,
    `- 已对齐：${report.summary.aligned}`,
    '',
    '## 本地正文待推送',
    '',
    '| slug | 标题 | 差异字段 |',
    '| --- | --- | --- |',
    ...report.items
      .filter((item) => item.pushFields.length > 0 && !item.blocked)
      .map((item) => `| ${item.slug} | ${item.title} | ${item.pushFields.join('、')} |`),
    '',
    '## 线上运营信息待回写',
    '',
    '| slug | 标题 | 字段 |',
    '| --- | --- | --- |',
    ...report.items
      .filter((item) => item.pullFields.length > 0 && !item.blocked)
      .map((item) => `| ${item.slug} | ${item.title} | ${item.pullFields.join('、')} |`),
    '',
    '## 冲突或未知基线',
    '',
    '| slug | 标题 | 原因 |',
    '| --- | --- | --- |',
    ...report.items
      .filter((item) => item.blocked)
      .map((item) => `| ${item.slug} | ${item.title} | ${item.blockReason || item.conflicts.join('、')} |`),
    ''
  ]
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(markdownPath, lines.join('\n'), 'utf8')
  return { jsonPath, markdownPath }
}

async function main() {
  const snapshot = readArticleExportSnapshot(EXPORT_ROOT)
  await connectDatabase()
  const [articles, categories, tags] = await Promise.all([
    Article.find({ deletedAt: null }).lean(),
    Category.find({}).lean(),
    Tag.find({}).lean()
  ])
  const report = buildArticleAuthorityMergePlan(snapshot, articles, categories, tags)
  report.target = env.nodeEnv === 'production' ? 'production' : 'local'
  report.snapshotRoot = EXPORT_ROOT
  const paths = writeReport(report)
  console.log(`目标: ${report.target}`)
  console.log(`已核验: ${report.summary.inspected}，正文待推送: ${report.summary.contentPush}，运营信息待回写: ${report.summary.metadataPull}，冲突: ${report.summary.conflicts}，仅目标: ${report.summary.remoteOnly}`)
  console.log(`报告: ${paths.markdownPath}`)
  if (report.summary.conflicts > 0 || report.summary.remoteOnly > 0) {
    process.exitCode = 2
  }
}

main()
  .catch((error) => {
    console.error('文章权威快照对比失败:', error)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
