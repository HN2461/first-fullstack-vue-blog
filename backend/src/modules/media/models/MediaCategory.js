import mongoose from 'mongoose'

const mediaCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 40
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

mediaCategorySchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    description: this.description || '',
    sortOrder: this.sortOrder || 0,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const MediaCategory = mongoose.model('MediaCategory', mediaCategorySchema)
