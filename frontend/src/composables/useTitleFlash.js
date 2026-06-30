import { onBeforeUnmount } from 'vue'

let originalTitle = ''
let timer = null
let visible = false
let subscriberCount = 0

function stop() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (originalTitle) {
    document.title = originalTitle
  }
  visible = false
}

function start(label = '收到新消息') {
  if (document.visibilityState === 'visible') return
  if (!timer) {
    originalTitle = document.title
  }
  clearInterval(timer)
  timer = setInterval(() => {
    visible = !visible
    document.title = visible ? `【${label}】` : originalTitle
  }, 900)
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    stop()
  }
}

export function useTitleFlash() {
  subscriberCount += 1
  if (subscriberCount === 1) {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  onBeforeUnmount(() => {
    subscriberCount = Math.max(0, subscriberCount - 1)
    if (subscriberCount === 0) {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      stop()
    }
  })

  return { startTitleFlash: start, stopTitleFlash: stop }
}
