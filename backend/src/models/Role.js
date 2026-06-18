import mongoose from 'mongoose'
import { BUILTIN_ROLE_CODES } from '#constants/domain'

const roleSchema = new mongoose.Schema(
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
      maxlength: 60
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 240
    },
    menuIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu'
    }],
    isBuiltin: {
      type: Boolean,
      default: false
    },
    isSuperAdmin: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active'
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

roleSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    code: this.code,
    description: this.description,
    menuIds: (this.menuIds || []).map((id) => id.toString()),
    isBuiltin: this.isBuiltin,
    isSuperAdmin: this.isSuperAdmin,
    status: this.status,
    sortOrder: this.sortOrder,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

roleSchema.statics.getBuiltinCodes = function getBuiltinCodes() {
  return Object.values(BUILTIN_ROLE_CODES)
}

export const Role = mongoose.model('Role', roleSchema)
