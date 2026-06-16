const METRIC_RETENTION_MS = 5 * 60 * 1000
const MAX_ERROR_RECORDS = 20

const requestEvents = []
const recentErrors = []

function pruneExpired(now) {
  const cutoff = now - METRIC_RETENTION_MS

  while (requestEvents.length > 0 && requestEvents[0].timestamp < cutoff) {
    requestEvents.shift()
  }

  while (recentErrors.length > 0 && recentErrors[0].timestamp < cutoff) {
    recentErrors.shift()
  }
}

export function requestMetricsMiddleware(req, res, next) {
  const startedAt = process.hrtime.bigint()

  res.on('finish', () => {
    const now = Date.now()
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6
    const event = {
      timestamp: now,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs
    }

    requestEvents.push(event)
    pruneExpired(now)

    if (res.statusCode >= 500) {
      recentErrors.push(event)
      if (recentErrors.length > MAX_ERROR_RECORDS) {
        recentErrors.shift()
      }
    }
  })

  next()
}

export function getRecentRequestMetrics() {
  const now = Date.now()
  pruneExpired(now)

  const total = requestEvents.length
  const status4xx = requestEvents.filter((item) => item.statusCode >= 400 && item.statusCode < 500).length
  const status5xx = requestEvents.filter((item) => item.statusCode >= 500).length
  const slowRequests = requestEvents.filter((item) => item.durationMs >= 1000).length
  const avgResponseMs = total > 0
    ? requestEvents.reduce((sum, item) => sum + item.durationMs, 0) / total
    : 0

  return {
    windowMinutes: METRIC_RETENTION_MS / 60000,
    totalRequests: total,
    status4xx,
    status5xx,
    slowRequests,
    avgResponseMs,
    lastRequestAt: requestEvents.at(-1)?.timestamp || null,
    lastErrorAt: recentErrors.at(-1)?.timestamp || null,
    recentErrors: recentErrors.slice().reverse()
  }
}
