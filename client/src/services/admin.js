import http from './http'
import { toItemList, toPageResult } from './contracts'

async function collectAllPageItems(loader, params = {}, pageSize = 200) {
  const items = []
  let page = 1
  let total = 0

  do {
    const result = await loader({ ...params, page, pageSize })
    const pageItems = toItemList(result)
    const pageTotal = Number(result?.total) || pageItems.length

    items.push(...pageItems)
    total = pageTotal
    page += 1
  } while (items.length < total)

  return items
}

// 文章相关
export async function listAdminArticles(params = {}) {
  return toPageResult(await http.get('/api/admin/articles', { params }), params.pageSize || 10)
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

export function updateAdminArticleStatus(id, status) {
  return http.patch(`/api/admin/articles/${id}/status`, { status })
}

export function publishAdminArticle(id) {
  return http.post(`/api/admin/articles/${id}/publish`)
}

export function deleteAdminArticle(id) {
  return http.delete(`/api/admin/articles/${id}`)
}

// 回收站相关
export async function listTrashArticles(params = {}) {
  return toPageResult(await http.get('/api/admin/articles/trash/list', { params }), params.pageSize || 20)
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
export async function listAdminCategories(params = {}) {
  return toPageResult(await http.get('/api/admin/categories', { params }), params.pageSize || 50)
}

export async function listAllAdminCategories(params = {}) {
  return collectAllPageItems(listAdminCategories, params)
}

export async function listAdminCategoryTree() {
  return http.get('/api/admin/categories/tree')
}

export async function listAdminCategoryArticles(id, params = {}) {
  return toPageResult(await http.get(`/api/admin/categories/${id}/articles`, { params }), params.pageSize || 20)
}

export function createAdminCategory(data) {
  return http.post('/api/admin/categories', data)
}

export function updateAdminCategory(id, data) {
  return http.patch(`/api/admin/categories/${id}`, data)
}

export function moveAdminCategory(id, data) {
  return http.post(`/api/admin/categories/${id}/move`, data)
}

export function moveAdminArticleCategory(id, targetCategoryId) {
  return http.post(`/api/admin/articles/${id}/category`, { targetCategoryId })
}

export function moveAdminArticlesCategory(articleIds, targetCategoryId) {
  return http.post('/api/admin/articles/category/batch', { articleIds, targetCategoryId })
}

export function deleteAdminCategory(id) {
  return http.delete(`/api/admin/categories/${id}`)
}

// 标签相关
export async function listAdminTags(params = {}) {
  return toPageResult(await http.get('/api/admin/tags', { params }), params.pageSize || 50)
}

export async function listAllAdminTags(params = {}) {
  return collectAllPageItems(listAdminTags, params)
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
export async function listAdminComments(params = {}) {
  return toPageResult(await http.get('/api/admin/comments', { params }), params.pageSize || 20)
}

export function reviewAdminComment(id, action) {
  return http.post(`/api/admin/comments/${id}/${action}`)
}

// 用户相关
export async function listAdminUsers(params = {}) {
  return toPageResult(await http.get('/api/admin/users', { params }), params.pageSize || 20)
}

export function updateAdminUserStatus(id, status) {
  return http.patch(`/api/admin/users/${id}/status`, { status })
}

// 统计
export function getAdminStats() {
  return http.get('/api/admin/stats')
}

export function getAdminMonitorOverview() {
  return http.get('/api/admin/monitor/overview')
}

// 媒体相关
export async function listAdminMedia(params = {}) {
  return toPageResult(await http.get('/api/admin/media', { params }), params.pageSize || 20)
}

export function listAdminMediaCategories() {
  return http.get('/api/admin/media/categories')
}

export function createAdminMediaCategory(data) {
  return http.post('/api/admin/media/categories', data)
}

export function updateAdminMediaCategory(id, data) {
  return http.patch(`/api/admin/media/categories/${id}`, data)
}

export function deleteAdminMediaCategory(id) {
  return http.delete(`/api/admin/media/categories/${id}`)
}

export function uploadAdminMedia(fileOrFiles, metadata = {}) {
  const formData = new FormData()
  const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles]
  const fieldName = files.length > 1 ? 'files' : 'file'

  files.forEach((file) => {
    formData.append(fieldName, file)
  })

  if (metadata.category) {
    formData.append('category', metadata.category)
  }
  return http.post('/api/admin/media', formData)
}

export function deleteAdminMedia(id) {
  return http.delete(`/api/admin/media/${id}`)
}

export async function listTrashMedia(params = {}) {
  return toPageResult(await http.get('/api/admin/media/trash', { params }), params.pageSize || 20)
}

export function restoreAdminMedia(id) {
  return http.post(`/api/admin/media/${id}/restore`)
}

export function permanentDeleteAdminMedia(id) {
  return http.delete(`/api/admin/media/${id}/permanent`)
}

export function emptyMediaTrash() {
  return http.delete('/api/admin/media/trash/empty')
}

// 公告相关
export async function listAdminAnnouncements(params = {}) {
  return toPageResult(await http.get('/api/admin/announcements', { params }), params.pageSize || 20)
}

export async function listRecentAdminArticles(limit = 5, params = {}) {
  return toItemList(await listAdminArticles({ pageSize: limit, ...params }))
}

export async function listRecentAdminAnnouncements(limit = 5, params = {}) {
  return toItemList(await listAdminAnnouncements({ pageSize: limit, ...params }))
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
