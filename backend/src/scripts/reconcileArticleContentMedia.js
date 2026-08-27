/**
 * 将历史上已被有效文章正文引用、但仍停留在临时分类的图片转为正式正文图片。
 * 默认仅预览；只有显式传入 --apply 才写库，可重复执行且保持幂等。
 */

import fs from 'node:fs'
import path from 'node:path'
import mongoose from 'mongoose'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { Article } from '#modules/content/models/Article.js'
import { Media } from '#modules/media/models/Media.js'
import {
  ARTICLE_CONTENT_CATEGORY,
  ARTICLE_CONTENT_TEMP_CATEGORY,
  extractArticleContentMediaUrls
} from '#modules/media/services/articleContentMedia.service.js'
import { assertMediaCategoryExists } from '#modules/media/services/mediaCategory.service.js'

const APPLY = process.argv.slice(2).includes('--apply')

function buildReferenceMap(articles) {
  const result = new Map()

  articles.forEach((article) => {
    extractArticleContentMediaUrls(article.contentMarkdown).forEach((url) => {
      if (!result.has(url)) result.set(url, [])
      result.get(url).push(article)
    })
  })

  return result
}

async function backupMedia(mediaItems) {
  const directory = path.join(env.rootDir, 'backups')
  fs.mkdirSync(directory, { recursive: true })
  const file = path.join(directory, `article-content-media-before-${new Date().toISOString().replace(/[:.]/g, '-')}.ejson`)
  fs.writeFileSync(file, mongoose.mongo.BSON.EJSON.stringify({
    createdAt: new Date(),
    media: mediaItems
  }, null, 2, { relaxed: false }), 'utf8')
  return file
}

async function main() {
  await connectDatabase()
  const [articles, temporaryMedia] = await Promise.all([
    Article.find({
      deletedAt: null,
      contentMode: { $ne: 'document' },
      contentMarkdown: /\/uploads\//
    }).select('_id title slug contentMarkdown updatedAt').lean(),
    Media.find({
      deletedAt: null,
      kind: 'image',
      category: ARTICLE_CONTENT_TEMP_CATEGORY
    }).lean()
  ])
  const referencesByUrl = buildReferenceMap(articles)
  const matched = temporaryMedia.map((media) => ({
    media,
    articles: referencesByUrl.get(media.url) || []
  })).filter((item) => item.articles.length > 0)
  const shared = matched.filter((item) => item.articles.length > 1)

  console.log(`模式: ${APPLY ? 'apply' : 'dry-run'}`)
  console.log(`临时正文图片: ${temporaryMedia.length}`)
  console.log(`已被有效正文引用、待转正式: ${matched.length}`)
  console.log(`被多篇文章复用: ${shared.length}`)
  matched.slice(0, 50).forEach((item) => {
    console.log(`- ${item.media.url} -> ${item.articles.map((article) => article.slug).join(', ')}`)
  })

  if (!APPLY || matched.length === 0) return

  const backupPath = await backupMedia(matched.map((item) => item.media))
  const category = await assertMediaCategoryExists(ARTICLE_CONTENT_CATEGORY, null)
  const ids = matched.map((item) => item.media._id)
  const categoryResult = await Media.updateMany({ _id: { $in: ids } }, {
    $set: {
      category: category.name,
      categoryId: category._id
    }
  })
  const bindingOperations = matched
    .filter((item) => !item.media.article)
    .map((item) => ({
      updateOne: {
        filter: { _id: item.media._id, article: null },
        update: { $set: { article: item.articles[0]._id } }
      }
    }))
  const bindingResult = bindingOperations.length > 0
    ? await Media.bulkWrite(bindingOperations)
    : { modifiedCount: 0 }
  const remaining = await Media.countDocuments({
    _id: { $in: ids },
    category: ARTICLE_CONTENT_TEMP_CATEGORY
  })

  if (remaining > 0) {
    throw new Error(`仍有 ${remaining} 条命中记录未转为正式分类`)
  }

  console.log(`已转正式分类: ${categoryResult.modifiedCount}`)
  console.log(`已补主文章绑定: ${bindingResult.modifiedCount}`)
  console.log(`备份: ${backupPath}`)
}

main()
  .catch((error) => {
    console.error('文章正文临时图片归类失败:', error)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
