import { Router } from 'express'
import { ok } from '#utils/apiResponse.js'

export const healthRouter = Router()

healthRouter.get('/health', (req, res) => {
  res.json(ok({
    service: 'personal-fullstack-blog-api',
    status: 'ok',
    timestamp: new Date().toISOString()
  }))
})
