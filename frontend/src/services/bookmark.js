import http from './http'
import { toPageResult } from './contracts'

const workspaceBase = (workspaceId) => `/api/bookmarks/workspaces/${workspaceId}`

export function listBookmarkWorkspaces() {
  return http.get('/api/bookmarks/workspaces')
}

export function createBookmarkWorkspace(data) {
  return http.post('/api/bookmarks/workspaces', data)
}

export function updateBookmarkWorkspace(workspaceId, data) {
  return http.patch(`${workspaceBase(workspaceId)}`, data)
}

export function clearBookmarkWorkspace(workspaceId) {
  return http.delete(`${workspaceBase(workspaceId)}/content`)
}

export function deleteBookmarkWorkspace(workspaceId) {
  return http.delete(workspaceBase(workspaceId))
}

export function listBookmarkFolders(workspaceId) {
  return http.get(`${workspaceBase(workspaceId)}/folders`)
}

export function createBookmarkFolder(workspaceId, data) {
  return http.post(`${workspaceBase(workspaceId)}/folders`, data)
}

export function updateBookmarkFolder(workspaceId, id, data) {
  return http.patch(`${workspaceBase(workspaceId)}/folders/${id}`, data)
}

export function deleteBookmarkFolder(workspaceId, id) {
  return http.delete(`${workspaceBase(workspaceId)}/folders/${id}`)
}

export function reorderBookmarkFolders(workspaceId, data) {
  return http.patch(`${workspaceBase(workspaceId)}/folders/reorder`, data)
}

export async function listBookmarks(workspaceId, params = {}) {
  const result = await http.get(`${workspaceBase(workspaceId)}/bookmarks`, { params })
  return toPageResult(result, params.pageSize || 20)
}

export function createBookmark(workspaceId, data) {
  return http.post(`${workspaceBase(workspaceId)}/bookmarks`, data)
}

export function updateBookmark(workspaceId, id, data) {
  return http.patch(`${workspaceBase(workspaceId)}/bookmarks/${id}`, data)
}

export function deleteBookmark(workspaceId, id) {
  return http.delete(`${workspaceBase(workspaceId)}/bookmarks/${id}`)
}

export function reorderBookmarks(workspaceId, data) {
  return http.patch(`${workspaceBase(workspaceId)}/bookmarks/reorder`, data)
}

export function moveBookmarks(workspaceId, data) {
  return http.patch(`${workspaceBase(workspaceId)}/bookmarks/move`, data)
}

function importBookmarks(workspaceId, type, file, mode) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('mode', mode)
  return http.post(`${workspaceBase(workspaceId)}/imports/${type}`, formData)
}

export function importBookmarkHtml(workspaceId, file, mode = 'merge') {
  return importBookmarks(workspaceId, 'html', file, mode)
}

export function importBookmarkJson(workspaceId, file, mode = 'merge') {
  return importBookmarks(workspaceId, 'json', file, mode)
}

export function exportBookmarkHtml(workspaceId) {
  return http.get(`${workspaceBase(workspaceId)}/exports/html`, { responseType: 'blob' })
}

export function exportBookmarkJson(workspaceId) {
  return http.get(`${workspaceBase(workspaceId)}/exports/json`, { responseType: 'blob' })
}

export function exportAllBookmarkJson() {
  return http.get('/api/bookmarks/exports/json/all', { responseType: 'blob' })
}

export async function compareBookmarkWorkspaces(params = {}) {
  const result = await http.get('/api/bookmarks/comparisons', { params })
  return { ...result, ...toPageResult(result, params.pageSize || 20) }
}

export function copyComparisonBookmarks(data) {
  return http.post('/api/bookmarks/comparisons/copy', data)
}
