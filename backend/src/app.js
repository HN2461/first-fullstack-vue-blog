import path from 'node:path'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { API_PREFIX } from '#config/routes'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'
import { requestMetricsMiddleware } from './middlewares/requestMetrics.js'
import { adminRouter } from './routes/admin.routes.js'
import { authRouter } from './routes/auth.routes.js'
import captchaRouter from './routes/captcha.routes.js'
import { healthRouter } from './routes/health.routes.js'
import { interactionRouter } from './routes/interaction.routes.js'
import { memoRouter } from './routes/memo.routes.js'
import profileRouter from './routes/profile.routes.js'
import { publicRouter } from './routes/public.routes.js'
import { rbacRouter } from './routes/rbac.routes.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({
    origin: env.clientOrigin,
    credentials: true
  }))
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use('/uploads', express.static(path.join(env.rootDir, env.uploadDir)))
  app.use('/legacy-notes', express.static(env.legacyNotesDir))
  app.use(requestMetricsMiddleware)

  if (env.nodeEnv !== 'test') {
    app.use(morgan('dev'))
  }

  app.use(`${API_PREFIX}/admin`, adminRouter)
  app.use(`${API_PREFIX}/auth`, authRouter)
  app.use(`${API_PREFIX}/captcha`, captchaRouter)
  app.use(`${API_PREFIX}/memos`, memoRouter)
  app.use(`${API_PREFIX}/profile`, profileRouter)
  app.use(`${API_PREFIX}/public`, publicRouter)
  app.use(`${API_PREFIX}/rbac`, rbacRouter)
  app.use(API_PREFIX, healthRouter)
  app.use(API_PREFIX, interactionRouter)
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
