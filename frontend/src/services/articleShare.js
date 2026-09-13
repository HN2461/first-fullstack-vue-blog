import http from './http'
import { toPageResult } from './contracts'

export async function listAdminArticleShares(params = {}) {
  return toPageResult(await http.get('/api/admin/article-shares', { params }), params.pageSize || 20)
}

export function getAdminArticleShare(id) {
  return http.get(`/api/admin/article-shares/${id}`)
}

export function createAdminArticleShare(data) {
  return http.post('/api/admin/article-shares', data)
}

/**
 * 查询当前用户相同文章范围的有效分享；未命中时返回 null，权限或范围非法时抛出请求错误。
 * @param {object} data 单篇、目录或自选文章范围。
 * @returns {Promise<object|null>} 可复用的共享详情或 null。
 */
export function findReusableAdminArticleShare(data) {
  return http.post('/api/admin/article-shares/reusable', data)
}

/**
 * 获取共享弹窗可选的已发布文章和有效目录；结果受后台共享权限保护。
 * @param {object} params 搜索词和返回数量等查询参数。
 * @returns {Promise<{articles: object[], categories: object[]}>} 共享来源集合。
 */
export function listArticleShareSources(params = {}) {
  return http.get('/api/admin/article-shares/sources', { params })
}

export function updateAdminArticleShare(id, data) {
  return http.patch(`/api/admin/article-shares/${id}`, data)
}

export function revokeAdminArticleShare(id) {
  return http.post(`/api/admin/article-shares/${id}/revoke`)
}

/**
 * 删除本人已撤销或已过期的共享记录；生效中的链接会由后端拒绝。
 * @param {string} id 共享记录 ID。
 * @returns {Promise<{id: string}>} 已删除记录标识。
 */
export function deleteAdminArticleShare(id) {
  return http.delete(`/api/admin/article-shares/${id}`)
}

export function getPublicArticleShare(publicId) {
  return http.get(`/api/public/article-shares/${encodeURIComponent(publicId)}`)
}

export function claimPublicArticleShare(publicId) {
  return http.post(`/api/public/article-shares/${encodeURIComponent(publicId)}/claim`)
}

export function verifyPublicArticleShare(publicId, code) {
  return http.post(`/api/public/article-shares/${encodeURIComponent(publicId)}/verify-password`, { code })
}

export function getPublicSharedArticle(publicId, slug) {
  return http.get(`/api/public/article-shares/${encodeURIComponent(publicId)}/articles/${encodeURIComponent(slug)}`)
}

export function buildArticleShareUrl(sharePath) {
  return new URL(sharePath, window.location.origin).toString()
}
