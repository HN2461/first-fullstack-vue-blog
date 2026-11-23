import { describe, expect, it } from 'vitest'
import { getAuthExpiredRedirect, getReturnPath } from './authRedirect'

describe('getAuthExpiredRedirect', () => {
  it('切换登录和注册保留站内文章位置，忽略数组、外部地址及缺失的回跳', () => {
    expect(getReturnPath('/articles/example?line=23#章节')).toBe('/articles/example?line=23#章节')
    for (const value of [undefined, [], '//example.org/blog', 'https://example.org', '/\\example.org']) {
      expect(getReturnPath(value)).toBe('/console')
    }
  })
  it('keeps the current protected page as the login destination', () => {
    expect(getAuthExpiredRedirect({
      path: '/console/article-directory/articles/example',
      fullPath: '/console/article-directory/articles/example?from=share#comments',
      meta: { requiresAuth: true }
    })).toEqual({
      name: 'Login',
      query: {
        redirect: '/console/article-directory/articles/example?from=share#comments'
      }
    })
  })

  it('does not redirect public share pages or the login page', () => {
    expect(getAuthExpiredRedirect({
      path: '/s/share-id',
      fullPath: '/s/share-id',
      meta: {}
    })).toBeNull()
    expect(getAuthExpiredRedirect({
      path: '/login',
      fullPath: '/login',
      meta: { requiresAuth: true }
    })).toBeNull()
  })
})
