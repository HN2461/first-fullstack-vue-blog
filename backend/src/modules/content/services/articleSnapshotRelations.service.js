import fs from 'node:fs'
import path from 'node:path'
import mongoose from 'mongoose'
import { env } from '../../../config/env.js'
import { Article } from '../models/Article.js'
import { Category } from '../models/Category.js'
import { Tag } from '../models/Tag.js'
import { Media } from '#modules/media/models/Media.js'
import { Comment } from '#modules/interaction/models/Comment.js'
import { Reaction } from '#modules/interaction/models/Reaction.js'

export async function createArticleSnapshotBackup(relatedMediaIds) {
  const backupDir = path.join(env.rootDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, `article-snapshot-before-${stamp}.ejson`)
  const data = {
    createdAt: new Date(),
    collections: {
      articles: await Article.find({}).lean(),
      categories: await Category.find({}).lean(),
      tags: await Tag.find({}).lean(),
      comments: await Comment.find({}).lean(),
      reactions: await Reaction.find({}).lean(),
      media: await Media.find({ _id: { $in: relatedMediaIds } }).lean()
    }
  }
  fs.writeFileSync(backupPath, mongoose.mongo.BSON.EJSON.stringify(data, null, 2, { relaxed: false }), 'utf8')
  return backupPath
}

export async function removeOrphanArticleInteractions(articleIds) {
  const orphanComments = await Comment.find({ article: { $nin: articleIds } }).select('_id').lean()
  const orphanCommentIds = orphanComments.map((item) => item._id)
  const [commentResult, articleReactionResult, commentReactionResult] = await Promise.all([
    Comment.deleteMany({ _id: { $in: orphanCommentIds } }),
    Reaction.deleteMany({ targetType: 'article', targetId: { $nin: articleIds } }),
    Reaction.deleteMany({ targetType: 'comment', targetId: { $in: orphanCommentIds } })
  ])
  return {
    comments: commentResult.deletedCount || 0,
    articleReactions: articleReactionResult.deletedCount || 0,
    commentReactions: commentReactionResult.deletedCount || 0
  }
}

export function buildArticleIdRemaps(snapshot, localArticles) {
  const localIds = new Set(localArticles.map((item) => String(item._id)))
  const localBySlug = new Map(localArticles.map((item) => [item.slug, item]))
  return snapshot.records.flatMap((record) => {
    if (localIds.has(String(record.originalId))) return []
    const existing = localBySlug.get(record.originalSlug)
    if (!existing) return []
    return [{
      from: existing._id,
      to: new mongoose.Types.ObjectId(record.originalId),
      slug: record.originalSlug
    }]
  })
}

export async function remapArticleRelations(remaps) {
  const summary = { comments: 0, reactions: 0, media: 0 }
  for (const remap of remaps) {
    const [comments, reactions, media] = await Promise.all([
      Comment.updateMany({ article: remap.from }, { $set: { article: remap.to } }),
      Reaction.updateMany({ targetType: 'article', targetId: remap.from }, { $set: { targetId: remap.to } }),
      Media.updateMany({ article: remap.from }, { $set: { article: remap.to } })
    ])
    summary.comments += comments.modifiedCount || 0
    summary.reactions += reactions.modifiedCount || 0
    summary.media += media.modifiedCount || 0
  }
  return summary
}
