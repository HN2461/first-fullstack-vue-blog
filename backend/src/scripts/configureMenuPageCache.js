import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { Menu } from '#modules/rbac/models/Menu.js'

const apply = process.argv.includes('--apply')

// 只启用以列表、查询和只读工作区为主的页面，避免缓存编辑器、实时页面和长表单。
const CACHE_ENABLED_MENU_CODES = Object.freeze([
  'content.articles',
  'content.categories',
  'content.media',
  'content.tags',
  'governance.comments',
  'governance.menus',
  'governance.projecttimeline',
  'governance.roles',
  'governance.users',
  'knowledge.ledger.entries',
  'knowledge.ledger.overview',
  'questionbank.attempts',
  'questionbank.papers',
  'questionbank.questions'
])

async function main() {
  await connectDatabase()

  try {
    const menus = await Menu.find({ code: { $in: CACHE_ENABLED_MENU_CODES } }).sort({ code: 1 })
    const foundCodes = new Set(menus.map((menu) => menu.code))
    const missingCodes = CACHE_ENABLED_MENU_CODES.filter((code) => !foundCodes.has(code))
    const pendingMenus = menus.filter((menu) => menu.pageCacheEnabled !== true)

    console.log(`模式：${apply ? '写入数据库' : 'dry-run'}`)
    console.log(`目标菜单：${CACHE_ENABLED_MENU_CODES.length} 项`)
    console.log(`已找到：${menus.length} 项`)
    console.log(`待开启缓存：${pendingMenus.length} 项`)

    menus.forEach((menu) => {
      console.log(`[${menu.pageCacheEnabled ? 'keep' : 'enable'}] ${menu.code} | ${menu.name} | ${menu.routePath || '-'}`)
    })
    missingCodes.forEach((code) => console.log(`[missing] ${code}`))

    if (!apply) {
      console.log('当前为 dry-run，传入 --apply 后才会写入数据库。')
      return
    }

    if (pendingMenus.length > 0) {
      await Menu.updateMany(
        { _id: { $in: pendingMenus.map((menu) => menu._id) } },
        { $set: { pageCacheEnabled: true } }
      )
    }

    const enabledCount = await Menu.countDocuments({
      code: { $in: CACHE_ENABLED_MENU_CODES },
      pageCacheEnabled: true
    })
    console.log(`写入后已开启缓存：${enabledCount} 项`)

    if (enabledCount !== menus.length) {
      throw new Error('菜单页面缓存配置写入后数量不一致')
    }
  } finally {
    await disconnectDatabase()
  }
}

main().catch((error) => {
  console.error('菜单页面缓存配置失败:', error)
  process.exitCode = 1
})
