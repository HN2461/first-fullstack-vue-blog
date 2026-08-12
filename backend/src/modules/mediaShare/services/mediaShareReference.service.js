import { Media } from '#modules/media/models/Media.js'
import { MediaSharePackage } from '../models/MediaSharePackage.js'

export async function findMediaShareReferences(mediaId) {
  if (!mediaId) return []
  const shares = await MediaSharePackage.find({ 'entries.media': mediaId })
    .select('name publicId status updatedAt')
    .sort({ updatedAt: -1 })
    .lean()

  return shares.map((share) => ({
    type: 'resourceShare',
    typeLabel: '资源分享',
    ownerId: share._id.toString(),
    ownerTitle: share.name,
    ownerSubtitle: share.publicId,
    routePath: '/console/manage/media-shares',
    status: share.status,
    updatedAt: share.updatedAt
  }))
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
