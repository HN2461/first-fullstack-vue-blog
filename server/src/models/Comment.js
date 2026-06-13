import mongoose from 'mongoose'
import { COMMENT_STATUS } from '@blog/shared'

const commentSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: Object.values(COMMENT_STATUS),
      default: COMMENT_STATUS.VISIBLE
    },
    riskReasons: [{
      type: String
    }],
    likeCount: {
      type: Number,
      default: 0
    },
    reportCount: {
      type: Number,
      default: 0
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

commentSchema.methods.toSafeJSON = function toSafeJSON() {
  const user = this.user && typeof this.user === 'object' && this.user.username
    ? this.user.toSafeJSON?.() || this.user
    : this.user?.toString?.()

  return {
    id: this._id.toString(),
    article: this.article?.toString?.(),
    user,
    parent: this.parent ? this.parent.toString() : null,
    replyTo: this.replyTo ? this.replyTo.toString() : null,
    content: this.content,
    status: this.status,
    riskReasons: this.riskReasons,
    likeCount: this.likeCount,
    reportCount: this.reportCount,
    reviewedBy: this.reviewedBy ? this.reviewedBy.toString() : null,
    reviewedAt: this.reviewedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const Comment = mongoose.model('Comment', commentSchema)
