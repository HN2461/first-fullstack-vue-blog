import path from 'node:path'

export const MEDIA_EXTENSION_GROUPS = Object.freeze([
  {
    key: 'image',
    label: '图片',
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.avif']
  },
  {
    key: 'document',
    label: '文档',
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.csv']
  },
  {
    key: 'code',
    label: '代码与文本',
    extensions: ['.txt', '.md', '.json', '.js', '.jsx', '.ts', '.tsx', '.vue', '.java', '.py', '.go', '.rb', '.php', '.sql', '.yml', '.yaml', '.xml', '.html', '.css', '.scss', '.less', '.sh', '.ps1', '.bat', '.c', '.cpp', '.h', '.hpp', '.cs', '.kt', '.swift', '.rs']
  },
  {
    key: 'archive',
    label: '压缩包',
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz']
  },
  {
    key: 'installer',
    label: '安装包',
    extensions: ['.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm', '.apk', '.appimage']
  },
  {
    key: 'media',
    label: '音视频',
    extensions: ['.mp4', '.webm', '.mov', '.mp3', '.wav', '.m4a', '.ogg']
  }
])

export const MEDIA_ALLOWED_EXTENSION_VALUES = Object.freeze(
  [...new Set(MEDIA_EXTENSION_GROUPS.flatMap((group) => group.extensions))]
)

export const DEFAULT_MEDIA_ALLOWED_EXTENSIONS = Object.freeze([...MEDIA_ALLOWED_EXTENSION_VALUES])

const MEDIA_CODE_EXTENSIONS = new Set(
  MEDIA_EXTENSION_GROUPS.find((group) => group.key === 'code').extensions
)
const MEDIA_DOCUMENT_EXTENSIONS = new Set(
  MEDIA_EXTENSION_GROUPS.find((group) => group.key === 'document').extensions
)
const MEDIA_ARCHIVE_EXTENSIONS = new Set([
  ...MEDIA_EXTENSION_GROUPS.find((group) => group.key === 'archive').extensions,
  ...MEDIA_EXTENSION_GROUPS.find((group) => group.key === 'installer').extensions
])

export function normalizeMediaExtension(value) {
  const extension = String(value || '').trim().toLowerCase()
  if (!extension) return ''
  return extension.startsWith('.') ? extension : `.${extension}`
}

export function normalizeAllowedMediaExtensions(value) {
  if (!Array.isArray(value)) {
    return [...DEFAULT_MEDIA_ALLOWED_EXTENSIONS]
  }

  const allowedSet = new Set(MEDIA_ALLOWED_EXTENSION_VALUES)
  const normalized = [...new Set(value.map(normalizeMediaExtension))]
    .filter((extension) => allowedSet.has(extension))

  return normalized.length > 0 ? normalized : [...DEFAULT_MEDIA_ALLOWED_EXTENSIONS]
}

export function getMediaFileExtension(filename) {
  return normalizeMediaExtension(path.extname(String(filename || '')))
}

export function isMediaExtensionAllowed(filename, allowedExtensions = DEFAULT_MEDIA_ALLOWED_EXTENSIONS) {
  const extension = getMediaFileExtension(filename)
  if (!extension) return false
  return new Set(normalizeAllowedMediaExtensions(allowedExtensions)).has(extension)
}

export function inferMediaFileClass(filename, mimeType = '') {
  if (String(mimeType || '').startsWith('image/')) {
    return 'image'
  }

  const extension = getMediaFileExtension(filename)
  if (MEDIA_CODE_EXTENSIONS.has(extension)) return 'code'
  if (MEDIA_DOCUMENT_EXTENSIONS.has(extension)) return 'document'
  if (MEDIA_ARCHIVE_EXTENSIONS.has(extension)) return 'archive'
  return 'other'
}
