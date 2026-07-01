<template>
  <FestivalAtmosphere
    :active-festival="activeFestival"
    :is-mobile="appStore.isMobile"
    :visible="atmosphereVisible"
    @close="closeFestivalForDevice"
  />

  <a-modal
    v-model:open="celebrationOpen"
    :title="celebrationFestival?.name || '节日快乐'"
    centered
    :width="appStore.isMobile ? '92vw' : 420"
    :footer="null"
    wrap-class-name="festival-celebration-modal"
    @afterOpenChange="handleCelebrationVisibleChange"
  >
    <div v-if="celebrationFestival" class="public-festival-celebration" :style="celebrationStyle">
      <div class="public-festival-celebration__icon">
        {{ celebrationFestival.icons?.[0] || '✨' }}
      </div>
      <strong>{{ celebrationFestival.text }}</strong>
      <span>{{ celebrationFestival.source }} · {{ celebrationFestival.date }}</span>
      <a-button @click="celebrationOpen = false">知道了</a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import FestivalAtmosphere from './FestivalAtmosphere.vue'
import { getPublicFestivalEffectState } from '@/services/public'
import { useAppStore } from '@/stores/app'
import {
  getActiveFestival,
  getDeviceType,
  getEffectStorageKey,
  getTodayKeyFromServer
} from '@/utils/festival/festivalCalendar'
import { playFestivalConfetti } from '@/utils/festival/confettiPlayer'

const appStore = useAppStore()
const route = useRoute()
const serverDate = ref('')
const activeFestival = ref(null)
const celebrationOpen = ref(false)
const celebrationFestival = ref(null)
const closedKey = ref('')
const appliedFestivalClass = ref('')
let initialized = false

const isConsoleRoute = computed(() => route.path.startsWith('/console'))
const device = computed(() => getDeviceType(appStore.isMobile))
const festivalEnabledKey = computed(() => getEffectStorageKey(device.value, 'public', 'enabled'))
const celebrationKey = computed(() => getEffectStorageKey(device.value, 'public', `${serverDate.value}:celebration`))
const celebrationQuietKey = computed(() => getEffectStorageKey(device.value, 'public', 'celebration-quiet-until'))
const atmosphereVisible = computed(() => {
  return Boolean(
    !isConsoleRoute.value &&
    activeFestival.value?.level === 'major' &&
    isFestivalEnabled() &&
    closedKey.value !== activeFestival.value.key
  )
})
const celebrationStyle = computed(() => ({
  '--festival-accent': celebrationFestival.value?.accent || '#2563eb',
  '--festival-tint': celebrationFestival.value?.tint || '#eff6ff'
}))
const rootFestivalClass = computed(() => activeFestival.value ? `festival-${activeFestival.value.effect}` : '')

function isFestivalEnabled() {
  return localStorage.getItem(festivalEnabledKey.value) !== 'off'
}

function closeFestivalForDevice() {
  localStorage.setItem(festivalEnabledKey.value, 'off')
  closedKey.value = activeFestival.value?.key || ''
  message.success(appStore.isMobile ? '已关闭移动端节日氛围' : '已关闭 PC 端节日氛围')
}

function markCelebrationShown(key) {
  localStorage.setItem(celebrationKey.value, key)
}

function hasShownCelebration(key) {
  return localStorage.getItem(celebrationKey.value) === key
}

function addDays(dateKey, days) {
  const [year, month, day] = String(dateKey || '').split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function isCelebrationAllowed(festival) {
  if (!festival || festival.level !== 'major') return false
  const quietUntil = localStorage.getItem(celebrationQuietKey.value)
  return !quietUntil || quietUntil <= serverDate.value
}

function openCelebration(festival) {
  celebrationFestival.value = festival
  celebrationOpen.value = true
  markCelebrationShown(festival.key)
  localStorage.setItem(celebrationQuietKey.value, addDays(serverDate.value, 14))
}

async function handleCelebrationVisibleChange(visible) {
  if (!visible || !celebrationFestival.value) return
  await playFestivalConfetti(celebrationFestival.value, { isMobile: appStore.isMobile })
}

async function loadFestivalState() {
  const state = await getPublicFestivalEffectState()
  serverDate.value = state.serverDate || getTodayKeyFromServer(state.serverTime)
  activeFestival.value = getActiveFestival(serverDate.value)

  if (
    activeFestival.value?.daysUntil === 0 &&
    isFestivalEnabled() &&
    isCelebrationAllowed(activeFestival.value) &&
    !hasShownCelebration(activeFestival.value.key)
  ) {
    openCelebration(activeFestival.value)
  }
}

function applyFestivalClass(nextClass, previousClass = '') {
  if (typeof document === 'undefined') return
  const classToRemove = previousClass || appliedFestivalClass.value
  if (classToRemove && classToRemove !== nextClass) {
    document.documentElement.classList.remove(classToRemove)
    appliedFestivalClass.value = ''
  }
  if (nextClass && atmosphereVisible.value) {
    document.documentElement.classList.add(nextClass)
    appliedFestivalClass.value = nextClass
    return
  }
  if (appliedFestivalClass.value) {
    document.documentElement.classList.remove(appliedFestivalClass.value)
    appliedFestivalClass.value = ''
  }
}

async function init() {
  if (initialized || isConsoleRoute.value) return
  initialized = true
  try {
    await loadFestivalState()
  } catch (error) {
    console.warn('公开页节日氛围加载失败:', error)
  }
}

watch(() => route.path, () => {
  if (isConsoleRoute.value) {
    celebrationOpen.value = false
    applyFestivalClass('', rootFestivalClass.value)
    return
  }
  init()
})

watch(rootFestivalClass, (nextClass, previousClass) => {
  applyFestivalClass(nextClass, previousClass)
})

watch(atmosphereVisible, () => {
  applyFestivalClass(rootFestivalClass.value)
})

onMounted(init)

onUnmounted(() => {
  applyFestivalClass('', rootFestivalClass.value)
})
</script>

<style scoped>
.public-festival-celebration {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 8px 0 4px;
  color: var(--console-text, #101828);
  text-align: center;
}

.public-festival-celebration__icon {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: var(--festival-tint);
  color: var(--festival-accent);
  font-size: 34px;
}

.public-festival-celebration strong {
  color: var(--festival-accent);
  font-size: 18px;
}

.public-festival-celebration span {
  color: var(--console-text-secondary, #667085);
  font-size: 13px;
}
</style>
