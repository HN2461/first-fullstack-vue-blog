/**
 * 统一资源原件的响应策略，只有被动媒体格式允许内嵌展示。
 * @param {object} media 已通过权限检查的资源记录。
 * @param {boolean} download 是否明确下载。
 * @returns {object} MIME、缓存、沙箱及下载文件名响应头。
 * @throws {Error} 不访问存储；调用方须先完成资源鉴权。
 */
export function getResourceContentHeaders(media, download = false) {
  const inline = /^image\/(jpeg|png|gif|webp|avif)$/.test(media.mimeType) ||
    media.mimeType === 'application/pdf' || /^(audio|video)\//.test(media.mimeType)
  return {
    'Content-Type': inline ? media.mimeType : 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; sandbox",
    'Cache-Control': media.accessScope === 'public' ? 'public, max-age=300' : 'private, no-store',
    'Content-Disposition': `${inline && !download ? 'inline' : 'attachment'}; filename="file"; filename*=UTF-8''${encodeURIComponent(media.originalName)}`
  }
}
