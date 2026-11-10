import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true, index: true },
  targetType: { type: String, required: true, maxlength: 60 },
  targetId: { type: String, required: true, maxlength: 100 },
  field: { type: String, required: true, maxlength: 80 },
  state: { type: String, enum: ['pending', 'active', 'retained'], default: 'active' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true })

schema.index({ mediaId: 1, targetType: 1, targetId: 1, field: 1 }, { unique: true })
schema.index({ targetType: 1, targetId: 1, field: 1 })

export const MediaReference = mongoose.model('MediaReference', schema)
