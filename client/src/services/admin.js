import { request } from './http'

export function listAdminArticles() {
  return request('/api/admin/articles')
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

export function listAdminCategories() {
  return request('/api/admin/categories')
}

export function createAdminCategory(data) {
  return request('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data)
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

export function listAdminAnnouncements() {
  return request('/api/admin/announcements')
}

export function createAdminAnnouncement(data) {
  return request('/api/admin/announcements', {
    method: 'POST',
    body: JSON.stringify(data)
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
