import mongoose from 'mongoose'
import { Bookmark } from '#modules/bookmark/models/Bookmark.js'
import { BookmarkFolder } from '#modules/bookmark/models/BookmarkFolder.js'
import { buildBookmarksHtml, parseBookmarksHtml } from './bookmarkHtml.service.js'

function createError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function normalizeUrl(url = '') {
  return String(url || '').trim()
}

function normalizeTags(tags = []) {
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

function assertObjectId(id, message = '数据不存在') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(404, 'BOOKMARK_NOT_FOUND', message)
  }
}

async function assertFolder(userId, folderId) {
  if (!folderId) return null
  assertObjectId(folderId, '文件夹不存在')
  const folder = await BookmarkFolder.findOne({ _id: folderId, userId })
  if (!folder) throw createError(404, 'BOOKMARK_FOLDER_NOT_FOUND', '文件夹不存在')
  return folder
}

async function findBookmark(userId, id) {
  assertObjectId(id, '书签不存在')
  const bookmark = await Bookmark.findOne({ _id: id, userId })
  if (!bookmark) throw createError(404, 'BOOKMARK_NOT_FOUND', '书签不存在')
  return bookmark
}

function buildFolderTree(folders = [], bookmarks = []) {
  const folderNodes = folders.map((folder) => ({ ...folder.toSafeJSON(), type: 'folder', children: [] }))
  const map = new Map(folderNodes.map((folder) => [folder.id, folder]))
  const roots = []

  for (const folder of folderNodes) {
    if (folder.parentId && map.has(folder.parentId)) {
      map.get(folder.parentId).children.push(folder)
    } else {
      roots.push(folder)
    }
  }

  for (const bookmark of bookmarks) {
    const node = { ...bookmark.toSafeJSON(), type: 'bookmark' }
    const parent = node.folderId ? map.get(node.folderId) : null
    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  const compare = (left, right) => (left.sortOrder || 0) - (right.sortOrder || 0) || String(left.title || left.name).localeCompare(String(right.title || right.name), 'zh-Hans-CN')
  const sortRecursive = (items) => {
    items.sort((left, right) => {
      if (left.type !== right.type) return left.type === 'folder' ? -1 : 1
      return compare(left, right)
    })
    items.forEach((item) => item.children && sortRecursive(item.children))
  }
  sortRecursive(roots)
  return roots
}

async function getNextSortOrder(Model, userId, parentField, parentId) {
  const query = { userId, [parentField]: parentId || null }
  const latest = await Model.findOne(query).sort({ sortOrder: -1 }).select('sortOrder').lean()
  return Number(latest?.sortOrder || 0) + 10
}

async function createOrFindFolder(userId, name, parentId, source) {
  const trimmedName = String(name || '').trim() || '未命名文件夹'
  const existing = await BookmarkFolder.findOne({ userId, parentId: parentId || null, name: trimmedName }).sort({ sortOrder: 1 })
  if (existing) return existing

  return BookmarkFolder.create({
    userId,
    name: trimmedName,
    parentId: parentId || null,
    source,
    sortOrder: await getNextSortOrder(BookmarkFolder, userId, 'parentId', parentId)
  })
}

async function collectChildFolderIds(userId, folderId) {
  const result = []
  const queue = [folderId]

  while (queue.length) {
    const current = queue.shift()
    result.push(current)
    const children = await BookmarkFolder.find({ userId, parentId: current }).select('_id')
    queue.push(...children.map((item) => item._id))
  }

  return result
}

async function assertNotDescendantFolder(userId, folderId, nextParentId) {
  if (!nextParentId) return
  const childIds = await collectChildFolderIds(userId, folderId)
  const childIdSet = new Set(childIds.map((item) => item.toString()))
  if (childIdSet.has(nextParentId.toString())) {
    throw createError(400, 'BOOKMARK_FOLDER_PARENT_CYCLE', '上级文件夹不能选择自己的下级文件夹')
  }
}

async function walkImportNode(userId, node, parentId, stats, source) {
  if (node.type === 'folder') {
    let nextParentId = parentId
    if (node.title !== 'root') {
      const folder = await createOrFindFolder(userId, node.title, parentId, source)
      nextParentId = folder._id
      stats.folders += 1
    }

    for (const child of node.children || []) {
      await walkImportNode(userId, child, nextParentId, stats, source)
    }
    return
  }

  const url = normalizeUrl(node.url)
  if (!url) {
    stats.skipped += 1
    return
  }

  stats.parsed += 1
  const existing = await Bookmark.findOne({ userId, url })
  if (existing) {
    existing.title = node.title || url
    existing.folderId = parentId || null
    existing.icon = node.icon || existing.icon || ''
    existing.addDate = node.addDate || existing.addDate || null
    if (node.tags !== undefined) existing.tags = normalizeTags(node.tags)
    if (node.note !== undefined) existing.note = node.note || ''
    existing.source = source
    existing.lastImportedAt = new Date()
    await existing.save()
    stats.updated += 1
    return
  }

  await Bookmark.create({
    userId,
    folderId: parentId || null,
    title: node.title || url,
    url,
    icon: node.icon || '',
    addDate: node.addDate || null,
    tags: normalizeTags(node.tags),
    note: node.note || '',
    source,
    lastImportedAt: new Date(),
    sortOrder: await getNextSortOrder(Bookmark, userId, 'folderId', parentId)
  })
  stats.inserted += 1
}

export async function listBookmarkFolders(userId) {
  const folders = await BookmarkFolder.find({ userId }).sort({ sortOrder: 1, createdAt: 1 })
  return folders.map((folder) => folder.toSafeJSON())
}

export async function createBookmarkFolder(userId, input) {
  await assertFolder(userId, input.parentId)
  const folder = await BookmarkFolder.create({
    userId,
    name: input.name,
    parentId: input.parentId || null,
    sortOrder: input.sortOrder ?? await getNextSortOrder(BookmarkFolder, userId, 'parentId', input.parentId),
    source: 'manual'
  })
  return folder.toSafeJSON()
}

export async function updateBookmarkFolder(userId, id, input) {
  const folder = await assertFolder(userId, id)
  if (input.parentId !== undefined) {
    if (input.parentId && input.parentId === id) throw createError(400, 'BOOKMARK_FOLDER_PARENT_SELF', '上级文件夹不能选择自身')
    await assertFolder(userId, input.parentId)
    await assertNotDescendantFolder(userId, folder._id, input.parentId)
    folder.parentId = input.parentId || null
  }
  if (input.name !== undefined) folder.name = input.name
  if (input.sortOrder !== undefined) folder.sortOrder = input.sortOrder
  await folder.save()
  return folder.toSafeJSON()
}

export async function deleteBookmarkFolder(userId, id) {
  const folder = await assertFolder(userId, id)
  const folderIds = await collectChildFolderIds(userId, folder._id)
  await Promise.all([
    Bookmark.deleteMany({ userId, folderId: { $in: folderIds } }),
    BookmarkFolder.deleteMany({ userId, _id: { $in: folderIds } })
  ])
  return { id: folder._id.toString(), deleted: true, deletedFolders: folderIds.length }
}

export async function reorderBookmarkFolders(userId, input) {
  await assertFolder(userId, input.parentId)
  const ids = [...new Set(input.ids)]
  const count = await BookmarkFolder.countDocuments({ userId, parentId: input.parentId || null, _id: { $in: ids } })
  if (count !== ids.length) throw createError(400, 'BOOKMARK_FOLDER_REORDER_INVALID', '只能排序同一层级下的文件夹')
  await Promise.all(ids.map((id, index) => BookmarkFolder.updateOne({ _id: id, userId }, { $set: { sortOrder: (index + 1) * 10 } })))
  return { updated: ids.length }
}

export async function listBookmarks(userId, filters = {}) {
  const page = Math.max(1, Number(filters.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 20))
  const query = { userId }
  const keyword = String(filters.keyword || '').trim()

  if (filters.folderId !== undefined && filters.folderId !== '') {
    await assertFolder(userId, filters.folderId)
    query.folderId = filters.folderId
  } else if (filters.folderId === '') {
    query.folderId = null
  }

  if (keyword) {
    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    query.$or = [{ title: regex }, { url: regex }, { note: regex }, { tags: regex }]
  }

  const [items, total] = await Promise.all([
    Bookmark.find(query).sort({ sortOrder: 1, updatedAt: -1 }).skip((page - 1) * pageSize).limit(pageSize),
    Bookmark.countDocuments(query)
  ])

  return { items: items.map((item) => item.toSafeJSON()), total, page, pageSize }
}

export async function createBookmark(userId, input) {
  await assertFolder(userId, input.folderId)
  const url = normalizeUrl(input.url)
  const existing = await Bookmark.findOne({ userId, url })
  if (existing) throw createError(409, 'BOOKMARK_URL_EXISTS', '该地址已存在，已按 URL 自动去重')

  const bookmark = await Bookmark.create({
    userId,
    folderId: input.folderId || null,
    title: input.title || url,
    url,
    note: input.note || '',
    tags: normalizeTags(input.tags),
    sortOrder: input.sortOrder ?? await getNextSortOrder(Bookmark, userId, 'folderId', input.folderId),
    source: 'manual'
  })
  return bookmark.toSafeJSON()
}

export async function updateBookmark(userId, id, input) {
  const bookmark = await findBookmark(userId, id)
  if (input.folderId !== undefined) {
    await assertFolder(userId, input.folderId)
    bookmark.folderId = input.folderId || null
  }
  if (input.url !== undefined) {
    const url = normalizeUrl(input.url)
    const existing = await Bookmark.findOne({ userId, url, _id: { $ne: bookmark._id } })
    if (existing) throw createError(409, 'BOOKMARK_URL_EXISTS', '该地址已存在，已按 URL 自动去重')
    bookmark.url = url
  }
  if (input.title !== undefined) bookmark.title = input.title || bookmark.url
  if (input.note !== undefined) bookmark.note = input.note || ''
  if (input.tags !== undefined) bookmark.tags = normalizeTags(input.tags)
  if (input.sortOrder !== undefined) bookmark.sortOrder = input.sortOrder
  await bookmark.save()
  return bookmark.toSafeJSON()
}

export async function deleteBookmark(userId, id) {
  const bookmark = await findBookmark(userId, id)
  await bookmark.deleteOne()
  return { id: bookmark._id.toString(), deleted: true }
}

export async function reorderBookmarks(userId, input) {
  await assertFolder(userId, input.folderId)
  const ids = [...new Set(input.ids)]
  const count = await Bookmark.countDocuments({ userId, folderId: input.folderId || null, _id: { $in: ids } })
  if (count !== ids.length) throw createError(400, 'BOOKMARK_REORDER_INVALID', '只能排序同一文件夹下的书签')
  await Promise.all(ids.map((id, index) => Bookmark.updateOne({ _id: id, userId }, { $set: { sortOrder: (index + 1) * 10 } })))
  return { updated: ids.length }
}

export async function importBookmarksFromHtml(userId, file) {
  if (!file?.buffer?.length) throw createError(400, 'BOOKMARK_IMPORT_FILE_REQUIRED', '请选择书签 HTML 文件')
  const html = file.buffer.toString('utf8').replace(/^\uFEFF/, '')
  const root = parseBookmarksHtml(html)
  const stats = { folders: 0, parsed: 0, inserted: 0, updated: 0, skipped: 0 }
  await walkImportNode(userId, root, null, stats, 'html_import')
  return stats
}

export async function exportBookmarksAsHtml(userId) {
  const [folders, bookmarks] = await Promise.all([
    BookmarkFolder.find({ userId }).sort({ sortOrder: 1, createdAt: 1 }),
    Bookmark.find({ userId }).sort({ sortOrder: 1, createdAt: 1 })
  ])
  return buildBookmarksHtml(buildFolderTree(folders, bookmarks))
}

export async function exportBookmarksAsJson(userId) {
  const [folders, bookmarks] = await Promise.all([
    BookmarkFolder.find({ userId }).sort({ sortOrder: 1, createdAt: 1 }),
    Bookmark.find({ userId }).sort({ sortOrder: 1, createdAt: 1 })
  ])
  return {
    schemaVersion: 1,
    source: 'bookmark_backup',
    exportedAt: new Date().toISOString(),
    folders: folders.map((item) => item.toSafeJSON()),
    bookmarks: bookmarks.map((item) => item.toSafeJSON())
  }
}

export async function importBookmarksFromJson(userId, file) {
  if (!file?.buffer?.length) throw createError(400, 'BOOKMARK_IMPORT_FILE_REQUIRED', '请选择书签 JSON 文件')
  let payload
  try {
    payload = JSON.parse(file.buffer.toString('utf8').replace(/^\uFEFF/, ''))
  } catch {
    throw createError(400, 'BOOKMARK_JSON_INVALID', 'JSON 备份文件格式不正确')
  }

  const folderIdMap = new Map()
  const stats = { folders: 0, parsed: 0, inserted: 0, updated: 0, skipped: 0 }
  for (const folder of payload.folders || []) {
    const parentId = folder.parentId ? folderIdMap.get(folder.parentId) : null
    const created = await createOrFindFolder(userId, folder.name, parentId, 'json_import')
    folderIdMap.set(folder.id, created._id)
    stats.folders += 1
  }

  for (const item of payload.bookmarks || []) {
    await walkImportNode(userId, {
      type: 'bookmark',
      title: item.title,
      url: item.url,
      icon: item.icon,
      addDate: item.addDate ? new Date(item.addDate) : null,
      tags: item.tags || [],
      note: item.note || ''
    }, item.folderId ? folderIdMap.get(item.folderId) : null, stats, 'json_import')
  }

  return stats
}
