import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import mongoose from 'mongoose'
import sharp from 'sharp'
import { Media } from '#modules/media/models/Media.js'
import { MediaCategory } from '#modules/media/models/MediaCategory.js'
import { resolveUploadRoot } from '#utils/uploadPath.js'
import { decodeUploadFilename } from '#utils/uploadFilename.js'
import { getBusinessDate } from '#utils/businessDate.js'

export const FEEDBACK_IMAGE_LIMIT = 5
export const FEEDBACK_IMAGE_BYTES = 5 * 1024 * 1024

/** 将真实图片写入统一上传根目录并登记媒体；失败会回收本次文件，不接受客户端路径。 */
export async function storeFeedbackAttachments(files, feedbackId, uploaderId) {
  if (files.length > FEEDBACK_IMAGE_LIMIT) {
    throw Object.assign(new Error('每次最多添加 5 张图片'), { statusCode: 400 })
  }
  const stored = []
  try {
    for (const file of files) {
      let format
      try {
        const metadata = await sharp(file.buffer, { limitInputPixels: 40000000 }).metadata()
        format = metadata.format
        if (!['png', 'jpeg', 'webp', 'gif'].includes(format)) throw new Error('format')
        // 解码实际像素，拒绝仅伪造文件头或截断的图片。
        await sharp(file.buffer, { limitInputPixels: 40000000 }).resize(1, 1).toBuffer()
      } catch {
        throw Object.assign(new Error('仅支持有效的 PNG、JPG、WEBP 或 GIF 图片'), { statusCode: 400, code: 'FEEDBACK_IMAGE_INVALID' })
      }
      if (!file.size || file.size > FEEDBACK_IMAGE_BYTES) {
        throw Object.assign(new Error('单张图片不能超过 5MB'), { statusCode: 400 })
      }
      const category = await MediaCategory.findOneAndUpdate(
        { name: '意见反馈', owner: null },
        { $setOnInsert: { system: true, description: '意见反馈私有截图，通过反馈权限读取', sortOrder: 8 } },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      )
      const id = new mongoose.Types.ObjectId()
      const filename = `${crypto.randomUUID()}.${format === 'jpeg' ? 'jpg' : format}`
      const directory = path.join(resolveUploadRoot(), 'feedback', ...getBusinessDate().slice(0, 7).split('-'))
      await fs.mkdir(directory, { recursive: true })
      const filePath = path.join(directory, filename)
      const media = new Media({
        _id: id,
        filename,
        originalName: decodeUploadFilename(file.originalname || filename).slice(0, 180),
        mimeType: `image/${format}`,
        size: file.size,
        storagePath: filePath,
        url: `/api/feedback/attachments/${id}`,
        kind: 'image',
        fileClass: 'image',
        accessScope: 'private',
        category: category.name,
        categoryId: category._id,
        feedback: feedbackId,
        uploader: uploaderId,
        sha256: crypto.createHash('sha256').update(file.buffer).digest('hex')
      })
      await fs.writeFile(filePath, file.buffer, { flag: 'wx', mode: 0o600 })
      stored.push(media)
      await media.save()
    }
    return stored
  } catch (error) {
    await discardFeedbackAttachments(stored)
    throw error
  }
}

/** 回收本次尚未关联成功的附件；参数为服务端媒体记录，失败不覆盖原业务异常。 */
export async function discardFeedbackAttachments(mediaItems) {
  for (const media of mediaItems) {
    await Media.deleteOne({ _id: media._id }).catch(() => {})
    await fs.unlink(media.storagePath).catch(() => {})
  }
}

/** 读取已授权反馈附件，返回媒体与路径；路径越界、软删除、文件缺失时拒绝读取。 */
export async function resolveFeedbackAttachment(media) {
  const root = path.resolve(resolveUploadRoot(), 'feedback')
  const filePath = path.resolve(media.storagePath)
  const relative = path.relative(root, filePath)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw Object.assign(new Error('图片路径不正确'), { statusCode: 404 })
  }
  const stats = await fs.stat(filePath).catch(() => null)
  if (!stats?.isFile()) throw Object.assign(new Error('图片文件不存在'), { statusCode: 404 })
  return { media, filePath }
}
