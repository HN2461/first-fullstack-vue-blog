import mongoose from 'mongoose'
import {
  TEA_DEMO_ROLE_LABELS,
  TEA_DEMO_ROLE_PERMISSIONS,
  TEA_DEMO_ROLES
} from '#modules/teaDemo/constants/teaDemo.constants.js'

const teaDemoUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 2,
      maxlength: 32
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    nickname: {
      type: String,
      default: '',
      trim: true,
      maxlength: 40
    },
    avatar: {
      type: String,
      default: '/images/default-avatar.png',
      trim: true
    },
    role: {
      type: String,
      enum: Object.values(TEA_DEMO_ROLES),
      default: TEA_DEMO_ROLES.USER
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active'
    },
    tokenVersion: {
      type: Number,
      default: 0
    },
    failedLoginCount: {
      type: Number,
      default: 0
    },
    lockedUntil: {
      type: Date,
      default: null
    },
    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

teaDemoUserSchema.methods.toSafeJSON = function toSafeJSON() {
  const roleLabel = TEA_DEMO_ROLE_LABELS[this.role] || TEA_DEMO_ROLE_LABELS[TEA_DEMO_ROLES.USER]

  return {
    id: this._id.toString(),
    username: this.username,
    email: this.email,
    nickname: this.nickname || this.username,
    avatar: this.avatar || '/images/default-avatar.png',
    role: this.role,
    roles: [roleLabel],
    permissions: [...(TEA_DEMO_ROLE_PERMISSIONS[this.role] || TEA_DEMO_ROLE_PERMISSIONS[TEA_DEMO_ROLES.USER])],
    status: this.status,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const TeaDemoUser = mongoose.model('TeaDemoUser', teaDemoUserSchema, 'tea_demo_users')
