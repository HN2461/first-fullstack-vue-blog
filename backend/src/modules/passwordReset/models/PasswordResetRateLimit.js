import mongoose from 'mongoose'

const passwordResetRateLimitSchema = new mongoose.Schema({
  action: { type: String, required: true },
  key: { type: String, required: true },
  count: { type: Number, default: 0 },
  windowStartedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true }
})

passwordResetRateLimitSchema.index({ action: 1, key: 1 }, { unique: true })
passwordResetRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const PasswordResetRateLimit = mongoose.model('PasswordResetRateLimit', passwordResetRateLimitSchema)
