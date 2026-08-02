import mongoose from 'mongoose'

const questionCategorySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionCategory',
      default: null
    },
    ancestors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionCategory'
    }],
    pathNames: [{
      type: String,
      trim: true,
      maxlength: 60
    }],
    level: {
      type: Number,
      min: 1,
      max: 12,
      default: 1
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

questionCategorySchema.index({ parentId: 1, sortOrder: 1, name: 1 })
questionCategorySchema.index({ ancestors: 1, enabled: 1 })

questionCategorySchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    key: this.key,
    name: this.name,
    parentId: this.parentId?.toString?.() || null,
    ancestors: (this.ancestors || []).map((id) => id.toString()),
    pathNames: this.pathNames || [this.name],
    fullName: (this.pathNames || [this.name]).join(' / '),
    level: this.level,
    sortOrder: this.sortOrder,
    enabled: this.enabled
  }
}

export const QuestionCategory = mongoose.model('QuestionCategory', questionCategorySchema)
