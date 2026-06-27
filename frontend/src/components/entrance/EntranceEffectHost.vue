<template>
  <EntranceEffectPlayer
    v-if="currentEffect"
    :key="currentEffect.playId"
    :effect-key="currentEffect.effectKey"
    :duration="currentEffect.duration"
    :leaving="leaving"
  />
  <SiteEntranceWelcome
    v-if="currentSiteWelcome"
    :key="currentSiteWelcome.playId"
    :effect-key="currentSiteWelcome.effectKey"
    :title="currentSiteWelcome.title"
    :subtitle="currentSiteWelcome.subtitle"
    :duration="currentSiteWelcome.duration"
    :leaving="siteLeaving"
  />
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSiteStore } from '@/stores/site'
import EntranceEffectPlayer from './EntranceEffectPlayer.vue'
import SiteEntranceWelcome from './SiteEntranceWelcome.vue'
import { normalizeEntranceEffectConfig } from '@/utils/entranceEffects/effectCatalog'
import { readEntranceEffectCache } from '@/utils/entranceEffects/entranceEffectStorage'
import {
  normalizeSiteEntranceEffectConfig,
  renderSiteEntranceTitle
} from '@/utils/entranceEffects/siteEntranceEffect'

const route = useRoute()
const authStore = useAuthStore()
const siteStore = useSiteStore()
const currentEffect = ref(null)
const currentSiteWelcome = ref(null)
const leaving = ref(false)
const siteLeaving = ref(false)
let disposeTimer = null
let leavingTimer = null
let siteDisposeTimer = null
let siteLeavingTimer = null
let lastAutoPlayKey = ''

const userConfig = computed(() => {
  const config = authStore.user?.entranceEffect || readEntranceEffectCache()
  return config ? normalizeEntranceEffectConfig(config) : null
})
const siteConfig = computed(() => normalizeSiteEntranceEffectConfig(siteStore.profile?.siteEntranceEffect))
const displayName = computed(() => (
  authStore.user?.remarkName ||
  authStore.user?.username ||
  authStore.user?.email?.split('@')[0] ||
  '朋友'
))

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

function stopSiteTimers() {
  window.clearTimeout(siteDisposeTimer)
  window.clearTimeout(siteLeavingTimer)
  siteDisposeTimer = null
  siteLeavingTimer = null
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

function playSiteWelcome(config, source = 'auto') {
  const normalized = normalizeSiteEntranceEffectConfig(config)
  stopSiteTimers()
  siteLeaving.value = false
  currentSiteWelcome.value = null

  nextTick(() => {
    currentSiteWelcome.value = {
      playId: `${Date.now()}-${source}`,
      effectKey: normalized.effectKey,
      title: renderSiteEntranceTitle(normalized.titleTemplate, {
        username: displayName.value,
        siteTitle: siteStore.siteTitle
      }),
      subtitle: normalized.subtitle,
      duration: normalized.duration
    }
    siteLeavingTimer = window.setTimeout(() => {
      siteLeaving.value = true
    }, Math.max(1000, normalized.duration * 1000 - 520))
    siteDisposeTimer = window.setTimeout(() => {
      currentSiteWelcome.value = null
      siteLeaving.value = false
    }, normalized.duration * 1000 + 120)
  })
}

function tryAutoPlay() {
  const triggerPage = getTriggerPage(route.path)
  if (!triggerPage) return

  const personalConfig = userConfig.value
  if (personalConfig?.enabled && personalConfig.triggerPages.includes(triggerPage)) {
    const playKey = `personal:${route.fullPath}:${personalConfig.effectKey}:${personalConfig.duration}:${personalConfig.triggerPages.join(',')}`
    if (playKey === lastAutoPlayKey) return

    lastAutoPlayKey = playKey
    playEffect(personalConfig)
    return
  }

  const config = siteConfig.value
  if (authStore.user?.closeSiteEntranceEffect || !config?.enabled || !config.triggerPages.includes(triggerPage)) return

  const playKey = `site:${route.fullPath}:${config.effectKey}:${config.duration}:${config.titleTemplate}:${config.subtitle}:${config.triggerPages.join(',')}`
  if (playKey === lastAutoPlayKey) return

  lastAutoPlayKey = playKey
  playSiteWelcome(config)
}

function handlePreview(event) {
  const config = normalizeEntranceEffectConfig({
    ...userConfig.value,
    ...event.detail,
    enabled: true
  })
  playEffect(config, 'preview')
}

function handleSitePreview(event) {
  const config = normalizeSiteEntranceEffectConfig({
    ...siteConfig.value,
    ...event.detail,
    enabled: true
  })
  playSiteWelcome(config, 'preview')
}

onMounted(() => {
  window.addEventListener('entrance-effect-preview', handlePreview)
  window.addEventListener('site-entrance-preview', handleSitePreview)
  siteStore.loadProfile().finally(() => {
    tryAutoPlay()
  })
  tryAutoPlay()
})

onBeforeUnmount(() => {
  window.removeEventListener('entrance-effect-preview', handlePreview)
  window.removeEventListener('site-entrance-preview', handleSitePreview)
  stopTimers()
  stopSiteTimers()
})

watch(() => [
  route.fullPath,
  authStore.ready,
  authStore.user?.entranceEffect,
  authStore.user?.closeSiteEntranceEffect,
  siteStore.ready,
  siteStore.profile?.siteEntranceEffect
], () => {
  tryAutoPlay()
}, { deep: true })
</script>
