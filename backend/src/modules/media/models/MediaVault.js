import mongoose from 'mongoose'

const mediaVaultSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MediaCategory',
      required: true,
      unique: true
    },
    passwordHash: {
      type: String,
      default: ''
    },
    passwordVersion: {
      type: Number,
      default: 0
    },
    failedAttempts: {
      type: Number,
      default: 0
    },
    lockedUntil: {
      type: Date,
      default: null
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

export const MediaVault = mongoose.model('MediaVault', mediaVaultSchema)
