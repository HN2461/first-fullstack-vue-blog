import path from 'node:path'
import { decodeUploadFilename } from '#utils/uploadFilename.js'
import { inferMediaFileClass } from '#modules/media/constants/mediaUpload.constants.js'

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
  '.exe': 'application/vnd.microsoft.portable-executable',
  '.msi': 'application/x-msi',
  '.dmg': 'application/x-apple-diskimage',
  '.pkg': 'application/octet-stream',
  '.deb': 'application/vnd.debian.binary-package',
  '.rpm': 'application/x-rpm',
  '.apk': 'application/vnd.android.package-archive',
  '.appimage': 'application/octet-stream',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg'
})

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
  return inferMediaFileClass(filename, mimeType)
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

export function inferInventorySource(relativePath) {
  const normalizedPath = String(relativePath || '').replace(/\\/g, '/')
  if (normalizedPath.startsWith('avatars/')) {
    return {
      type: 'avatar',
      label: '用户头像目录',
      description: '来自个人资料头像上传目录，需优先确认是否仍被用户账号使用。'
    }
  }
  if (normalizedPath.startsWith('media/')) {
    return {
      type: 'media',
      label: '媒体上传目录',
      description: '来自后台媒体资产上传目录，通常应登记进媒体库后再统一管理。'
    }
  }
  if (normalizedPath.startsWith('inventory-test/')) {
    return {
      type: 'test',
      label: '测试目录',
      description: '来自测试扫描目录，确认无引用后可清理。'
    }
  }
  return {
    type: 'upload',
    label: '上传目录',
    description: '位于上传根目录下，需结合引用状态判断是否可清理。'
  }
}

export function normalizeDiskPath(value) {
  return path.resolve(String(value || '')).replace(/\\/g, '/').toLowerCase()
}

export function isPathInside(parent, target) {
  const relative = path.relative(parent, target)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}
