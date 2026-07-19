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
  siteWelcome: 70,
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
export function enqueueEffect({ id, priority = 0, start }) {
  return new Promise((resolve) => {
    const item = { id, type: id, priority, start, resolve, sequence: sequence += 1 }
    queue.push(item)

    if (active && priority > active.item.priority) {
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
