import { Bookmark } from '#modules/bookmark/models/Bookmark.js'
import { BookmarkFolder } from '#modules/bookmark/models/BookmarkFolder.js'
import { assertFolder, assertWorkspace, createBookmarkError, getNextSortOrder } from './bookmark.shared.js'

function buildFolderPathMap(folders = []) {
  const map = new Map(folders.map((folder) => [folder._id.toString(), folder]))
  const cache = new Map()
  const resolve = (id) => {
    if (!id) return '书签栏'
    if (cache.has(id)) return cache.get(id)
    const names = []
    const seen = new Set()
    let current = map.get(id)
    while (current && !seen.has(current._id.toString())) {
      seen.add(current._id.toString())
      names.unshift(current.name)
      current = current.parentId ? map.get(current.parentId.toString()) : null
    }
    const path = names.join(' / ') || '书签栏'
    cache.set(id, path)
    return path
  }
  return resolve
}

function toComparisonBookmark(item, resolvePath) {
  if (!item) return null
  return {
    id: item._id.toString(),
    title: item.title,
    url: item.url,
    folderId: item.folderId?.toString?.() || null,
    folderPath: resolvePath(item.folderId?.toString?.()),
    tags: item.tags || [],
    note: item.note || ''
  }
}

function matchesStatus(row, status) {
  if (!status || status === 'all') return true
  if (status === 'differences') return row.status !== 'common' || row.folderDifferent || row.titleDifferent
  if (status === 'folder_diff') return row.folderDifferent
  if (status === 'title_diff') return row.titleDifferent
  if (status === 'common') return Boolean(row.primary && row.secondary)
  return row.status === status
}

function matchesKeyword(row, keyword) {
  if (!keyword) return true
  const haystack = [
    row.primary?.title,
    row.primary?.url,
    row.primary?.folderPath,
    row.secondary?.title,
    row.secondary?.url,
    row.secondary?.folderPath
  ].filter(Boolean).join('\n').toLowerCase()
  return haystack.includes(keyword.toLowerCase())
}

export async function compareBookmarkWorkspaces(userId, filters) {
  const { primaryWorkspaceId, secondaryWorkspaceId } = filters
  if (primaryWorkspaceId === secondaryWorkspaceId) {
    throw createBookmarkError(400, 'BOOKMARK_COMPARISON_SAME_WORKSPACE', '主书签库和对比书签库不能相同')
  }
  const [primaryWorkspace, secondaryWorkspace] = await Promise.all([
    assertWorkspace(userId, primaryWorkspaceId),
    assertWorkspace(userId, secondaryWorkspaceId)
  ])
  const [primaryItems, secondaryItems, primaryFolders, secondaryFolders] = await Promise.all([
    Bookmark.find({ userId, workspaceId: primaryWorkspaceId }).lean(),
    Bookmark.find({ userId, workspaceId: secondaryWorkspaceId }).lean(),
    BookmarkFolder.find({ userId, workspaceId: primaryWorkspaceId }).lean(),
    BookmarkFolder.find({ userId, workspaceId: secondaryWorkspaceId }).lean()
  ])

  const primaryMap = new Map(primaryItems.map((item) => [item.urlKey, item]))
  const secondaryMap = new Map(secondaryItems.map((item) => [item.urlKey, item]))
  const primaryPath = buildFolderPathMap(primaryFolders)
  const secondaryPath = buildFolderPathMap(secondaryFolders)
  const keys = new Set([...primaryMap.keys(), ...secondaryMap.keys()])
  const rows = []
  const stats = { total: keys.size, common: 0, secondaryOnly: 0, primaryOnly: 0, folderDiff: 0, titleDiff: 0, differences: 0 }

  for (const key of keys) {
    const primary = toComparisonBookmark(primaryMap.get(key), primaryPath)
    const secondary = toComparisonBookmark(secondaryMap.get(key), secondaryPath)
    const folderDifferent = Boolean(primary && secondary && primary.folderPath !== secondary.folderPath)
    const titleDifferent = Boolean(primary && secondary && primary.title.trim() !== secondary.title.trim())
    let status = 'common'
    if (!primary) status = 'secondary_only'
    else if (!secondary) status = 'primary_only'
    else if (folderDifferent) status = 'folder_diff'
    else if (titleDifferent) status = 'title_diff'

    if (primary && secondary) stats.common += 1
    if (status === 'secondary_only') stats.secondaryOnly += 1
    if (status === 'primary_only') stats.primaryOnly += 1
    if (folderDifferent) stats.folderDiff += 1
    if (titleDifferent) stats.titleDiff += 1
    if (status !== 'common' || folderDifferent || titleDifferent) stats.differences += 1
    rows.push({ key, status, folderDifferent, titleDifferent, primary, secondary })
  }

  const keyword = String(filters.keyword || '').trim()
  const filtered = rows
    .filter((row) => matchesStatus(row, filters.status))
    .filter((row) => matchesKeyword(row, keyword))
    .sort((left, right) => String(left.secondary?.title || left.primary?.title || '').localeCompare(
      String(right.secondary?.title || right.primary?.title || ''),
      'zh-Hans-CN'
    ))
  const page = Math.max(1, Number(filters.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 20))
  return {
    primaryWorkspace: primaryWorkspace.toSafeJSON({ bookmarkCount: primaryItems.length, folderCount: primaryFolders.length }),
    secondaryWorkspace: secondaryWorkspace.toSafeJSON({ bookmarkCount: secondaryItems.length, folderCount: secondaryFolders.length }),
    stats,
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    page,
    pageSize
  }
}

export async function copyComparisonBookmarks(userId, input) {
  if (input.sourceWorkspaceId === input.targetWorkspaceId) {
    throw createBookmarkError(400, 'BOOKMARK_COPY_SAME_WORKSPACE', '来源和目标书签库不能相同')
  }
  await Promise.all([
    assertWorkspace(userId, input.sourceWorkspaceId),
    assertWorkspace(userId, input.targetWorkspaceId),
    assertFolder(userId, input.targetWorkspaceId, input.targetFolderId)
  ])
  const ids = [...new Set(input.bookmarkIds)]
  const sources = await Bookmark.find({ userId, workspaceId: input.sourceWorkspaceId, _id: { $in: ids } })
  if (sources.length !== ids.length) throw createBookmarkError(404, 'BOOKMARK_COPY_SOURCE_NOT_FOUND', '包含不存在的来源书签')

  const existingKeys = new Set(await Bookmark.distinct('urlKey', {
    userId,
    workspaceId: input.targetWorkspaceId,
    urlKey: { $in: sources.map((item) => item.urlKey) }
  }))
  const targetFolderId = input.targetFolderId || null
  const baseSortOrder = await getNextSortOrder(Bookmark, userId, input.targetWorkspaceId, 'folderId', targetFolderId)
  const inserts = sources
    .filter((item) => !existingKeys.has(item.urlKey))
    .map((item, index) => ({
      userId,
      workspaceId: input.targetWorkspaceId,
      folderId: targetFolderId,
      title: item.title,
      url: item.url,
      urlKey: item.urlKey,
      similarityKey: item.similarityKey,
      tags: item.tags || [],
      note: item.note || '',
      icon: item.icon || '',
      addDate: item.addDate || null,
      sortOrder: baseSortOrder + index * 10,
      source: 'manual'
    }))
  if (inserts.length) await Bookmark.insertMany(inserts, { ordered: false })
  return { inserted: inserts.length, skipped: sources.length - inserts.length }
}
