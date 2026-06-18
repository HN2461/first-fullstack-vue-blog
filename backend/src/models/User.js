import mongoose from 'mongoose'
import { USER_ROLES, USER_STATUS } from '#constants/domain'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
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
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: '',
      maxlength: 240
    },
    website: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120
    },
    location: {
      type: String,
      default: '',
      trim: true,
      maxlength: 60
    },
    notificationSettings: {
      email: {
        type: Boolean,
        default: true
      },
      site: {
        type: Boolean,
        default: true
      },
      comment: {
        type: Boolean,
        default: true
      },
      like: {
        type: Boolean,
        default: false
      }
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER
    },
    roles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    }],
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE
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
    },
    passwordChangedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

userSchema.methods.toSafeJSON = function toSafeJSON(options = {}) {
  const roles = options.roles || this.roles || []
  const safeRoles = Array.isArray(roles)
    ? roles.map((role) => {
        if (role && typeof role === 'object' && role.toSafeJSON) {
          return role.toSafeJSON()
        }
        if (role && typeof role === 'object' && role._id) {
          return {
            id: role._id.toString(),
            name: role.name,
            code: role.code,
            isSuperAdmin: !!role.isSuperAdmin
          }
        }
        return role?.toString?.() || role
      })
    : []
  const isSuperAdmin = safeRoles.some((role) => role?.isSuperAdmin || role?.code === 'super-admin') || this.role === USER_ROLES.SUPER_ADMIN

  return {
    id: this._id.toString(),
    username: this.username,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    website: this.website,
    location: this.location,
    notificationSettings: {
      email: this.notificationSettings?.email ?? true,
      site: this.notificationSettings?.site ?? true,
      comment: this.notificationSettings?.comment ?? true,
      like: this.notificationSettings?.like ?? false
    },
    role: this.role,
    roles: safeRoles,
    isSuperAdmin,
    permissions: options.permissions || {
      menus: [],
      menuPaths: []
    },
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const User = mongoose.model('User', userSchema)
