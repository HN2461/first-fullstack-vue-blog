export const DISCUSSION_ROUTE_PATH = '/console/discussions'

export const DISCUSSION_CONFIG = Object.freeze({
  enabled: true,
  messageLimitPerUser: 300,
  groupMemberLimit: 10,
  messageMaxLength: 2000,
  attachmentMaxFileSizeMB: 5,
  threadStorageSoftLimitMB: 50,
  revokeWindowSeconds: 120,
  pollingIntervalSeconds: 5,
  retentionDays: null
})

export const DISCUSSION_THREAD_TYPES = Object.freeze({
  DIRECT: 'direct',
  GROUP: 'group'
})

export const DISCUSSION_MEMBER_ROLES = Object.freeze({
  OWNER: 'owner',
  MEMBER: 'member'
})

export const DISCUSSION_CONTENT_TYPES = Object.freeze({
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file'
})
