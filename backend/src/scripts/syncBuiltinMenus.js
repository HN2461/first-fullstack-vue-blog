import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { Menu } from '#modules/rbac/models/Menu.js'

async function main() {
  await connectDatabase()

  try {
    await ensureRbacSeed({ forceBuiltinSync: true })
    await Menu.deleteMany({
      code: {
        $in: ['content.articlecreate', 'content.articleedit']
      }
    })

    const menus = await Menu.find().sort({ sortOrder: 1, createdAt: 1 }).lean()
    const hiddenMenus = menus.filter((menu) => menu.hidden)

    console.log(`菜单同步完成，共 ${menus.length} 项`)
    console.log(`隐藏菜单 ${hiddenMenus.length} 项`)

    hiddenMenus.forEach((menu) => {
      console.log(`- ${menu.name} | ${menu.code} | ${menu.routePath}`)
    })
  } finally {
    await disconnectDatabase()
  }
}

main().catch((error) => {
  console.error('菜单同步失败:', error)
  process.exitCode = 1
})
