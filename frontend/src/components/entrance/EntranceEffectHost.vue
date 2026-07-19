<template>
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
import SiteEntranceWelcome from './SiteEntranceWelcome.vue'
import {
  normalizeSiteEntranceEffectConfig,
  renderSiteEntranceTitle
} from '@/utils/entranceEffects/siteEntranceEffect'
import {
  buildEntranceConfigPlayKey,
  hasEntranceAutoPlayed,
  markEntranceAutoPlayed,
} from '@/utils/entranceEffects/entranceAutoPlaySession'
import { EFFECT_PRIORITIES, enqueueEffect } from '@/utils/effects/effectQueue'

const route = useRoute()
const authStore = useAuthStore()
const siteStore = useSiteStore()
const currentSiteWelcome = ref(null)
const siteLeaving = ref(false)
let siteDisposeTimer = null
let siteLeavingTimer = null
let siteFinish = null

const siteConfig = computed(() => normalizeSiteEntranceEffectConfig(siteStore.profile?.siteEntranceEffect))
const siteConfigSignature = computed(() => JSON.stringify(siteConfig.value || {}))
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

function getSessionUserId() {
  return authStore.user?.id || 'guest'
}

function stopSiteTimers({ finish = true } = {}) {
  window.clearTimeout(siteDisposeTimer)
  window.clearTimeout(siteLeavingTimer)
  siteDisposeTimer = null
  siteLeavingTimer = null
  if (finish) siteFinish?.()
  siteFinish = null
}

function playSiteWelcome(config, source = 'auto', onFinish = null) {
  const normalized = normalizeSiteEntranceEffectConfig(config)
  stopSiteTimers()
  let cancelled = false
  siteFinish = onFinish
  siteLeaving.value = false
  currentSiteWelcome.value = null

  nextTick(() => {
    if (cancelled) return
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
      siteFinish?.()
      siteFinish = null
    }, normalized.duration * 1000 + 120)
  })

  return () => {
    cancelled = true
    stopSiteTimers({ finish: false })
    currentSiteWelcome.value = null
    siteLeaving.value = false
  }
}

function tryAutoPlay() {
  if (!authStore.ready || !siteStore.ready) return

  const triggerPage = getTriggerPage(route.path)
  if (!triggerPage) return

  const config = siteConfig.value
  if (authStore.user?.closeSiteEntranceEffect || !config?.enabled || !config.triggerPages.includes(triggerPage)) return

  const playKey = buildEntranceConfigPlayKey('site', triggerPage, getSessionUserId(), siteConfigSignature.value)
  if (hasEntranceAutoPlayed(playKey)) return

  markEntranceAutoPlayed(playKey)
  enqueueEffect({
    id: `site-welcome:${triggerPage}`,
    priority: EFFECT_PRIORITIES.siteWelcome,
    start: (finish) => playSiteWelcome(config, 'auto', finish)
  })
}

function handleSitePreview(event) {
  const config = normalizeSiteEntranceEffectConfig({
    ...siteConfig.value,
    ...event.detail,
    enabled: true
  })
  enqueueEffect({
    id: 'site-welcome:preview',
    priority: EFFECT_PRIORITIES.manual,
    start: (finish) => playSiteWelcome(config, 'preview', finish)
  })
}

onMounted(() => {
  window.addEventListener('site-entrance-preview', handleSitePreview)
  Promise.all([
    authStore.ready ? Promise.resolve() : authStore.restoreSession(),
    siteStore.loadProfile()
  ]).finally(() => {
    tryAutoPlay()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('site-entrance-preview', handleSitePreview)
  stopSiteTimers()
})

watch(() => [
  route.fullPath,
  authStore.ready,
  authStore.user?.closeSiteEntranceEffect,
  siteStore.ready,
  siteStore.profile?.siteEntranceEffect,
  siteConfigSignature.value
], () => {
  tryAutoPlay()
}, { deep: true })
</script>
