import mongoose from 'mongoose'
import { Bookmark } from '#modules/bookmark/models/Bookmark.js'
import { BookmarkFolder } from '#modules/bookmark/models/BookmarkFolder.js'
import { BookmarkWorkspace } from '#modules/bookmark/models/BookmarkWorkspace.js'

export function createBookmarkError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

export function assertObjectId(id, message = '数据不存在') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createBookmarkError(404, 'BOOKMARK_NOT_FOUND', message)
  }
}

export function normalizeTags(tags = []) {
  const seen = new Set()
  return (Array.isArray(tags) ? tags : [])
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .filter((tag) => {
      const key = tag.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 12)
}

export async function assertWorkspace(userId, workspaceId) {
  assertObjectId(workspaceId, '书签库不存在')
  const workspace = await BookmarkWorkspace.findOne({ _id: workspaceId, userId })
  if (!workspace) throw createBookmarkError(404, 'BOOKMARK_WORKSPACE_NOT_FOUND', '书签库不存在')
  return workspace
}

export async function assertFolder(userId, workspaceId, folderId) {
  if (!folderId) return null
  assertObjectId(folderId, '文件夹不存在')
  const folder = await BookmarkFolder.findOne({ _id: folderId, userId, workspaceId })
  if (!folder) throw createBookmarkError(404, 'BOOKMARK_FOLDER_NOT_FOUND', '文件夹不存在')
  return folder
}

export async function findBookmark(userId, workspaceId, id) {
  assertObjectId(id, '书签不存在')
  const bookmark = await Bookmark.findOne({ _id: id, userId, workspaceId })
  if (!bookmark) throw createBookmarkError(404, 'BOOKMARK_NOT_FOUND', '书签不存在')
  return bookmark
}

export async function getNextSortOrder(Model, userId, workspaceId, parentField, parentId) {
  const query = { userId, workspaceId, [parentField]: parentId || null }
  const latest = await Model.findOne(query).sort({ sortOrder: -1 }).select('sortOrder').lean()
  return Number(latest?.sortOrder || 0) + 10
}

export async function collectChildFolderIds(userId, workspaceId, folderId) {
  const result = []
  const queue = [folderId]

  while (queue.length) {
    const current = queue.shift()
    result.push(current)
    const children = await BookmarkFolder.find({ userId, workspaceId, parentId: current }).select('_id')
    queue.push(...children.map((item) => item._id))
  }

  return result
}

export async function assertNotDescendantFolder(userId, workspaceId, folderId, nextParentId) {
  if (!nextParentId) return
  const childIds = await collectChildFolderIds(userId, workspaceId, folderId)
  const childIdSet = new Set(childIds.map((item) => item.toString()))
  if (childIdSet.has(nextParentId.toString())) {
    throw createBookmarkError(400, 'BOOKMARK_FOLDER_PARENT_CYCLE', '上级文件夹不能选择自己的下级文件夹')
  }
}

export function buildFolderTree(folders = [], bookmarks = []) {
  const folderNodes = folders.map((folder) => ({ ...folder.toSafeJSON(), type: 'folder', children: [] }))
  const map = new Map(folderNodes.map((folder) => [folder.id, folder]))
  const roots = []

  for (const folder of folderNodes) {
    if (folder.parentId && map.has(folder.parentId)) map.get(folder.parentId).children.push(folder)
    else roots.push(folder)
  }

  for (const bookmark of bookmarks) {
    const node = { ...bookmark.toSafeJSON(), type: 'bookmark' }
    const parent = node.folderId ? map.get(node.folderId) : null
    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  const compare = (left, right) => (left.sortOrder || 0) - (right.sortOrder || 0)
    || String(left.title || left.name).localeCompare(String(right.title || right.name), 'zh-Hans-CN')
  const sortRecursive = (items) => {
    items.sort((left, right) => left.type !== right.type ? (left.type === 'folder' ? -1 : 1) : compare(left, right))
    items.forEach((item) => item.children && sortRecursive(item.children))
  }
  sortRecursive(roots)
  return roots
}
