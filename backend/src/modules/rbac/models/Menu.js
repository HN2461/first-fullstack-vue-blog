import mongoose from 'mongoose'
import { MENU_OPEN_MODES, MENU_TYPES } from '#constants/domain'

export const MENU_PARENT_TYPES = Object.freeze({
  ROOT: 'root',
  CHILD: 'child'
})

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
      default: '',
      trim: true,
      maxlength: 120
    },
    routeKey: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120
    },
    activeMenuCode: {
      type: String,
      default: '',
      trim: true,
      maxlength: 80
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
    parentType: {
      type: String,
      enum: Object.values(MENU_PARENT_TYPES),
      default: MENU_PARENT_TYPES.ROOT
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      default: null
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 64
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
    routeKey: this.routeKey,
    activeMenuCode: this.activeMenuCode,
    openMode: this.openMode,
    hidden: this.hidden,
    enabled: this.enabled,
    parentType: this.parentType,
    parent_type: this.parentType,
    parentId: this.parentId ? this.parentId.toString() : null,
    parent_id: this.parentId ? this.parentId.toString() : '0',
    level: this.level || (this.parentId ? 2 : 1),
    sortOrder: this.sortOrder,
    type: this.type,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

menuSchema.index({ parentId: 1, sortOrder: 1 })
menuSchema.index({ parentType: 1, sortOrder: 1 })

export const Menu = mongoose.model('Menu', menuSchema)
