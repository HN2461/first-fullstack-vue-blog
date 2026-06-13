import { request } from './http'

function toQuery(params = {}) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value)
    }
  })

  const query = search.toString()
  return query ? `?${query}` : ''
}

export function getPublicHome() {
  return request('/api/public/home')
}

export async function listPublicCategories() {
  const home = await getPublicHome()
  return home.categories || []
}

export function listPublicArticles(params = {}) {
  return request(`/api/public/articles${toQuery(params)}`)
}

export function searchPublicArticles(params = {}) {
  return request(`/api/public/search${toQuery(params)}`)
}

export function getPublicArticle(slug) {
  return request(`/api/public/articles/${encodeURIComponent(slug)}`)
}

// ==================== 公告通知相关 ====================

export function listPublicAnnouncements(params = {}) {
  return request(`/api/public/announcements${toQuery(params)}`)
}

export function getUnreadCount() {
  return request('/api/public/announcements/unread-count')
}

export function getPopupAnnouncements() {
  return request('/api/public/announcements/popups')
}

export function markAnnouncementRead(id) {
  return request(`/api/public/announcements/${id}/read`, {
    method: 'POST'
  })
}

export function markAllAnnouncementsRead() {
  return request('/api/public/announcements/read-all', {
    method: 'POST'
  })
}
