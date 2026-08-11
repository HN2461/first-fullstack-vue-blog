import http from './http'

export function getPublicMediaShare(publicId) {
  return http.get(`/api/public/media-shares/${encodeURIComponent(publicId)}`)
}

export function claimPublicMediaShare(publicId) {
  return http.post(`/api/public/media-shares/${encodeURIComponent(publicId)}/claim`)
}

export function verifyPublicMediaShare(publicId, code) {
  return http.post(`/api/public/media-shares/${encodeURIComponent(publicId)}/verify-password`, { code })
}

export function getPublicMediaShareContentUrl(publicId, entryId, disposition = 'inline') {
  const baseUrl = http.defaults.baseURL || window.location.origin
  const query = disposition === 'attachment' ? '?disposition=attachment' : ''
  return `${baseUrl}/api/public/media-shares/${encodeURIComponent(publicId)}/entries/${encodeURIComponent(entryId)}/content${query}`
}

export function getPublicMediaShareArchiveUrl(publicId) {
  const baseUrl = http.defaults.baseURL || window.location.origin
  return `${baseUrl}/api/public/media-shares/${encodeURIComponent(publicId)}/download`
}
