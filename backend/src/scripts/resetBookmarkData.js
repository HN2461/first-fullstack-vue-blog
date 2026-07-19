import mongoose from 'mongoose'
import { connectDatabase, disconnectDatabase } from '../config/database.js'

const applyChanges = process.argv.includes('--apply')
const collectionNames = ['bookmarks', 'bookmarkfolders', 'bookmarkworkspaces']

async function main() {
  await connectDatabase()
  const existing = new Set((await mongoose.connection.db.listCollections().toArray()).map((item) => item.name))
  const targets = collectionNames.filter((name) => existing.has(name))
  const counts = {}

  for (const name of targets) {
    counts[name] = await mongoose.connection.db.collection(name).countDocuments()
  }

  console.log(`${applyChanges ? 'Apply' : 'Dry-run'}：书签模块集合 ${targets.length} 个。`)
  for (const name of collectionNames) console.log(`${name}: ${counts[name] || 0} 条`)

  if (!applyChanges) {
    console.log('未修改数据库。确认目标数据库备份后，传入 --apply 才会删除书签模块集合。')
    return
  }

  for (const name of targets) await mongoose.connection.db.collection(name).drop()
  console.log('书签、书签文件夹和书签库集合已删除，其他业务集合未修改。')
}

try {
  await main()
} finally {
  await disconnectDatabase()
}
