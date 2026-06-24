import mongoose from 'mongoose'

export const LEDGER_MOMENT_SCOPES = ['day', 'month', 'year']

const ledgerMomentSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    scope: {
      type: String,
      enum: LEDGER_MOMENT_SCOPES,
      default: 'day'
    },
    occurredAt: {
      type: Date,
      required: true,
      index: true
    },
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LedgerCategory',
      default: null
    },
    categoryText: {
      type: String,
      default: '',
      trim: true,
      maxlength: 40
    },
    entryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LedgerEntry',
      default: null
    },
    mood: {
      type: String,
      default: '',
      trim: true,
      maxlength: 40
    },
    content: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 24
    }],
    pinned: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

ledgerMomentSchema.index({ userId: 1, bookId: 1, occurredAt: -1 })
ledgerMomentSchema.index({ title: 'text', content: 'text', mood: 'text', tags: 'text' }, { name: 'ledger_moment_text_index' })

ledgerMomentSchema.methods.toSafeJSON = function toSafeJSON() {
  const category = this.categoryId && typeof this.categoryId === 'object' && this.categoryId.toSafeJSON
    ? this.categoryId.toSafeJSON()
    : null

  return {
    id: this._id.toString(),
    userId: this.userId?.toString?.(),
    bookId: this.bookId?.toString?.(),
    title: this.title,
    scope: this.scope,
    occurredAt: this.occurredAt,
    amount: this.amount,
    categoryId: category?.id || this.categoryId?.toString?.() || null,
    categoryText: this.categoryText || '',
    category,
    entryId: this.entryId?.toString?.() || null,
    mood: this.mood,
    content: this.content,
    tags: this.tags || [],
    pinned: this.pinned,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const LedgerMoment = mongoose.model('LedgerMoment', ledgerMomentSchema)
