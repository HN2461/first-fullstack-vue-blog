import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
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
      maxlength: 240
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
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

categorySchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    slug: this.slug,
    description: this.description,
    parent: this.parent ? this.parent.toString() : null,
    sortOrder: this.sortOrder,
    status: this.status,
    articleCount: this.articleCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const Category = mongoose.model('Category', categorySchema)
