import { Notification } from '../models/Notification.js'

/* ===========================
   管理端 — 公告 CRUD
   =========================== */

export async function createAnnouncement(input, authorId) {
  const notification = await Notification.create({
    type: 'announcement',
    title: input.title.trim(),
    content: input.content.trim(),
    level: input.level || 'info',
    link: input.link || '',
    isActive: input.isActive !== false,
    autoPopup: input.autoPopup === true,
    author: authorId || null
  })

  return notification.toSafeJSON()
}

export async function createSystemNotification(input, recipientId = null) {
  const notification = await Notification.create({
    recipient: recipientId || null,
    type: 'system',
    title: input.title.trim(),
    content: input.content.trim(),
    level: input.level || 'info',
    link: input.link || '',
    isActive: input.isActive !== false,
    autoPopup: input.autoPopup === true,
    author: input.authorId || null
  })

  return notification.toSafeJSON()
}

export async function listAnnouncements(includeInactive = false, filters = {}) {
  const query = { type: 'announcement' }

  if (!includeInactive) {
    query.isActive = true
  }

  if (filters.level) {
    query.level = filters.level
  }

  if (filters.isActive !== undefined && filters.isActive !== '') {
    query.isActive = filters.isActive === 'true' || filters.isActive === true
  }

  const page = Math.max(1, parseInt(filters.page, 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize, 10) || 20))
  const skip = (page - 1) * pageSize

  const [items, total] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    Notification.countDocuments(query)
  ])

  return {
    items: items.map(item => {
      const obj = new Notification(item)
      return obj.toSafeJSON()
    }),
    total,
    page,
    pageSize
  }
}

export async function getAnnouncementById(id) {
  const notification = await Notification.findById(id)
  if (!notification) {
    const error = new Error('公告不存在')
    error.statusCode = 404
    error.code = 'ANNOUNCEMENT_NOT_FOUND'
    throw error
  }
  return notification.toSafeJSON()
}

export async function updateAnnouncement(id, input) {
  const notification = await Notification.findById(id)
  if (!notification) {
    const error = new Error('公告不存在')
    error.statusCode = 404
    error.code = 'ANNOUNCEMENT_NOT_FOUND'
    throw error
  }

  if (input.title !== undefined) notification.title = input.title.trim()
  if (input.content !== undefined) notification.content = input.content.trim()
  if (input.level !== undefined) notification.level = input.level
  if (input.link !== undefined) notification.link = input.link
  if (input.isActive !== undefined) notification.isActive = input.isActive
  if (input.autoPopup !== undefined) notification.autoPopup = input.autoPopup

  await notification.save()
  return notification.toSafeJSON()
}

export async function deleteAnnouncement(id) {
  const notification = await Notification.findById(id)
  if (!notification) {
    const error = new Error('公告不存在')
    error.statusCode = 404
    error.code = 'ANNOUNCEMENT_NOT_FOUND'
    throw error
  }

  await Notification.findByIdAndDelete(id)
  return { id, deleted: true }
}

export async function batchToggleAnnouncement(ids, isActive) {
  const result = await Notification.updateMany(
    { _id: { $in: ids }, type: 'announcement' },
    { $set: { isActive } }
  )
  return { modifiedCount: result.modifiedCount, isActive }
}

export async function batchDeleteAnnouncements(ids) {
  const result = await Notification.deleteMany({
    _id: { $in: ids },
    type: 'announcement'
  })
  return { deletedCount: result.deletedCount }
}

/* ===========================
   用户端 — 公告阅读 / 已读
   =========================== */

export async function listActiveAnnouncements(userId, filters = {}) {
  const query = {
    isActive: true,
    $or: [
      { type: 'announcement' },
      { type: 'system', recipient: userId || null }
    ]
  }

  if (filters.level) {
    query.level = filters.level
  }

  const page = Math.max(1, parseInt(filters.page, 10) || 1)
  const pageSize = Math.min(50, Math.max(1, parseInt(filters.pageSize, 10) || 20))
  const skip = (page - 1) * pageSize

  const [items, total] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    Notification.countDocuments(query)
  ])

  return {
    items: items.map(item => {
      const obj = new Notification(item)
      return obj.toSafeJSON(userId)
    }),
    total,
    page,
    pageSize
  }
}

export async function getUnreadCount(userId) {
  if (!userId) return 0

  const visibleQuery = {
    isActive: true,
    $or: [
      { type: 'announcement' },
      { type: 'system', recipient: userId }
    ]
  }
  const total = await Notification.countDocuments(visibleQuery)
  const readCount = await Notification.countDocuments({
    ...visibleQuery,
    'readBy.user': userId
  })

  return Math.max(0, total - readCount)
}

export async function markAsRead(notificationId, userId) {
  if (!userId) return null

  const notification = await Notification.findById(notificationId)
  if (!notification) {
    const error = new Error('公告不存在')
    error.statusCode = 404
    error.code = 'ANNOUNCEMENT_NOT_FOUND'
    throw error
  }

  const alreadyRead = notification.readBy.some(
    entry => entry.user.toString() === userId.toString()
  )

  if (!alreadyRead) {
    notification.readBy.push({ user: userId, readAt: new Date() })
    notification.viewCount = (notification.viewCount || 0) + 1
    await notification.save()
  }

  return notification.toSafeJSON(userId)
}

export async function markAllAsRead(userId) {
  if (!userId) return { modifiedCount: 0 }

  const unreadAnnouncements = await Notification.find({
    isActive: true,
    $or: [
      { type: 'announcement' },
      { type: 'system', recipient: userId }
    ],
    'readBy.user': { $ne: userId }
  })

  const bulkOps = unreadAnnouncements.map(notification => ({
    updateOne: {
      filter: { _id: notification._id },
      update: {
        $push: { readBy: { user: userId, readAt: new Date() } },
        $inc: { viewCount: 1 }
      }
    }
  }))

  if (bulkOps.length > 0) {
    await Notification.bulkWrite(bulkOps)
  }

  return { modifiedCount: unreadAnnouncements.length }
}

export async function getPopupAnnouncements(userId) {
  if (!userId) return []

  const announcements = await Notification.find({
    isActive: true,
    autoPopup: true,
    $or: [
      { type: 'announcement' },
      { type: 'system', recipient: userId }
    ],
    'readBy.user': { $ne: userId }
  }).sort({ createdAt: -1 }).limit(5).lean()

  return announcements.map(item => {
    const obj = new Notification(item)
    return obj.toSafeJSON(userId)
  })
}
