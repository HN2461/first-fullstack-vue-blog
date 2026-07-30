/**
 * 将当前数据库中的全部未删除文章导出为本地文章仓库 ZIP。
 *
 * 默认保留原 slug，确保本地文件可以稳定对应数据库文章。目标文件已存在时拒绝覆盖，
 * 只有显式传入 --force 才替换，避免误删上一份可用快照。
 */

import fs from 'node:fs'
import path from 'node:path'
import { createWriteStream } from 'node:fs'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import '#modules/content/models/Tag.js'
import { exportArticlesAsMarkdownZip } from '#modules/content/services/articleExport.service.js'

const args = process.argv.slice(2)
const FORCE = args.includes('--force')

function readOutputPath() {
  const outputArg = args.find((item) => item.startsWith('--output='))
  const configured = outputArg?.slice('--output='.length) || process.env.ARTICLE_REPOSITORY_ZIP
  return path.resolve(configured || path.join(env.rootDir, '../output/article-repository-latest.zip'))
}

async function main() {
  const outputPath = readOutputPath()
  if (fs.existsSync(outputPath) && !FORCE) {
    throw new Error(`目标文件已存在，请更换路径或使用 --force：${outputPath}`)
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  const temporaryPath = `${outputPath}.tmp`
  fs.rmSync(temporaryPath, { force: true })

  await connectDatabase()
  const exported = await exportArticlesAsMarkdownZip({
    scope: 'all',
    slugStrategy: 'keep'
  })

  try {
    await exported.writeTo(createWriteStream(temporaryPath))
    fs.renameSync(temporaryPath, outputPath)
    console.log(`文章仓库导出完成：${exported.total} 篇`)
    console.log(`文件：${outputPath}`)
  } catch (error) {
    fs.rmSync(temporaryPath, { force: true })
    throw error
  }
}

main()
  .catch((error) => {
    console.error('文章仓库导出失败：', error)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
