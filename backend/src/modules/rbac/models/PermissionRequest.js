import mongoose from 'mongoose'
import { PERMISSION_REQUEST_STATUS } from '#constants/domain'

const permissionRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    status: {
      type: String,
      enum: Object.values(PERMISSION_REQUEST_STATUS),
      default: PERMISSION_REQUEST_STATUS.PENDING
    },
    rejectReason: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

permissionRequestSchema.methods.toSafeJSON = function toSafeJSON() {
  const user = this.user && typeof this.user === 'object' && this.user.toSafeJSON
    ? this.user.toSafeJSON()
    : this.user
  const targetRole = this.targetRole && typeof this.targetRole === 'object' && this.targetRole.toSafeJSON
    ? this.targetRole.toSafeJSON()
    : this.targetRole

  return {
    id: this._id.toString(),
    user,
    targetRole,
    reason: this.reason,
    status: this.status,
    rejectReason: this.rejectReason,
    reviewedBy: this.reviewedBy,
    reviewedAt: this.reviewedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

export const PermissionRequest = mongoose.model('PermissionRequest', permissionRequestSchema)
