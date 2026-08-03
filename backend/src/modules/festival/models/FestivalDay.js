import mongoose from 'mongoose'

const festivalDaySchema = new mongoose.Schema({
  year: { type: Number, required: true, index: true },
  date: { type: String, required: true },
  name: { type: String, required: true },
  isHoliday: { type: Boolean, default: false },
  isWorkday: { type: Boolean, default: false },
  source: { type: String, required: true },
  syncedAt: { type: Date, default: Date.now },
  raw: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true })

festivalDaySchema.index({ year: 1, date: 1 }, { unique: true })

export const FestivalDay = mongoose.model('FestivalDay', festivalDaySchema)
