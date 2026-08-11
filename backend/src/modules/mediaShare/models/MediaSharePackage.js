import mongoose from 'mongoose'

const mediaShareEntrySchema = new mongoose.Schema({
  entryId: { type: String, required: true },
  media: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  fileClass: { type: String, required: true },
  sortOrder: { type: Number, default: 0 }
}, { _id: false })

const mediaSharePackageSchema = new mongoose.Schema({
  publicId: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  entries: {
    type: [mediaShareEntrySchema],
    validate: {
      validator: (value) => Array.isArray(value) && value.length > 0 && value.length <= 50,
      message: '资源包需要包含 1 到 50 个资源'
    }
  },
  mode: { type: String, enum: ['public', 'password'], required: true },
  passwordHash: { type: String, select: false, default: '' },
  expiresAt: { type: Date, default: null },
  maxAccessCount: { type: Number, default: null, min: 1, max: 100000 },
  accessCount: { type: Number, default: 0, min: 0 },
  viewCount: { type: Number, default: 0, min: 0 },
  downloadCount: { type: Number, default: 0, min: 0 },
  accessVersion: { type: Number, default: 1, min: 1 },
  status: { type: String, enum: ['active', 'revoked'], default: 'active', index: true },
  revokedAt: { type: Date, default: null },
  revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  lastAccessAt: { type: Date, default: null },
  lastDownloadAt: { type: Date, default: null }
}, { timestamps: true })

mediaSharePackageSchema.index({ createdBy: 1, updatedAt: -1 })
mediaSharePackageSchema.index({ status: 1, expiresAt: 1 })

export const MediaSharePackage = mongoose.model('MediaSharePackage', mediaSharePackageSchema)
