const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export function getMediaThumbnailUrl(record) {
  if (!record?.id) return record?.url || ''
  return `${API_BASE_URL}/api/admin/media-downloads/thumbnail/${encodeURIComponent(record.id)}`
}

export function hideFailedThumbnail(event) {
  const image = event.currentTarget
  if (image) image.hidden = true
}
