import mongoose from 'mongoose'

export const LEDGER_BOOK_STATUSES = ['active', 'archived']

const ledgerBookSchema = new mongoose.Schema(
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
      maxlength: 60
    },
    currency: {
      type: String,
      default: 'CNY',
      trim: true,
      uppercase: true,
      maxlength: 8
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 240
    },
    status: {
      type: String,
      enum: LEDGER_BOOK_STATUSES,
      default: 'active'
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

ledgerBookSchema.index({ userId: 1, status: 1, sortOrder: 1 })

ledgerBookSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    userId: this.userId?.toString?.(),
    name: this.name,
    currency: this.currency,
    description: this.description,
    status: this.status,
    sortOrder: this.sortOrder,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const LedgerBook = mongoose.model('LedgerBook', ledgerBookSchema)
