import { createServer } from 'node:http'
import { createApp } from './app.js'
import { connectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { ensureRbacSeed } from '#modules/rbac/services/rbac.service.js'
import { initDiscussionSocket } from '#modules/discussion/realtime/discussionSocket.js'

async function bootstrap() {
  await connectDatabase()
  await ensureRbacSeed()

  const app = createApp()
  const httpServer = createServer(app)
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
