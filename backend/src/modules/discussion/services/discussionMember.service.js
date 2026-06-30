import { DiscussionMember } from '#modules/discussion/models/DiscussionMember.js'
import { createDiscussionError } from '#modules/discussion/services/discussionHelpers.js'

export async function assertThreadMember(threadId, userId) {
  const member = await DiscussionMember.findOne({ threadId, userId })
  if (!member) {
    throw createDiscussionError(403, 'DISCUSSION_MEMBER_REQUIRED', '你不是该讨论成员')
  }
  return member
}

export async function getThreadMembers(threadId) {
  return DiscussionMember.find({ threadId })
    .populate('userId', 'username email avatar')
    .sort({ role: -1, createdAt: 1 })
}
