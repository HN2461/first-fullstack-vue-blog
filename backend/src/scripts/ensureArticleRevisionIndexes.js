import mongoose from 'mongoose'
import { env } from '#config/env'
import { ArticleRevision } from '#modules/content/models/ArticleRevision.js'

const apply = process.argv.includes('--apply')
const verify = process.argv.includes('--verify')

async function main() {
  // 本地与生产的 dry-run 均不得因注册模型隐式创建集合或索引。
  await mongoose.connect(env.mongodbUri, { autoCreate: false, autoIndex: false })
  try {
    const collection = ArticleRevision.collection
    const exists = await mongoose.connection.db.listCollections({ name: collection.name }, { nameOnly: true }).hasNext()
    const existingIndexes = exists ? await collection.indexes() : []
    const [keys] = ArticleRevision.schema.indexes()[0]
    const isExpected = (index) => index.unique === true && JSON.stringify(index.key) === JSON.stringify(keys)
    const ready = existingIndexes.some(isExpected)
    const count = exists ? await collection.countDocuments({}) : 0
    console.log(`文章修订集合 ${collection.name}，现有 ${count} 条历史版本；唯一索引 ${ready ? '已就绪' : '待创建'}。`)
    if (ready) return
    if (verify) throw new Error('文章修订缺少文章 ID 和版本号的唯一索引')
    if (!apply) {
      console.log('当前为 dry-run。确认数据库已备份后可传入 --apply 创建索引。')
      return
    }
    await ArticleRevision.createIndexes()
    if (!(await collection.indexes()).some(isExpected)) throw new Error('创建后未检出预期的唯一索引')
    console.log('文章修订唯一索引已核验。')
  } finally {
    await mongoose.disconnect()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
