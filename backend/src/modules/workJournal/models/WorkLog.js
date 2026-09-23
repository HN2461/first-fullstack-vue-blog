import mongoose from 'mongoose'

const evidenceSchema = new mongoose.Schema({
  originalName: { type: String, required: true, maxlength: 180 },
  storedName: { type: String, default: '' },
  mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null, index: true },
  mimeType: { type: String, required: true, enum: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] },
  size: { type: Number, required: true, min: 1 },
  sha256: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  uploadedAt: { type: Date, required: true, default: Date.now }
}, { _id: true })

const revisionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  title: { type: String, required: true },
  summary: { type: String, default: '' },
  accomplishments: { type: String, default: '' },
  blockers: { type: String, default: '' },
  nextPlan: { type: String, default: '' },
  contentMarkdown: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'final'], required: true },
  finalizedAt: { type: Date, default: null },
  capturedAt: { type: Date, required: true, default: Date.now }
}, { _id: false })

const workLogSchema = new mongoose.Schema(
  {
    employment: { type: mongoose.Schema.Types.ObjectId, ref: 'Employment', required: true, index: true },
    workDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    summary: { type: String, default: '', trim: true, maxlength: 500 },
    accomplishments: { type: String, default: '', trim: true, maxlength: 10000 },
    blockers: { type: String, default: '', trim: true, maxlength: 5000 },
    nextPlan: { type: String, default: '', trim: true, maxlength: 5000 },
    contentMarkdown: { type: String, default: '', maxlength: 30000 },
    status: { type: String, enum: ['draft', 'final'], default: 'draft', index: true },
    finalizedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null, index: true },
    version: { type: Number, default: 1, min: 1 },
    revisions: { type: [revisionSchema], default: [] },
    evidence: { type: [evidenceSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
  },
  { timestamps: true }
)

workLogSchema.index({ createdBy: 1, employment: 1, workDate: 1 }, { unique: true })
workLogSchema.index({ createdBy: 1, employment: 1, status: 1, workDate: -1 })

workLogSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    employment: this.employment?.toString?.() || String(this.employment || ''),
    workDate: this.workDate,
    title: this.title,
    summary: this.summary || '',
    accomplishments: this.accomplishments || '',
    blockers: this.blockers || '',
    nextPlan: this.nextPlan || '',
    contentMarkdown: this.contentMarkdown || '',
    status: this.status,
    finalizedAt: this.finalizedAt,
    deletedAt: this.deletedAt || null,
    version: this.version || 1,
    revisionCount: this.revisions?.length || 0,
    revisions: (this.revisions || []).map((item) => ({
      version: item.version,
      title: item.title,
      summary: item.summary || '',
      accomplishments: item.accomplishments || '',
      blockers: item.blockers || '',
      nextPlan: item.nextPlan || '',
      contentMarkdown: item.contentMarkdown || '',
      status: item.status,
      finalizedAt: item.finalizedAt,
      capturedAt: item.capturedAt
    })),
    evidence: (this.evidence || []).map((item) => ({
      id: item._id.toString(),
      mediaId: item.mediaId?.toString?.() || null,
      originalName: item.originalName,
      mimeType: item.mimeType,
      size: item.size,
      sha256: item.sha256,
      uploadedAt: item.uploadedAt
    })),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const WorkLog = mongoose.model('WorkLog', workLogSchema)
