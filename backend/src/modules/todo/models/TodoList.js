import mongoose from 'mongoose'

export const TODO_LIST_TYPES = ['daily', 'shopping', 'travel', 'custom']
export const TODO_LIST_STATUSES = ['active', 'archived']

const todoListSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    type: {
      type: String,
      enum: TODO_LIST_TYPES,
      default: 'custom'
    },
    planDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: TODO_LIST_STATUSES,
      default: 'active'
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    // 仅用于可控演示数据的幂等清理，不参与普通用户业务筛选。
    seedKey: {
      type: String,
      default: null,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  { timestamps: true }
)

todoListSchema.index({ createdBy: 1, status: 1, planDate: 1, updatedAt: -1 })
todoListSchema.index({ createdBy: 1, title: 'text' })

todoListSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    title: this.title,
    type: this.type,
    planDate: this.planDate,
    status: this.status,
    isPinned: this.isPinned,
    seedKey: this.seedKey || null,
    createdBy: this.createdBy?.toString?.(),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const TodoList = mongoose.model('TodoList', todoListSchema)
