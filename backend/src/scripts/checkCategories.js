/**
 * 检查分类重复情况 - 清理后验证版
 */

import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { Category } from '../models/Category.js'

async function main() {
  await connectDatabase()

  const categories = await Category.find({}).sort({ name: 1, parent: 1 }).lean()
  const nameGroups = {}

  for (const c of categories) {
    if (!nameGroups[c.name]) nameGroups[c.name] = []
    nameGroups[c.name].push(c)
  }

  console.log(`Total categories: ${categories.length}\n`)
  console.log('=== Duplicate Name Check ===\n')

  let hasDuplicates = false
  let duplicateCount = 0
  for (const [name, list] of Object.entries(nameGroups)) {
    if (list.length > 1) {
      hasDuplicates = true
      duplicateCount++
      console.log(`[${name}] x${list.length}:`)
      for (const item of list) {
        const parentInfo = item.parent ? ` (parent: ${item.parent.toString().slice(-8)})` : ' (top)'
        console.log(`  -> id=${item._id.toString().slice(-8)} slug=${item.slug} arts=${item.articleCount}${parentInfo}`)
      }
      console.log('')
    }
  }

  if (!hasDuplicates) {
    console.log('OK - No duplicate names found!')
  } else {
    console.log(`---\nDuplicate name groups: ${duplicateCount}`)
  }

  // Also show full tree for visual check
  console.log('\n=== Full Category Tree ===')
  const catMap = {}
  for (const c of categories) catMap[c._id.toString()] = c

  function getPath(cid, visited = new Set()) {
    if (visited.has(cid)) return 'CYCLE!'
    visited.add(cid)
    const cat = catMap[cid]
    if (!cat) return '(?)'
    if (!cat.parent) return cat.name
    return getPath(cat.parent.toString(), visited) + ' > ' + cat.name
  }

  const paths = categories.map(c => ({
    path: getPath(c._id.toString()),
    slug: c.slug,
    arts: c.articleCount,
    depth: (getPath(c._id.toString()).match(/>/g) || []).length + 1
  }))
  paths.sort((a, b) => a.path.localeCompare(b.path, 'zh-CN'))

  for (const p of paths) {
    const marker = p.arts > 0 ? '*' : ' '
    console.log(`[${p.depth}L]${marker} ${p.path} (${p.arts})`)
  }

  await disconnectDatabase()
}

main()
  .catch((e) => { console.error('ERR:', e); process.exitCode = 1 })
