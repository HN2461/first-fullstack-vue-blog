import { Router } from 'express'
import mongoose from 'mongoose'
import { fail, ok } from '#utils/apiResponse.js'

export const healthRouter = Router()

healthRouter.get('/health', (req, res) => {
  res.json(ok({
    service: 'personal-fullstack-blog-api',
    status: 'ok',
    timestamp: new Date().toISOString()
  }))
})

/** 发布探针只验证能否在两秒内访问 MongoDB，避免向公网返回连接细节。 */
healthRouter.get('/ready', async (req, res) => {
  res.set('Cache-Control', 'no-store')
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.command({ ping: 1 }, { timeoutMS: 2000 })
      return res.json(ok({ status: 'ready' }))
    }
  } catch {
    // 超时和短暂断连都允许探针在下一次请求时重新判断。
  }
  return res.status(503).json(fail('服务暂未就绪', 'SERVICE_UNAVAILABLE'))
})
