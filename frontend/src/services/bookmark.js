import http from './http'
import { toPageResult } from './contracts'

export function listBookmarkFolders() {
  return http.get('/api/bookmarks/folders')
}

export function createBookmarkFolder(data) {
  return http.post('/api/bookmarks/folders', data)
}

export function updateBookmarkFolder(id, data) {
  return http.patch(`/api/bookmarks/folders/${id}`, data)
}

export function deleteBookmarkFolder(id) {
  return http.delete(`/api/bookmarks/folders/${id}`)
}

export function reorderBookmarkFolders(data) {
  return http.patch('/api/bookmarks/folders/reorder', data)
}

export async function listBookmarks(params = {}) {
  return toPageResult(await http.get('/api/bookmarks/bookmarks', { params }), params.pageSize || 20)
}

export function createBookmark(data) {
  return http.post('/api/bookmarks/bookmarks', data)
}

export function updateBookmark(id, data) {
  return http.patch(`/api/bookmarks/bookmarks/${id}`, data)
}

export function deleteBookmark(id) {
  return http.delete(`/api/bookmarks/bookmarks/${id}`)
}

export function reorderBookmarks(data) {
  return http.patch('/api/bookmarks/bookmarks/reorder', data)
}

export function moveBookmarks(data) {
  return http.patch('/api/bookmarks/bookmarks/move', data)
}

export function importBookmarkHtml(file) {
  const formData = new FormData()
  formData.append('file', file)
  return http.post('/api/bookmarks/imports/html', formData)
}

export function importBookmarkJson(file) {
  const formData = new FormData()
  formData.append('file', file)
  return http.post('/api/bookmarks/imports/json', formData)
}

export function exportBookmarkHtml() {
  return http.get('/api/bookmarks/exports/html', { responseType: 'blob' })
}

export function exportBookmarkJson() {
  return http.get('/api/bookmarks/exports/json', { responseType: 'blob' })
}
