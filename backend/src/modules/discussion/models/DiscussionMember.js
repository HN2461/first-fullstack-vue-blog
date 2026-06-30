import mongoose from 'mongoose'
import { DISCUSSION_MEMBER_ROLES } from '#modules/discussion/constants/discussion.constants.js'

const discussionMemberSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DiscussionThread',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: Object.values(DISCUSSION_MEMBER_ROLES),
      default: DISCUSSION_MEMBER_ROLES.MEMBER
    },
    muted: {
      type: Boolean,
      default: false
    },
    lastReadAt: {
      type: Date,
      default: null
    },
    clearedBeforeAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

discussionMemberSchema.index({ threadId: 1, userId: 1 }, { unique: true })
discussionMemberSchema.index({ userId: 1, updatedAt: -1 })

discussionMemberSchema.methods.toSafeJSON = function toSafeJSON() {
  const user = this.userId && typeof this.userId === 'object' ? this.userId : null
  return {
    id: this._id.toString(),
    threadId: this.threadId?.toString?.(),
    userId: user?._id?.toString?.() || this.userId?.toString?.(),
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    role: this.role,
    muted: this.muted,
    lastReadAt: this.lastReadAt,
    clearedBeforeAt: this.clearedBeforeAt,
    joinedAt: this.createdAt
  }
}

export const DiscussionMember = mongoose.model('DiscussionMember', discussionMemberSchema)
