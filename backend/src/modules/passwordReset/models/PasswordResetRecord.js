import mongoose from 'mongoose'

const passwordResetRecordSchema = new mongoose.Schema(
  {
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mode: { type: String, enum: ['link', 'direct'], required: true },
    tokenHash: { type: String, unique: true, sparse: true },
    expiresAt: { type: Date, default: null },
    usedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdIp: { type: String, default: '' },
    usedIp: { type: String, default: '' },
    note: { type: String, trim: true, maxlength: 200, default: '' }
  },
  { timestamps: true }
)

passwordResetRecordSchema.index({ targetUser: 1, createdAt: -1 })

export const PasswordResetRecord = mongoose.model('PasswordResetRecord', passwordResetRecordSchema)
