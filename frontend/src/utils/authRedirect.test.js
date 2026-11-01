import { describe, expect, it } from 'vitest'
import { getAuthExpiredRedirect } from './authRedirect'

describe('getAuthExpiredRedirect', () => {
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
