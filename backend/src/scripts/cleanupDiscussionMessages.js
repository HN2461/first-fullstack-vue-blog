import { connectDatabase } from '#config/database'
import { cleanupAllDiscussionMessages } from '#modules/discussion/services/discussionCleanup.service.js'

const applyChanges = process.argv.includes('--apply')

async function main() {
  await connectDatabase()

  if (!applyChanges) {
    console.log('Dry-run: 讨论消息清理脚本当前仅在 --apply 时执行删除。')
    console.log('执行写入清理请使用：node src/scripts/cleanupDiscussionMessages.js --apply')
    return
  }

  const result = await cleanupAllDiscussionMessages()
  console.log(`讨论消息清理完成：检查用户 ${result.checkedUsers} 个，删除 ${result.deletedCount} 条。`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    const mongoose = await import('mongoose')
    await mongoose.default.disconnect()
  })
