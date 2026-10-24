import { Media } from '#modules/media/models/Media.js'
import { MediaSharePackage } from '../models/MediaSharePackage.js'

function toMediaShareReference(share) {
  return {
    type: 'resourceShare',
    typeLabel: '资源分享',
    ownerId: share._id.toString(),
    ownerUserId: share.createdBy?.toString?.() || '',
    ownerTitle: share.name,
    ownerSubtitle: share.publicId,
    routePath: '/console/manage/media-shares',
    routeQuery: {
      shareId: share._id.toString(),
      keyword: share.name
    },
    status: share.status,
    updatedAt: share.updatedAt
  }
}

export async function findMediaShareReferences(mediaId) {
  if (!mediaId) return []
  const shares = await MediaSharePackage.find({ 'entries.media': mediaId })
    .select('name publicId status createdBy updatedAt')
    .sort({ updatedAt: -1 })
    .lean()

  return shares.map(toMediaShareReference)
}

/**
 * 批量统计一组媒体分别被多少个资源分享包引用。
 * @param {Array<string|object>} mediaIds 媒体 ID 或 Mongoose ObjectId。
 * @returns {Promise<Map<string, number>>} 以媒体 ID 为键的分享引用数量。
 * @throws {Error} 数据库查询失败时透传 Mongoose 错误；空数组返回空计数映射。
 */
export async function countMediaShareReferencesByMediaIds(mediaIds = []) {
  const uniqueIds = [...new Map(mediaIds.map((id) => [id.toString(), id])).values()]
  const counts = new Map(uniqueIds.map((id) => [id.toString(), 0]))
  if (uniqueIds.length === 0) return counts

  const shares = await MediaSharePackage.find({ 'entries.media': { $in: uniqueIds } })
    .select('entries.media')
    .lean()

  for (const share of shares) {
    const referencedIds = new Set((share.entries || []).map((entry) => entry.media?.toString?.()).filter(Boolean))
    for (const id of referencedIds) {
      if (counts.has(id)) counts.set(id, counts.get(id) + 1)
    }
  }

  return counts
}

export async function findBlockingMediaShares(mediaId) {
  return MediaSharePackage.find({ status: 'active', 'entries.media': mediaId })
    .select('name publicId')
    .lean()
}

export async function attachShareEntryAvailability(share) {
  const availableMedia = await Media.find({
    _id: { $in: share.entries.map((entry) => entry.media) }
  }).select('_id').lean()
  const availableIds = new Set(availableMedia.map((item) => item._id.toString()))

  return share.entries.map((entry) => ({
    entryId: entry.entryId,
    originalName: entry.originalName,
    mimeType: entry.mimeType,
    size: entry.size,
    fileClass: entry.fileClass,
    available: availableIds.has(entry.media.toString())
  }))
}
