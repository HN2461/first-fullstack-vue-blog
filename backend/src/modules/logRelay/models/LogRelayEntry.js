import mongoose from 'mongoose'

const logRelayEntrySchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: 2_000_000
    },
    receivedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
)

logRelayEntrySchema.index({ receivedAt: 1, _id: 1 })

logRelayEntrySchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    content: this.content,
    receivedAt: this.receivedAt,
    createdAt: this.createdAt
  }
}

export const LogRelayEntry = mongoose.model('LogRelayEntry', logRelayEntrySchema)
