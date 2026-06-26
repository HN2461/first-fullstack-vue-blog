import { normalizeEntranceEffectConfig } from './effectCatalog'

const STORAGE_KEY = 'blog-entrance-effect-config'

export function readEntranceEffectCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? normalizeEntranceEffectConfig(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function cacheEntranceEffectConfig(config) {
  if (!config) return

  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeEntranceEffectConfig(config)))
}

export function clearEntranceEffectCache() {
  localStorage.removeItem(STORAGE_KEY)
}
