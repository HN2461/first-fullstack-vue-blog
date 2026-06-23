import mongoose from 'mongoose'

export const LEDGER_IMPORT_STATUSES = ['previewed', 'committed', 'failed']
export const LEDGER_IMPORT_TEMPLATE_TYPES = ['yuque_monthly_ledger_v1']

const ledgerImportBatchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LedgerBook',
      required: true,
      index: true
    },
    filename: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180
    },
    fileHash: {
      type: String,
      required: true,
      trim: true,
      maxlength: 96
    },
    templateType: {
      type: String,
      enum: LEDGER_IMPORT_TEMPLATE_TYPES,
      default: 'yuque_monthly_ledger_v1'
    },
    status: {
      type: String,
      enum: LEDGER_IMPORT_STATUSES,
      default: 'previewed'
    },
    stats: {
      inserted: { type: Number, default: 0 },
      updated: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
      errors: { type: Number, default: 0 },
      sheets: { type: Number, default: 0 },
      records: { type: Number, default: 0 }
    },
    previewItems: [{
      type: mongoose.Schema.Types.Mixed
    }],
    errorItems: [{
      type: mongoose.Schema.Types.Mixed
    }],
    committedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

ledgerImportBatchSchema.index({ userId: 1, bookId: 1, createdAt: -1 })

ledgerImportBatchSchema.methods.toSafeJSON = function toSafeJSON(options = {}) {
  const includePreview = options.includePreview === true
  return {
    id: this._id.toString(),
    userId: this.userId?.toString?.(),
    bookId: this.bookId?.toString?.(),
    filename: this.filename,
    fileHash: this.fileHash,
    templateType: this.templateType,
    status: this.status,
    stats: this.stats,
    previewItems: includePreview ? this.previewItems || [] : undefined,
    errors: this.errorItems || [],
    committedAt: this.committedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const LedgerImportBatch = mongoose.model('LedgerImportBatch', ledgerImportBatchSchema)
