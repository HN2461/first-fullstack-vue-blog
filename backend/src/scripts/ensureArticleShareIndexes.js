import { connectDatabase, disconnectDatabase } from '#config/database'
import { ArticleSharePackage } from '#modules/articleShare/models/ArticleSharePackage.js'
import { ArticleShareSession } from '#modules/articleShare/models/ArticleShareSession.js'

const apply = process.argv.includes('--apply')
const verify = process.argv.includes('--verify')
const models = [ArticleSharePackage, ArticleShareSession]

function formatIndexKeys(keys) {
  return Object.entries(keys).map(([field, direction]) => `${field}:${direction}`).join(',')
}

function matchesExpectedIndex(existing, expected) {
  const [keys, options] = expected
  return formatIndexKeys(existing.key) === formatIndexKeys(keys) &&
    Boolean(existing.unique) === Boolean(options.unique) &&
    Number(existing.expireAfterSeconds ?? -1) === Number(options.expireAfterSeconds ?? -1)
}

async function main() {
  await connectDatabase()
  try {
    const mode = apply ? '写入数据库' : verify ? '校验数据库' : 'dry-run'
    console.log(`模式：${mode}`)
    for (const model of models) {
      const collectionNames = new Set((await model.db.db.listCollections().toArray()).map((item) => item.name))
      const existing = collectionNames.has(model.collection.name)
        ? await model.collection.listIndexes().toArray()
        : []
      const expected = model.schema.indexes()
      if (apply) await model.createIndexes()
      const current = apply ? await model.collection.listIndexes().toArray() : existing
      console.log(`目标集合：${model.collection.name}，目标索引：${expected.length} 项，现有索引：${current.length} 项`)
      current.forEach((index) => console.log(`[existing] ${index.name} ${formatIndexKeys(index.key)} unique:${Boolean(index.unique)} ttl:${index.expireAfterSeconds ?? '-'}`))
      const missing = expected.filter((item) => !current.some((index) => matchesExpectedIndex(index, item)))
      missing.forEach(([keys, options]) => console.log(`[missing] ${formatIndexKeys(keys)} unique:${Boolean(options.unique)} ttl:${options.expireAfterSeconds ?? '-'}`))
      if ((apply || verify) && missing.length) throw new Error(`${model.collection.name} 缺少 ${missing.length} 项目标索引`)
    }
    if (!apply && !verify) console.log('当前为 dry-run，传入 --apply 后才会写入数据库。')
    if (verify) console.log('索引校验通过。')
  } finally {
    await disconnectDatabase()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
