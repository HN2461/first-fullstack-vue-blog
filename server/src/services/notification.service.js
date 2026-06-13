import { Notification } from '../models/Notification.js'

export async function createAnnouncement(input) {
  const notification = await Notification.create({
    type: 'announcement',
    title: input.title.trim(),
    content: input.content.trim(),
    link: input.link || '',
    isActive: input.isActive !== false
  })

  return notification.toSafeJSON()
}

export async function listAnnouncements(includeInactive = false) {
  const query = includeInactive ? { type: 'announcement' } : { type: 'announcement', isActive: true }
  const notifications = await Notification.find(query).sort({ createdAt: -1 })
  return notifications.map((item) => item.toSafeJSON())
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
  if (input.link !== undefined) notification.link = input.link
  if (input.isActive !== undefined) notification.isActive = input.isActive

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
