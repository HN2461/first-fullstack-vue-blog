import mongoose from 'mongoose'

const mediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    storagePath: {
      type: String,
      required: true
    },
    kind: {
      type: String,
      enum: ['image', 'attachment'],
      required: true
    },
    category: {
      type: String,
      trim: true,
      default: '未分类',
      maxlength: 40
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MediaCategory',
      default: null
    },
    fileClass: {
      type: String,
      enum: ['image', 'code', 'document', 'archive', 'other'],
      default: 'other'
    },
    accessScope: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
      index: true
    },
    sha256: {
      type: String,
      default: '',
      match: /^(?:[a-f0-9]{64})?$/
    },
    workJournalLog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkLog',
      default: null,
      index: true
    },
    workJournalEvidence: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      default: null
    },
    deletedAt: {
      type: Date,
      default: null
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
)

mediaSchema.methods.toSafeJSON = function toSafeJSON() {
  const uploaderValue = this.uploader
  const uploader = uploaderValue && typeof uploaderValue === 'object' && uploaderValue._id
    ? {
        id: uploaderValue._id.toString(),
        username: uploaderValue.username || '',
        email: uploaderValue.email || '',
        role: uploaderValue.role || ''
      }
    : uploaderValue?.toString?.()

  return {
    id: this._id.toString(),
    filename: this.filename,
    originalName: this.originalName,
    mimeType: this.mimeType,
    size: this.size,
    url: this.url,
    storagePath: this.storagePath,
    kind: this.kind,
    category: this.category || '未分类',
    categoryId: this.categoryId?.toString?.() || null,
    fileClass: this.fileClass || 'other',
    accessScope: this.accessScope || 'public',
    sha256: this.sha256 || '',
    uploader,
    article: this.article?.toString?.() || null,
    workJournalLog: this.workJournalLog?.toString?.() || null,
    workJournalEvidence: this.workJournalEvidence?.toString?.() || null,
    deletedAt: this.deletedAt || null,
    deletedBy: this.deletedBy?.toString?.() || null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const Media = mongoose.model('Media', mediaSchema)
