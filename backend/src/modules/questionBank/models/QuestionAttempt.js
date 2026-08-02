import mongoose from 'mongoose'
import { QUESTION_TYPES } from './Question.js'

export const QUESTION_ATTEMPT_MODES = Object.freeze(['exam', 'practice', 'review'])
export const QUESTION_ATTEMPT_STATUSES = Object.freeze(['in_progress', 'submitted', 'expired'])

const optionSnapshotSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true, maxlength: 20 },
    content: { type: String, required: true, trim: true, maxlength: 3000 }
  },
  { _id: false }
)

const questionSnapshotSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    code: { type: String, required: true, trim: true, maxlength: 120 },
    version: { type: Number, min: 1, default: 1 },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionCategory', required: true },
    categoryName: { type: String, required: true, trim: true, maxlength: 240 },
    type: { type: String, enum: QUESTION_TYPES, required: true },
    stem: { type: String, required: true, trim: true, maxlength: 12000 },
    options: { type: [optionSnapshotSchema], default: [] },
    answerKeys: [{ type: String, trim: true, maxlength: 500 }],
    explanation: { type: String, default: '', trim: true, maxlength: 12000 },
    difficulty: { type: String, required: true },
    tags: [{ type: String, trim: true, maxlength: 30 }]
  },
  { _id: false }
)

const draftAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    answerKeys: [{ type: String, trim: true, maxlength: 1000 }],
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false }
)

const resultAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    answerKeys: [{ type: String, trim: true, maxlength: 1000 }],
    correct: { type: Boolean, required: true },
    score: { type: Number, min: 0, required: true }
  },
  { _id: false }
)

const questionAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    paperId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionPaper', default: null },
    mode: { type: String, enum: QUESTION_ATTEMPT_MODES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    status: { type: String, enum: QUESTION_ATTEMPT_STATUSES, default: 'in_progress' },
    durationMinutes: { type: Number, min: 0, max: 480, default: 0 },
    passScore: { type: Number, min: 0, max: 100, default: 60 },
    questions: { type: [questionSnapshotSchema], default: [] },
    draftAnswers: { type: [draftAnswerSchema], default: [] },
    answers: { type: [resultAnswerSchema], default: [] },
    totalScore: { type: Number, min: 0, max: 100, default: 0 },
    correctCount: { type: Number, min: 0, default: 0 },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null }
  },
  { timestamps: true }
)

questionAttemptSchema.index({ userId: 1, createdAt: -1 })
questionAttemptSchema.index({ userId: 1, status: 1, startedAt: -1 })

export const QuestionAttempt = mongoose.model('QuestionAttempt', questionAttemptSchema)
