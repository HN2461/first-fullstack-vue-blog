const RELEASE_TARGET_LABELS = {
  full: '完整发布',
  backend: '后端发布',
  frontend: '前端发布'
}

export function formatReleaseInfo(releaseInfo) {
  const value = releaseInfo?.lastSuccessfulReleaseAt
  if (!value || Number.isNaN(new Date(value).getTime())) return '尚未记录'

  const timestamp = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(value))
  const target = RELEASE_TARGET_LABELS[releaseInfo.target] || releaseInfo.target

  return target ? `${timestamp}（${target}）` : timestamp
}
