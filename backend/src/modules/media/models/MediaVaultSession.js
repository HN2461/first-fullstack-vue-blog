import mongoose from 'mongoose'

const mediaVaultSessionSchema = new mongoose.Schema(
  {
    vault: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MediaVault',
      required: true,
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    passwordVersion: {
      type: Number,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    // 保留旧字段以兼容已有会话数据；密码箱有效期只依据 createdAt / expiresAt，绝不按最近操作续期。
    lastSeenAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
)

mediaVaultSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const MediaVaultSession = mongoose.model('MediaVaultSession', mediaVaultSessionSchema)
