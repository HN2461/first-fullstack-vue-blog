import { createServer } from 'node:http'
import { createApp } from './app.js'
import { connectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { initDiscussionSocket } from '#modules/discussion/realtime/discussionSocket.js'
import { ensureHolidayYears } from '#modules/festival/services/festival.service.js'
import { startMediaUploadCleanup } from '#modules/media/services/mediaUploadSession.service.js'

async function bootstrap() {
  await connectDatabase()
  await ensureRbacSeed()
  const currentYear = Number(new Intl.DateTimeFormat('en-CA', { timeZone: env.businessTimeZone, year: 'numeric' }).format(new Date()))
  await ensureHolidayYears([currentYear, currentYear + 1])

  const app = createApp()
  const httpServer = createServer(app)
  // Node 默认只允许约 5 分钟接收请求体，旧整文件上传在慢网络下会直接返回 408。
  httpServer.requestTimeout = env.httpRequestTimeoutMs
  await startMediaUploadCleanup()
  initDiscussionSocket(httpServer)
  httpServer.listen(env.port, () => {
    console.log(`API server listening on http://127.0.0.1:${env.port}`)
  })
}

bootstrap().catch((error) => {
  console.error('API server failed to start')
  console.error(error)
  process.exit(1)
})
