import { describe, expect, it } from 'vitest'
import { normalizeThemePreference, resolveTheme } from './themePreference'

describe('theme preference resolution', () => {
  it('uses the site default for anonymous visitors without an override', () => {
    expect(resolveTheme({ siteDefaultTheme: 'dark' })).toBe('dark')
  })

  it('lets an anonymous auth-page override temporarily replace the site default', () => {
    expect(resolveTheme({
      isLoggedIn: false,
      authOverride: 'dark',
      siteDefaultTheme: 'light'
    })).toBe('dark')
  })

  it('gives a logged-in user preference priority over anonymous state and site default', () => {
    expect(resolveTheme({
      isLoggedIn: true,
      userPreference: 'light',
      authOverride: 'dark',
      siteDefaultTheme: 'dark'
    })).toBe('light')
  })

  it('uses the site default when a logged-in user follows the site setting', () => {
    expect(resolveTheme({
      isLoggedIn: true,
      userPreference: normalizeThemePreference('default'),
      siteDefaultTheme: 'dark'
    })).toBe('dark')
  })
})
