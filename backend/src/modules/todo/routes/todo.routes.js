import { Router } from 'express'
import { requireAuth, requireMenuAccess } from '#middlewares/auth.js'
import { ok } from '#utils/apiResponse.js'
import { asyncHandler } from '#utils/asyncHandler.js'
import {
  createTodoItem,
  createTodoList,
  deleteTodoItem,
  deleteTodoList,
  getTodoList,
  getTodoStats,
  listTodoLists,
  updateTodoItem,
  updateTodoList
} from '#modules/todo/services/todo.service.js'
import {
  parseBody,
  todoItemCreateSchema,
  todoItemUpdateSchema,
  todoListCreateSchema,
  todoListUpdateSchema
} from '#modules/todo/validators/todo.validator.js'

export const todoRouter = Router()

todoRouter.use(requireAuth)
todoRouter.use(requireMenuAccess('/console/todos'))

todoRouter.get('/', asyncHandler(async (req, res) => {
  res.json(ok(await listTodoLists(req.user._id, req.query)))
}))

todoRouter.get('/stats', asyncHandler(async (req, res) => {
  res.json(ok(await getTodoStats(req.user._id)))
}))

todoRouter.post('/', asyncHandler(async (req, res) => {
  const input = parseBody(todoListCreateSchema, req.body)
  res.status(201).json(ok(await createTodoList(req.user._id, input), '待办清单已创建'))
}))

todoRouter.get('/:id', asyncHandler(async (req, res) => {
  res.json(ok(await getTodoList(req.params.id, req.user._id)))
}))

todoRouter.patch('/:id', asyncHandler(async (req, res) => {
  const input = parseBody(todoListUpdateSchema, req.body)
  res.json(ok(await updateTodoList(req.params.id, req.user._id, input), '待办清单已更新'))
}))

todoRouter.delete('/:id', asyncHandler(async (req, res) => {
  res.json(ok(await deleteTodoList(req.params.id, req.user._id), '待办清单已删除'))
}))

todoRouter.post('/:id/items', asyncHandler(async (req, res) => {
  const input = parseBody(todoItemCreateSchema, req.body)
  res.status(201).json(ok(await createTodoItem(req.params.id, req.user._id, input), '待办事项已添加'))
}))

todoRouter.patch('/:id/items/:itemId', asyncHandler(async (req, res) => {
  const input = parseBody(todoItemUpdateSchema, req.body)
  const item = await getTodoList(req.params.id, req.user._id)
  if (!item.items.some((entry) => entry.id === req.params.itemId)) {
    res.status(404).json({ code: 'TODO_ITEM_NOT_FOUND', message: '待办事项不存在' })
    return
  }
  res.json(ok(await updateTodoItem(req.params.itemId, req.user._id, input), '待办事项已更新'))
}))

todoRouter.delete('/:id/items/:itemId', asyncHandler(async (req, res) => {
  const list = await getTodoList(req.params.id, req.user._id)
  if (!list.items.some((entry) => entry.id === req.params.itemId)) {
    res.status(404).json({ code: 'TODO_ITEM_NOT_FOUND', message: '待办事项不存在' })
    return
  }
  res.json(ok(await deleteTodoItem(req.params.itemId, req.user._id), '待办事项已删除'))
}))
