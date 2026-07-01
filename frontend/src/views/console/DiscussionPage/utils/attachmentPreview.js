export function getAttachmentOpenUrl(attachment = {}) {
  if (!attachment.url) return ''
  return new URL(attachment.url, window.location.origin).href
}

export function getAttachmentPreviewType(attachment = {}) {
  const mime = (attachment.mimeType || '').toLowerCase()
  const ext = (attachment.originalName || '').split('.').pop().toLowerCase()

  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) return 'video'
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext)) return 'audio'
  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf'
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'].includes(ext)) return 'office'

  const textExtensions = [
    'js', 'jsx', 'ts', 'tsx', 'vue', 'json', 'yml', 'yaml', 'xml',
    'html', 'css', 'scss', 'less', 'md', 'txt', 'sh', 'bat', 'ps1',
    'py', 'java', 'go', 'rb', 'php', 'sql', 'c', 'cpp', 'h', 'cs',
    'kt', 'swift', 'rs', 'ini', 'conf', 'env', 'gitignore', 'editorconfig'
  ]
  if (mime.startsWith('text/') || textExtensions.includes(ext)) return 'text'

  return 'other'
}

export function getAttachmentTypeLabel(attachment = {}) {
  const labelMap = {
    image: '图片',
    video: '视频',
    audio: '音频',
    pdf: 'PDF',
    office: '文档',
    text: '文本'
  }
  return labelMap[getAttachmentPreviewType(attachment)] || attachment.mimeType || '附件'
}

export function canUseOfficeOnlinePreview(openUrl) {
  if (!openUrl) return false

  try {
    const url = new URL(openUrl)
    const host = url.hostname.toLowerCase()
    const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '::1'
    const isPrivateIp =
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    const isPlainIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
    return ['http:', 'https:'].includes(url.protocol) && !isLocalhost && !isPrivateIp && !isPlainIp
  } catch {
    return false
  }
}
