import mongoose from 'mongoose'

export const BOOKMARK_SOURCES = ['manual', 'html_import', 'json_import']

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookmarkFolder',
      default: null,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 240
    },
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator(v) { return v.length <= 12 },
        message: '最多 12 个标签'
      }
    },
    note: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000
    },
    icon: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2048
    },
    addDate: {
      type: Date,
      default: null
    },
    sortOrder: {
      type: Number,
      default: 0,
      min: 0
    },
    source: {
      type: String,
      enum: BOOKMARK_SOURCES,
      default: 'manual'
    },
    lastImportedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

bookmarkSchema.index({ userId: 1, url: 1 }, { unique: true })
bookmarkSchema.index({ userId: 1, folderId: 1, sortOrder: 1 })
bookmarkSchema.index({ title: 'text', url: 'text', note: 'text', tags: 'text' }, { name: 'bookmark_text_index' })

bookmarkSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    userId: this.userId?.toString?.(),
    folderId: this.folderId?.toString?.() || null,
    title: this.title,
    url: this.url,
    tags: this.tags || [],
    note: this.note || '',
    icon: this.icon || '',
    addDate: this.addDate,
    sortOrder: this.sortOrder || 0,
    source: this.source,
    lastImportedAt: this.lastImportedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const Bookmark = mongoose.model('Bookmark', bookmarkSchema)
