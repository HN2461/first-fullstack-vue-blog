import http from './http'

// 文章相关
export function listAdminArticles(params = {}) {
  return http.get('/api/admin/articles', { params })
}

export function getAdminArticle(id) {
  return http.get(`/api/admin/articles/${id}`)
}

export function createAdminArticle(data) {
  return http.post('/api/admin/articles', data)
}

export function updateAdminArticle(id, data) {
  return http.patch(`/api/admin/articles/${id}`, data)
}

export function publishAdminArticle(id) {
  return http.post(`/api/admin/articles/${id}/publish`)
}

export function deleteAdminArticle(id) {
  return http.delete(`/api/admin/articles/${id}`)
}

// 回收站相关
export function listTrashArticles(params = {}) {
  return http.get('/api/admin/articles/trash/list', { params })
}

export function restoreArticle(id) {
  return http.post(`/api/admin/articles/${id}/restore`)
}

export function permanentDeleteArticle(id) {
  return http.delete(`/api/admin/articles/${id}/permanent`)
}

export function emptyTrash() {
  return http.delete('/api/admin/articles/trash/empty')
}

// 分类相关
export function listAdminCategories(params = {}) {
  return http.get('/api/admin/categories', { params })
}

export function createAdminCategory(data) {
  return http.post('/api/admin/categories', data)
}

export function updateAdminCategory(id, data) {
  return http.patch(`/api/admin/categories/${id}`, data)
}

export function deleteAdminCategory(id) {
  return http.delete(`/api/admin/categories/${id}`)
}

// 标签相关
export function listAdminTags(params = {}) {
  return http.get('/api/admin/tags', { params })
}

export function createAdminTag(data) {
  return http.post('/api/admin/tags', data)
}

export function updateAdminTag(id, data) {
  return http.patch(`/api/admin/tags/${id}`, data)
}

export function deleteAdminTag(id) {
  return http.delete(`/api/admin/tags/${id}`)
}

// 评论相关
export function listAdminComments(params = {}) {
  return http.get('/api/admin/comments', { params })
}

export function reviewAdminComment(id, action) {
  return http.post(`/api/admin/comments/${id}/${action}`)
}

// 用户相关
export function listAdminUsers(params = {}) {
  return http.get('/api/admin/users', { params })
}

export function updateAdminUserStatus(id, status) {
  return http.patch(`/api/admin/users/${id}/status`, { status })
}

// 统计
export function getAdminStats() {
  return http.get('/api/admin/stats')
}

// 媒体相关
export function listAdminMedia(params = {}) {
  return http.get('/api/admin/media', { params })
}

export function uploadAdminMedia(file) {
  const formData = new FormData()
  formData.append('file', file)
  return http.post('/api/admin/media', formData)
}

export function deleteAdminMedia(id) {
  return http.delete(`/api/admin/media/${id}`)
}

// 公告相关
export function listAdminAnnouncements(params = {}) {
  return http.get('/api/admin/announcements', { params })
}

export function getAdminAnnouncement(id) {
  return http.get(`/api/admin/announcements/detail/${id}`)
}

export function createAdminAnnouncement(data) {
  return http.post('/api/admin/announcements', data)
}

export function updateAdminAnnouncement(id, data) {
  return http.patch(`/api/admin/announcements/${id}`, data)
}

export function deleteAdminAnnouncement(id) {
  return http.delete(`/api/admin/announcements/${id}`)
}

export function batchToggleAnnouncement(ids, isActive) {
  return http.post('/api/admin/announcements/batch-toggle', { ids, isActive })
}

export function batchDeleteAnnouncements(ids) {
  return http.post('/api/admin/announcements/batch-delete', { ids })
}

// 设置相关
export function getAdminSettings() {
  return http.get('/api/admin/settings')
}

export function updateAdminSettings(data) {
  return http.patch('/api/admin/settings', data)
}
