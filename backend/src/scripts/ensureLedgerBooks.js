import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { LedgerBook } from '#modules/ledger/models/LedgerBook.js'
import { LedgerEntry } from '#modules/ledger/models/LedgerEntry.js'
import { LedgerImportBatch } from '#modules/ledger/models/LedgerImportBatch.js'
import { User } from '#modules/user/models/User.js'
import { seedDefaultCategories } from '#modules/ledger/services/ledgerBook.service.js'

const targetBooks = [
  { name: '默认账本', description: '日常收支记录', sortOrder: 10 },
  { name: '润岚', description: '润岚时期的公司相关收支记录', sortOrder: 20 },
  { name: '杭漂', description: '杭州发展阶段的个人收支记录', sortOrder: 30 }
]

function readArg(name) {
  const prefix = `--${name}=`
  const value = process.argv.find((arg) => arg.startsWith(prefix))
  return value ? value.slice(prefix.length).trim() : ''
}

function resolveEmail() {
  return (readArg('email') || process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase()
}

export async function ensureLedgerBooks({ email = resolveEmail(), apply = process.argv.includes('--apply') } = {}) {
  await connectDatabase()

  try {
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      throw new Error(`找不到目标用户：${email}`)
    }

    const result = []
    const defaultBook = await LedgerBook.findOne({ userId: user._id, name: '默认账本' }).sort({ createdAt: 1 })
    const runlanBook = await LedgerBook.findOne({ userId: user._id, name: '润岚' }).sort({ createdAt: 1 })
    let defaultBookWillBeRenamed = false
    if (defaultBook && !runlanBook) {
      const [entryCount, importCount] = await Promise.all([
        LedgerEntry.countDocuments({ userId: user._id, bookId: defaultBook._id }),
        LedgerImportBatch.countDocuments({ userId: user._id, bookId: defaultBook._id })
      ])
      if (entryCount > 0 || importCount > 0) {
        defaultBookWillBeRenamed = true
        if (apply) {
          defaultBook.name = '润岚'
          defaultBook.description = '润岚时期的公司相关收支记录'
          defaultBook.sortOrder = 20
          await defaultBook.save()
          result.push({ name: '润岚', action: 'renamed-existing-default', id: defaultBook._id.toString(), entries: entryCount, imports: importCount })
        } else {
          result.push({ name: '润岚', action: 'would-rename-existing-default', id: defaultBook._id.toString(), entries: entryCount, imports: importCount })
        }
      }
    }

    for (const target of targetBooks) {
      if (target.name === '默认账本' && defaultBookWillBeRenamed) {
        if (!apply) {
          result.push({ name: target.name, action: 'would-create', categoryCount: 10 })
          continue
        }
      }
      const existing = await LedgerBook.findOne({ userId: user._id, name: target.name }).sort({ createdAt: 1 })
      if (existing) {
        const categoryCount = await seedDefaultCategories(user._id, existing._id)
        result.push({ name: target.name, action: 'existing', id: existing._id.toString(), categoryCount })
        continue
      }

      if (!apply) {
        result.push({ name: target.name, action: 'would-create', categoryCount: 10 })
        continue
      }

      const book = await LedgerBook.create({
        userId: user._id,
        name: target.name,
        currency: 'CNY',
        description: target.description,
        sortOrder: target.sortOrder,
        status: 'active'
      })
      const categoryCount = await seedDefaultCategories(user._id, book._id)
      result.push({ name: target.name, action: 'created', id: book._id.toString(), categoryCount })
    }

    console.log(JSON.stringify({
      mode: apply ? 'apply' : 'dry-run',
      user: { id: user._id.toString(), email: user.email, username: user.username },
      books: result
    }, null, 2))
    return { user, result }
  } finally {
    await disconnectDatabase()
  }
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href

if (isCli) {
  ensureLedgerBooks().catch((error) => {
    console.error('账本初始化失败:', error)
    process.exitCode = 1
  })
}
