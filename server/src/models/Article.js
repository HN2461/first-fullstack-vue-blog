import mongoose from 'mongoose'
import { ARTICLE_STATUS } from '@blog/shared'

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    summary: {
      type: String,
      default: '',
      maxlength: 300
    },
    contentMarkdown: {
      type: String,
      default: ''
    },
    cover: {
      type: String,
      default: ''
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    tags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag'
    }],
    status: {
      type: String,
      enum: Object.values(ARTICLE_STATUS),
      default: ARTICLE_STATUS.DRAFT
    },
    isRecommended: {
      type: Boolean,
      default: false
    },
    viewCount: {
      type: Number,
      default: 0
    },
    likeCount: {
      type: Number,
      default: 0
    },
    favoriteCount: {
      type: Number,
      default: 0
    },
    commentCount: {
      type: Number,
      default: 0
    },
    wordCount: {
      type: Number,
      default: 0
    },
    readingMinutes: {
      type: Number,
      default: 1
    },
    publishedAt: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

articleSchema.index({
  title: 'text',
  summary: 'text',
  contentMarkdown: 'text'
})

articleSchema.methods.toSafeJSON = function toSafeJSON() {
  const category = this.category && typeof this.category === 'object' && this.category.name
    ? this.category.toSafeJSON?.() || this.category
    : this.category?.toString?.() || null
  const tags = Array.isArray(this.tags)
    ? this.tags.map((tag) => (tag && typeof tag === 'object' && tag.name ? tag.toSafeJSON?.() || tag : tag.toString()))
    : []

  return {
    id: this._id.toString(),
    title: this.title,
    slug: this.slug,
    summary: this.summary,
    contentMarkdown: this.contentMarkdown,
    cover: this.cover,
    category,
    tags,
    status: this.status,
    isRecommended: this.isRecommended,
    viewCount: this.viewCount,
    likeCount: this.likeCount,
    favoriteCount: this.favoriteCount,
    commentCount: this.commentCount,
    wordCount: this.wordCount,
    readingMinutes: this.readingMinutes,
    publishedAt: this.publishedAt,
    createdBy: this.createdBy?.toString?.(),
    updatedBy: this.updatedBy?.toString?.(),
    deletedAt: this.deletedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const Article = mongoose.model('Article', articleSchema)
