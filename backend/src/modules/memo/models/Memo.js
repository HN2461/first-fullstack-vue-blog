import mongoose from 'mongoose'

export const MEMO_TYPES = ['idea', 'plan', 'study', 'work']
export const MEMO_STATUSES = ['open', 'completed', 'archived']
export const MEMO_PRIORITIES = ['low', 'medium', 'high']
export const MEMO_KINDS = ['capture', 'reference']
export const MEMO_FIELD_TYPES = ['text', 'textarea', 'date', 'phone', 'id-number', 'address', 'email', 'number']
export const MEMO_SENSITIVE_FIELD_TYPES = ['phone', 'id-number', 'address']

const memoFieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true, maxlength: 64 },
    label: { type: String, required: true, trim: true, maxlength: 40 },
    type: { type: String, enum: MEMO_FIELD_TYPES, default: 'text' },
    value: { type: String, default: '', maxlength: 2000 },
    encryptedValue: { type: String, default: '', select: false },
    isSensitive: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  },
  { _id: false }
)

const memoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    content: {
      type: String,
      trim: true,
      default: '',
      maxlength: 5000
    },
    kind: {
      type: String,
      enum: MEMO_KINDS,
      default: 'capture',
      index: true
    },
    category: {
      type: String,
      trim: true,
      default: '',
      maxlength: 60
    },
    fields: {
      type: [memoFieldSchema],
      default: []
    },
    type: {
      type: String,
      enum: MEMO_TYPES,
      default: 'idea'
    },
    status: {
      type: String,
      enum: MEMO_STATUSES,
      default: 'open'
    },
    priority: {
      type: String,
      enum: MEMO_PRIORITIES,
      default: 'medium'
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 20
    }],
    isPinned: {
      type: Boolean,
      default: false
    },
    dueAt: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
)

memoSchema.index({ createdBy: 1, status: 1, isPinned: -1, updatedAt: -1 })
memoSchema.index({ createdBy: 1, type: 1, updatedAt: -1 })
memoSchema.index({ createdBy: 1, kind: 1, category: 1, updatedAt: -1 })
memoSchema.index(
  {
    title: 'text',
    content: 'text',
    tags: 'text'
  },
  {
    weights: {
      title: 8,
      tags: 4,
      content: 1
    },
    name: 'memo_text_index'
  }
)

memoSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    title: this.title,
    content: this.content,
    kind: this.kind || 'capture',
    category: this.category || '',
    fields: (this.fields || []).map((field) => ({
      key: field.key,
      label: field.label,
      type: field.type,
      value: field.isSensitive ? '' : field.value || '',
      isSensitive: field.isSensitive === true,
      order: field.order || 0
    })),
    type: this.type,
    status: this.status,
    priority: this.priority,
    tags: this.tags || [],
    isPinned: this.isPinned,
    dueAt: this.dueAt,
    createdBy: this.createdBy?.toString?.(),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const Memo = mongoose.model('Memo', memoSchema)
