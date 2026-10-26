import mongoose from 'mongoose'

const workMaterialSchema = new mongoose.Schema(
  {
    employment: { type: mongoose.Schema.Types.ObjectId, ref: 'Employment', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    type: { type: String, required: true, enum: ['website', 'credential', 'contact', 'note'], index: true },
    url: { type: String, default: '', trim: true, maxlength: 1000 },
    username: { type: String, default: '', trim: true, maxlength: 240 },
    passwordCiphertext: { type: String, default: '', select: false },
    passwordConfigured: { type: Boolean, default: false },
    contactName: { type: String, default: '', trim: true, maxlength: 120 },
    contactPhone: { type: String, default: '', trim: true, maxlength: 80 },
    contactEmail: { type: String, default: '', trim: true, maxlength: 160 },
    content: { type: String, default: '', trim: true, maxlength: 10000 },
    note: { type: String, default: '', trim: true, maxlength: 2000 },
    isPinned: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
)

workMaterialSchema.index({ createdBy: 1, employment: 1, isPinned: -1, updatedAt: -1 })

workMaterialSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    employmentId: this.employment?.toString?.() || String(this.employment || ''),
    title: this.title,
    type: this.type,
    url: this.url || '',
    username: this.username || '',
    passwordConfigured: Boolean(this.passwordConfigured || this.passwordCiphertext),
    contactName: this.contactName || '',
    contactPhone: this.contactPhone || '',
    contactEmail: this.contactEmail || '',
    content: this.content || '',
    note: this.note || '',
    isPinned: Boolean(this.isPinned),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const WorkMaterial = mongoose.model('WorkMaterial', workMaterialSchema)
