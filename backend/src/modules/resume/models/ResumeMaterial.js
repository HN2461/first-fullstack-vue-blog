import mongoose from 'mongoose'

const resumeMaterialSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sourceKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    category: {
      type: String,
      default: '简历资料',
      trim: true,
      maxlength: 80
    },
    format: {
      type: String,
      enum: ['markdown', 'html', 'text'],
      default: 'markdown'
    },
    relativePath: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    content: {
      type: String,
      default: ''
    },
    excerpt: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 24
    }],
    checksum: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    fileSize: {
      type: Number,
      default: 0
    },
    importedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

resumeMaterialSchema.index({ ownerId: 1, sourceKey: 1 }, { unique: true })
resumeMaterialSchema.index({ ownerId: 1, updatedAt: -1 })
resumeMaterialSchema.index({ ownerId: 1, category: 1, updatedAt: -1 })
resumeMaterialSchema.index({ ownerId: 1, tags: 1 })

resumeMaterialSchema.methods.toSafeJSON = function toSafeJSON(options = {}) {
  return {
    id: this._id.toString(),
    ownerId: this.ownerId?.toString?.(),
    sourceKey: this.sourceKey,
    title: this.title,
    category: this.category,
    format: this.format,
    relativePath: this.relativePath,
    content: options.includeContent ? this.content || '' : undefined,
    excerpt: this.excerpt || '',
    tags: this.tags || [],
    checksum: this.checksum,
    fileSize: this.fileSize || 0,
    importedAt: this.importedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const ResumeMaterial = mongoose.model('ResumeMaterial', resumeMaterialSchema)
