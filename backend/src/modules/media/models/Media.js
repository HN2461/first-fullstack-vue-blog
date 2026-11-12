import mongoose from 'mongoose'
import { isSystemMediaCategory } from '../constants/mediaCategories.js'

const mediaSchema = new mongoose.Schema(
  {
    provider: { type: String, default: 'local' },
    storageKey: { type: String, default: '' },
    scene: { type: String, default: '', index: true },
    sourceTargetId: { type: String, default: '' },
    lifecycleStatus: { type: String, enum: ['pending', 'retained', 'attached', 'trash', 'deleting'], default: 'retained' },
    expiresAt: { type: Date, default: null },
    attachedAt: { type: Date, default: null },
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
      enum: ['public', 'private', 'vault'],
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
    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      default: null,
      index: true
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

mediaSchema.index({ lifecycleStatus: 1, expiresAt: 1 }, { name: 'resource_pending_cleanup' })

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
    scene: this.scene || '',
    systemManaged: isSystemMediaCategory(this.category) || Boolean(this.feedback || this.workJournalLog) || Boolean(this.scene && this.scene !== 'admin-library'),
    lifecycleStatus: this.deletedAt ? 'trash' : (this.lifecycleStatus || 'retained'),
    expiresAt: this.expiresAt || null,
    filename: this.filename,
    originalName: this.originalName,
    mimeType: this.mimeType,
    size: this.size,
    url: this.url,
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
    feedback: this.feedback?.toString?.() || null,
    deletedAt: this.deletedAt || null,
    deletedBy: this.deletedBy?.toString?.() || null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const Media = mongoose.model('Media', mediaSchema)
