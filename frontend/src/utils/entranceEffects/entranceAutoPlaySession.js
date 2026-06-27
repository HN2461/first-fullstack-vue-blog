const ENTRANCE_AUTO_PLAY_SESSION_KEY = 'blog-entrance-auto-play-session-v1'
const memoryPlayedKeys = new Set()

function readStoredKeys() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(ENTRANCE_AUTO_PLAY_SESSION_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

function writePlayedKeys(keys) {
  try {
    sessionStorage.setItem(ENTRANCE_AUTO_PLAY_SESSION_KEY, JSON.stringify([...keys]))
  } catch {
    // sessionStorage 不可用时仅退化为当前组件内存防重，不阻断页面进入。
  }
}

export function buildEntranceAutoPlayKey(source, triggerPage, userId = 'guest') {
  return `${source}:${userId || 'guest'}:${triggerPage}`
}

export function hasEntranceAutoPlayed(key) {
  if (memoryPlayedKeys.has(key)) return true

  const storedKeys = readStoredKeys()
  if (!storedKeys.has(key)) return false

  memoryPlayedKeys.add(key)
  return true
}

export function markEntranceAutoPlayed(key) {
  memoryPlayedKeys.add(key)

  const keys = readStoredKeys()
  keys.add(key)
  writePlayedKeys(keys)
}

export function clearEntranceAutoPlaySession() {
  memoryPlayedKeys.clear()
  try {
    sessionStorage.removeItem(ENTRANCE_AUTO_PLAY_SESSION_KEY)
  } catch {
    // 忽略隐私模式或浏览器策略导致的清理失败。
  }
}
