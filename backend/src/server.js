import { createApp } from './app.js'
import { connectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { ensureRbacSeed } from './services/rbac.service.js'

async function bootstrap() {
  await connectDatabase()
  await ensureRbacSeed()

  const app = createApp()
  app.listen(env.port, () => {
    console.log(`API server listening on http://127.0.0.1:${env.port}`)
  })
}

bootstrap().catch((error) => {
  console.error('API server failed to start')
  console.error(error)
  process.exit(1)
})
