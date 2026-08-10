import { describe, expect, it } from 'vitest'
import { mergeCachedPermissions } from './auth'

describe('mergeCachedPermissions', () => {
  it('restores cached menu permissions when the current-user response omits them', () => {
    const user = { id: 'user-1', username: '测试用户' }
    const permissions = {
      rootMenus: [{ id: 'knowledge', name: '知识库' }],
      menuPaths: ['/console/articles']
    }

    expect(mergeCachedPermissions(user, {
      userId: 'user-1',
      permissions
    })).toEqual({
      ...user,
      permissions
    })
  })

  it('does not apply another user cache or overwrite fresh permissions', () => {
    const freshPermissions = { rootMenus: [{ id: 'admin', name: '后台管理' }] }
    const user = { id: 'user-1', permissions: freshPermissions }
    const staleCache = {
      userId: 'user-2',
      permissions: { rootMenus: [{ id: 'knowledge', name: '知识库' }] }
    }

    expect(mergeCachedPermissions(user, staleCache)).toBe(user)
    expect(mergeCachedPermissions(user, {
      ...staleCache,
      userId: 'user-1'
    })).toBe(user)
  })
})
