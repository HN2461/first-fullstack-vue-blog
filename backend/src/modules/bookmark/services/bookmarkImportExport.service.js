import { Bookmark } from '#modules/bookmark/models/Bookmark.js'
import { BookmarkFolder } from '#modules/bookmark/models/BookmarkFolder.js'
import { BookmarkWorkspace } from '#modules/bookmark/models/BookmarkWorkspace.js'
import { buildBookmarksHtml, parseBookmarksHtml } from './bookmarkHtml.service.js'
import { buildBookmarkSimilarityKey, buildBookmarkUrlKey, normalizeBookmarkUrl } from '../utils/bookmarkUrl.js'
import {
  assertWorkspace,
  buildFolderTree,
  createBookmarkError,
  getNextSortOrder,
  normalizeTags
} from './bookmark.shared.js'

function isBrowserToolbarFolder(title, parentId) {
  if (parentId) return false
  return [
    '书签栏',
    '收藏夹栏',
    '书签工具栏',
    'bookmarks bar',
    'favorites bar',
    'bookmarks toolbar'
  ].includes(String(title || '').trim().toLowerCase())
}

async function createOrFindFolder(userId, workspaceId, name, parentId, source, sortOrder) {
  const trimmedName = String(name || '').trim() || '未命名文件夹'
  const existing = await BookmarkFolder.findOne({
    userId,
    workspaceId,
    parentId: parentId || null,
    name: trimmedName
  }).sort({ sortOrder: 1 })
  if (existing) return existing

  return BookmarkFolder.create({
    userId,
    workspaceId,
    name: trimmedName,
    parentId: parentId || null,
    source,
    sortOrder: sortOrder ?? await getNextSortOrder(BookmarkFolder, userId, workspaceId, 'parentId', parentId)
  })
}

async function walkImportNode(userId, workspaceId, node, parentId, stats, source, mode) {
  if (node.type === 'folder') {
    let nextParentId = parentId
    if (node.title !== 'root' && !isBrowserToolbarFolder(node.title, parentId)) {
      const folder = await createOrFindFolder(userId, workspaceId, node.title, parentId, source)
      nextParentId = folder._id
      stats.folders += 1
    }
    for (const child of node.children || []) {
      await walkImportNode(userId, workspaceId, child, nextParentId, stats, source, mode)
    }
    return
  }

  const url = normalizeBookmarkUrl(node.url)
  const urlKey = buildBookmarkUrlKey(url)
  if (!urlKey) {
    stats.skipped += 1
    return
  }

  stats.parsed += 1
  const existing = await Bookmark.findOne({ userId, workspaceId, urlKey })
  if (existing) {
    existing.title = node.title || existing.title || url
    if (mode !== 'merge') existing.folderId = parentId || null
    existing.icon = node.icon || existing.icon || ''
    existing.addDate = node.addDate || existing.addDate || null
    if (node.tags !== undefined) existing.tags = normalizeTags(node.tags)
    if (node.note !== undefined) existing.note = node.note || ''
    if (mode !== 'merge' && node.sortOrder !== undefined) existing.sortOrder = node.sortOrder
    existing.source = source
    existing.lastImportedAt = new Date()
    await existing.save()
    stats.updated += 1
    return
  }

  await Bookmark.create({
    userId,
    workspaceId,
    folderId: parentId || null,
    title: node.title || url,
    url,
    urlKey,
    similarityKey: buildBookmarkSimilarityKey(url),
    icon: node.icon || '',
    addDate: node.addDate || null,
    tags: normalizeTags(node.tags),
    note: node.note || '',
    source,
    lastImportedAt: new Date(),
    sortOrder: node.sortOrder ?? await getNextSortOrder(Bookmark, userId, workspaceId, 'folderId', parentId)
  })
  stats.inserted += 1
}

async function prepareWorkspaceImport(userId, workspaceId, file, mode) {
  const workspace = await assertWorkspace(userId, workspaceId)
  if (!file?.buffer?.length) throw createBookmarkError(400, 'BOOKMARK_IMPORT_FILE_REQUIRED', '请选择书签文件')
  let snapshot = null
  if (mode === 'replace') {
    const [folders, bookmarks] = await Promise.all([
      BookmarkFolder.find({ userId, workspaceId }).lean(),
      Bookmark.find({ userId, workspaceId }).lean()
    ])
    snapshot = { folders, bookmarks }
    await Promise.all([
      Bookmark.deleteMany({ userId, workspaceId }),
      BookmarkFolder.deleteMany({ userId, workspaceId })
    ])
  }
  return { workspace, snapshot }
}

async function rollbackWorkspaceImport(userId, workspaceId, snapshot, originalError) {
  if (!snapshot) return
  try {
    await Promise.all([
      Bookmark.deleteMany({ userId, workspaceId }),
      BookmarkFolder.deleteMany({ userId, workspaceId })
    ])
    if (snapshot.folders.length) await BookmarkFolder.insertMany(snapshot.folders)
    if (snapshot.bookmarks.length) await Bookmark.insertMany(snapshot.bookmarks)
  } catch (rollbackError) {
    originalError.message = `${originalError.message}；原书签数据自动恢复失败，请立即检查数据库备份`
    originalError.rollbackError = rollbackError
  }
}

function normalizeJsonSortOrder(value, fieldName) {
  if (value === undefined || value === null) return undefined
  const sortOrder = Number(value)
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 999999) {
    throw createBookmarkError(400, 'BOOKMARK_JSON_INVALID', `${fieldName}排序值不正确`)
  }
  return sortOrder
}

function normalizeJsonDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw createBookmarkError(400, 'BOOKMARK_JSON_INVALID', 'JSON 备份包含无效的书签日期')
  }
  return date
}

function normalizeJsonWorkspace(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw createBookmarkError(400, 'BOOKMARK_JSON_INVALID', 'JSON 备份文件格式不正确')
  }
  if (!payload.workspace && Array.isArray(payload.workspaces)) {
    throw createBookmarkError(400, 'BOOKMARK_JSON_ALL_UNSUPPORTED', '全部书签库备份不能导入到单个书签库，请导出当前书签库 JSON')
  }

  const sourceWorkspace = payload.workspace
    || (Array.isArray(payload.folders) && Array.isArray(payload.bookmarks) ? payload : null)
  if (!sourceWorkspace || !Array.isArray(sourceWorkspace.folders) || !Array.isArray(sourceWorkspace.bookmarks)) {
    throw createBookmarkError(400, 'BOOKMARK_JSON_INVALID', 'JSON 备份缺少书签库、文件夹或书签数据')
  }

  const folderIds = new Set()
  const folders = sourceWorkspace.folders.map((folder, index) => {
    const id = String(folder?.id || '').trim()
    const name = String(folder?.name || '').trim()
    if (!id || folderIds.has(id) || !name || name.length > 120) {
      throw createBookmarkError(400, 'BOOKMARK_JSON_INVALID', `第 ${index + 1} 个文件夹数据不正确`)
    }
    folderIds.add(id)
    return {
      id,
      name,
      parentId: folder.parentId ? String(folder.parentId) : null,
      sortOrder: normalizeJsonSortOrder(folder.sortOrder, `第 ${index + 1} 个文件夹`)
    }
  })

  for (const folder of folders) {
    if (folder.parentId && !folderIds.has(folder.parentId)) {
      throw createBookmarkError(400, 'BOOKMARK_JSON_INVALID', `文件夹「${folder.name}」的上级文件夹不存在`)
    }
  }

  const pendingFolders = new Map(folders.map((folder) => [folder.id, folder]))
  const orderedFolders = []
  const resolvedIds = new Set()
  while (pendingFolders.size) {
    let resolvedInRound = false
    for (const [id, folder] of pendingFolders) {
      if (folder.parentId && !resolvedIds.has(folder.parentId)) continue
      orderedFolders.push(folder)
      resolvedIds.add(id)
      pendingFolders.delete(id)
      resolvedInRound = true
    }
    if (!resolvedInRound) {
      throw createBookmarkError(400, 'BOOKMARK_JSON_INVALID', 'JSON 备份中的文件夹层级存在循环')
    }
  }

  const bookmarks = sourceWorkspace.bookmarks.map((item, index) => {
    const url = String(item?.url || '').trim()
    const folderId = item?.folderId ? String(item.folderId) : null
    const title = String(item?.title || '').trim()
    const icon = String(item?.icon || '').trim()
    const note = String(item?.note || '').trim()
    if (
      !url
      || url.length > 2048
      || title.length > 240
      || icon.length > 2048
      || note.length > 1000
      || (folderId && !folderIds.has(folderId))
    ) {
      throw createBookmarkError(400, 'BOOKMARK_JSON_INVALID', `第 ${index + 1} 条书签数据不正确`)
    }
    return {
      title,
      url,
      folderId,
      icon,
      addDate: normalizeJsonDate(item.addDate),
      tags: normalizeTags(item.tags),
      note,
      sortOrder: normalizeJsonSortOrder(item.sortOrder, `第 ${index + 1} 条书签`)
    }
  })

  return { folders: orderedFolders, bookmarks }
}

async function finishWorkspaceImport(workspace, file) {
  workspace.lastImportedAt = new Date()
  workspace.lastImportFileName = file.originalname || ''
  await workspace.save()
}

export async function importBookmarksFromHtml(userId, workspaceId, file, mode = 'merge') {
  if (!file?.buffer?.length) throw createBookmarkError(400, 'BOOKMARK_IMPORT_FILE_REQUIRED', '请选择书签 HTML 文件')
  const html = file.buffer.toString('utf8').replace(/^\uFEFF/, '')
  const root = parseBookmarksHtml(html)
  const { workspace, snapshot } = await prepareWorkspaceImport(userId, workspaceId, file, mode)
  try {
    const stats = { folders: 0, parsed: 0, inserted: 0, updated: 0, skipped: 0 }
    await walkImportNode(userId, workspaceId, root, null, stats, 'html_import', mode)
    await finishWorkspaceImport(workspace, file)
    return stats
  } catch (error) {
    await rollbackWorkspaceImport(userId, workspaceId, snapshot, error)
    throw error
  }
}

export async function importBookmarksFromJson(userId, workspaceId, file, mode = 'merge') {
  if (!file?.buffer?.length) throw createBookmarkError(400, 'BOOKMARK_IMPORT_FILE_REQUIRED', '请选择书签 JSON 文件')
  let payload
  try {
    payload = JSON.parse(file.buffer.toString('utf8').replace(/^\uFEFF/, ''))
  } catch {
    throw createBookmarkError(400, 'BOOKMARK_JSON_INVALID', 'JSON 备份文件格式不正确')
  }

  const sourceWorkspace = normalizeJsonWorkspace(payload)
  const { workspace, snapshot } = await prepareWorkspaceImport(userId, workspaceId, file, mode)
  try {
    const folderIdMap = new Map()
    const stats = { folders: 0, parsed: 0, inserted: 0, updated: 0, skipped: 0 }
    for (const folder of sourceWorkspace.folders) {
      const parentId = folder.parentId ? folderIdMap.get(folder.parentId) : null
      const created = await createOrFindFolder(
        userId,
        workspaceId,
        folder.name,
        parentId,
        'json_import',
        folder.sortOrder
      )
      folderIdMap.set(folder.id, created._id)
      stats.folders += 1
    }
    for (const item of sourceWorkspace.bookmarks) {
      await walkImportNode(userId, workspaceId, {
        type: 'bookmark',
        title: item.title,
        url: item.url,
        icon: item.icon,
        addDate: item.addDate,
        tags: item.tags,
        note: item.note,
        sortOrder: item.sortOrder
      }, item.folderId ? folderIdMap.get(item.folderId) : null, stats, 'json_import', mode)
    }
    await finishWorkspaceImport(workspace, file)
    return stats
  } catch (error) {
    await rollbackWorkspaceImport(userId, workspaceId, snapshot, error)
    throw error
  }
}

async function loadWorkspaceTree(userId, workspaceId) {
  const [folders, bookmarks] = await Promise.all([
    BookmarkFolder.find({ userId, workspaceId }).sort({ sortOrder: 1, createdAt: 1 }),
    Bookmark.find({ userId, workspaceId }).sort({ sortOrder: 1, createdAt: 1 })
  ])
  return { folders, bookmarks, tree: buildFolderTree(folders, bookmarks) }
}

export async function exportBookmarksAsHtml(userId, workspaceId) {
  const workspace = await assertWorkspace(userId, workspaceId)
  const { tree } = await loadWorkspaceTree(userId, workspaceId)
  workspace.lastExportedAt = new Date()
  await workspace.save()
  return buildBookmarksHtml(tree)
}

export async function exportBookmarksAsJson(userId, workspaceId) {
  const workspace = await assertWorkspace(userId, workspaceId)
  const { folders, bookmarks } = await loadWorkspaceTree(userId, workspaceId)
  workspace.lastExportedAt = new Date()
  await workspace.save()
  return {
    schemaVersion: 2,
    source: 'bookmark_workspace_backup',
    exportedAt: new Date().toISOString(),
    workspace: {
      ...workspace.toSafeJSON({ bookmarkCount: bookmarks.length, folderCount: folders.length }),
      folders: folders.map((item) => item.toSafeJSON()),
      bookmarks: bookmarks.map((item) => item.toSafeJSON())
    }
  }
}

export async function exportAllBookmarksAsJson(userId) {
  const workspaces = await BookmarkWorkspace.find({ userId }).sort({ sortOrder: 1, createdAt: 1 })
  const items = []
  for (const workspace of workspaces) {
    const { folders, bookmarks } = await loadWorkspaceTree(userId, workspace._id)
    items.push({
      ...workspace.toSafeJSON({ bookmarkCount: bookmarks.length, folderCount: folders.length }),
      folders: folders.map((item) => item.toSafeJSON()),
      bookmarks: bookmarks.map((item) => item.toSafeJSON())
    })
  }
  return {
    schemaVersion: 2,
    source: 'bookmark_workspace_backup_all',
    exportedAt: new Date().toISOString(),
    workspaces: items
  }
}
