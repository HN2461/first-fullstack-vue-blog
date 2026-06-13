import mongoose from 'mongoose'

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetType: {
      type: String,
      enum: ['article', 'comment'],
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    type: {
      type: String,
      enum: ['like', 'favorite'],
      required: true
    }
  },
  {
    timestamps: true
  }
)

reactionSchema.index({ user: 1, targetType: 1, targetId: 1, type: 1 }, { unique: true })

export const Reaction = mongoose.model('Reaction', reactionSchema)
