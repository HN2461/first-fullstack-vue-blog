import { env } from '#config/env'

/**
 * Returns the calendar date used by user-facing daily features.
 * Keeping this in one helper prevents UTC midnight from shifting birthdays
 * and festival states to the previous local day.
 */
export function getBusinessDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: env.businessTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function isValidPastOrTodayDate(value, { minimumYear = 1900 } = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false

  const [year, month, day] = value.split('-').map(Number)
  if (year < minimumYear) return false

  const candidate = new Date(Date.UTC(year, month - 1, day))
  if (candidate.toISOString().slice(0, 10) !== value) return false

  return value <= getBusinessDate()
}
