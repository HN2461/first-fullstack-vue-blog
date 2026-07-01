import mongoose from 'mongoose'

const bookmarkFolderSchema = new mongoose.Schema(
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
      maxlength: 120
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookmarkFolder',
      default: null,
      index: true
    },
    sortOrder: {
      type: Number,
      default: 0,
      min: 0
    },
    source: {
      type: String,
      enum: ['manual', 'html_import', 'json_import'],
      default: 'manual'
    }
  },
  {
    timestamps: true
  }
)

bookmarkFolderSchema.index({ userId: 1, parentId: 1, sortOrder: 1 })
bookmarkFolderSchema.index({ userId: 1, parentId: 1, name: 1 })

bookmarkFolderSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    userId: this.userId?.toString?.(),
    name: this.name,
    parentId: this.parentId?.toString?.() || null,
    sortOrder: this.sortOrder || 0,
    source: this.source,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const BookmarkFolder = mongoose.model('BookmarkFolder', bookmarkFolderSchema)
