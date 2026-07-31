/**
 * 合并历史导入形成的规范化重复标签。
 *
 * 用途：
 * - 仅合并经人工确认的大小写、空白差异标签；不清理单篇文章的长尾技术标签。
 * - 默认 dry-run；仅传入 --apply 才会修改数据库。
 *
 * 边界：
 * - 先迁移全部文章（包含回收站）的标签引用，再删除重复标签，保证恢复文章时不会出现悬挂引用。
 * - 最终只按未删除文章重算 Tag.articleCount，与后台展示和公开搜索口径保持一致。
 */

import mongoose from 'mongoose'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { Article } from '#modules/content/models/Article.js'
import { Tag } from '#modules/content/models/Tag.js'

const args = new Set(process.argv.slice(2))
const DRY_RUN = !args.has('--apply')

const MERGES = [
  { keepId: '6a6b58607410eb434f473763', removeId: '6a6b58607410eb434f473730', name: 'CSV' },
  { keepId: '6a2d291f8a2b1c68f2cac4c2', removeId: '6a2d291e8a2b1c68f2cac194', name: 'Axios' },
  { keepId: '6a2d291d8a2b1c68f2cabf54', removeId: '6a2d291d8a2b1c68f2cac04c', name: 'CCSwitch' },
  { keepId: '6a2d291d8a2b1c68f2cabf28', removeId: '6a2d291f8a2b1c68f2cac4ba', name: 'Plugins' },
  { keepId: '6a2d291e8a2b1c68f2cac1f6', removeId: '6a2d291f8a2b1c68f2cac67a', name: 'uni-app' },
  { keepId: '6a2d291f8a2b1c68f2cac4f0', removeId: '6a2d29208a2b1c68f2cac754', name: 'webpack' },
  { keepId: '6a2d291f8a2b1c68f2cac3f0', removeId: '6a2d291f8a2b1c68f2cac658', name: 'input' },
  { keepId: '6a2d291f8a2b1c68f2cac648', removeId: '6a2d291f8a2b1c68f2cac5d8', name: 'Tooltip' }
]

function objectId(value) {
  return new mongoose.Types.ObjectId(value)
}

async function validateMerges() {
  const ids = MERGES.flatMap((item) => [item.keepId, item.removeId])
  const tags = await Tag.find({ _id: { $in: ids } }).select('name slug articleCount').lean()
  const tagById = new Map(tags.map((tag) => [String(tag._id), tag]))
  const missing = ids.filter((id) => !tagById.has(id))

  if (missing.length > 0) {
    throw new Error(`迁移已中止：以下预期标签不存在，数据库状态可能已变化：${missing.join(', ')}`)
  }

  return tagById
}

async function buildPlan(tagById) {
  const plan = []

  for (const merge of MERGES) {
    const sourceId = objectId(merge.removeId)
    const [allArticleCount, activeArticleCount] = await Promise.all([
      Article.countDocuments({ tags: sourceId }),
      Article.countDocuments({ tags: sourceId, deletedAt: null })
    ])

    plan.push({
      ...merge,
      keep: tagById.get(merge.keepId),
      remove: tagById.get(merge.removeId),
      allArticleCount,
      activeArticleCount
    })
  }

  return plan
}

function printPlan(plan, tagTotal, articleTotal) {
  console.log('')
  console.log('历史重复标签合并')
  console.log(`模式：${DRY_RUN ? 'dry-run，只打印不修改' : 'apply，将写入数据库'}`)
  console.log(`当前标签：${tagTotal} 个；文章：${articleTotal} 篇；预计标签：${tagTotal - plan.length} 个`)
  console.log('')

  plan.forEach((item) => {
    console.log(`- ${item.remove.name} (${item.removeId}) -> ${item.name} (${item.keepId})`)
    console.log(`  全部文章引用：${item.allArticleCount}；有效文章引用：${item.activeArticleCount}`)
  })
}

async function mergeTagReferences(item) {
  const sourceId = objectId(item.removeId)
  const targetId = objectId(item.keepId)

  // 用聚合更新保证替换后同一文章内不存在重复标签 ID。
  const result = await Article.collection.updateMany(
    { tags: sourceId },
    [{
      $set: {
        tags: {
          $setUnion: [{
            $map: {
              input: '$tags',
              as: 'tagId',
              in: {
                $cond: [
                  { $eq: ['$$tagId', sourceId] },
                  targetId,
                  '$$tagId'
                ]
              }
            }
          }, []]
        }
      }
    }]
  )

  await Tag.collection.updateOne(
    { _id: targetId },
    { $set: { name: item.name, updatedAt: new Date() } }
  )
  await Tag.collection.deleteOne({ _id: sourceId })

  return result.modifiedCount || 0
}

async function recalculateArticleCounts() {
  const counts = await Article.aggregate([
    { $match: { deletedAt: null } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', articleCount: { $sum: 1 } } }
  ])

  await Tag.updateMany({}, { $set: { articleCount: 0 } })
  if (counts.length > 0) {
    await Tag.bulkWrite(counts.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { articleCount: item.articleCount } }
      }
    })))
  }

  return counts.length
}

async function main() {
  await connectDatabase()

  try {
    const [tagById, tagTotal, articleTotal] = await Promise.all([
      validateMerges(),
      Tag.countDocuments(),
      Article.countDocuments()
    ])
    const plan = await buildPlan(tagById)
    printPlan(plan, tagTotal, articleTotal)

    if (DRY_RUN) {
      console.log('')
      console.log('未写入数据库。确认生产备份存在后，执行：node src/scripts/mergeDuplicateTags.js --apply')
      return
    }

    for (const item of plan) {
      const changedArticleCount = await mergeTagReferences(item)
      console.log(`已合并 ${item.remove.name} -> ${item.name}，更新 ${changedArticleCount} 篇文章引用。`)
    }

    const countedTagTotal = await recalculateArticleCounts()
    const [finalTagTotal, remainingSourceTags] = await Promise.all([
      Tag.countDocuments(),
      Tag.countDocuments({ _id: { $in: MERGES.map((item) => objectId(item.removeId)) } })
    ])

    if (remainingSourceTags > 0 || finalTagTotal !== tagTotal - MERGES.length) {
      throw new Error(`合并后的校验失败：标签数 ${finalTagTotal}，重复源标签剩余 ${remainingSourceTags}`)
    }

    console.log(`完成：标签 ${tagTotal} -> ${finalTagTotal}，已重算 ${countedTagTotal} 个被文章引用的标签计数。`)
  } finally {
    await disconnectDatabase()
  }
}

main().catch((error) => {
  console.error('脚本执行失败：', error)
  process.exitCode = 1
})
