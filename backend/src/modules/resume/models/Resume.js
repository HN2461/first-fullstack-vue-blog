import crypto from 'node:crypto'
import mongoose from 'mongoose'

export const RESUME_STATUSES = ['draft', 'active', 'archived']

function createItemId() {
  return crypto.randomUUID()
}

export function createEmptyResumeSections() {
  return {
    profile: {
      name: '',
      gender: '',
      age: '',
      phone: '',
      email: '',
      location: '',
      expectedCity: '',
      workYears: '',
      photoUrl: '',
      website: '',
      summary: ''
    },
    advantages: [],
    skills: [],
    education: [],
    workExperiences: [],
    projects: [],
    selfEvaluation: []
  }
}

const resumeSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    targetRole: {
      type: String,
      default: '',
      trim: true,
      maxlength: 80
    },
    templateKey: {
      type: String,
      default: 'boss',
      trim: true,
      maxlength: 40
    },
    status: {
      type: String,
      enum: RESUME_STATUSES,
      default: 'draft'
    },
    sections: {
      type: mongoose.Schema.Types.Mixed,
      default: createEmptyResumeSections
    },
    version: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
)

resumeSchema.index({ ownerId: 1, updatedAt: -1 })
resumeSchema.index({ ownerId: 1, status: 1, updatedAt: -1 })

resumeSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    ownerId: this.ownerId?.toString?.(),
    title: this.title,
    targetRole: this.targetRole || '',
    templateKey: this.templateKey || 'boss',
    status: this.status,
    sections: this.sections || createEmptyResumeSections(),
    version: this.version || 1,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export function ensureResumeItemId(item = {}) {
  return {
    ...item,
    id: item.id || createItemId()
  }
}

export const Resume = mongoose.model('Resume', resumeSchema)
