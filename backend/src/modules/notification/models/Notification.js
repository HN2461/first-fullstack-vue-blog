import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    type: {
      type: String,
      enum: ['announcement', 'system', 'comment'],
      default: 'announcement'
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'error'],
      default: 'info'
    },
    link: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    autoPopup: {
      type: Boolean,
      default: false
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    readBy: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      readAt: { type: Date, default: Date.now }
    }],
    viewCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

// 索引：按类型+状态查询
notificationSchema.index({ type: 1, isActive: 1, createdAt: -1 })

notificationSchema.methods.toSafeJSON = function toSafeJSON(userId) {
  const readEntry = userId
    ? this.readBy.find(entry => entry.user.toString() === userId.toString())
    : null

  return {
    id: this._id.toString(),
    recipient: this.recipient?.toString?.() || null,
    type: this.type,
    title: this.title,
    content: this.content,
    level: this.level || 'info',
    link: this.link,
    isActive: this.isActive,
    autoPopup: this.autoPopup || false,
    author: this.author?.toString?.() || null,
    readCount: this.readBy?.length || 0,
    isRead: !!readEntry,
    readAt: readEntry?.readAt || null,
    viewCount: this.viewCount || 0,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const Notification = mongoose.model('Notification', notificationSchema)
