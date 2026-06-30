import mongoose from 'mongoose'
import { DISCUSSION_CONTENT_TYPES } from '#modules/discussion/constants/discussion.constants.js'

const discussionAttachmentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    mimeType: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    storagePath: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    _id: false
  }
)

const discussionMessageSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DiscussionThread',
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    content: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ''
    },
    contentType: {
      type: String,
      enum: Object.values(DISCUSSION_CONTENT_TYPES),
      default: DISCUSSION_CONTENT_TYPES.TEXT
    },
    attachments: [discussionAttachmentSchema],
    revokedAt: {
      type: Date,
      default: null
    },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    hiddenFor: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true
  }
)

discussionMessageSchema.index({ threadId: 1, createdAt: -1, _id: -1 })
discussionMessageSchema.index({ senderId: 1, createdAt: -1, _id: -1 })

discussionMessageSchema.methods.toSafeJSON = function toSafeJSON() {
  const sender = this.senderId && typeof this.senderId === 'object' ? this.senderId : null
  return {
    id: this._id.toString(),
    threadId: this.threadId?.toString?.(),
    senderId: sender?._id?.toString?.() || this.senderId?.toString?.(),
    senderName: sender?.username || '',
    senderEmail: sender?.email || '',
    senderAvatar: sender?.avatar || '',
    content: this.revokedAt ? '' : this.content,
    contentType: this.contentType,
    attachments: this.revokedAt ? [] : (this.attachments || []),
    revokedAt: this.revokedAt || null,
    revokedBy: this.revokedBy?.toString?.() || null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const DiscussionMessage = mongoose.model('DiscussionMessage', discussionMessageSchema)
