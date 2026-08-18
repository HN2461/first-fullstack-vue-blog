import mongoose from 'mongoose'

const articleShareEntrySchema = new mongoose.Schema({
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  sortOrder: { type: Number, default: 0 }
}, { _id: false })

const articleSharePackageSchema = new mongoose.Schema({
  publicId: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  scopeType: { type: String, enum: ['article', 'category'], required: true },
  sourceArticle: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', default: null },
  sourceCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  includeDescendants: { type: Boolean, default: false },
  entries: {
    type: [articleShareEntrySchema],
    validate: {
      validator: (value) => Array.isArray(value) && value.length > 0 && value.length <= 500,
      message: '共享阅读至少需要包含 1 篇、最多包含 500 篇文章'
    }
  },
  mode: { type: String, enum: ['public', 'password'], required: true },
  passwordHash: { type: String, select: false, default: '' },
  passwordCipher: { type: String, select: false, default: '' },
  expiresAt: { type: Date, default: null },
  accessCount: { type: Number, default: 0, min: 0 },
  viewCount: { type: Number, default: 0, min: 0 },
  accessVersion: { type: Number, default: 1, min: 1 },
  status: { type: String, enum: ['active', 'revoked'], default: 'active', index: true },
  revokedAt: { type: Date, default: null },
  revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  lastAccessAt: { type: Date, default: null }
}, { timestamps: true })

articleSharePackageSchema.index({ createdBy: 1, updatedAt: -1 })
articleSharePackageSchema.index({ status: 1, expiresAt: 1 })

export const ArticleSharePackage = mongoose.model('ArticleSharePackage', articleSharePackageSchema)
