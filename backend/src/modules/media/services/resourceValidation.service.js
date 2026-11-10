import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { createReadStream } from 'node:fs'
import sharp from 'sharp'
import { decodeUploadFilename } from '#utils/uploadFilename.js'
import { resourceError } from '../constants/resourceScenes.js'
import { inferMimeType } from '../utils/mediaInventory.util.js'

const rasterExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp'])
const imageMime = { jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif' }

/**
 * 校验上传大小与真实图片内容，MIME 和后缀只作为辅助信息。
 * @param {object} file Multer 文件，支持 buffer 或服务端 path。
 * @param {object} policy 服务端场景限制。
 * @returns {Promise<object>} 真实名称、大小、类型、扩展名与 SHA-256。
 * @throws {Error} 空文件、超限、伪造或损坏图片返回 400。
 */
export async function validateResourceFile(file, policy) {
  if (!file || (!file.buffer && !file.path)) throw resourceError(400, 'FILE_REQUIRED', '请选择要上传的文件')
  const originalName = path.basename(decodeUploadFilename(file.originalname || file.filename || 'file')).slice(0, 180)
  const size = file.buffer ? file.buffer.length : (await fs.stat(file.path)).size
  if ((!size && policy.imageFormats) || size > policy.maxBytes) throw resourceError(400, 'RESOURCE_SIZE_LIMIT', `文件超过场景大小限制 ${policy.maxBytes / 1024 / 1024}MB，图片不能为空`)
  let extension = path.extname(originalName).toLowerCase()
  let mimeType = String(file.mimetype || 'application/octet-stream')
  if (mimeType === 'application/octet-stream') mimeType = inferMimeType(originalName)
  const source = file.buffer || file.path
  if (policy.imageFormats || rasterExtensions.has(extension) || mimeType.startsWith('image/') && mimeType !== 'image/svg+xml') {
    try {
      const metadata = await sharp(source, { limitInputPixels: 40000000 }).metadata()
      const format = metadata.format === 'heif' && metadata.compression === 'av1' ? 'avif' : metadata.format
      if (!(policy.imageFormats || Object.keys(imageMime)).includes(format) || !imageMime[format]) throw new Error('format')
      // 实际解码可拒绝只有正确文件头、内容截断或像素数量异常的图片。
      await sharp(source, { limitInputPixels: 40000000 }).resize(1, 1).toBuffer()
      mimeType = imageMime[format]
      extension = format === 'jpeg' ? '.jpg' : `.${format}`
    } catch {
      throw resourceError(400, 'RESOURCE_IMAGE_INVALID', policy.imageFormats?.length === 1 ? '仅支持有效的 JPG 图片' : '请选择完整有效的图片文件')
    }
  }
  const hash = crypto.createHash('sha256')
  if (file.buffer) hash.update(file.buffer)
  else for await (const chunk of createReadStream(file.path)) hash.update(chunk)
  return { originalName, size, mimeType, extension, sha256: hash.digest('hex') }
}
