import path from 'node:path'
import { decodeUploadFilename } from '#utils/uploadFilename.js'

const MIME_BY_EXT = Object.freeze({
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.json': 'application/json',
  '.js': 'text/javascript',
  '.ts': 'text/typescript',
  '.vue': 'text/plain',
  '.css': 'text/css',
  '.html': 'text/html',
  '.xml': 'application/xml',
  '.csv': 'text/csv',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.zip': 'application/zip',
  '.rar': 'application/vnd.rar',
  '.7z': 'application/x-7z-compressed',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
})

const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.vue', '.java', '.py', '.go', '.rb', '.php', '.sql', '.json', '.yml', '.yaml', '.xml', '.html', '.css', '.scss', '.less', '.md', '.txt', '.sh', '.ps1', '.bat', '.c', '.cpp', '.h', '.hpp', '.cs', '.kt', '.swift', '.rs'])
const DOCUMENT_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.csv'])
const ARCHIVE_EXTENSIONS = new Set(['.zip', '.rar', '.7z', '.tar', '.gz'])
const TEST_UPLOAD_BASENAMES = new Set([
  'hello.txt',
  'article-image.png',
  'upload-filename.test.js',
  'untitled.txt',
  'first.txt',
  'second.txt',
  'large.bin',
  'recycle.txt',
  'legacy-delete.txt',
  'untracked.png'
])

export function inferMimeType(filename) {
  const ext = path.extname(filename || '').toLowerCase()
  return MIME_BY_EXT[ext] || 'application/octet-stream'
}

export function inferFileClass(filename, mimeType = '') {
  if (mimeType.startsWith('image/')) {
    return 'image'
  }

  const ext = path.extname(filename || '').toLowerCase()
  if (CODE_EXTENSIONS.has(ext)) return 'code'
  if (DOCUMENT_EXTENSIONS.has(ext)) return 'document'
  if (ARCHIVE_EXTENSIONS.has(ext)) return 'archive'
  return 'other'
}

export function getDisplayName(filename) {
  const decodedName = decodeUploadFilename(filename)
  return decodedName.replace(/^\d{10,}-/, '') || decodedName
}

export function getTestUploadReason(relativePath, filename) {
  const normalizedPath = String(relativePath || '').replace(/\\/g, '/')
  const normalizedName = String(filename || '').replace(/^\d{10,}-/, '')

  if (normalizedPath.startsWith('inventory-test/')) {
    return '测试库存扫描目录'
  }
  if (TEST_UPLOAD_BASENAMES.has(normalizedName)) {
    return '命中测试上传文件名'
  }
  if (/^\d{10,}-[a-f0-9]+-untracked\.png$/i.test(filename || '')) {
    return '命中测试未登记图片命名'
  }
  return ''
}

export function buildUrlFromRelativePath(relativePath) {
  return `/uploads/${String(relativePath || '').replace(/\\/g, '/')}`
}

export function normalizeDiskPath(value) {
  return path.resolve(String(value || '')).replace(/\\/g, '/').toLowerCase()
}

export function isPathInside(parent, target) {
  const relative = path.relative(parent, target)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}
