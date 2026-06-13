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
export function listTrashArticles(params = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', params.page)
  if (params.pageSize) query.set('pageSize', params.pageSize)

  const queryStr = query.toString()
  return request(`/api/admin/articles/trash/list${queryStr ? '?' + queryStr : ''}`)
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

export function listAdminCategories(params = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', params.page)
  if (params.pageSize) query.set('pageSize', params.pageSize)

  const queryStr = query.toString()
  return request(`/api/admin/categories${queryStr ? '?' + queryStr : ''}`)
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

export function listAdminTags(params = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', params.page)
  if (params.pageSize) query.set('pageSize', params.pageSize)

  const queryStr = query.toString()
  return request(`/api/admin/tags${queryStr ? '?' + queryStr : ''}`)
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

export function listAdminComments(params = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.page) query.set('page', params.page)
  if (params.pageSize) query.set('pageSize', params.pageSize)

  const queryStr = query.toString()
  return request(`/api/admin/comments${queryStr ? '?' + queryStr : ''}`)
}

export function reviewAdminComment(id, action) {
  return request(`/api/admin/comments/${id}/${action}`, {
    method: 'POST'
  })
}

export function listAdminUsers(params = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', params.page)
  if (params.pageSize) query.set('pageSize', params.pageSize)

  const queryStr = query.toString()
  return request(`/api/admin/users${queryStr ? '?' + queryStr : ''}`)
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

export function listAdminMedia(params = {}) {
  const query = new URLSearchParams()
  if (params.kind) query.set('kind', params.kind)
  if (params.page) query.set('page', params.page)
  if (params.pageSize) query.set('pageSize', params.pageSize)

  const queryStr = query.toString()
  return request(`/api/admin/media${queryStr ? '?' + queryStr : ''}`)
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

export function listAdminAnnouncements(params = {}) {
  const query = new URLSearchParams()
  if (params.level) query.set('level', params.level)
  if (params.isActive !== undefined && params.isActive !== '') query.set('isActive', params.isActive)
  if (params.page) query.set('page', params.page)
  if (params.pageSize) query.set('pageSize', params.pageSize)

  const queryStr = query.toString()
  return request(`/api/admin/announcements${queryStr ? '?' + queryStr : ''}`)
}

export function getAdminAnnouncement(id) {
  return request(`/api/admin/announcements/detail/${id}`)
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

export function batchToggleAnnouncement(ids, isActive) {
  return request('/api/admin/announcements/batch-toggle', {
    method: 'POST',
    body: JSON.stringify({ ids, isActive })
  })
}

export function batchDeleteAnnouncements(ids) {
  return request('/api/admin/announcements/batch-delete', {
    method: 'POST',
    body: JSON.stringify({ ids })
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
