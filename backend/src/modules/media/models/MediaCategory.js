import mongoose from 'mongoose'

const mediaCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    system: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 200
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

mediaCategorySchema.index({ owner: 1, name: 1 }, { unique: true })
mediaCategorySchema.index({ system: 1, sortOrder: 1, createdAt: 1 })

mediaCategorySchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    owner: this.owner?.toString?.() || null,
    system: this.system === true,
    description: this.description || '',
    sortOrder: this.sortOrder || 0,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const MediaCategory = mongoose.model('MediaCategory', mediaCategorySchema)
