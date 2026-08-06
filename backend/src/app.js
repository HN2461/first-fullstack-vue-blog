import path from 'node:path'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { API_PREFIX } from '#config/routes'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'
import { requestMetricsMiddleware } from './middlewares/requestMetrics.js'
import { resolveUploadRoot } from '#utils/uploadPath.js'
import { adminRouter } from '#modules/admin/routes/admin.routes.js'
import { authRouter } from '#modules/auth/routes/auth.routes.js'
import { bookmarkRouter } from '#modules/bookmark/routes/bookmark.routes.js'
import captchaRouter from '#modules/auth/routes/captcha.routes.js'
import { healthRouter } from '#modules/health/routes/health.routes.js'
import { interactionRouter } from '#modules/interaction/routes/interaction.routes.js'
import { ledgerRouter } from '#modules/ledger/routes/ledger.routes.js'
import { memoRouter } from '#modules/memo/routes/memo.routes.js'
import { logRelayRouter } from '#modules/logRelay/routes/logRelay.routes.js'
import { discussionRouter } from '#modules/discussion/routes/discussion.routes.js'
import profileRouter from '#modules/user/routes/profile.routes.js'
import { publicRouter } from '#modules/public/routes/public.routes.js'
import { rbacRouter } from '#modules/rbac/routes/rbac.routes.js'
import { teaDemoRouter } from '#modules/teaDemo/routes/teaDemo.routes.js'
import { questionBankRouter } from '#modules/questionBank/routes/questionBank.routes.js'
import {
  resumeExportRouter,
  resumeInterviewRouter,
  resumeMaterialRouter,
  resumeRouter,
  resumeTemplateRouter
} from '#modules/resume/routes/resume.routes.js'

export function createApp() {
  const app = express()
  const mainAllowedOrigins = new Set((env.clientOrigins || []).filter(Boolean))
  const teaDemoAllowedOrigins = new Set((env.teaDemoClientOrigins || []).filter(Boolean))

  app.use(helmet())
  app.use(cors((req, callback) => {
    const origin = req.get('Origin') || ''
    const isTeaDemoRequest = req.path === `${API_PREFIX}/tea-demo/v1` || req.path.startsWith(`${API_PREFIX}/tea-demo/v1/`)
    const allowedOrigins = isTeaDemoRequest ? teaDemoAllowedOrigins : mainAllowedOrigins

    if (!origin || !allowedOrigins.size || allowedOrigins.has(origin)) {
      callback(null, { origin: true, credentials: true })
      return
    }

    const error = new Error(`CORS 不允许来源：${origin}`)
    error.statusCode = 403
    error.code = 'CORS_ORIGIN_DENIED'
    callback(error)
  }))
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use('/uploads', express.static(resolveUploadRoot()))
  app.use('/legacy-notes', express.static(env.legacyNotesDir))
  app.use(requestMetricsMiddleware)

  if (env.nodeEnv !== 'test') {
    app.use(morgan('dev'))
  }

  app.use(`${API_PREFIX}/admin`, adminRouter)
  app.use(`${API_PREFIX}/auth`, authRouter)
  app.use(`${API_PREFIX}/bookmarks`, bookmarkRouter)
  app.use(`${API_PREFIX}/captcha`, captchaRouter)
  app.use(`${API_PREFIX}/ledger`, ledgerRouter)
  app.use(`${API_PREFIX}/memos`, memoRouter)
  app.use(`${API_PREFIX}/log-relay`, logRelayRouter)
  app.use(`${API_PREFIX}/resumes`, resumeRouter)
  app.use(`${API_PREFIX}/resume-interviews`, resumeInterviewRouter)
  app.use(`${API_PREFIX}/resume-materials`, resumeMaterialRouter)
  app.use(`${API_PREFIX}/resume-templates`, resumeTemplateRouter)
  app.use(`${API_PREFIX}/resume-exports`, resumeExportRouter)
  app.use(`${API_PREFIX}/discussions`, discussionRouter)
  app.use(`${API_PREFIX}/profile`, profileRouter)
  app.use(`${API_PREFIX}/public`, publicRouter)
  app.use(`${API_PREFIX}/rbac`, rbacRouter)
  app.use(`${API_PREFIX}/tea-demo/v1`, teaDemoRouter)
  app.use(`${API_PREFIX}/question-bank`, questionBankRouter)
  app.use(API_PREFIX, healthRouter)
  app.use(API_PREFIX, interactionRouter)
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
