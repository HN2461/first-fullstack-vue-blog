import mongoose from 'mongoose'
import { ARTICLE_STATUS } from '#constants/domain'

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
    resources: [{
      mediaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        default: null
      },
      name: {
        type: String,
        default: '',
        trim: true,
        maxlength: 120
      },
      url: {
        type: String,
        default: '',
        trim: true
      },
      kind: {
        type: String,
        enum: ['image', 'attachment'],
        default: 'attachment'
      },
      description: {
        type: String,
        default: '',
        trim: true,
        maxlength: 240
      },
      fileSize: {
        type: Number,
        default: 0
      },
      mimeType: {
        type: String,
        default: '',
        trim: true
      }
    }],
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
    source: {
      type: String,
      enum: ['manual', 'legacy-notes'],
      default: 'manual'
    },
    sourcePath: {
      type: String,
      default: '',
      index: true
    },
    sourceHash: {
      type: String,
      default: ''
    },
    importedAt: {
      type: Date,
      default: null
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

articleSchema.index(
  {
    title: 'text',
    summary: 'text',
    contentMarkdown: 'text'
  },
  {
    weights: {
      title: 10,
      summary: 5,
      contentMarkdown: 1
    },
    name: 'article_text_index'
  }
)

articleSchema.methods.toSafeJSON = function toSafeJSON() {
  const category = this.category && typeof this.category === 'object' && this.category.name
    ? this.category.toSafeJSON?.() || this.category
    : this.category?.toString?.() || null
  const author = this.createdBy && typeof this.createdBy === 'object' && this.createdBy.username
    ? {
        id: this.createdBy._id?.toString?.() || this.createdBy.id,
        username: this.createdBy.username,
        avatar: this.createdBy.avatar || '',
        role: this.createdBy.role || 'user'
      }
    : null
  const tags = Array.isArray(this.tags)
    ? this.tags.map((tag) => (tag && typeof tag === 'object' && tag.name ? tag.toSafeJSON?.() || tag : tag.toString()))
    : []
  const resources = Array.isArray(this.resources)
    ? this.resources.map((item) => ({
      mediaId: item.mediaId?.toString?.() || item.mediaId || null,
      name: item.name || '',
      url: item.url || '',
      kind: item.kind || 'attachment',
      description: item.description || '',
      fileSize: item.fileSize || 0,
      mimeType: item.mimeType || ''
    }))
    : []

  return {
    id: this._id.toString(),
    title: this.title,
    slug: this.slug,
    summary: this.summary,
    contentMarkdown: this.contentMarkdown,
    cover: this.cover,
    resources,
    author,
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
    source: this.source,
    sourcePath: this.sourcePath,
    sourceHash: this.sourceHash,
    importedAt: this.importedAt,
    publishedAt: this.publishedAt,
    createdBy: this.createdBy?.toString?.(),
    updatedBy: this.updatedBy?.toString?.(),
    deletedAt: this.deletedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const Article = mongoose.model('Article', articleSchema)
