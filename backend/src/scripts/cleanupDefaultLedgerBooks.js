import fs from 'node:fs/promises'
import path from 'node:path'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { LedgerBook } from '#modules/ledger/models/LedgerBook.js'
import { LedgerCategory } from '#modules/ledger/models/LedgerCategory.js'
import { LedgerEntry } from '#modules/ledger/models/LedgerEntry.js'
import { LedgerImportBatch } from '#modules/ledger/models/LedgerImportBatch.js'
import { LedgerMoment } from '#modules/ledger/models/LedgerMoment.js'
import { User } from '#modules/user/models/User.js'

function isApplyMode() {
  return process.argv.includes('--apply')
}

async function buildPlan() {
  const books = await LedgerBook.find({ name: '默认账本' }).sort({ createdAt: 1 }).lean()
  const bookIds = books.map((book) => book._id)
  const categories = await LedgerCategory.find({ bookId: { $in: bookIds } }).lean()
  const categoryIds = categories.map((category) => category._id)
  const [users, entries, imports, momentsByBook, entryCategoryRefs, momentCategoryRefs] = await Promise.all([
    User.find({ _id: { $in: books.map((book) => book.userId) } }).select('email username').lean(),
    LedgerEntry.countDocuments({ bookId: { $in: bookIds } }),
    LedgerImportBatch.countDocuments({ bookId: { $in: bookIds } }),
    LedgerMoment.countDocuments({ bookId: { $in: bookIds } }),
    LedgerEntry.countDocuments({ categoryId: { $in: categoryIds } }),
    LedgerMoment.countDocuments({ categoryId: { $in: categoryIds } })
  ])
  const userMap = new Map(users.map((user) => [user._id.toString(), user.email || user.username || '']))

  return {
    books,
    categories,
    counts: {
      books: books.length,
      categories: categories.length,
      entries,
      imports,
      momentsByBook,
      entryCategoryRefs,
      momentCategoryRefs
    },
    users: books.map((book) => ({
      bookId: book._id.toString(),
      userId: book.userId.toString(),
      user: userMap.get(book.userId.toString()) || '',
      name: book.name,
      status: book.status,
      createdAt: book.createdAt
    }))
  }
}

function assertSafe(plan) {
  const unsafe = Object.entries(plan.counts)
    .filter(([key]) => key !== 'books' && key !== 'categories' && plan.counts[key] > 0)
  if (unsafe.length) {
    throw new Error(`默认账本存在关联数据，已停止删除：${unsafe.map(([key, value]) => `${key}=${value}`).join('、')}`)
  }
}

async function writeBackup(plan) {
  const backupDir = path.resolve(env.rootDir, '../backups/ledger-default-cleanup')
  await fs.mkdir(backupDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, `before-${stamp}.json`)
  await fs.writeFile(backupPath, `${JSON.stringify({ backedUpAt: new Date().toISOString(), ...plan }, null, 2)}\n`, 'utf8')
  return backupPath
}

async function main() {
  await connectDatabase()
  try {
    const plan = await buildPlan()
    console.log(JSON.stringify({ mode: isApplyMode() ? 'apply' : 'dry-run', ...plan }, null, 2))
    assertSafe(plan)
    if (!isApplyMode()) return

    const backupPath = await writeBackup(plan)
    const bookIds = plan.books.map((book) => book._id)
    const categoriesResult = await LedgerCategory.deleteMany({ bookId: { $in: bookIds } })
    const booksResult = await LedgerBook.deleteMany({ _id: { $in: bookIds } })
    console.log(JSON.stringify({
      backupPath,
      deleted: {
        categories: categoriesResult.deletedCount || 0,
        books: booksResult.deletedCount || 0
      }
    }, null, 2))
  } finally {
    await disconnectDatabase()
  }
}

main().catch((error) => {
  console.error('清理默认账本失败:', error.message)
  process.exitCode = 1
})
