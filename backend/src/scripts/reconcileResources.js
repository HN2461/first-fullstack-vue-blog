import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import { disconnectDatabase } from '#config/database'
import { env } from '#config/env'
import { Media } from '#modules/media/models/Media.js'
import { MediaReference } from '#modules/media/models/MediaReference.js'
import { reconcileResources } from '#modules/media/services/resourceMigration.service.js'

async function main() {
  const apply = process.argv.includes('--apply')
  if (apply) {
    const backup = process.argv.find((arg) => arg.startsWith('--backup-dir='))?.slice('--backup-dir='.length)
    if (!backup || !(await fs.stat(path.resolve(backup))).isDirectory() || !(await fs.readdir(path.resolve(backup))).length) {
      throw new Error('写入前必须完成 mongodump 和永久文件备份，并用 --backup-dir=备份目录 指明已有备份')
    }
  }
  // dry-run 连集合和索引都不隐式创建；仅在 apply 分支执行显式索引初始化。
  await mongoose.connect(env.mongodbUri, { autoIndex: false, autoCreate: false })
  try {
    if (apply) {
      await MediaReference.createIndexes()
      await Media.collection.createIndex({ lifecycleStatus: 1, expiresAt: 1 }, { name: 'resource_pending_cleanup' })
    }
    console.log('范围：已登记媒体、头像、简历照片、讨论附件、工作日志、反馈和文章引用；不移动原件，不删除未知文件。')
    const result = await reconcileResources({ apply })
    console.log(JSON.stringify(result, null, 2))
    if (apply && !result.errors.length) {
      const verified = await reconcileResources()
      console.log('写入后幂等预演：', JSON.stringify(verified, null, 2))
      if (verified.files + verified.metadata + verified.bindings + verified.staleBindings + verified.lifecycle + verified.businesses > 0) process.exitCode = 1
    }
    if (result.errors.length) process.exitCode = 1
  } finally {
    await disconnectDatabase()
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
