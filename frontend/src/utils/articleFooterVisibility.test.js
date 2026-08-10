import { describe, expect, it } from 'vitest'
import { shouldShowArticleFooter } from './articleFooterVisibility'

describe('shouldShowArticleFooter', () => {
  it('hides the entire footer when a logged-in user disables the preference', () => {
    expect(shouldShowArticleFooter({
      isLoggedIn: true,
      preferenceEnabled: false
    })).toBe(false)
  })

  it('shows the entire footer when a logged-in user enables the preference', () => {
    expect(shouldShowArticleFooter({
      isLoggedIn: true,
      preferenceEnabled: true
    })).toBe(true)
  })

  it('keeps public article actions available to signed-out visitors', () => {
    expect(shouldShowArticleFooter({
      isLoggedIn: false,
      preferenceEnabled: false
    })).toBe(true)
  })

  it.each([
    { isAdminPreview: true },
    { isImmersiveReading: true },
    { isSessionHidden: true }
  ])('keeps higher-priority hidden states effective: %o', (state) => {
    expect(shouldShowArticleFooter({
      isLoggedIn: true,
      preferenceEnabled: true,
      ...state
    })).toBe(false)
  })
})
