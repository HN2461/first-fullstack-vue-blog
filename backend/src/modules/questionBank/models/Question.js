import mongoose from 'mongoose'

export const QUESTION_TYPES = Object.freeze(['single_choice', 'multiple_choice', 'true_false', 'short_answer'])
export const QUESTION_DIFFICULTIES = Object.freeze(['easy', 'medium', 'hard'])
export const QUESTION_STATUSES = Object.freeze(['draft', 'ready', 'archived'])

const optionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000
    }
  },
  { _id: false }
)

const questionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 120
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionCategory',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: QUESTION_TYPES,
      required: true
    },
    stem: {
      type: String,
      required: true,
      trim: true,
      maxlength: 12000
    },
    options: {
      type: [optionSchema],
      default: []
    },
    answerKeys: [{
      type: String,
      trim: true,
      maxlength: 500
    }],
    explanation: {
      type: String,
      default: '',
      trim: true,
      maxlength: 12000
    },
    difficulty: {
      type: String,
      enum: QUESTION_DIFFICULTIES,
      default: 'medium'
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 30
    }],
    status: {
      type: String,
      enum: QUESTION_STATUSES,
      default: 'draft'
    },
    source: {
      type: String,
      default: 'manual',
      trim: true,
      maxlength: 120
    },
    contentHash: {
      type: String,
      default: '',
      trim: true,
      maxlength: 64
    },
    defaultScore: {
      type: Number,
      min: 1,
      max: 100,
      default: 1
    },
    version: {
      type: Number,
      min: 1,
      default: 1
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
)

questionSchema.index({ status: 1, categoryId: 1, difficulty: 1, type: 1 })
questionSchema.index({ tags: 1, status: 1 })
questionSchema.index({ updatedAt: -1 })

questionSchema.methods.toSafeJSON = function toSafeJSON(options = {}) {
  const category = this.categoryId && typeof this.categoryId === 'object' && this.categoryId.name
    ? this.categoryId.toSafeJSON?.() || this.categoryId
    : null
  const result = {
    id: this._id.toString(),
    code: this.code,
    categoryId: category?.id || this.categoryId?.toString?.(),
    category,
    type: this.type,
    stem: this.stem,
    options: this.options || [],
    difficulty: this.difficulty,
    tags: this.tags || [],
    status: this.status,
    source: this.source,
    defaultScore: this.defaultScore,
    version: this.version,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }

  if (options.includeAnswer) {
    result.answerKeys = this.answerKeys || []
    result.explanation = this.explanation || ''
  }

  return result
}

export const Question = mongoose.model('Question', questionSchema)
