import mongoose from 'mongoose'

export const TODO_ITEM_PRIORITIES = ['low', 'medium', 'high']

const todoItemSchema = new mongoose.Schema(
  {
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TodoList',
      required: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    note: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    completed: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: TODO_ITEM_PRIORITIES,
      default: 'medium'
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
)

todoItemSchema.index({ listId: 1, completed: 1, sortOrder: 1, createdAt: 1 })

todoItemSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    listId: this.listId?.toString?.(),
    createdBy: this.createdBy?.toString?.(),
    title: this.title,
    note: this.note || '',
    completed: this.completed,
    priority: this.priority,
    sortOrder: this.sortOrder,
    completedAt: this.completedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const TodoItem = mongoose.model('TodoItem', todoItemSchema)
