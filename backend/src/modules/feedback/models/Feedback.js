import mongoose from 'mongoose'

export const FEEDBACK_TYPES = ['bug', 'suggestion', 'question']
export const FEEDBACK_STATUSES = ['pending', 'waiting', 'accepted', 'processing', 'completed', 'closed']

const feedbackSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true },
    requestId: { type: String, required: true },
    type: { type: String, enum: FEEDBACK_TYPES, required: true },
    title: { type: String, required: true, maxlength: 120 },
    content: { type: String, required: true, maxlength: 10000 },
    sourcePath: { type: String, default: '', maxlength: 500 },
    environment: { type: String, default: '', maxlength: 300 },
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
    status: { type: String, enum: FEEDBACK_STATUSES, default: 'pending' },
    version: { type: Number, default: 1 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastActivityAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

feedbackSchema.index({ createdBy: 1, requestId: 1 }, { unique: true })
feedbackSchema.index({ createdBy: 1, lastActivityAt: -1, _id: -1 })
feedbackSchema.index({ status: 1, lastActivityAt: -1, _id: -1 })

export const Feedback = mongoose.model('Feedback', feedbackSchema)
