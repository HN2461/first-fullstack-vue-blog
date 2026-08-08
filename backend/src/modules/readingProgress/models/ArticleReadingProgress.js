import mongoose from 'mongoose'

const articleReadingProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true
    },
    progressPercent: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    scrollRatio: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    anchorSlug: {
      type: String,
      trim: true,
      maxlength: 240,
      default: ''
    },
    anchorOffset: {
      type: Number,
      min: 0,
      max: 10000000,
      default: 0
    },
    articleUpdatedAt: {
      type: Date,
      required: true
    },
    lastReadAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
)

articleReadingProgressSchema.index({ userId: 1, articleId: 1 }, { unique: true })
articleReadingProgressSchema.index({ userId: 1, lastReadAt: -1 })

articleReadingProgressSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    articleId: this.articleId?.toString?.() || this.articleId,
    progressPercent: this.progressPercent,
    scrollRatio: this.scrollRatio,
    anchorSlug: this.anchorSlug || '',
    anchorOffset: this.anchorOffset || 0,
    articleUpdatedAt: this.articleUpdatedAt,
    lastReadAt: this.lastReadAt,
    completedAt: this.completedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const ArticleReadingProgress = mongoose.model(
  'ArticleReadingProgress',
  articleReadingProgressSchema
)
