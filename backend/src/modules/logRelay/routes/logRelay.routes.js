import express, { Router } from 'express'
import { requireAuth, requireMenuAccess } from '#middlewares/auth.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import {
  clearLogRelayEntries,
  createLogRelayEntry,
  listLogRelayEntries
} from '#modules/logRelay/services/logRelay.service.js'

export const logRelayRouter = Router()

// 上传接口保留为公开入口，便于安卓设备和脚本直接推送原始文本；查询与清空仍受控制台菜单权限保护。
logRelayRouter.post(
  '/',
  express.text({ type: ['text/plain', 'text/*'], limit: '2mb' }),
  asyncHandler(async (req, res) => {
    res.status(201).json(ok(await createLogRelayEntry(req.body), '日志已接收'))
  })
)

logRelayRouter.use(requireAuth)
logRelayRouter.use(requireMenuAccess('/console/log-relay'))

logRelayRouter.get('/', asyncHandler(async (req, res) => {
  res.json(ok(await listLogRelayEntries()))
}))

logRelayRouter.delete('/', asyncHandler(async (req, res) => {
  res.json(ok(await clearLogRelayEntries(), '日志已全部清空'))
}))
