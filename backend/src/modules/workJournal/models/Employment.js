import mongoose from 'mongoose'

const employmentSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true, maxlength: 120 },
    department: { type: String, default: '', trim: true, maxlength: 120 },
    position: { type: String, required: true, trim: true, maxlength: 120 },
    startedOn: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    endedOn: { type: String, default: '', match: /^$|^\d{4}-\d{2}-\d{2}$/ },
    note: { type: String, default: '', trim: true, maxlength: 1000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
  },
  { timestamps: true }
)

employmentSchema.index({ createdBy: 1, startedOn: -1 })

employmentSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    company: this.company,
    department: this.department,
    position: this.position,
    startedOn: this.startedOn,
    endedOn: this.endedOn || '',
    note: this.note || '',
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const Employment = mongoose.model('Employment', employmentSchema)
