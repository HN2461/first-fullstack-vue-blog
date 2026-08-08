import { connectDatabase, disconnectDatabase } from '#config/database'
import { ArticleReadingProgress } from '#modules/readingProgress/models/ArticleReadingProgress.js'

const apply = process.argv.includes('--apply')
const verify = process.argv.includes('--verify')

function formatIndexKeys(keys) {
  return Object.entries(keys).map(([field, direction]) => `${field}:${direction}`).join(',')
}

function matchesExpectedIndex(existingIndex, expectedIndex) {
  const [expectedKeys, expectedOptions] = expectedIndex
  return formatIndexKeys(existingIndex.key) === formatIndexKeys(expectedKeys) &&
    Boolean(existingIndex.unique) === Boolean(expectedOptions.unique)
}

function printIndexStatus(existingIndexes, expectedIndexes) {
  existingIndexes.forEach((index) => {
    console.log(`[existing] ${index.name} ${formatIndexKeys(index.key)} unique:${Boolean(index.unique)}`)
  })

  return expectedIndexes.filter((expectedIndex) => {
    const [keys, options] = expectedIndex
    const matchedIndex = existingIndexes.find((index) => matchesExpectedIndex(index, expectedIndex))
    const status = matchedIndex ? 'ok' : 'missing'
    console.log(`[${status}] ${formatIndexKeys(keys)} unique:${Boolean(options.unique)}`)
    return !matchedIndex
  })
}

async function main() {
  await connectDatabase()

  try {
    const collectionNames = new Set(
      (await ArticleReadingProgress.db.db.listCollections().toArray()).map((item) => item.name)
    )
    const existingIndexes = collectionNames.has(ArticleReadingProgress.collection.name)
      ? await ArticleReadingProgress.collection.listIndexes().toArray()
      : []
    const expectedIndexes = ArticleReadingProgress.schema.indexes()

    const mode = apply ? '写入数据库' : verify ? '校验数据库' : 'dry-run'
    console.log(`模式：${mode}`)
    console.log(`目标集合：${ArticleReadingProgress.collection.name}`)
    console.log(`目标索引：${expectedIndexes.length} 项`)
    console.log(`现有索引：${existingIndexes.length} 项`)

    if (apply) {
      await ArticleReadingProgress.createIndexes()
      const ensuredIndexes = await ArticleReadingProgress.collection.listIndexes().toArray()
      const missingIndexes = printIndexStatus(ensuredIndexes, expectedIndexes)
      if (missingIndexes.length > 0) {
        throw new Error(`索引创建后仍缺少 ${missingIndexes.length} 项目标索引`)
      }
      console.log(`索引已确认：${ensuredIndexes.length} 项`)
      return
    }

    const missingIndexes = printIndexStatus(existingIndexes, expectedIndexes)
    if (verify && missingIndexes.length > 0) {
      throw new Error(`缺少 ${missingIndexes.length} 项目标索引`)
    }

    if (!verify) {
      console.log('当前为 dry-run，传入 --apply 后才会写入数据库。')
      return
    }
    console.log('索引校验通过。')
  } finally {
    await disconnectDatabase()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
