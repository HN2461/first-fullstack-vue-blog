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
      description: '由个人资料模块管理的用户头像，不属于普通媒体资产。',
      registerable: false,
      protectedReason: '用户头像由账号资料独立管理，不可登记或按未登记资源清理'
    }
  }
  if (normalizedPath.startsWith('resumes/')) {
    return {
      type: 'resume',
      label: '简历照片目录',
      description: '由简历模块管理的证件照或个人照片，不属于普通媒体资产。',
      registerable: false,
      protectedReason: '简历照片由简历模块独立管理，不可登记或按未登记资源清理'
    }
  }
  if (normalizedPath.startsWith('discussions/')) {
    return {
      type: 'discussion',
      label: '讨论附件目录',
      description: '由讨论模块管理的图片和附件，引用关系不依赖媒体资产记录。',
      registerable: false,
      protectedReason: '讨论附件由讨论模块独立管理，不可登记或按未登记资源清理'
    }
  }
  if (normalizedPath.startsWith('article-snapshot/')) {
    return {
      type: 'articleSnapshot',
      label: '文章快照目录',
      description: '用于保存文章权威快照的原始文档，由文章快照流程独立管理。',
      registerable: false,
      protectedReason: '文章快照原始文档由快照流程独立管理，不可按未登记资源处理'
    }
  }
  if (normalizedPath.startsWith('media/') || /^\d{4}\/(0[1-9]|1[0-2])\//.test(normalizedPath)) {
    return {
      type: 'media',
      label: '媒体上传目录',
      description: '后台媒体资产使用的常规上传位置，未登记文件可以补录到媒体库。',
      registerable: true,
      protectedReason: ''
    }
  }
  if (normalizedPath.startsWith('inventory-test/')) {
    return {
      type: 'test',
      label: '测试目录',
      description: '用于验证库存扫描的测试位置，确认无引用后可以登记或清理。',
      registerable: true,
      protectedReason: ''
    }
  }
  return {
    type: 'upload',
    label: '其他上传目录',
    description: '上传根目录下尚未归类的历史或脚本写入文件，需结合业务用途和引用状态人工判断。',
    registerable: true,
    protectedReason: ''
  }
}

export function normalizeDiskPath(value) {
  return path.resolve(String(value || '')).replace(/\\/g, '/').toLowerCase()
}

export function isPathInside(parent, target) {
  const relative = path.relative(parent, target)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}
