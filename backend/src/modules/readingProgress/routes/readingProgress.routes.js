import { Router } from 'express'
import { requireAuth } from '#middlewares/auth.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import {
  deleteReadingProgress,
  getReadingProgress,
  listReadingProgress,
  saveReadingProgress
} from '../services/readingProgress.service.js'
import {
  parseReadingProgressBody,
  parseReadingProgressQuery
} from '../validators/readingProgress.validator.js'

export const readingProgressRouter = Router()

readingProgressRouter.use(requireAuth)

/** 获取当前登录用户的最近阅读记录；已下架文章不会出现在列表中。 */
readingProgressRouter.get('/reading-progress', asyncHandler(async (req, res) => {
  const query = parseReadingProgressQuery(req.query)
  res.json(ok(await listReadingProgress(req.user._id, query)))
}))

/** 获取当前登录用户的单篇文章阅读进度；无记录时 data 为 null。 */
readingProgressRouter.get('/:articleId/reading-progress', asyncHandler(async (req, res) => {
  res.json(ok(await getReadingProgress(req.params.articleId, req.user._id)))
}))

/** 保存当前登录用户的单篇文章阅读进度；请求体错误或文章不可读时拒绝写入。 */
readingProgressRouter.put('/:articleId/reading-progress', asyncHandler(async (req, res) => {
  const input = parseReadingProgressBody(req.body)
  res.json(ok(await saveReadingProgress(req.params.articleId, req.user._id, input), '阅读进度已保存'))
}))

/** 清除当前登录用户的单篇文章阅读进度；重复清除保持幂等。 */
readingProgressRouter.delete('/:articleId/reading-progress', asyncHandler(async (req, res) => {
  res.json(ok(await deleteReadingProgress(req.params.articleId, req.user._id), '阅读进度已清除'))
}))
