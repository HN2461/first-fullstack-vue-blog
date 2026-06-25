import mongoose from 'mongoose'

export const PROJECT_TIMELINE_CATEGORIES = [
  '内容上新',
  '功能更新',
  '问题修复',
  '系统公告',
  '部署发布',
  '项目搭建',
  '版本调整',
  '手动记录'
]

export const PROJECT_TIMELINE_SOURCES = [
  'legacy_daily',
  'legacy_history',
  'legacy_manual',
  'current_project',
  'collaboration_daily',
  'manual'
]

const projectTimelineRecordSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    detail: {
      type: String,
      required: true,
      trim: true,
      maxlength: 12000
    },
    occurredAt: {
      type: Date,
      required: true
    },
    category: {
      type: String,
      trim: true,
      maxlength: 40,
      default: '手动记录'
    },
    source: {
      type: String,
      enum: PROJECT_TIMELINE_SOURCES,
      default: 'manual'
    },
    legacyId: {
      type: String,
      trim: true,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
)

projectTimelineRecordSchema.index({ occurredAt: -1, createdAt: -1 })
projectTimelineRecordSchema.index(
  { source: 1, legacyId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      legacyId: { $type: 'string' }
    }
  }
)

projectTimelineRecordSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    title: this.title,
    detail: this.detail,
    occurredAt: this.occurredAt,
    category: this.category || '手动记录',
    source: this.source || 'manual',
    legacyId: this.legacyId || null,
    createdBy: this.createdBy?.toString?.() || null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const ProjectTimelineRecord = mongoose.model(
  'ProjectTimelineRecord',
  projectTimelineRecordSchema,
  'projectTimelineRecords'
)
