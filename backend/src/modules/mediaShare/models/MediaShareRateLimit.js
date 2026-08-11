import mongoose from 'mongoose'

const mediaShareRateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  failures: { type: Number, default: 0 },
  windowStartedAt: { type: Date, default: Date.now },
  lockedUntil: { type: Date, default: null },
  expiresAt: { type: Date, required: true }
}, { timestamps: true })

mediaShareRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const MediaShareRateLimit = mongoose.model('MediaShareRateLimit', mediaShareRateLimitSchema)
