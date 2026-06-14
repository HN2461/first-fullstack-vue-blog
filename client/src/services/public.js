import http from './http'

export function getPublicSiteProfile() {
  return http.get('/api/public/site/profile')
}

export function getPublicHome() {
  return http.get('/api/public/home')
}

export async function listPublicCategories() {
  const home = await getPublicHome()
  return home.categories || []
}

export function listPublicArticles(params = {}) {
  return http.get('/api/public/articles', { params })
}

export function searchPublicArticles(params = {}) {
  return http.get('/api/public/search', { params })
}

export function getPublicArticle(slug) {
  return http.get(`/api/public/articles/${encodeURIComponent(slug)}`)
}

// ==================== 公告通知相关 ====================

export function listPublicAnnouncements(params = {}) {
  return http.get('/api/public/announcements', { params })
}

export function getUnreadCount() {
  return http.get('/api/public/announcements/unread-count')
}

export function getPopupAnnouncements() {
  return http.get('/api/public/announcements/popups')
}

export function markAnnouncementRead(id) {
  return http.post(`/api/public/announcements/${id}/read`)
}

export function markAllAnnouncementsRead() {
  return http.post('/api/public/announcements/read-all')
}
