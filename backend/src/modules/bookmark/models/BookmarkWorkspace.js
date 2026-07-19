import mongoose from 'mongoose'

export const BOOKMARK_BROWSER_TYPES = [
  'chrome',
  'edge',
  'firefox',
  'brave',
  'opera',
  'safari',
  'other'
]

const bookmarkWorkspaceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    browserType: {
      type: String,
      enum: BOOKMARK_BROWSER_TYPES,
      default: 'other'
    },
    isPrimary: {
      type: Boolean,
      default: false,
      index: true
    },
    sortOrder: {
      type: Number,
      default: 0,
      min: 0
    },
    lastImportedAt: {
      type: Date,
      default: null
    },
    lastExportedAt: {
      type: Date,
      default: null
    },
    lastImportFileName: {
      type: String,
      default: '',
      trim: true,
      maxlength: 255
    }
  },
  {
    timestamps: true
  }
)

bookmarkWorkspaceSchema.index({ userId: 1, sortOrder: 1, createdAt: 1 })
bookmarkWorkspaceSchema.index(
  { userId: 1, isPrimary: 1 },
  { unique: true, partialFilterExpression: { isPrimary: true } }
)

bookmarkWorkspaceSchema.methods.toSafeJSON = function toSafeJSON(counts = {}) {
  return {
    id: this._id.toString(),
    name: this.name,
    browserType: this.browserType,
    isPrimary: this.isPrimary,
    sortOrder: this.sortOrder || 0,
    bookmarkCount: Number(counts.bookmarkCount || 0),
    folderCount: Number(counts.folderCount || 0),
    lastImportedAt: this.lastImportedAt,
    lastExportedAt: this.lastExportedAt,
    lastImportFileName: this.lastImportFileName || '',
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const BookmarkWorkspace = mongoose.model('BookmarkWorkspace', bookmarkWorkspaceSchema)
