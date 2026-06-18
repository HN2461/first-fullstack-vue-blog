import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.js'
import { createMemo, deleteMemo, getMemoStats, listMemos, updateMemo } from '../services/memo.service.js'
import { ok } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { memoCreateSchema, memoUpdateSchema, parseBody } from '../validators/memo.validator.js'

export const memoRouter = Router()

memoRouter.use(requireAuth)

memoRouter.get('/', asyncHandler(async (req, res) => {
  res.json(ok(await listMemos(req.user._id, req.query)))
}))

memoRouter.get('/stats', asyncHandler(async (req, res) => {
  res.json(ok(await getMemoStats(req.user._id)))
}))

memoRouter.post('/', asyncHandler(async (req, res) => {
  const input = parseBody(memoCreateSchema, req.body)
  res.status(201).json(ok(await createMemo(input, req.user._id), '备忘录已保存'))
}))

memoRouter.patch('/:id', asyncHandler(async (req, res) => {
  const input = parseBody(memoUpdateSchema, req.body)
  res.json(ok(await updateMemo(req.params.id, input, req.user._id), '备忘录已更新'))
}))

memoRouter.delete('/:id', asyncHandler(async (req, res) => {
  res.json(ok(await deleteMemo(req.params.id, req.user._id), '备忘录已删除'))
}))
