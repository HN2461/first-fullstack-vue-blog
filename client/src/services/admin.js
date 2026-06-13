import { request } from './http'

export function listAdminArticles(params = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.category) query.set('category', params.category)
  if (params.keyword) query.set('keyword', params.keyword)
  if (params.page) query.set('page', params.page)
  if (params.pageSize) query.set('pageSize', params.pageSize)

  const queryStr = query.toString()
  return request(`/api/admin/articles${queryStr ? '?' + queryStr : ''}`)
}

export function getAdminArticle(id) {
  return request(`/api/admin/articles/${id}`)
}

export function createAdminArticle(data) {
  return request('/api/admin/articles', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export function updateAdminArticle(id, data) {
  return request(`/api/admin/articles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
}

export function publishAdminArticle(id) {
  return request(`/api/admin/articles/${id}/publish`, {
    method: 'POST'
  })
}

export function deleteAdminArticle(id) {
  return request(`/api/admin/articles/${id}`, {
    method: 'DELETE'
  })
}

// 回收站相关
export function listTrashArticles() {
  return request('/api/admin/articles/trash/list')
}

export function restoreArticle(id) {
  return request(`/api/admin/articles/${id}/restore`, {
    method: 'POST'
  })
}

export function permanentDeleteArticle(id) {
  return request(`/api/admin/articles/${id}/permanent`, {
    method: 'DELETE'
  })
}

export function emptyTrash() {
  return request('/api/admin/articles/trash/empty', {
    method: 'DELETE'
  })
}

export function listAdminCategories() {
  return request('/api/admin/categories')
}

export function createAdminCategory(data) {
  return request('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export function updateAdminCategory(id, data) {
  return request(`/api/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
}

export function deleteAdminCategory(id) {
  return request(`/api/admin/categories/${id}`, {
    method: 'DELETE'
  })
}

export function listAdminTags() {
  return request('/api/admin/tags')
}

export function createAdminTag(data) {
  return request('/api/admin/tags', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export function updateAdminTag(id, data) {
  return request(`/api/admin/tags/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
}

export function deleteAdminTag(id) {
  return request(`/api/admin/tags/${id}`, {
    method: 'DELETE'
  })
}

export function listAdminComments(status = '') {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return request(`/api/admin/comments${query}`)
}

export function reviewAdminComment(id, action) {
  return request(`/api/admin/comments/${id}/${action}`, {
    method: 'POST'
  })
}

export function listAdminUsers() {
  return request('/api/admin/users')
}

export function updateAdminUserStatus(id, status) {
  return request(`/api/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
}

export function getAdminStats() {
  return request('/api/admin/stats')
}

export function listAdminMedia(kind = '') {
  const query = kind ? `?kind=${encodeURIComponent(kind)}` : ''
  return request(`/api/admin/media${query}`)
}

export function uploadAdminMedia(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request('/api/admin/media', {
    method: 'POST',
    headers: {},
    body: formData
  })
}

export function deleteAdminMedia(id) {
  return request(`/api/admin/media/${id}`, {
    method: 'DELETE'
  })
}

export function listAdminAnnouncements() {
  return request('/api/admin/announcements')
}

export function createAdminAnnouncement(data) {
  return request('/api/admin/announcements', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export function updateAdminAnnouncement(id, data) {
  return request(`/api/admin/announcements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
}

export function deleteAdminAnnouncement(id) {
  return request(`/api/admin/announcements/${id}`, {
    method: 'DELETE'
  })
}

export function getAdminSettings() {
  return request('/api/admin/settings')
}

export function updateAdminSettings(data) {
  return request('/api/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
}
