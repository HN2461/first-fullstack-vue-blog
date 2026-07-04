import mongoose from 'mongoose'

const resumeTemplateSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 200
    },
    accentColor: {
      type: String,
      default: '#1677ff',
      trim: true,
      maxlength: 20
    },
    isSystem: {
      type: Boolean,
      default: false
    },
    enabled: {
      type: Boolean,
      default: true
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

resumeTemplateSchema.index({ ownerId: 1, key: 1 }, { unique: true })
resumeTemplateSchema.index({ enabled: 1, sortOrder: 1 })

resumeTemplateSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    ownerId: this.ownerId?.toString?.() || null,
    name: this.name,
    key: this.key,
    description: this.description || '',
    accentColor: this.accentColor || '#1677ff',
    isSystem: this.isSystem === true,
    enabled: this.enabled !== false,
    sortOrder: this.sortOrder || 0,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const ResumeTemplate = mongoose.model('ResumeTemplate', resumeTemplateSchema)
