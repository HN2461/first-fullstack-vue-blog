import mongoose from 'mongoose'

export const SYSTEM_BROADCAST_FESTIVAL_CATEGORY = 'system-broadcast'

const customFestivalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  day: { type: Number, required: true, min: 1, max: 31 },
  // 管理员维护的自定义日期只负责向全站广播，类别由系统统一维护，避免误选国家或行业分类。
  category: { type: String, required: true, default: SYSTEM_BROADCAST_FESTIVAL_CATEGORY },
  source: { type: String, default: '管理员维护' },
  greeting: { type: String, default: '' },
  effect: { type: String, default: 'new-year' },
  isMajor: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true })

export const CustomFestival = mongoose.model('CustomFestival', customFestivalSchema)
