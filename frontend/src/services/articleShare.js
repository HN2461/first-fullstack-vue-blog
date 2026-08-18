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

export function updateAdminArticleShare(id, data) {
  return http.patch(`/api/admin/article-shares/${id}`, data)
}

export function revokeAdminArticleShare(id) {
  return http.post(`/api/admin/article-shares/${id}/revoke`)
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
