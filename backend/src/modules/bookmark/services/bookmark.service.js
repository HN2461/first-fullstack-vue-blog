import { Bookmark } from '#modules/bookmark/models/Bookmark.js'
import { BookmarkFolder } from '#modules/bookmark/models/BookmarkFolder.js'
import { buildBookmarkSimilarityKey, buildBookmarkUrlKey, normalizeBookmarkUrl } from '../utils/bookmarkUrl.js'
import {
  assertFolder,
  assertNotDescendantFolder,
  assertWorkspace,
  collectChildFolderIds,
  createBookmarkError,
  findBookmark,
  getNextSortOrder,
  normalizeTags
} from './bookmark.shared.js'

export async function listBookmarkFolders(userId, workspaceId) {
  await assertWorkspace(userId, workspaceId)
  const folders = await BookmarkFolder.find({ userId, workspaceId }).sort({ sortOrder: 1, createdAt: 1 })
  return folders.map((folder) => folder.toSafeJSON())
}

export async function createBookmarkFolder(userId, workspaceId, input) {
  await assertWorkspace(userId, workspaceId)
  await assertFolder(userId, workspaceId, input.parentId)
  const folder = await BookmarkFolder.create({
    userId,
    workspaceId,
    name: input.name,
    parentId: input.parentId || null,
    sortOrder: input.sortOrder ?? await getNextSortOrder(BookmarkFolder, userId, workspaceId, 'parentId', input.parentId),
    source: 'manual'
  })
  return folder.toSafeJSON()
}

export async function updateBookmarkFolder(userId, workspaceId, id, input) {
  const folder = await assertFolder(userId, workspaceId, id)
  if (input.parentId !== undefined) {
    if (input.parentId && input.parentId === id) {
      throw createBookmarkError(400, 'BOOKMARK_FOLDER_PARENT_SELF', '上级文件夹不能选择自身')
    }
    await assertFolder(userId, workspaceId, input.parentId)
    await assertNotDescendantFolder(userId, workspaceId, folder._id, input.parentId)
    folder.parentId = input.parentId || null
    if (input.sortOrder === undefined) {
      folder.sortOrder = await getNextSortOrder(BookmarkFolder, userId, workspaceId, 'parentId', input.parentId)
    }
  }
  if (input.name !== undefined) folder.name = input.name
  if (input.sortOrder !== undefined) folder.sortOrder = input.sortOrder
  await folder.save()
  return folder.toSafeJSON()
}

export async function deleteBookmarkFolder(userId, workspaceId, id) {
  const folder = await assertFolder(userId, workspaceId, id)
  const folderIds = await collectChildFolderIds(userId, workspaceId, folder._id)
  const [bookmarkResult] = await Promise.all([
    Bookmark.deleteMany({ userId, workspaceId, folderId: { $in: folderIds } }),
    BookmarkFolder.deleteMany({ userId, workspaceId, _id: { $in: folderIds } })
  ])
  return { id, deleted: true, deletedFolders: folderIds.length, deletedBookmarks: bookmarkResult.deletedCount }
}

export async function reorderBookmarkFolders(userId, workspaceId, input) {
  await assertWorkspace(userId, workspaceId)
  await assertFolder(userId, workspaceId, input.parentId)
  const ids = [...new Set(input.ids)]
  const count = await BookmarkFolder.countDocuments({ userId, workspaceId, parentId: input.parentId || null, _id: { $in: ids } })
  if (count !== ids.length) throw createBookmarkError(400, 'BOOKMARK_FOLDER_REORDER_INVALID', '只能排序同一层级下的文件夹')
  await Promise.all(ids.map((id, index) => BookmarkFolder.updateOne(
    { _id: id, userId, workspaceId },
    { $set: { sortOrder: (index + 1) * 10 } }
  )))
  return { updated: ids.length }
}

export async function listBookmarks(userId, workspaceId, filters = {}) {
  await assertWorkspace(userId, workspaceId)
  const page = Math.max(1, Number(filters.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 20))
  const query = { userId, workspaceId }
  const keyword = String(filters.keyword || '').trim()

  if (filters.folderId !== undefined && filters.folderId !== '') {
    await assertFolder(userId, workspaceId, filters.folderId)
    query.folderId = filters.folderId
  } else if (filters.folderId === '') query.folderId = null

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

export async function createBookmark(userId, workspaceId, input) {
  await assertWorkspace(userId, workspaceId)
  await assertFolder(userId, workspaceId, input.folderId)
  const url = normalizeBookmarkUrl(input.url)
  const urlKey = buildBookmarkUrlKey(url)
  const existing = await Bookmark.findOne({ userId, workspaceId, urlKey })
  if (existing) throw createBookmarkError(409, 'BOOKMARK_URL_EXISTS', '当前书签库已存在该地址')
  const bookmark = await Bookmark.create({
    userId,
    workspaceId,
    folderId: input.folderId || null,
    title: input.title || url,
    url,
    urlKey,
    similarityKey: buildBookmarkSimilarityKey(url),
    note: input.note || '',
    tags: normalizeTags(input.tags),
    sortOrder: input.sortOrder ?? await getNextSortOrder(Bookmark, userId, workspaceId, 'folderId', input.folderId),
    source: 'manual'
  })
  return bookmark.toSafeJSON()
}

export async function updateBookmark(userId, workspaceId, id, input) {
  const bookmark = await findBookmark(userId, workspaceId, id)
  if (input.folderId !== undefined) {
    await assertFolder(userId, workspaceId, input.folderId)
    bookmark.folderId = input.folderId || null
  }
  if (input.url !== undefined) {
    const url = normalizeBookmarkUrl(input.url)
    const urlKey = buildBookmarkUrlKey(url)
    const existing = await Bookmark.findOne({ userId, workspaceId, urlKey, _id: { $ne: bookmark._id } })
    if (existing) throw createBookmarkError(409, 'BOOKMARK_URL_EXISTS', '当前书签库已存在该地址')
    bookmark.url = url
    bookmark.urlKey = urlKey
    bookmark.similarityKey = buildBookmarkSimilarityKey(url)
  }
  if (input.title !== undefined) bookmark.title = input.title || bookmark.url
  if (input.note !== undefined) bookmark.note = input.note || ''
  if (input.tags !== undefined) bookmark.tags = normalizeTags(input.tags)
  if (input.sortOrder !== undefined) bookmark.sortOrder = input.sortOrder
  await bookmark.save()
  return bookmark.toSafeJSON()
}

export async function deleteBookmark(userId, workspaceId, id) {
  const bookmark = await findBookmark(userId, workspaceId, id)
  await bookmark.deleteOne()
  return { id, deleted: true }
}

export async function reorderBookmarks(userId, workspaceId, input) {
  await assertWorkspace(userId, workspaceId)
  await assertFolder(userId, workspaceId, input.folderId)
  const ids = [...new Set(input.ids)]
  const count = await Bookmark.countDocuments({ userId, workspaceId, folderId: input.folderId || null, _id: { $in: ids } })
  if (count !== ids.length) throw createBookmarkError(400, 'BOOKMARK_REORDER_INVALID', '只能排序同一文件夹下的书签')
  await Promise.all(ids.map((id, index) => Bookmark.updateOne(
    { _id: id, userId, workspaceId },
    { $set: { sortOrder: (index + 1) * 10 } }
  )))
  return { updated: ids.length }
}

export async function moveBookmarks(userId, workspaceId, input) {
  await assertWorkspace(userId, workspaceId)
  await assertFolder(userId, workspaceId, input.folderId)
  const ids = [...new Set(input.ids)]
  const count = await Bookmark.countDocuments({ userId, workspaceId, _id: { $in: ids } })
  if (count !== ids.length) throw createBookmarkError(404, 'BOOKMARK_NOT_FOUND', '包含不存在的书签')
  const folderId = input.folderId || null
  const baseSortOrder = await getNextSortOrder(Bookmark, userId, workspaceId, 'folderId', folderId)
  await Promise.all(ids.map((id, index) => Bookmark.updateOne(
    { _id: id, userId, workspaceId },
    { $set: { folderId, sortOrder: baseSortOrder + index * 10 } }
  )))
  return { updated: ids.length, folderId: folderId?.toString?.() || null }
}
