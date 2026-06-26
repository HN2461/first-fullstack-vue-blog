<template>
  <EntranceEffectPlayer
    v-if="currentEffect"
    :key="currentEffect.playId"
    :effect-key="currentEffect.effectKey"
    :duration="currentEffect.duration"
    :leaving="leaving"
  />
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import EntranceEffectPlayer from './EntranceEffectPlayer.vue'
import { normalizeEntranceEffectConfig } from '@/utils/entranceEffects/effectCatalog'
import { readEntranceEffectCache } from '@/utils/entranceEffects/entranceEffectStorage'

const route = useRoute()
const authStore = useAuthStore()
const currentEffect = ref(null)
const leaving = ref(false)
let disposeTimer = null
let leavingTimer = null
let lastAutoPlayKey = ''

const userConfig = computed(() => {
  const config = authStore.user?.entranceEffect || readEntranceEffectCache()
  return config ? normalizeEntranceEffectConfig(config) : null
})

function getTriggerPage(path) {
  if (path === '/login') return 'login'
  if (path === '/register') return 'register'
  if (path === '/') return 'home'
  if (path === '/console') return 'consoleHome'
  return ''
}

function stopTimers() {
  window.clearTimeout(disposeTimer)
  window.clearTimeout(leavingTimer)
  disposeTimer = null
  leavingTimer = null
}

function playEffect(config, source = 'auto') {
  const normalized = normalizeEntranceEffectConfig(config)
  stopTimers()
  leaving.value = false
  currentEffect.value = null

  nextTick(() => {
    currentEffect.value = {
      playId: `${Date.now()}-${source}`,
      effectKey: normalized.effectKey,
      duration: normalized.duration
    }
    leavingTimer = window.setTimeout(() => {
      leaving.value = true
    }, Math.max(1000, normalized.duration * 1000 - 520))
    disposeTimer = window.setTimeout(() => {
      currentEffect.value = null
      leaving.value = false
    }, normalized.duration * 1000 + 120)
  })
}

function tryAutoPlay() {
  const triggerPage = getTriggerPage(route.path)
  const config = userConfig.value
  if (!triggerPage || !config?.enabled || !config.triggerPages.includes(triggerPage)) return

  const playKey = `${route.fullPath}:${config.effectKey}:${config.duration}:${config.triggerPages.join(',')}`
  if (playKey === lastAutoPlayKey) return

  lastAutoPlayKey = playKey
  playEffect(config)
}

function handlePreview(event) {
  const config = normalizeEntranceEffectConfig({
    ...userConfig.value,
    ...event.detail,
    enabled: true
  })
  playEffect(config, 'preview')
}

onMounted(() => {
  window.addEventListener('entrance-effect-preview', handlePreview)
  tryAutoPlay()
})

onBeforeUnmount(() => {
  window.removeEventListener('entrance-effect-preview', handlePreview)
  stopTimers()
})

watch(() => [route.fullPath, authStore.ready, authStore.user?.entranceEffect], () => {
  tryAutoPlay()
}, { deep: true })
</script>
