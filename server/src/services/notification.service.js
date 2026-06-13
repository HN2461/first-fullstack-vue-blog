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
