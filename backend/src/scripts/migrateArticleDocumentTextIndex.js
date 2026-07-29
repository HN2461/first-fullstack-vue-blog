/**
 * 更新文章全文索引，使 Word 文档提取文本参与知识库搜索。
 * 默认 dry-run；只有传入 --apply 才会删除旧文本索引并创建新索引。
 */

import mongoose from 'mongoose'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { Article } from '#modules/content/models/Article.js'

const APPLY = process.argv.slice(2).includes('--apply')
mongoose.set('autoIndex', false)
const INDEX_NAME = 'article_text_index'
const INDEX_KEYS = {
  title: 'text',
  summary: 'text',
  contentMarkdown: 'text',
  'document.extractedText': 'text'
}
const INDEX_OPTIONS = {
  name: INDEX_NAME,
  weights: {
    title: 10,
    summary: 5,
    contentMarkdown: 1,
    'document.extractedText': 1
  }
}

function hasDocumentTextField(index) {
  return Object.hasOwn(index.weights || {}, 'document.extractedText')
}

async function main() {
  console.log('文章 Word 全文索引迁移')
  console.log(`模式：${APPLY ? 'apply，将更新索引' : 'dry-run，只检查不修改'}`)
  await connectDatabase()

  try {
    const indexes = await Article.collection.indexes().catch((error) => {
      if (error.codeName === 'NamespaceNotFound') return []
      throw error
    })
    const textIndex = indexes.find((index) => index.name === INDEX_NAME || index.key?._fts === 'text')

    if (textIndex && hasDocumentTextField(textIndex)) {
      console.log(`索引 ${textIndex.name} 已包含 document.extractedText，无需迁移。`)
      return
    }

    console.log(textIndex
      ? `发现旧文本索引：${textIndex.name}`
      : '当前没有文章文本索引。')

    if (!APPLY) {
      console.log('未修改数据库。正式执行：node src/scripts/migrateArticleDocumentTextIndex.js --apply')
      return
    }

    if (textIndex) {
      await Article.collection.dropIndex(textIndex.name)
      console.log(`已删除旧索引：${textIndex.name}`)
    }

    const indexName = await Article.collection.createIndex(INDEX_KEYS, INDEX_OPTIONS)
    console.log(`已创建新索引：${indexName}`)
  } finally {
    await disconnectDatabase()
  }
}

main().catch((error) => {
  console.error('索引迁移失败：', error)
  process.exitCode = 1
})
