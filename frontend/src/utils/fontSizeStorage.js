const STORAGE_KEY = 'article-font-size'
const DESKTOP_DEFAULT_FONT_SIZE = 17
const MOBILE_DEFAULT_FONT_SIZE = 16
const MOBILE_BREAKPOINT = 768
const MIN_FONT_SIZE = 12
const MAX_FONT_SIZE = 24

export function getDefaultFontSize(viewportWidth) {
  const width = typeof viewportWidth === 'number'
    ? viewportWidth
    : (typeof window !== 'undefined' ? window.innerWidth : MOBILE_BREAKPOINT + 1)

  return width <= MOBILE_BREAKPOINT ? MOBILE_DEFAULT_FONT_SIZE : DESKTOP_DEFAULT_FONT_SIZE
}

export function getFontSize(viewportWidth) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === null) {
      return getDefaultFontSize(viewportWidth)
    }

    const size = Number.parseInt(saved, 10)

    if (Number.isNaN(size) || size < MIN_FONT_SIZE || size > MAX_FONT_SIZE) {
      return getDefaultFontSize(viewportWidth)
    }

    return size
  } catch {
    return getDefaultFontSize(viewportWidth)
  }
}

export function setFontSize(size) {
  try {
    const validSize = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Number(size) || DESKTOP_DEFAULT_FONT_SIZE))
    localStorage.setItem(STORAGE_KEY, String(validSize))
    return true
  } catch {
    return false
  }
}

export {
  DESKTOP_DEFAULT_FONT_SIZE,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  MOBILE_DEFAULT_FONT_SIZE,
  STORAGE_KEY
}
