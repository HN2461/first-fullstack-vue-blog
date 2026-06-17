const SCROLLABLE_OVERFLOW_VALUES = new Set(['auto', 'scroll', 'overlay'])

export function isScrollableElement(element) {
  if (!element || typeof element !== 'object') {
    return false
  }

  const hasScrollableBox =
    typeof element.scrollHeight === 'number' &&
    typeof element.clientHeight === 'number'

  if (!hasScrollableBox) {
    return false
  }

  if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
    return element.scrollHeight > element.clientHeight + 1
  }

  const overflowY = window.getComputedStyle(element).overflowY.toLowerCase()

  return SCROLLABLE_OVERFLOW_VALUES.has(overflowY) &&
    element.scrollHeight > element.clientHeight + 1
}

export function resolveScrollableContainer(...candidates) {
  const elements = candidates.flat().filter(Boolean)
  return elements.find((element) => isScrollableElement(element)) || elements[0] || null
}
