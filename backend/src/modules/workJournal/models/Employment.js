import mongoose from 'mongoose'

const employmentSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true, maxlength: 120 },
    department: { type: String, default: '', trim: true, maxlength: 120 },
    position: { type: String, required: true, trim: true, maxlength: 120 },
    startedOn: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    endedOn: { type: String, default: '', match: /^$|^\d{4}-\d{2}-\d{2}$/ },
    probationSalary: { type: String, default: '', trim: true, maxlength: 80 },
    regularSalary: { type: String, default: '', trim: true, maxlength: 80 },
    salaryUnit: { type: String, default: '', enum: ['', '月薪', '年薪', '时薪', '面议', '其他'] },
    workSchedule: { type: String, default: '', enum: ['', '双休', '单休', '大小周', '轮班制', '不固定', '其他'] },
    workStartTime: { type: String, default: '', match: /^$|^(?:[01]\d|2[0-3]):[0-5]\d$/ },
    workEndTime: { type: String, default: '', match: /^$|^(?:[01]\d|2[0-3]):[0-5]\d$/ },
    departureContactName: { type: String, default: '', trim: true, maxlength: 80 },
    departureContactPhone: { type: String, default: '', trim: true, maxlength: 40 },
    departureContactEmail: { type: String, default: '', trim: true, maxlength: 160 },
    workContent: { type: String, default: '', trim: true, maxlength: 5000 },
    companyAddress: { type: String, default: '', trim: true, maxlength: 300 },
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
    probationSalary: this.probationSalary || '',
    regularSalary: this.regularSalary || '',
    salaryUnit: this.salaryUnit || '',
    workSchedule: this.workSchedule || '',
    workStartTime: this.workStartTime || '',
    workEndTime: this.workEndTime || '',
    departureContactName: this.departureContactName || '',
    departureContactPhone: this.departureContactPhone || '',
    departureContactEmail: this.departureContactEmail || '',
    workContent: this.workContent || '',
    companyAddress: this.companyAddress || '',
    note: this.note || '',
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const Employment = mongoose.model('Employment', employmentSchema)
