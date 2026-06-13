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
      maxlength: 80
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    link: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

notificationSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    recipient: this.recipient?.toString?.() || null,
    type: this.type,
    title: this.title,
    content: this.content,
    link: this.link,
    isActive: this.isActive,
    readAt: this.readAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const Notification = mongoose.model('Notification', notificationSchema)
