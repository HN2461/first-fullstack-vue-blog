import mongoose from 'mongoose'
import { DISCUSSION_THREAD_TYPES } from '#modules/discussion/constants/discussion.constants.js'

const discussionThreadSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(DISCUSSION_THREAD_TYPES),
      required: true,
      index: true
    },
    title: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ''
    },
    directKey: {
      type: String,
      trim: true,
      default: ''
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true
    },
    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DiscussionMessage',
      default: null
    },
    lastMessagePreview: {
      type: String,
      default: '',
      maxlength: 120
    },
    lastMessageAt: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
)

discussionThreadSchema.index({ status: 1, lastMessageAt: -1, updatedAt: -1 })
discussionThreadSchema.index({ directKey: 1 }, {
  unique: true,
  partialFilterExpression: { directKey: { $type: 'string', $gt: '' } }
})

discussionThreadSchema.methods.toSafeJSON = function toSafeJSON(options = {}) {
  return {
    id: this._id.toString(),
    type: this.type,
    title: options.title || this.title,
    ownerId: this.ownerId?.toString?.(),
    status: this.status,
    lastMessageId: this.lastMessageId?.toString?.() || null,
    lastMessagePreview: this.lastMessagePreview || '',
    lastMessageAt: this.lastMessageAt,
    unreadCount: options.unreadCount || 0,
    members: options.members || [],
    createdBy: this.createdBy?.toString?.(),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const DiscussionThread = mongoose.model('DiscussionThread', discussionThreadSchema)
