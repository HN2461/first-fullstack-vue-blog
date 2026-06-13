/**
 * 审计检查：
 * 1. 回收站里有什么（是否是测试数据）
 * 2. 原始 Markdown 文档是否完整
 */

import fs from 'node:fs'
import path from 'node:path'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { Article } from '../models/Article.js'

const OLD_NOTES_DIR = process.env.OLD_NOTES_DIR ||
  'c:/Users/HN246/Desktop/全栈/个人技术博客网站/public/notes'

async function main() {
  await connectDatabase()

  // ═══════════════ 1. 回收站检查 ═══════════════
  console.log('=== 1. Trash / Recycle Bin Check ===\n')

  const deletedArticles = await Article.find({ deletedAt: { $ne: null } })
    .select('title source sourcePath createdAt deletedAt status')
    .sort({ deletedAt: -1 })
    .lean()

  console.log('Total in trash: ' + deletedArticles.length)
  console.log('')

  if (deletedArticles.length === 0) {
    console.log('Recycle bin is EMPTY.')
  } else {
    for (const art of deletedArticles) {
      const isLegacy = art.source === 'legacy-notes'
      const src = isLegacy ? art.sourcePath : '(non-legacy)'
      console.log('---')
      console.log('Title: ' + art.title)
      console.log('Source: ' + (isLegacy ? 'LEGACY MIGRATED' : 'TEST/MANUAL'))
      console.log('SourcePath: ' + src)
      console.log('Status: ' + art.status)
      console.log('Created: ' + (art.createdAt || '').toString().slice(0, 10))
      console.log('Deleted: ' + (art.deletedAt || '').toString().slice(0, 10))
    }

    // 统计
    const legacyCount = deletedArticles.filter(a => a.source === 'legacy-notes').length
    const testCount = deletedArticles.length - legacyCount
    console.log('\n--- Summary ---')
    console.log('Legacy migrated articles in trash: ' + legacyCount)
    console.log('Test/manual articles in trash: ' + testCount)
  }

  // ═══════════════ 2. 原始文档完整性检查 ═══════════════
  console.log('\n\n=== 2. Original Markdown Files Integrity ===\n')

  const notesRoot = OLD_NOTES_DIR
  console.log('Notes directory: ' + notesRoot)

  let exists = false
  try {
    fs.accessSync(notesRoot, fs.constants.R_OK)
    exists = true
  } catch (e) {
    exists = false
  }
  console.log('Exists (accessSync): ' + exists)

  if (!exists) {
    // 尝试列出目录内容作为备选检查
    try {
      const test = fs.readdirSync(notesRoot)
      console.log('Actually readable! Files: ' + test.length)
      exists = true
    } catch (e2) {
      console.log('ERROR: Notes directory not found! Error: ' + e2.message)
      await disconnectDatabase()
      return
    }
  }

  function walkDir(dir, base) {
    let files = []
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relPath = base ? base + '/' + entry.name : entry.name
        if (entry.isDirectory()) {
          if (entry.name !== 'images') {
            files = files.concat(walkDir(fullPath, relPath))
          }
        } else if (entry.name.toLowerCase().endsWith('.md')) {
          files.push(relPath)
        }
      }
    } catch (e) {
      // skip permission errors etc
    }
    return files
  }

  const allMdFiles = walkDir(notesRoot, '')
  console.log('Total .md files on disk: ' + allMdFiles.length)

  // 对比数据库中的 legacy 文章
  const dbLegacyArticles = await Article.find({
    source: 'legacy-notes',
    sourcePath: { $ne: null, $ne: '' },
    deletedAt: null
  }).select('sourcePath title').lean()

  const dbPaths = new Set(dbLegacyArticles.map(a => normalizePath(a.sourcePath)))

  function normalizePath(p) {
    return p.replace(/\\/g, '/')
  }

  const diskPaths = new Set(allMdFiles.map(normalizePath))

  // 在磁盘上但不在数据库中（未迁移的）
  const missingInDb = allMdFiles.filter(f => !dbPaths.has(normalizePath(f)))

  // 在数据库中但不在磁盘上的
  const missingOnDisk = []
  for (const art of dbLegacyArticles) {
    if (!diskPaths.has(normalizePath(art.sourcePath))) {
      missingOnDisk.push(art.sourcePath)
    }
  }

  console.log('\nDatabase legacy articles (active): ' + dbLegacyArticles.length)
  console.log('Matched (in both DB and disk): ' + (dbLegacyArticles.length - missingOnDisk.length))

  console.log('\n--- On disk but NOT in database (' + missingInDb.length + ') ---')
  // 排除目录文件
  const navFiles = ['目录.md', 'README.md', 'readme.md', 'index.md', 'Index.md', '00_总导航.md']
  const realMissing = missingInDb.filter(f => !navFiles.includes(path.basename(f)))
  console.log('(Excluding nav/index files: 目录.md, README.md, index.md, etc.)')
  console.log('Real missing articles: ' + realMissing.length)
  if (realMissing.length > 0 && realMissing.length <= 30) {
    for (const f of realMissing) {
      console.log('  MISSING: ' + f)
    }
  } else if (realMissing.length > 30) {
    console.log('  (too many to list, first 30):')
    for (const f of realMissing.slice(0, 30)) {
      console.log('  MISSING: ' + f)
    }
    console.log('  ... and ' + (realMissing.length - 30) + ' more')
  }

  console.log('\n--- In database but NOT on disk (' + missingOnDisk.length + ') ---')
  if (missingOnDisk.length > 0) {
    for (const f of missingOnDisk) {
      console.log('  ORPHAN: ' + f)
    }
  } else {
    console.log('  None. All DB articles have corresponding files on disk.')
  }

  // 最终结论
  console.log('\n\n=== FINAL VERDICT ===')
  const allOk = missingOnDisk.length === 0 && realMissing.length === 0
  if (allOk) {
    console.log('ALL GOOD:')
    console.log('- Recycle bin contains only ' + deletedArticles.length + ' items (checked above)')
    console.log('- All ' + allMdFiles.length + ' markdown files are intact on disk')
    console.log('- All legacy articles in DB have matching source files')
  } else {
    console.log('ISSUES FOUND:')
    if (missingOnDisk.length > 0) console.log('- ' + missingOnDisk.length + ' DB articles missing source files!')
    if (realMissing.length > 0) console.log('- ' + realMissing.length + ' disk files not migrated to DB!')
  }

  await disconnectDatabase()
}

main()
  .catch((e) => { console.error('ERR:', e); process.exitCode = 1 })
