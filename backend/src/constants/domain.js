export const USER_ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user'
})

export const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  MUTED: 'muted',
  DISABLED: 'disabled'
})

export const ARTICLE_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
})

export const COMMENT_STATUS = Object.freeze({
  VISIBLE: 'visible',
  PENDING: 'pending',
  REJECTED: 'rejected',
  HIDDEN: 'hidden',
  DELETED: 'deleted'
})

export const BUILTIN_ROLE_CODES = Object.freeze({
  SUPER_ADMIN: 'super-admin',
  VISITOR: 'visitor',
  ADMIN_BASE: 'admin-base'
})

export const MENU_TYPES = Object.freeze({
  SYSTEM: 'system',
  CUSTOM: 'custom'
})

export const MENU_OPEN_MODES = Object.freeze({
  CURRENT: 'current',
  BLANK: 'blank'
})

export const PERMISSION_REQUEST_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
})
