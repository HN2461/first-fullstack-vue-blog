const TRACKING_PARAMS = new Set([
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'ref',
  'source'
])

function isTrackingParam(name = '') {
  const key = String(name).toLowerCase()
  return key.startsWith('utm_') || TRACKING_PARAMS.has(key)
}

function normalizeParsedUrl(value, { similarity = false } = {}) {
  const parsed = new URL(value)
  parsed.protocol = parsed.protocol.toLowerCase()
  parsed.hostname = parsed.hostname.toLowerCase()

  if ((parsed.protocol === 'http:' && parsed.port === '80') || (parsed.protocol === 'https:' && parsed.port === '443')) {
    parsed.port = ''
  }

  if (similarity) {
    parsed.hostname = parsed.hostname.replace(/^www\./i, '')
    parsed.hash = ''
    for (const key of [...parsed.searchParams.keys()]) {
      if (isTrackingParam(key)) parsed.searchParams.delete(key)
    }
    parsed.searchParams.sort()
    if (parsed.pathname.length > 1) parsed.pathname = parsed.pathname.replace(/\/+$/, '')
  }

  return parsed.toString()
}

export function normalizeBookmarkUrl(url = '') {
  return String(url || '').trim()
}

export function buildBookmarkUrlKey(url = '') {
  const value = normalizeBookmarkUrl(url)
  if (!value) return ''
  try {
    return normalizeParsedUrl(value)
  } catch {
    return value
  }
}

export function buildBookmarkSimilarityKey(url = '') {
  const value = normalizeBookmarkUrl(url)
  if (!value) return ''
  try {
    return normalizeParsedUrl(value, { similarity: true })
  } catch {
    return value.toLowerCase()
  }
}
