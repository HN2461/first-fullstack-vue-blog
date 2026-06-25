import http from './http'
import { toItemList, toPageResult } from './contracts'
import { encryptAuthCredential } from '@/utils/credentialCrypto'

async function collectAllPageItems(loader, params = {}, pageSize = 100) {
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

export function batchUpdateAdminArticleStatus(ids, status) {
  return http.post('/api/admin/articles/batch/status', { ids, status })
}

export function batchUpdateAdminArticleMeta(payload) {
  return http.post('/api/admin/articles/batch/meta', payload)
}

export function publishAdminArticle(id) {
  return http.post(`/api/admin/articles/${id}/publish`)
}

export function deleteAdminArticle(id) {
  return http.delete(`/api/admin/articles/${id}`)
}

export function batchDeleteAdminArticles(ids) {
  return http.post('/api/admin/articles/batch/delete', { ids })
}

export function downloadArticleImportTemplate() {
  return http.get('/api/admin/articles/import/template', {
    responseType: 'blob'
  })
}

export function previewArticleImport(files) {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  return http.post('/api/admin/articles/import/preview', formData)
}

export function commitArticleImport(payload) {
  return http.post('/api/admin/articles/import/commit', payload)
}

// 回收站相关
export async function listTrashArticles(params = {}) {
  return toPageResult(await http.get('/api/admin/articles/trash/list', { params }), params.pageSize || 20)
}

export function restoreArticle(id) {
  return http.post(`/api/admin/articles/${id}/restore`)
}

export function batchRestoreArticles(ids) {
  return http.post('/api/admin/articles/trash/batch/restore', { ids })
}

export function permanentDeleteArticle(id) {
  return http.delete(`/api/admin/articles/${id}/permanent`)
}

export function batchPermanentDeleteArticles(ids) {
  return http.post('/api/admin/articles/trash/batch/permanent', { ids })
}

export function emptyTrash() {
  return http.delete('/api/admin/articles/trash/empty')
}

// 分类相关
export async function listAdminCategories(params = {}) {
  return toPageResult(await http.get('/api/admin/categories', { params }), params.pageSize || 50)
}

export function batchUpdateAdminCategoryStatus(ids, status) {
  return http.post('/api/admin/categories/batch/status', { ids, status })
}

export function batchDeleteAdminCategories(ids) {
  return http.post('/api/admin/categories/batch/delete', { ids })
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

export function batchUpdateAdminTagStatus(ids, status) {
  return http.post('/api/admin/tags/batch/status', { ids, status })
}

export function batchDeleteAdminTags(ids) {
  return http.post('/api/admin/tags/batch/delete', { ids })
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

export function batchReviewAdminComments(ids, action) {
  return http.post('/api/admin/comments/batch/review', { ids, action })
}

export function reviewAdminComment(id, action) {
  return http.post(`/api/admin/comments/${id}/${action}`)
}

// 用户相关
export async function listAdminUsers(params = {}) {
  return toPageResult(await http.get('/api/admin/users', { params }), params.pageSize || 20)
}

export async function createAdminUser(data) {
  const challenge = await http.get('/api/auth/challenge', {
    params: { purpose: 'admin-create-user' }
  })
  const encryptedPayload = await encryptAuthCredential(challenge.publicKey, {
    purpose: 'admin-create-user',
    challengeId: challenge.challengeId,
    nonce: challenge.nonce,
    password: data.password
  })

  return http.post('/api/admin/users', {
    username: data.username,
    email: data.email,
    remarkName: data.remarkName || '',
    roleIds: data.roleIds || [],
    status: data.status || 'active',
    credential: {
      challengeId: challenge.challengeId,
      payload: encryptedPayload
    }
  })
}

export function updateAdminUserStatus(id, status) {
  return http.patch(`/api/admin/users/${id}/status`, { status })
}

export function updateAdminUserRemark(id, remarkName) {
  return http.patch(`/api/admin/users/${id}/remark`, { remarkName })
}

export function batchUpdateAdminUserStatus(ids, status) {
  return http.post('/api/admin/users/batch/status', { ids, status })
}

export function updateAdminUserRoles(id, roleIds) {
  return http.patch(`/api/admin/users/${id}/roles`, { roleIds })
}

export function batchUpdateAdminUserRoles(ids, roleIds) {
  return http.post('/api/admin/users/batch/roles', { ids, roleIds })
}

export function deleteAdminUser(id) {
  return http.delete(`/api/admin/users/${id}`)
}

export function batchDeleteAdminUsers(ids) {
  return http.post('/api/admin/users/batch/delete', { ids })
}

export async function batchResetAdminUserPasswords(userIds, newPassword) {
  const challenge = await http.get('/api/auth/challenge', {
    params: { purpose: 'admin-reset-password' }
  })
  const encryptedPayload = await encryptAuthCredential(challenge.publicKey, {
    purpose: 'admin-reset-password',
    challengeId: challenge.challengeId,
    nonce: challenge.nonce,
    newPassword
  })

  return http.post('/api/admin/users/batch/reset-password', {
    userIds,
    credential: {
      challengeId: challenge.challengeId,
      payload: encryptedPayload
    }
  })
}

export async function listRbacRoles(params = {}) {
  return toPageResult(await http.get('/api/rbac/roles', { params }), params.pageSize || 10)
}

export async function listAllRbacRoles(params = {}) {
  return collectAllPageItems(listRbacRoles, params)
}

export function createRbacRole(data) {
  return http.post('/api/rbac/roles', data)
}

export function updateRbacRole(id, data) {
  return http.patch(`/api/rbac/roles/${id}`, data)
}

export function deleteRbacRole(id) {
  return http.delete(`/api/rbac/roles/${id}`)
}

export function batchDeleteRbacRoles(ids) {
  return http.post('/api/rbac/roles/batch/delete', { ids })
}

export function batchUpdateRbacRoleMenus(ids, menuIds) {
  return http.post('/api/rbac/roles/batch/menus', { ids, menuIds })
}

export function listRbacRolePermissionMenus() {
  return http.get('/api/rbac/roles/permission-menus')
}

export function listRbacMenus() {
  return http.get('/api/rbac/menus')
}

export function createRbacMenu(data) {
  return http.post('/api/rbac/menus', data)
}

export function updateRbacMenu(id, data) {
  return http.patch(`/api/rbac/menus/${id}`, data)
}

export function reorderRbacMenus(items) {
  return http.post('/api/rbac/menus/reorder', { items })
}

export function deleteRbacMenu(id) {
  return http.delete(`/api/rbac/menus/${id}`)
}

export async function listPermissionRequests(params = {}) {
  return toPageResult(await http.get('/api/rbac/permission-requests', { params }), params.pageSize || 20)
}

export function reviewPermissionRequest(id, data) {
  return http.post(`/api/rbac/permission-requests/${id}/review`, data)
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

export function batchDeleteAdminMedia(ids) {
  return http.post('/api/admin/media/batch/delete', { ids })
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

export function batchRestoreAdminMedia(ids) {
  return http.post('/api/admin/media/trash/batch/restore', { ids })
}

export function batchPermanentDeleteAdminMedia(ids) {
  return http.post('/api/admin/media/trash/batch/permanent', { ids })
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

export function renameAdminMedia(id, data) {
  return http.patch(`/api/admin/media/${id}/name`, data)
}

export async function listProjectTimelineRecords(params = {}) {
  const result = await http.get('/api/admin/project-timeline', { params })
  return {
    ...toPageResult(result, params.pageSize || 20),
    categories: Array.isArray(result?.categories) ? result.categories : []
  }
}

export function createProjectTimelineRecord(data) {
  return http.post('/api/admin/project-timeline', data)
}

export function importProjectTimelineRecords(file) {
  const formData = new FormData()
  formData.append('file', file)
  return http.post('/api/admin/project-timeline/import', formData)
}

// 设置相关
export function getAdminSettings() {
  return http.get('/api/admin/settings')
}

export function updateAdminSettings(data) {
  return http.patch('/api/admin/settings', data)
}
