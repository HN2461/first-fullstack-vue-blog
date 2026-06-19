import mongoose from 'mongoose'

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    group: {
      type: String,
      default: 'site'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
)

settingSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    key: this.key,
    value: this.value,
    group: this.group,
    updatedBy: this.updatedBy?.toString?.() || null,
    updatedAt: this.updatedAt
  }
}

export const Setting = mongoose.model('Setting', settingSchema)
