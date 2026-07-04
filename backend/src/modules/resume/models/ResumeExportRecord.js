import mongoose from 'mongoose'

export const RESUME_EXPORT_FORMATS = ['markdown', 'pdf', 'word']

const resumeExportRecordSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true
    },
    resumeTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    format: {
      type: String,
      enum: RESUME_EXPORT_FORMATS,
      required: true
    },
    templateKey: {
      type: String,
      default: 'classic',
      trim: true,
      maxlength: 40
    },
    filename: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    contentType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    fileData: {
      type: Buffer,
      required: true
    },
    fileSize: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

resumeExportRecordSchema.index({ ownerId: 1, createdAt: -1 })
resumeExportRecordSchema.index({ ownerId: 1, resumeId: 1, createdAt: -1 })

resumeExportRecordSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    ownerId: this.ownerId?.toString?.(),
    resumeId: this.resumeId?.toString?.(),
    resumeTitle: this.resumeTitle,
    format: this.format,
    templateKey: this.templateKey || 'classic',
    filename: this.filename,
    contentType: this.contentType,
    fileSize: this.fileSize || 0,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const ResumeExportRecord = mongoose.model('ResumeExportRecord', resumeExportRecordSchema)
