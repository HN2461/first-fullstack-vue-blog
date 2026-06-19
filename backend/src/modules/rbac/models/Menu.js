import mongoose from 'mongoose'
import { MENU_OPEN_MODES, MENU_TYPES } from '#constants/domain'

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    },
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 80
    },
    icon: {
      type: String,
      default: '',
      trim: true,
      maxlength: 60
    },
    routePath: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    openMode: {
      type: String,
      enum: Object.values(MENU_OPEN_MODES),
      default: MENU_OPEN_MODES.CURRENT
    },
    hidden: {
      type: Boolean,
      default: false
    },
    enabled: {
      type: Boolean,
      default: true
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      default: null
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      enum: Object.values(MENU_TYPES),
      default: MENU_TYPES.CUSTOM
    }
  },
  {
    timestamps: true
  }
)

menuSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    code: this.code,
    icon: this.icon,
    routePath: this.routePath,
    openMode: this.openMode,
    hidden: this.hidden,
    enabled: this.enabled,
    parentId: this.parentId ? this.parentId.toString() : null,
    sortOrder: this.sortOrder,
    type: this.type,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const Menu = mongoose.model('Menu', menuSchema)
