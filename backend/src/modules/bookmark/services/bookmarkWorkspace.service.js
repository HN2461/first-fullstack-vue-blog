import { Bookmark } from '#modules/bookmark/models/Bookmark.js'
import { BookmarkFolder } from '#modules/bookmark/models/BookmarkFolder.js'
import { BookmarkWorkspace } from '#modules/bookmark/models/BookmarkWorkspace.js'
import { assertWorkspace, createBookmarkError } from './bookmark.shared.js'

async function nextWorkspaceSortOrder(userId) {
  const latest = await BookmarkWorkspace.findOne({ userId }).sort({ sortOrder: -1 }).select('sortOrder').lean()
  return Number(latest?.sortOrder || 0) + 10
}

async function collectWorkspaceCounts(userId) {
  const [bookmarkCounts, folderCounts] = await Promise.all([
    Bookmark.aggregate([
      { $match: { userId } },
      { $group: { _id: '$workspaceId', count: { $sum: 1 } } }
    ]),
    BookmarkFolder.aggregate([
      { $match: { userId } },
      { $group: { _id: '$workspaceId', count: { $sum: 1 } } }
    ])
  ])
  return {
    bookmarks: new Map(bookmarkCounts.map((item) => [item._id.toString(), item.count])),
    folders: new Map(folderCounts.map((item) => [item._id.toString(), item.count]))
  }
}

export async function listBookmarkWorkspaces(userId) {
  const [workspaces, counts] = await Promise.all([
    BookmarkWorkspace.find({ userId }).sort({ sortOrder: 1, createdAt: 1 }),
    collectWorkspaceCounts(userId)
  ])
  return workspaces.map((workspace) => workspace.toSafeJSON({
    bookmarkCount: counts.bookmarks.get(workspace.id),
    folderCount: counts.folders.get(workspace.id)
  }))
}

export async function createBookmarkWorkspace(userId, input) {
  const existingCount = await BookmarkWorkspace.countDocuments({ userId })
  const shouldBePrimary = input.isPrimary === true || existingCount === 0
  if (shouldBePrimary) await BookmarkWorkspace.updateMany({ userId, isPrimary: true }, { $set: { isPrimary: false } })

  const workspace = await BookmarkWorkspace.create({
    userId,
    name: input.name,
    browserType: input.browserType,
    isPrimary: shouldBePrimary,
    sortOrder: input.sortOrder ?? await nextWorkspaceSortOrder(userId)
  })
  return workspace.toSafeJSON()
}

export async function updateBookmarkWorkspace(userId, workspaceId, input) {
  const workspace = await assertWorkspace(userId, workspaceId)
  if (input.isPrimary === true && !workspace.isPrimary) {
    await BookmarkWorkspace.updateMany({ userId, isPrimary: true }, { $set: { isPrimary: false } })
    workspace.isPrimary = true
  }
  if (input.name !== undefined) workspace.name = input.name
  if (input.browserType !== undefined) workspace.browserType = input.browserType
  if (input.sortOrder !== undefined) workspace.sortOrder = input.sortOrder
  await workspace.save()
  return workspace.toSafeJSON({
    bookmarkCount: await Bookmark.countDocuments({ userId, workspaceId }),
    folderCount: await BookmarkFolder.countDocuments({ userId, workspaceId })
  })
}

export async function clearBookmarkWorkspace(userId, workspaceId) {
  await assertWorkspace(userId, workspaceId)
  const [bookmarkResult, folderResult] = await Promise.all([
    Bookmark.deleteMany({ userId, workspaceId }),
    BookmarkFolder.deleteMany({ userId, workspaceId })
  ])
  return { deletedBookmarks: bookmarkResult.deletedCount, deletedFolders: folderResult.deletedCount }
}

export async function deleteBookmarkWorkspace(userId, workspaceId) {
  const workspace = await assertWorkspace(userId, workspaceId)
  await clearBookmarkWorkspace(userId, workspaceId)
  await workspace.deleteOne()

  if (workspace.isPrimary) {
    const next = await BookmarkWorkspace.findOne({ userId }).sort({ sortOrder: 1, createdAt: 1 })
    if (next) {
      next.isPrimary = true
      await next.save()
    }
  }
  return { id: workspaceId, deleted: true }
}

export async function reorderBookmarkWorkspaces(userId, ids = []) {
  const uniqueIds = [...new Set(ids)]
  const count = await BookmarkWorkspace.countDocuments({ userId, _id: { $in: uniqueIds } })
  if (count !== uniqueIds.length) {
    throw createBookmarkError(400, 'BOOKMARK_WORKSPACE_REORDER_INVALID', '包含不存在的书签库')
  }
  await Promise.all(uniqueIds.map((id, index) => BookmarkWorkspace.updateOne(
    { _id: id, userId },
    { $set: { sortOrder: (index + 1) * 10 } }
  )))
  return { updated: uniqueIds.length }
}
