import mongoose from 'mongoose'
import { env } from '#config/env'
import { Feedback } from '#modules/feedback/models/Feedback.js'
import { FeedbackEvent } from '#modules/feedback/models/FeedbackEvent.js'
import { Notification } from '#modules/notification/models/Notification.js'
import { Media } from '#modules/media/models/Media.js'
import { initializeFeedbackMenus } from '#modules/feedback/services/feedbackMenu.service.js'

const apply = process.argv.includes('--apply')
const verify = process.argv.includes('--verify')

async function main() {
  await mongoose.connect(env.mongodbUri, { autoIndex: false, autoCreate: false })
  const menuPlan = await initializeFeedbackMenus(false)
  console.log(
    `${apply ? '应用' : verify ? '验证' : '只读预览'}意见反馈初始化；待创建菜单 ${menuPlan.createdMenus}，首次授权角色 ${menuPlan.grantRoles}`
  )
  let missingTotal = 0
  for (const model of [Feedback, FeedbackEvent, Notification, Media]) {
    const exists = await mongoose.connection.db.listCollections({ name: model.collection.collectionName }).hasNext()
    const actual = exists ? await model.collection.listIndexes().toArray() : []
    const expected =
      model === Notification
        ? model.schema.indexes().filter(([key]) => key.eventKey)
        : model === Media
          ? model.schema.indexes().filter(([key]) => key.feedback)
          : model.schema.indexes()
    const missing = expected.filter(([key, options]) => {
      const found = actual.find((index) => JSON.stringify(Object.entries(index.key)) === JSON.stringify(Object.entries(key)))
      if (found && (Boolean(found.unique) !== Boolean(options.unique) || Boolean(found.sparse) !== Boolean(options.sparse))) {
        throw new Error(`${model.collection.collectionName} 的索引选项存在冲突，请人工检查`)
      }
      return !found
    })
    missingTotal += missing.length
    console.log(
      `集合 ${model.collection.collectionName}：现有记录 ${exists ? await model.countDocuments() : 0}，待创建索引 ${missing.length}`
    )
    if (apply) {
      if (!exists) await model.createCollection()
      for (const [key, options] of missing) await model.collection.createIndex(key, options)
    }
  }
  if (apply) {
    await initializeFeedbackMenus(true)
    console.log('反馈初始化已完成，未修改历史文章、账本或其他业务数据')
  } else if (verify && (missingTotal || menuPlan.createdMenus)) {
    throw new Error('反馈菜单或索引不完整')
  } else console.log(verify ? '反馈初始化校验通过' : 'dry-run 完成；确认已有 mongodump 备份后使用 --apply')
}

main()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
