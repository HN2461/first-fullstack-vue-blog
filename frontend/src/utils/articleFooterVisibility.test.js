import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
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

  it.each(['PcView.vue', 'MobileView.vue'])('controls the complete %s footer block through the shared rule', (fileName) => {
    const viewPath = fileURLToPath(new URL(`../views/public/ArticleDetailPage/${fileName}`, import.meta.url))
    const viewSource = readFileSync(viewPath, 'utf8')

    expect(viewSource).toContain('shouldShowArticleFooter({')
    expect(viewSource).toMatch(/<footer\s+[\s\S]*?v-if="actionBarVisible"/)
  })
})
