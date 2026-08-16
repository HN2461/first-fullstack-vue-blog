import mongoose from 'mongoose'
import { TodoItem, TODO_ITEM_PRIORITIES } from '#modules/todo/models/TodoItem.js'
import { TodoList, TODO_LIST_STATUSES, TODO_LIST_TYPES } from '#modules/todo/models/TodoList.js'

function createError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function normalizeDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function buildListQuery(userId, filters = {}) {
  const query = { createdBy: userId }
  const keyword = String(filters.keyword || '').trim()
  if (filters.status && TODO_LIST_STATUSES.includes(filters.status)) query.status = filters.status
  if (filters.type && TODO_LIST_TYPES.includes(filters.type)) query.type = filters.type

  if (filters.date === 'today') {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    query.planDate = { $gte: start, $lt: end }
  }

  if (keyword) query.title = { $regex: keyword, $options: 'i' }
  return query
}

async function findOwnedList(id, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(404, 'TODO_LIST_NOT_FOUND', '待办清单不存在')
  }
  const list = await TodoList.findOne({ _id: id, createdBy: userId })
  if (!list) throw createError(404, 'TODO_LIST_NOT_FOUND', '待办清单不存在')
  return list
}

async function findOwnedItem(id, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(404, 'TODO_ITEM_NOT_FOUND', '待办事项不存在')
  }
  const item = await TodoItem.findOne({ _id: id, createdBy: userId })
  if (!item) throw createError(404, 'TODO_ITEM_NOT_FOUND', '待办事项不存在')
  return item
}

async function getItemStats(userId, listIds) {
  if (!listIds.length) return new Map()
  const rows = await TodoItem.aggregate([
    { $match: { createdBy: userId, listId: { $in: listIds } } },
    {
      $group: {
        _id: '$listId',
        total: { $sum: 1 },
        completed: { $sum: { $cond: ['$completed', 1, 0] } }
      }
    }
  ])
  return new Map(rows.map((row) => [row._id.toString(), { total: row.total, completed: row.completed }]))
}

function withStats(list, stats) {
  return {
    ...list.toSafeJSON(),
    itemCount: stats?.total || 0,
    completedCount: stats?.completed || 0
  }
}

export async function listTodoLists(userId, filters = {}) {
  const page = Math.max(1, parseInt(filters.page, 10) || 1)
  const pageSize = Math.min(50, Math.max(1, parseInt(filters.pageSize, 10) || 30))
  const query = buildListQuery(userId, filters)
  const [lists, total] = await Promise.all([
    TodoList.find(query)
      .sort({ isPinned: -1, planDate: 1, updatedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    TodoList.countDocuments(query)
  ])
  const stats = await getItemStats(userId, lists.map((list) => list._id))
  return {
    items: lists.map((list) => withStats(list, stats.get(list._id.toString()))),
    total,
    page,
    pageSize
  }
}

export async function getTodoStats(userId) {
  const [lists, items] = await Promise.all([
    TodoList.countDocuments({ createdBy: userId, status: 'active' }),
    TodoItem.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: '$completed', count: { $sum: 1 } } }
    ])
  ])
  const completed = items.find((row) => row._id === true)?.count || 0
  const total = items.reduce((sum, row) => sum + row.count, 0)
  return { lists, totalItems: total, openItems: total - completed, completedItems: completed }
}

export async function getTodoList(id, userId) {
  const list = await findOwnedList(id, userId)
  const items = await TodoItem.find({ listId: list._id, createdBy: userId })
    .sort({ completed: 1, sortOrder: 1, createdAt: 1 })
  const stats = { total: items.length, completed: items.filter((item) => item.completed).length }
  return { ...withStats(list, stats), items: items.map((item) => item.toSafeJSON()) }
}

export async function createTodoList(userId, input) {
  const list = await TodoList.create({
    title: input.title.trim(),
    type: input.type || 'custom',
    planDate: normalizeDate(input.planDate),
    isPinned: input.isPinned === true,
    createdBy: userId
  })
  return withStats(list, null)
}

export async function updateTodoList(id, userId, input) {
  const list = await findOwnedList(id, userId)
  if (input.title !== undefined) list.title = input.title.trim()
  if (input.type !== undefined) list.type = input.type
  if (input.planDate !== undefined) list.planDate = normalizeDate(input.planDate)
  if (input.status !== undefined) list.status = input.status
  if (input.isPinned !== undefined) list.isPinned = input.isPinned
  await list.save()
  const stats = await getItemStats(userId, [list._id])
  return withStats(list, stats.get(list._id.toString()))
}

export async function deleteTodoList(id, userId) {
  const list = await findOwnedList(id, userId)
  await Promise.all([
    TodoItem.deleteMany({ listId: list._id, createdBy: userId }),
    list.deleteOne()
  ])
  return { id: list._id.toString(), deleted: true }
}

export async function createTodoItem(listId, userId, input) {
  const list = await findOwnedList(listId, userId)
  if (list.status === 'archived') throw createError(400, 'TODO_LIST_ARCHIVED', '已归档清单不能新增事项')
  const lastItem = await TodoItem.findOne({ listId: list._id, createdBy: userId }).sort({ sortOrder: -1 })
  const item = await TodoItem.create({
    listId: list._id,
    createdBy: userId,
    title: input.title.trim(),
    note: input.note?.trim() || '',
    priority: input.priority || 'medium',
    sortOrder: input.sortOrder ?? ((lastItem?.sortOrder || 0) + 10)
  })
  list.updatedAt = new Date()
  await list.save()
  return item.toSafeJSON()
}

export async function updateTodoItem(id, userId, input) {
  const item = await findOwnedItem(id, userId)
  if (input.title !== undefined) item.title = input.title.trim()
  if (input.note !== undefined) item.note = input.note.trim()
  if (input.priority !== undefined) item.priority = input.priority
  if (input.sortOrder !== undefined) item.sortOrder = input.sortOrder
  if (input.completed !== undefined) {
    item.completed = input.completed
    item.completedAt = input.completed ? (item.completedAt || new Date()) : null
  }
  await item.save()
  await TodoList.updateOne({ _id: item.listId, createdBy: userId }, { $set: { updatedAt: new Date() } })
  return item.toSafeJSON()
}

export async function deleteTodoItem(id, userId) {
  const item = await findOwnedItem(id, userId)
  await item.deleteOne()
  await TodoList.updateOne({ _id: item.listId, createdBy: userId }, { $set: { updatedAt: new Date() } })
  return { id: item._id.toString(), deleted: true }
}

export { TODO_ITEM_PRIORITIES }
