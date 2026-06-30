import { DiscussionMember } from '#modules/discussion/models/DiscussionMember.js'
import { DiscussionMessage } from '#modules/discussion/models/DiscussionMessage.js'
import { DiscussionThread } from '#modules/discussion/models/DiscussionThread.js'
import { resolveThreadTitle } from '#modules/discussion/services/discussionHelpers.js'

export async function listDiscussionThreads(currentUserId) {
  const memberships = await DiscussionMember.find({ userId: currentUserId }).select('threadId lastReadAt clearedBeforeAt')
  const readMap = new Map(memberships.map((item) => [item.threadId.toString(), item.lastReadAt]))
  const clearedMap = new Map(memberships.map((item) => [item.threadId.toString(), item.clearedBeforeAt]))
  const threadIds = memberships.map((item) => item.threadId)
  if (!threadIds.length) {
    return { items: [] }
  }

  const threads = await DiscussionThread.find({ _id: { $in: threadIds }, status: 'active' })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
  const memberRows = await DiscussionMember.find({ threadId: { $in: threadIds } })
    .populate('userId', 'username email avatar')
    .sort({ createdAt: 1 })
  const membersByThread = new Map()
  for (const member of memberRows) {
    const key = member.threadId.toString()
    if (!membersByThread.has(key)) membersByThread.set(key, [])
    membersByThread.get(key).push(member.toSafeJSON())
  }

  const unreadPairs = await Promise.all(threadIds.map(async (threadId) => {
    const lastReadAt = readMap.get(threadId.toString())
    const clearedBeforeAt = clearedMap.get(threadId.toString())
    const query = {
      threadId,
      senderId: { $ne: currentUserId },
      hiddenFor: { $ne: currentUserId }
    }
    const afterDates = [lastReadAt, clearedBeforeAt].filter(Boolean)
    if (afterDates.length) {
      query.createdAt = { $gt: new Date(Math.max(...afterDates.map((date) => date.getTime()))) }
    }
    return [threadId.toString(), await DiscussionMessage.countDocuments(query)]
  }))
  const unreadMap = new Map(unreadPairs)

  return {
    items: threads.map((thread) => {
      const members = membersByThread.get(thread._id.toString()) || []
      const unreadCount = unreadMap.get(thread._id.toString()) || 0
      return thread.toSafeJSON({
        title: resolveThreadTitle(thread, members, currentUserId),
        members,
        unreadCount
      })
    })
  }
}
