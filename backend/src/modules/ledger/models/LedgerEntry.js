import mongoose from 'mongoose'

export const LEDGER_ENTRY_TYPES = ['expense', 'income']
export const LEDGER_ENTRY_SOURCES = ['manual', 'excel_import']

const ledgerEntrySchema = new mongoose.Schema(
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
    occurredAt: {
      type: Date,
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: LEDGER_ENTRY_TYPES,
      required: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LedgerCategory',
      required: true,
      index: true
    },
    categoryNameSnapshot: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    note: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500
    },
    dailyNote: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000
    },
    source: {
      type: String,
      enum: LEDGER_ENTRY_SOURCES,
      default: 'manual'
    },
    sourceKey: {
      type: String,
      default: '',
      trim: true,
      maxlength: 160
    },
    importBatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LedgerImportBatch',
      default: null
    },
    raw: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
)

ledgerEntrySchema.index({ userId: 1, bookId: 1, occurredAt: -1 })
ledgerEntrySchema.index({ userId: 1, bookId: 1, occurredAt: 1, type: 1, categoryId: 1 }, { unique: true })
ledgerEntrySchema.index({ note: 'text', dailyNote: 'text', categoryNameSnapshot: 'text' }, { name: 'ledger_entry_text_index' })

ledgerEntrySchema.methods.toSafeJSON = function toSafeJSON() {
  const category = this.categoryId && typeof this.categoryId === 'object' && this.categoryId.toSafeJSON
    ? this.categoryId.toSafeJSON()
    : null

  return {
    id: this._id.toString(),
    userId: this.userId?.toString?.(),
    bookId: this.bookId?.toString?.(),
    occurredAt: this.occurredAt,
    type: this.type,
    categoryId: category?.id || this.categoryId?.toString?.(),
    category,
    categoryNameSnapshot: this.categoryNameSnapshot,
    amount: this.amount,
    note: this.note,
    dailyNote: this.dailyNote,
    source: this.source,
    sourceKey: this.sourceKey,
    importBatchId: this.importBatchId?.toString?.() || null,
    raw: this.raw || null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const LedgerEntry = mongoose.model('LedgerEntry', ledgerEntrySchema)
