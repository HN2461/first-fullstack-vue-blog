/**
 * 文章时间修复脚本
 *
 * 解决问题：从旧静态博客迁移过来的文章，createdAt 全是迁移当天的时刻，
 *          publishedAt 对无 frontmatter 的文章 fallback 到文件 mtime（不准确）。
 *
 * 修复策略（按优先级）：
 *   1. Markdown frontmatter 中的 date / created / createdAt 字段
 *   2. 文件名中的日期后缀，如 _2026-04.md、_2026-05-11.md
 *   3. 文件的 mtime（最后修改时间）
 *
 * 使用方式：
 *   npm run fix:timestamps --workspace server        # 预览模式（dry-run），只打印不会改
 *   npm run fix:timestamps --workspace server --apply # 正式执行，回填数据库
 *
 * 原则：
 *   - 不修改任何 .md 文档内容
 *   - 幂等可重复执行
 *   - 执行前自动备份 articles 集合
 *   - 仅处理 source === 'legacy-notes' 的文章
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { Article } from '../models/Article.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ARGS = new Set(process.argv.slice(2))
const DRY_RUN = !ARGS.has('--apply')
const OLD_NOTES_DIR = process.env.OLD_NOTES_DIR || path.resolve(__dirname, '../../../../个人技术博客网站/public/notes')

// ──── 从文件名提取日期 ────
// 匹配：_2026-04.md  _2026-05-11.md  _2026-04-30-201402.md  -2026-04-30-093055.md
const FILENAME_DATE_RE = /[_.-](\d{4})-(\d{1,2})(?:-(\d{1,2}))?(?:[\s_-](\d{1,2}))?(\d{2})(\d{2})?\.(?:md|markdown)$/i

function extractDateFromFilename(filename) {
  const match = filename.match(FILENAME_DATE_RE)
  if (!match) return null

  const [, year, month, day, optHour, hOrMin, min] = match
  const y = Number(year)
  const mo = Number(month)
  const d = day ? Number(day) : 1

  if (optHour) {
    // 带时分格式如 _2026-04-30-201402 → 2026-04-30 20:14:02
    const h = Number(optHour)
    const mi = Number(hOrMin)
    const s = min ? Number(min) : 0
    const date = new Date(y, mo - 1, d, h, mi, s)
    if (!Number.isNaN(date.getTime())) return date
  }

  // 纯日期格式如 _2026-04.md 或 _2026-05-11.md（默认中午避免时区问题）
  const date = new Date(y, mo - 1, d, 12, 0, 0)
  if (!Number.isNaN(date.getTime())) return date

  return null
}

// ──── 从 frontmatter 提取日期 ────
function extractDateFromFrontmatter(frontmatter) {
  const fields = ['date', 'created', 'createdAt', 'publishDate', 'updated', '日期']

  for (const field of fields) {
    const value = frontmatter[field]
    if (!value) continue

    let strValue
    if (Array.isArray(value)) {
      strValue = String(value[0] || '').trim()
    } else {
      strValue = String(value).trim()
    }
    if (!strValue) continue

    const parsed = new Date(strValue)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  return null
}

// ──── 解析单个 md 文件，提取最佳可用日期 ────
function resolveBestDate(fullPath, filename) {
  // 优先级 1：frontmatter
  try {
    const raw = fs.readFileSync(fullPath, 'utf8')
    const sanitized = raw.replace(/\u0000/g, '')

    // 轻量提取 frontmatter（不依赖 gray-matter）
    const fmMatch = sanitized.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (fmMatch) {
      try {
        const fmBody = fmMatch[1]
        const frontmatter = {}
        for (const line of fmBody.split('\n')) {
          const colonIdx = line.indexOf(':')
          if (colonIdx <= 0) continue
          const key = line.slice(0, colonIdx).trim()
          let val = line.slice(colonIdx + 1).trim()
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1)
          }
          if (val.startsWith('- ')) {
            val = val.split('\n').map((l) => l.replace(/^-\s*/, '').trim()).filter(Boolean)
          }
          if (key) frontmatter[key] = val
        }
        const fmDate = extractDateFromFrontmatter(frontmatter)
        if (fmDate) return { date: fmDate, source: 'frontmatter' }
      } catch {
        // frontmatter 解析失败，继续尝试其他来源
      }
    }
  } catch {
    // 文件读取失败，继续
  }

  // 优先级 2：文件名中的日期
  const filenameDate = extractDateFromFilename(filename)
  if (filenameDate) return { date: filenameDate, source: 'filename' }

  // 优先级 3：文件系统 mtime
  try {
    const stat = fs.statSync(fullPath)
    return { date: stat.mtime, source: 'mtime' }
  } catch {
    // 无法获取 stat
  }

  return null
}

// ──── 备份 ────
async function createBackup() {
  const backupDir = path.join(env.rootDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const backupPath = path.join(backupDir, `timestamp-fix-${Date.now()}.json`)

  const articles = await Article.find({}).lean()
  fs.writeFileSync(backupPath, JSON.stringify({
    reason: 'fixArticleTimestamps 执行前备份',
    createdAt: new Date().toISOString(),
    totalArticles: articles.length,
    articles
  }, null, 2), 'utf8')

  return backupPath
}

// ──── 主逻辑 ────
async function main() {
  console.log('')
  console.log('╔══════════════════════════════════════════════╗')
  console.log('║     文章时间修复工具                           ║')
  console.log(`║     模式: ${DRY_RUN ? '预览 (dry-run) —— 只打印不修改' : '正式执行 (apply) —— 将写入数据库'.padEnd(35)}║`)
  console.log('╚══════════════════════════════════════════════╝')
  console.log(`旧笔记目录: ${OLD_NOTES_DIR}`)

  if (!fs.existsSync(OLD_NOTES_DIR)) {
    console.error(`❌ 旧笔记目录不存在: ${OLD_NOTES_DIR}`)
    process.exitCode = 1
    return
  }

  await connectDatabase()

  // 查找所有 legacy 来源的文章
  const legacyArticles = await Article.find({
    source: 'legacy-notes',
    deletedAt: null
  }).sort({ createdAt: 1 })

  console.log(`📦 数据库中 legacy 文章总数: ${legacyArticles.length}`)

  if (legacyArticles.length === 0) {
    console.log('✅ 没有需要修复的 legacy 文章')
    await disconnectDatabase()
    return
  }

  // 非预览模式下先备份
  if (!DRY_RUN) {
    const backupPath = await createBackup()
    console.log(`📋 已备份到: ${backupPath}`)
  }

  // 统计
  let changed = 0
  let skipped = 0
  let noSourceFile = 0
  const details = []

  for (const article of legacyArticles) {
    if (!article.sourcePath) {
      noSourceFile++
      continue
    }

    // 根据 sourcePath 定位原始文件
    const fullPath = path.join(OLD_NOTES_DIR, article.sourcePath)

    if (!fs.existsSync(fullPath)) {
      noSourceFile++
      details.push({
        title: article.title,
        sourcePath: article.sourcePath,
        issue: '原始文件不存在'
      })
      continue
    }

    const filename = path.basename(article.sourcePath)
    const result = resolveBestDate(fullPath, filename)

    if (!result) {
      skipped++
      continue
    }

    const bestDate = result.date
    const dateSource = result.source

    // 判断是否需要更新（差异超过 1 分钟才改）
    const currentCreatedAt = new Date(article.createdAt)
    const currentPublishedAt = article.publishedAt ? new Date(article.publishedAt) : null
    const needsUpdate =
      Math.abs(currentCreatedAt.getTime() - bestDate.getTime()) > 60 * 1000 ||
      (currentPublishedAt && article.status === 'published' && Math.abs(currentPublishedAt.getTime() - bestDate.getTime()) > 60 * 1000)

    if (!needsUpdate) {
      skipped++
      continue
    }

    if (DRY_RUN) {
      changed++
      details.push({
        title: article.title,
        sourcePath: article.sourcePath,
        dateSource,
        currentCreatedAt: article.createdAt?.toISOString(),
        currentPublishedAt: article.publishedAt?.toISOString(),
        proposedDate: bestDate.toISOString(),
        action: '[预览] 将被修改'
      })
    } else {
      // 正式写入
      article.createdAt = bestDate
      if (article.status === 'published') {
        article.publishedAt = article.publishedAt || bestDate
      }
      await article.save()
      changed++

      details.push({
        title: article.title,
        sourcePath: article.sourcePath,
        dateSource,
        previousCreatedAt: currentCreatedAt.toISOString(),
        previousPublishedAt: currentPublishedAt?.toISOString()?.slice(0, 10) || '(空)',
        newCreatedAt: bestDate.toISOString(),
        newPublishedAt: (article.publishedAt || '').toString()?.slice(0, 10) || '(空)',
        action: '✅ 已更新'
      })
    }
  }

  // ──── 输出报告 ────
  console.log('')
  console.log('────────────────────────────────────────────')
  console.log(`总计扫描: ${legacyArticles.length} 篇`)
  console.log(`需要修改: ${changed} 篇`)
  console.log(`无需修改: ${skipped} 篇`)
  console.log(`源文件丢失: ${noSourceFile} 篇`)
  console.log('────────────────────────────────────────────')

  if (details.length > 0) {
    console.log('')
    console.log('变更明细（前 30 条）：')
    console.log('─'.repeat(70))

    const showItems = details.slice(0, 30)
    for (const item of showItems) {
      if (DRY_RUN) {
        console.log(`  📝 ${item.title}`)
        console.log(`     来源: [${item.dateSource}]  →  ${item.proposedDate?.slice(0, 10)}`)
        console.log(`     当前 createdAt: ${item.currentCreatedAt?.slice(0, 10)}`)
        console.log(`     当前 publishedAt: ${item.currentPublishedAt?.slice(0, 10) || '(空)'}`)
      } else {
        console.log(`  ✅ ${item.title}`)
        console.log(`     来源: [${item.dateSource}]`)
        console.log(`     createdAt: ${item.previousCreatedAt?.slice(0, 10)} → ${item.newCreatedAt?.slice(0, 10)}`)
        console.log(`     publishedAt: ${item.previousPublishedAt} → ${item.newPublishedAt}`)
      }
      console.log('')
    }

    if (details.length > 30) {
      console.log(`  ... 还有 ${details.length - 30} 条未显示`)
    }
  }

  if (noSourceFile > 0) {
    console.log('')
    console.log(`⚠️  有 ${noSourceFile} 篇文章找不到对应的原始文件（可能已被移动或删除）：`)
    for (const d of details.filter((x) => x.issue).slice(0, 10)) {
      console.log(`   - ${d.title} (${d.sourcePath})`)
    }
  }

  if (DRY_RUN) {
    console.log('')
    console.log('💡 以上为预览结果，数据未被修改。')
    console.log('   如需正式执行，请运行:')
    console.log('   npm run fix:timestamps --workspace server --apply')
  }

  await disconnectDatabase()
}

main()
  .catch((error) => {
    console.error('❌ 脚本执行出错:', error)
    process.exitCode = 1
  })
