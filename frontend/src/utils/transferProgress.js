export function formatTransferSize(size = 0) {
  const value = Math.max(0, Number(size) || 0)
  if (value >= 1024 * 1024 * 1024) return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`
  if (value >= 1024) return `${Math.round(value / 1024)} KB`
  return `${value} B`
}

export function formatTransferSpeed(bytesPerSecond = 0) {
  const speed = Math.max(0, Number(bytesPerSecond) || 0)
  return speed > 0 ? `${formatTransferSize(speed)}/s` : '计算中'
}

export function formatRemainingTime(seconds = 0) {
  const value = Math.max(0, Math.ceil(Number(seconds) || 0))
  if (!value) return '计算中'
  if (value < 60) return `约 ${value} 秒`
  if (value < 3600) return `约 ${Math.ceil(value / 60)} 分钟`
  return `约 ${(value / 3600).toFixed(1)} 小时`
}

export function createTransferTracker(onUpdate) {
  const startedAt = performance.now()
  let lastAt = startedAt
  let lastLoaded = 0
  let smoothedSpeed = 0

  return (loaded = 0, total = 0) => {
    const now = performance.now()
    const elapsed = Math.max((now - lastAt) / 1000, 0.001)
    const instantSpeed = Math.max(0, loaded - lastLoaded) / elapsed
    smoothedSpeed = smoothedSpeed ? smoothedSpeed * 0.72 + instantSpeed * 0.28 : instantSpeed
    lastAt = now
    lastLoaded = loaded

    const hasTotal = total > 0
    const percent = hasTotal ? Math.min(100, Math.round((loaded / total) * 100)) : 0
    const remainingSeconds = hasTotal && smoothedSpeed > 0
      ? Math.max(0, total - loaded) / smoothedSpeed
      : 0

    onUpdate({
      loaded,
      total,
      percent,
      speed: smoothedSpeed,
      remainingSeconds,
      elapsedSeconds: (now - startedAt) / 1000
    })
  }
}
