import mongoose from 'mongoose'

export const LEDGER_CATEGORY_TYPES = ['expense', 'income']

const ledgerCategorySchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    },
    code: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 80
    },
    type: {
      type: String,
      enum: LEDGER_CATEGORY_TYPES,
      required: true
    },
    color: {
      type: String,
      default: '#1677ff',
      trim: true,
      maxlength: 24
    },
    icon: {
      type: String,
      default: '',
      trim: true,
      maxlength: 60
    },
    aliases: [{
      type: String,
      trim: true,
      maxlength: 40
    }],
    sortOrder: {
      type: Number,
      default: 0
    },
    archived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

ledgerCategorySchema.index({ userId: 1, bookId: 1, type: 1, sortOrder: 1 })
ledgerCategorySchema.index({ userId: 1, bookId: 1, code: 1 }, { unique: true })

ledgerCategorySchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    userId: this.userId?.toString?.(),
    bookId: this.bookId?.toString?.(),
    name: this.name,
    code: this.code,
    type: this.type,
    color: this.color,
    icon: this.icon,
    aliases: this.aliases || [],
    sortOrder: this.sortOrder,
    archived: this.archived,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const LedgerCategory = mongoose.model('LedgerCategory', ledgerCategorySchema)
