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
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE
    }
  },
  {
    timestamps: true
  }
)

userSchema.methods.toSafeJSON = function toSafeJSON() {
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
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const User = mongoose.model('User', userSchema)
