import mongoose from 'mongoose'

const mediaShareSessionSchema = new mongoose.Schema({
  share: { type: mongoose.Schema.Types.ObjectId, ref: 'MediaSharePackage', required: true, index: true },
  tokenHash: { type: String, required: true },
  accessVersion: { type: Number, required: true },
  mode: { type: String, enum: ['public', 'password'], required: true },
  ipHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  lastSeenAt: { type: Date, default: Date.now }
}, { timestamps: true })

mediaShareSessionSchema.index({ share: 1, tokenHash: 1 }, { unique: true })
mediaShareSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const MediaShareSession = mongoose.model('MediaShareSession', mediaShareSessionSchema)
