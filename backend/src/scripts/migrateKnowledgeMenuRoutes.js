import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { Menu } from '#modules/rbac/models/Menu.js'

const apply = process.argv.includes('--apply')

const TARGETS = [
  {
    code: 'knowledge.root',
    routePath: '',
    routeKey: 'knowledge.root'
  },
  {
    code: 'knowledge.articles',
    routePath: '/console/articles',
    routeKey: 'knowledge.article.list'
  },
  {
    code: 'knowledge.directory',
    routePath: '/console/article-directory',
    routeKey: 'knowledge.article.directory'
  }
]

async function main() {
  await connectDatabase()

  try {
    const operations = []

    for (const target of TARGETS) {
      const menu = await Menu.findOne({ code: target.code })
      if (!menu) {
        console.log(`[missing] ${target.code}`)
        continue
      }

      const before = {
        routePath: menu.routePath || '',
        routeKey: menu.routeKey || ''
      }
      const after = {
        routePath: target.routePath,
        routeKey: target.routeKey
      }
      const changed = before.routePath !== after.routePath || before.routeKey !== after.routeKey

      console.log(`[${changed ? 'change' : 'keep'}] ${target.code}`)
      console.log(`  routePath: "${before.routePath}" -> "${after.routePath}"`)
      console.log(`  routeKey:  "${before.routeKey}" -> "${after.routeKey}"`)

      if (changed) {
        operations.push({
          updateOne: {
            filter: { _id: menu._id },
            update: { $set: after }
          }
        })
      }
    }

    console.log(`待更新菜单数量：${operations.length}`)

    if (!apply) {
      console.log('当前为 dry-run，传入 --apply 后才会写入数据库。')
      return
    }

    if (operations.length > 0) {
      await Menu.bulkWrite(operations)
    }

    console.log('知识库菜单路由迁移完成。')
  } finally {
    await disconnectDatabase()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
