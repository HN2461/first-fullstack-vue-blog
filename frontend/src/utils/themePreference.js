export const THEME_VALUES = ['light', 'dark']

export function normalizeTheme(value, fallback = 'light') {
  return THEME_VALUES.includes(value) ? value : fallback
}

export function normalizeThemePreference(value) {
  return THEME_VALUES.includes(value) ? value : 'default'
}

export function resolveTheme({ isLoggedIn, userPreference, authOverride, siteDefaultTheme }) {
  if (isLoggedIn && THEME_VALUES.includes(userPreference)) {
    return userPreference
  }

  if (!isLoggedIn && THEME_VALUES.includes(authOverride)) {
    return authOverride
  }

  return normalizeTheme(siteDefaultTheme)
}
