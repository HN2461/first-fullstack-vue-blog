/**
 * 最终收尾 v2：合并剩余重复（有文章/有子分类的）
 * 策略：保留文章最多的，其他文章移过去，子分类重新挂父
 */

import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { Category } from '../models/Category.js'
import { Article } from '../models/Article.js'

async function main() {
  await connectDatabase()

  const categories = await Category.find({}).lean()
  const catMap = {}
  for (const c of categories) catMap[c._id.toString()] = c

  function getPath(cid, v = new Set()) {
    if (v.has(cid)) return 'CYCLE'
    v.add(cid)
    const c = catMap[cid]
    if (!c) return '(?)'
    if (!c.parent) return c.name
    return getPath(c.parent.toString(), v) + ' > ' + c.name
  }

  // 找同名组
  const nameGroups = {}
  for (const c of categories) {
    if (!nameGroups[c.name]) nameGroups[c.name] = []
    nameGroups[c.name].push(c)
  }

  let movedArticles = 0
  let reparentedCats = 0
  let deletedCats = 0

  for (const [name, list] of Object.entries(nameGroups)) {
    if (list.length <= 1) continue

    console.log('\n=== [' + name + '] x' + list.length + ' ===')

    // 获取每个的详细信息
    const detailed = await Promise.all(list.map(async (item) => ({
      id: item._id.toString(),
      name: item.name,
      path: getPath(item._id.toString()),
      articleCount: await Article.countDocuments({ category: item._id, deletedAt: null }),
      childCount: await Category.countDocuments({ parent: item._id }),
      hasParent: !!item.parent
    })))

    // 按文章数降序，选第一个作为保留目标
    detailed.sort((a, b) => b.articleCount - a.articleCount)
    const keep = detailed[0]
    const merge = detailed.slice(1)

    console.log('Keep: ' + keep.path + ' (' + keep.articleCount + 'arts, ' + keep.childCount + 'subs)')

    for (const m of merge) {
      console.log('Process: ' + m.path + ' (' + m.articleCount + 'arts, ' + m.childCount + 'subs)')

      // 1. 移动文章
      if (m.articleCount > 0) {
        const res = await Article.updateMany(
          { category: m.id, deletedAt: null },
          { $set: { category: keep.id } }
        )
        movedArticles += res.modifiedCount
        console.log('  -> Moved ' + res.modifiedCount + ' articles to keep')
      }

      // 2. 子分类重新挂到保留目标下
      if (m.childCount > 0) {
        const res2 = await Category.updateMany(
          { parent: m.id },
          { $set: { parent: keep.id } }
        )
        reparentedCats += res2.modifiedCount
        console.log('  -> Reparented ' + res2.modifiedCount + ' sub-categories to keep')
      }

      // 3. 删除自身（现在应该是空的）
      await Category.findByIdAndDelete(m.id)
      deletedCats++
      console.log('  -> Deleted empty category')
    }
  }

  // 重建计数
  console.log('\n--- Rebuilding counts ---')
  await Category.updateMany({}, { $set: { articleCount: 0 } })
  const allArts = await Article.find({ deletedAt: null }).select('category').lean()
  for (const a of allArts) {
    if (a.category) await Category.updateOne({ _id: a.category }, { $inc: { articleCount: 1 } })
  }

  // 最终验证
  const finalCats = await Category.find({}).lean()
  const finalGroups = {}
  for (const c of finalCats) {
    if (!finalGroups[c.name]) finalGroups[c.name] = []
    finalGroups[c.name].push(c)
  }
  const finalDups = Object.values(finalGroups).filter(l => l.length > 1)

  console.log('\n=== Final Result ===')
  console.log('Categories: ' + finalCats.length)
  console.log('Articles moved: ' + movedArticles)
  console.log('Cats reparented: ' + reparentedCats)
  console.log('Cats deleted: ' + deletedCats)
  console.log('Duplicates left: ' + finalDups.length)

  if (finalDups.length === 0) {
    console.log('\n✅ ALL CLEAN! Zero duplicate names.')
  } else {
    console.log('\nStill remaining:')
    for (const l of finalDups) {
      console.log('  [' + l[0].name + '] x' + l.length)
      for (const item of l) {
        console.log('    ' + getPath(item._id.toString()))
      }
    }
  }

  await disconnectDatabase()
}

main().catch(e => { console.error('ERR:', e); process.exitCode = 1 })
