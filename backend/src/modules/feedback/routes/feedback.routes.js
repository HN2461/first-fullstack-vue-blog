import { Router } from 'express'
import multer from 'multer'
import { requireAuth, requireAdmin, requireMenuAccess, requireAnyMenuAccess } from '#middlewares/auth.js'
import { isRoutePathMatched } from '#utils/routeMatch.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import {
  addFeedbackEvent,
  createFeedback,
  getFeedback,
  getFeedbackAttachment,
  listFeedback,
  listFeedbackEvents
} from '../services/feedback.service.js'
import { FEEDBACK_IMAGE_BYTES, FEEDBACK_IMAGE_LIMIT } from '../services/feedbackAttachment.service.js'
import { feedbackCreateSchema, feedbackEventSchema, parseFeedbackPayload } from '../validators/feedback.validator.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: FEEDBACK_IMAGE_BYTES,
    files: FEEDBACK_IMAGE_LIMIT,
    fields: 10,
    fieldSize: 45000,
    parts: 16
  }
}).array('images', FEEDBACK_IMAGE_LIMIT)

function receiveImages(req, res, next) {
  upload(req, res, (error) => {
    if (error) {
      error.statusCode = 400
      error.message = error.code === 'LIMIT_FILE_SIZE' ? '单张图片不能超过 5MB' : '最多上传 5 张图片，请检查附件和表单内容'
    }
    next(error)
  })
}

function registerRoutes(router, management) {
  router.get(
    '/',
    asyncHandler(async (req, res) => res.json(ok(await listFeedback(req.query, req.user, management))))
  )
  router.get(
    '/:id/events',
    asyncHandler(async (req, res) => res.json(ok(await listFeedbackEvents(req.params.id, req.query, req.user, management))))
  )
  router.get(
    '/:id',
    asyncHandler(async (req, res) => res.json(ok(await getFeedback(req.params.id, req.user, management))))
  )
  const actions = management ? ['reply', 'status', 'reopen'] : ['reply', 'reopen', 'withdraw']
  for (const action of actions) {
    router.post(
      `/:id/${action}`,
      receiveImages,
      asyncHandler(async (req, res) => {
        const input = parseFeedbackPayload(feedbackEventSchema, req.body)
        res.json(ok(await addFeedbackEvent(req.params.id, action, input, req.files || [], req.user, management), '反馈已更新'))
      })
    )
  }
}

export const feedbackRouter = Router()
feedbackRouter.use(requireAuth)
feedbackRouter.get(
  '/attachments/:id',
  requireAnyMenuAccess(['/console/feedback', '/console/manage/feedback']),
  asyncHandler(async (req, res) => {
    const management =
      req.rbacUser?.isSuperAdmin ||
      req.rbacUser?.permissions?.menuPaths?.some((item) => isRoutePathMatched('/console/manage/feedback', item))
    const { media, filePath } = await getFeedbackAttachment(req.params.id, req.user, management)
    res.set({ 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Type': media.mimeType })
    // 路径已限定在反馈根目录内；测试上传根目录含 .tmp，也需要允许其已授权文件读取。
    res.sendFile(filePath, { dotfiles: 'allow' })
  })
)
feedbackRouter.use(requireMenuAccess('/console/feedback'))
feedbackRouter.post(
  '/',
  receiveImages,
  asyncHandler(async (req, res) => {
    const input = parseFeedbackPayload(feedbackCreateSchema, req.body)
    res.status(201).json(ok(await createFeedback(input, req.files || [], req.user), '反馈已提交'))
  })
)
registerRoutes(feedbackRouter, false)

export const feedbackAdminRouter = Router()
feedbackAdminRouter.use(requireAuth, requireAdmin, requireMenuAccess('/console/manage/feedback'))
registerRoutes(feedbackAdminRouter, true)
