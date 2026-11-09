import mongoose from 'mongoose'
import { FEEDBACK_STATUSES } from './Feedback.js'

const feedbackEventSchema = new mongoose.Schema(
  {
    feedback: { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback', required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestId: { type: String, required: true },
    kind: { type: String, enum: ['created', 'reply', 'status', 'reopen', 'withdraw'], required: true },
    content: { type: String, default: '', maxlength: 10000 },
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
    fromStatus: { type: String, enum: ['', ...FEEDBACK_STATUSES], default: '' },
    toStatus: { type: String, enum: ['', ...FEEDBACK_STATUSES], default: '' },
    // 收件人随事件持久化；通知失败可重试，不让用户重复提交已经保存的反馈。
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    ready: { type: Boolean, default: false },
    notifiedAt: { type: Date, default: null }
  },
  { timestamps: true }
)

feedbackEventSchema.index({ feedback: 1, actor: 1, requestId: 1 }, { unique: true })
feedbackEventSchema.index({ feedback: 1, createdAt: -1, _id: -1 })
feedbackEventSchema.index({ ready: 1, notifiedAt: 1, createdAt: 1 })

export const FeedbackEvent = mongoose.model('FeedbackEvent', feedbackEventSchema)
