import mongoose from 'mongoose'
import { QUESTION_DIFFICULTIES, QUESTION_TYPES } from './Question.js'

export const QUESTION_PAPER_MODES = Object.freeze(['fixed', 'random'])
export const QUESTION_PAPER_STATUSES = Object.freeze(['draft', 'ready', 'archived'])

const paperFilterSchema = new mongoose.Schema(
  {
    categoryIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionCategory'
    }],
    tags: [{ type: String, trim: true, maxlength: 30 }],
    types: [{ type: String, enum: QUESTION_TYPES }],
    difficulties: [{ type: String, enum: QUESTION_DIFFICULTIES }]
  },
  { _id: false }
)

const questionPaperSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      maxlength: 120
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000
    },
    mode: {
      type: String,
      enum: QUESTION_PAPER_MODES,
      default: 'random'
    },
    questionIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    }],
    filters: {
      type: paperFilterSchema,
      default: () => ({})
    },
    questionCount: {
      type: Number,
      min: 1,
      max: 200,
      default: 20
    },
    durationMinutes: {
      type: Number,
      min: 1,
      max: 480,
      default: 30
    },
    passScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 60
    },
    shuffleQuestions: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: QUESTION_PAPER_STATUSES,
      default: 'ready'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    source: {
      type: String,
      default: 'manual',
      trim: true,
      maxlength: 120
    }
  },
  { timestamps: true }
)

questionPaperSchema.index({ status: 1, updatedAt: -1 })

questionPaperSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    key: this.key || '',
    title: this.title,
    description: this.description || '',
    mode: this.mode,
    questionIds: (this.questionIds || []).map((item) => item?._id?.toString?.() || item.toString()),
    filters: {
      categoryIds: (this.filters?.categoryIds || []).map((item) => item.toString()),
      tags: this.filters?.tags || [],
      types: this.filters?.types || [],
      difficulties: this.filters?.difficulties || []
    },
    questionCount: this.questionCount,
    durationMinutes: this.durationMinutes,
    passScore: this.passScore,
    shuffleQuestions: this.shuffleQuestions,
    status: this.status,
    createdBy: this.createdBy?.toString?.(),
    source: this.source || 'manual',
    isBuiltin: (this.source || '').startsWith('builtin-'),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const QuestionPaper = mongoose.model('QuestionPaper', questionPaperSchema)
