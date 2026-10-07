const queue = []
let active = null
let sequence = 0

function notify() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('effect-queue-change', {
    detail: { activeType: active?.item.type || null }
  }))
}

export const EFFECT_PRIORITIES = Object.freeze({
  manual: 1000,
  birthday: 100,
  personalEntrance: 80,
  siteWelcome: 70,
  announcement: 60,
  majorFestival: 40
})

function pump() {
  if (active || queue.length === 0) return

  queue.sort((left, right) => right.priority - left.priority || left.sequence - right.sequence)
  const item = queue.shift()
  let finished = false
  const finish = () => {
    if (finished) return
    finished = true
    item.cancel?.()
    if (active?.item === item) active = null
    item.resolve()
    notify()
    pump()
  }

  active = { item, finish }
  notify()
  item.cancel = item.start(finish)
}

/**
 * Serializes blocking effects. A higher-priority effect preempts a lower one
 * so birthday reminders cannot wait behind a welcome animation.
 */
export function enqueueEffect({ id, priority = 0, start, replaceKey = '' }) {
  return new Promise((resolve) => {
    const item = { id, type: id, priority, start, resolve, replaceKey, sequence: sequence += 1 }

    // 手动预览类效果只保留最后一次选择，避免快速点击把多个彩带动画堆在队列里。
    if (replaceKey) {
      for (let index = queue.length - 1; index >= 0; index -= 1) {
        if (queue[index].replaceKey !== replaceKey) continue
        queue[index].resolve()
        queue.splice(index, 1)
      }
    }

    queue.push(item)

    if (active && (priority > active.item.priority || (replaceKey && active.item.replaceKey === replaceKey))) {
      active.finish()
      return
    }

    pump()
  })
}

export function clearQueuedEffects() {
  while (queue.length) {
    queue.shift().resolve()
  }
  active?.finish()
}
