import mongoose from 'mongoose'

const workReportSchema = new mongoose.Schema(
  {
    employment: { type: mongoose.Schema.Types.ObjectId, ref: 'Employment', required: true },
    period: { type: String, enum: ['week', 'month'], required: true },
    fromDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    toDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    contentMarkdown: { type: String, default: '', maxlength: 60000 },
    sourceLogIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkLog' }],
    status: { type: String, enum: ['draft', 'final'], default: 'draft' },
    finalizedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
)

workReportSchema.index(
  { createdBy: 1, employment: 1, period: 1, fromDate: 1, toDate: 1 },
  { unique: true }
)
workReportSchema.index({ createdBy: 1, period: 1, fromDate: -1 })

workReportSchema.methods.toSafeJSON = function toSafeJSON() {
  const employment = this.employment && typeof this.employment === 'object'
    ? this.employment
    : null

  return {
    id: this._id.toString(),
    employmentId: employment?._id?.toString?.() || this.employment?.toString?.() || '',
    company: employment?.company || '',
    position: employment?.position || '',
    period: this.period,
    fromDate: this.fromDate,
    toDate: this.toDate,
    title: this.title,
    contentMarkdown: this.contentMarkdown || '',
    sourceLogIds: (this.sourceLogIds || []).map((id) => id.toString()),
    status: this.status,
    finalizedAt: this.finalizedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const WorkReport = mongoose.model('WorkReport', workReportSchema)
