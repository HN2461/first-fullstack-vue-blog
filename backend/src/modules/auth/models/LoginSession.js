import mongoose from 'mongoose'

export const LOGIN_SESSION_STATUS = Object.freeze({
  ACTIVE: 'active',
  LOGGED_OUT: 'logged_out'
})

export const LOGIN_SESSION_ONLINE_WINDOW_MS = 3 * 60 * 1000

const loginSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      maxlength: 80
    },
    tokenVersion: {
      type: Number,
      default: 0
    },
    loginAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    logoutAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: Object.values(LOGIN_SESSION_STATUS),
      default: LOGIN_SESSION_STATUS.ACTIVE,
      index: true
    },
    ip: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120
    },
    userAgent: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500
    },
    device: {
      type: String,
      default: '未知设备',
      trim: true,
      maxlength: 80
    },
    browser: {
      type: String,
      default: '未知浏览器',
      trim: true,
      maxlength: 80
    }
  },
  { timestamps: true }
)

loginSessionSchema.index({ user: 1, loginAt: -1 })
loginSessionSchema.index({ status: 1, lastSeenAt: -1 })

export const LoginSession = mongoose.model('LoginSession', loginSessionSchema)
