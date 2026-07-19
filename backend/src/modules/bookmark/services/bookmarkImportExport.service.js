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

async function createOrFindFolder(userId, workspaceId, name, parentId, source) {
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
    sortOrder: await getNextSortOrder(BookmarkFolder, userId, workspaceId, 'parentId', parentId)
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
    sortOrder: await getNextSortOrder(Bookmark, userId, workspaceId, 'folderId', parentId)
  })
  stats.inserted += 1
}

async function prepareWorkspaceImport(userId, workspaceId, file, mode) {
  const workspace = await assertWorkspace(userId, workspaceId)
  if (!file?.buffer?.length) throw createBookmarkError(400, 'BOOKMARK_IMPORT_FILE_REQUIRED', '请选择书签文件')
  if (mode === 'replace') {
    await Promise.all([
      Bookmark.deleteMany({ userId, workspaceId }),
      BookmarkFolder.deleteMany({ userId, workspaceId })
    ])
  }
  return workspace
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
  const workspace = await prepareWorkspaceImport(userId, workspaceId, file, mode)
  const stats = { folders: 0, parsed: 0, inserted: 0, updated: 0, skipped: 0 }
  await walkImportNode(userId, workspaceId, root, null, stats, 'html_import', mode)
  await finishWorkspaceImport(workspace, file)
  return stats
}

export async function importBookmarksFromJson(userId, workspaceId, file, mode = 'merge') {
  if (!file?.buffer?.length) throw createBookmarkError(400, 'BOOKMARK_IMPORT_FILE_REQUIRED', '请选择书签 JSON 文件')
  let payload
  try {
    payload = JSON.parse(file.buffer.toString('utf8').replace(/^\uFEFF/, ''))
  } catch {
    throw createBookmarkError(400, 'BOOKMARK_JSON_INVALID', 'JSON 备份文件格式不正确')
  }

  const workspace = await prepareWorkspaceImport(userId, workspaceId, file, mode)
  const folderIdMap = new Map()
  const stats = { folders: 0, parsed: 0, inserted: 0, updated: 0, skipped: 0 }
  const sourceWorkspace = payload.workspace || payload.workspaces?.[0] || payload
  for (const folder of sourceWorkspace.folders || payload.folders || []) {
    const parentId = folder.parentId ? folderIdMap.get(folder.parentId) : null
    const created = await createOrFindFolder(userId, workspaceId, folder.name, parentId, 'json_import')
    folderIdMap.set(folder.id, created._id)
    stats.folders += 1
  }
  for (const item of sourceWorkspace.bookmarks || payload.bookmarks || []) {
    await walkImportNode(userId, workspaceId, {
      type: 'bookmark',
      title: item.title,
      url: item.url,
      icon: item.icon,
      addDate: item.addDate ? new Date(item.addDate) : null,
      tags: item.tags || [],
      note: item.note || ''
    }, item.folderId ? folderIdMap.get(item.folderId) : null, stats, 'json_import', mode)
  }
  await finishWorkspaceImport(workspace, file)
  return stats
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
