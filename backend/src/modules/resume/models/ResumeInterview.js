import mongoose from 'mongoose'

const linkSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true
    },
    sectionKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    },
    entryId: {
      type: String,
      default: '',
      trim: true,
      maxlength: 80
    },
    highlightId: {
      type: String,
      default: '',
      trim: true,
      maxlength: 80
    },
    excerpt: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300
    }
  },
  { _id: false }
)

const resumeInterviewSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    answerOutline: {
      type: String,
      default: '',
      trim: true,
      maxlength: 5000
    },
    polishedAnswer: {
      type: String,
      default: '',
      trim: true,
      maxlength: 8000
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 24
    }],
    difficulty: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    links: {
      type: [linkSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
)

resumeInterviewSchema.index({ ownerId: 1, updatedAt: -1 })
resumeInterviewSchema.index({ ownerId: 1, tags: 1 })
resumeInterviewSchema.index({ ownerId: 1, 'links.resumeId': 1 })

resumeInterviewSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    ownerId: this.ownerId?.toString?.(),
    question: this.question,
    answerOutline: this.answerOutline || '',
    polishedAnswer: this.polishedAnswer || '',
    tags: this.tags || [],
    difficulty: this.difficulty,
    links: (this.links || []).map((link) => ({
      resumeId: link.resumeId?.toString?.(),
      sectionKey: link.sectionKey,
      entryId: link.entryId || '',
      highlightId: link.highlightId || '',
      excerpt: link.excerpt || ''
    })),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const ResumeInterview = mongoose.model('ResumeInterview', resumeInterviewSchema)
