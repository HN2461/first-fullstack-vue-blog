import mongoose from 'mongoose'

const customFestivalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  day: { type: Number, required: true, min: 1, max: 31 },
  category: { type: String, required: true, default: 'national' },
  source: { type: String, default: '管理员维护' },
  greeting: { type: String, default: '' },
  effect: { type: String, default: 'new-year' },
  isMajor: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true })

export const CustomFestival = mongoose.model('CustomFestival', customFestivalSchema)
