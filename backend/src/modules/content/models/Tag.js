import mongoose from 'mongoose'

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      maxlength: 180
    },
    color: {
      type: String,
      default: '#2852b8'
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'hidden'],
      default: 'active'
    },
    articleCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

tagSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    slug: this.slug,
    description: this.description,
    color: this.color,
    sortOrder: this.sortOrder,
    status: this.status,
    articleCount: this.articleCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const Tag = mongoose.model('Tag', tagSchema)
