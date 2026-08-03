import mongoose from 'mongoose'

const questionProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    attempts: { type: Number, min: 0, default: 0 },
    correctCount: { type: Number, min: 0, default: 0 },
    wrongCount: { type: Number, min: 0, default: 0 },
    masteryLevel: { type: Number, min: 0, max: 5, default: 0 },
    lastCorrect: { type: Boolean, default: false },
    lastSelfAssessment: {
      type: String,
      enum: ['mastered', 'uncertain', 'unknown'],
      default: null
    },
    lastSelfAssessmentAttemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionAttempt',
      default: null
    },
    selfAssessmentUpdatedAt: { type: Date, default: null },
    isFavorite: { type: Boolean, default: false },
    nextReviewAt: { type: Date, default: null },
    lastAttemptAt: { type: Date, default: null }
  },
  { timestamps: true }
)

questionProgressSchema.index({ userId: 1, questionId: 1 }, { unique: true })
questionProgressSchema.index({ userId: 1, nextReviewAt: 1 })
questionProgressSchema.index({ userId: 1, lastCorrect: 1, updatedAt: -1 })

export const QuestionProgress = mongoose.model('QuestionProgress', questionProgressSchema)
