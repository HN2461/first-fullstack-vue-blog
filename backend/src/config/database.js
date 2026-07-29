import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  await mongoose.connect(env.mongodbUri, {
    // 生产索引变更必须通过显式迁移脚本执行，避免应用启动时隐式改库。
    autoIndex: env.nodeEnv !== 'production'
  })
  return mongoose.connection
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
}
