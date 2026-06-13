import mongoose from 'mongoose'

const mediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    storagePath: {
      type: String,
      required: true
    },
    kind: {
      type: String,
      enum: ['image', 'attachment'],
      required: true
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      default: null
    }
  },
  {
    timestamps: true
  }
)

mediaSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    filename: this.filename,
    originalName: this.originalName,
    mimeType: this.mimeType,
    size: this.size,
    url: this.url,
    storagePath: this.storagePath,
    kind: this.kind,
    uploader: this.uploader?.toString?.(),
    article: this.article?.toString?.() || null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const Media = mongoose.model('Media', mediaSchema)
