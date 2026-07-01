<template>
  <FestivalAtmosphere
    :active-festival="activeFestival"
    :is-mobile="appStore.isMobile"
    :visible="atmosphereVisible"
    @close="closeFestivalForDevice"
  />

  <Teleport v-if="countdownTargetReady" to="#festival-countdown-action">
    <FestivalCountdownPanel
      v-if="schedule.length || history.length"
      :schedule="schedule"
      :history="history"
      :solar-summary="solarSummary"
      :lunar-summary="lunarSummary"
      :active-festival="activeFestival"
      :atmosphere-visible="atmosphereVisible"
      @select="openScheduleFestival"
      @toggle-atmosphere="toggleFestivalForDevice"
    />
  </Teleport>

  <a-modal
    v-model:open="celebrationOpen"
    :title="celebrationFestival?.name || '节日快乐'"
    centered
    :width="appStore.isMobile ? '92vw' : 420"
    :footer="null"
    wrap-class-name="festival-celebration-modal"
    @afterOpenChange="handleCelebrationVisibleChange"
  >
    <div v-if="celebrationFestival" class="festival-celebration" :style="celebrationStyle">
      <div class="festival-celebration__icon">
        {{ celebrationFestival.icons?.[0] || '✨' }}
      </div>
      <strong>{{ celebrationFestival.text }}</strong>
      <span>{{ celebrationFestival.source }} · {{ celebrationFestival.date }}</span>
      <div class="festival-celebration__actions">
        <a-button @click="celebrationOpen = false">关闭本次</a-button>
        <a-button v-if="celebrationFestival.type === 'birthday'" danger @click="closeBirthdayForever">
          不再提醒生日动画
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import FestivalAtmosphere from './FestivalAtmosphere.vue'
import FestivalCountdownPanel from './FestivalCountdownPanel.vue'
import { getFestivalEffectState, updateFestivalEffectState } from '@/services/http'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import {
  getActiveFestival,
  getDeviceType,
  getEffectStorageKey,
  getFestivalHistory,
  getFestivalSchedule,
  getLunarSummary,
  getSolarSummary,
  getTodayKeyFromServer
} from '@/utils/festival/festivalCalendar'
import { playBirthdayConfetti, playFestivalConfetti } from '@/utils/festival/confettiPlayer'

const appStore = useAppStore()
const authStore = useAuthStore()
const serverDate = ref('')
const activeFestival = ref(null)
const schedule = ref([])
const history = ref([])
const lunarSummary = ref('')
const solarSummary = ref('')
const celebrationOpen = ref(false)
const celebrationFestival = ref(null)
const closedKey = ref('')
const appliedFestivalClass = ref('')
const countdownTargetReady = ref(false)
let initialized = false

const device = computed(() => getDeviceType(appStore.isMobile))
const userId = computed(() => authStore.user?.id || 'guest')
const festivalEnabledKey = computed(() => getEffectStorageKey(device.value, userId.value, 'enabled'))
const celebrationKey = computed(() => getEffectStorageKey(device.value, userId.value, `${serverDate.value}:celebration`))
const atmosphereVisible = computed(() => {
  return Boolean(activeFestival.value && isFestivalEnabled() && closedKey.value !== activeFestival.value.key)
})
const celebrationStyle = computed(() => ({
  '--festival-accent': celebrationFestival.value?.accent || '#2563eb',
  '--festival-tint': celebrationFestival.value?.tint || '#eff6ff'
}))
const rootFestivalClass = computed(() => activeFestival.value ? `festival-${activeFestival.value.effect}` : '')

function isFestivalEnabled() {
  return localStorage.getItem(festivalEnabledKey.value) === 'on'
}

function closeFestivalForDevice() {
  localStorage.setItem(festivalEnabledKey.value, 'off')
  closedKey.value = activeFestival.value?.key || ''
  message.success(appStore.isMobile ? '已关闭移动端节日氛围' : '已关闭 PC 端节日氛围')
}

function openFestivalForDevice() {
  localStorage.setItem(festivalEnabledKey.value, 'on')
  closedKey.value = ''
  message.success(appStore.isMobile ? '已打开移动端节日氛围' : '已打开 PC 端节日氛围')
}

function toggleFestivalForDevice() {
  if (!activeFestival.value) return
  if (atmosphereVisible.value) {
    closeFestivalForDevice()
    return
  }
  openFestivalForDevice()
}

function markCelebrationShown(key) {
  localStorage.setItem(celebrationKey.value, key)
}

function hasShownCelebration(key) {
  return localStorage.getItem(celebrationKey.value) === key
}

function openCelebration(festival, autoMark = true) {
  if (!festival) return
  celebrationFestival.value = festival
  celebrationOpen.value = true
  if (autoMark) {
    markCelebrationShown(celebrationFestival.value.key)
  }
}

async function handleCelebrationVisibleChange(visible) {
  if (!visible || !celebrationFestival.value) return
  if (celebrationFestival.value.type === 'birthday') {
    await playBirthdayConfetti(appStore.isMobile)
    return
  }
  await playFestivalConfetti(celebrationFestival.value, { isMobile: appStore.isMobile })
}

function openScheduleFestival(item) {
  openCelebration(item, false)
}

async function closeBirthdayForever() {
  try {
    const user = await updateFestivalEffectState('close-birth-effect')
    authStore.user = { ...authStore.user, ...user }
    celebrationOpen.value = false
    message.success('已关闭生日动画提醒')
  } catch (error) {
    message.error(error.message || '关闭失败')
  }
}

async function loadFestivalState() {
  if (!authStore.isLoggedIn) return
  const state = await getFestivalEffectState()
  serverDate.value = state.serverDate || getTodayKeyFromServer(state.serverTime)
  const birthdayOptions = {
    birthday: state.birthday,
    birthdayCalendar: state.birthdayCalendar || 'solar'
  }
  activeFestival.value = getActiveFestival(serverDate.value)
  schedule.value = getFestivalSchedule(serverDate.value, 12, birthdayOptions)
  history.value = getFestivalHistory(serverDate.value, 8, birthdayOptions)
  solarSummary.value = getSolarSummary(serverDate.value)
  lunarSummary.value = getLunarSummary(serverDate.value)

  const birthdayFestival = schedule.value.find((item) => item.type === 'birthday' && item.daysUntil === 0)
  if (birthdayFestival && !state.closeBirthEffect && state.lastBirthEffectDate !== serverDate.value) {
    if (!hasShownCelebration(birthdayFestival.key)) {
      openCelebration(birthdayFestival)
      await updateFestivalEffectState('birth-shown')
    }
    return
  }

  // 控制台是工作台环境，普通节日祝福保留在顶部日历中，由用户主动打开，避免登录后反复弹窗打断操作。
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
  if (initialized || !authStore.ready || !authStore.isLoggedIn) return
  initialized = true
  try {
    await loadFestivalState()
  } catch (error) {
    console.warn('节日氛围加载失败:', error)
  }
}

watch(() => authStore.ready, init, { immediate: true })
watch(() => authStore.user?.id, () => {
  initialized = false
  init()
})

watch(rootFestivalClass, (nextClass, previousClass) => {
  applyFestivalClass(nextClass, previousClass)
})

watch(atmosphereVisible, () => {
  applyFestivalClass(rootFestivalClass.value)
})

onMounted(init)
onMounted(() => {
  countdownTargetReady.value = Boolean(document.querySelector('#festival-countdown-action'))
})

onUnmounted(() => {
  applyFestivalClass('', rootFestivalClass.value)
})
</script>

<style scoped>
.festival-celebration {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 8px 0 4px;
  color: var(--console-text);
  text-align: center;
}

.festival-celebration__icon {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: var(--festival-tint);
  color: var(--festival-accent);
  font-size: 34px;
}

.festival-celebration strong {
  color: var(--festival-accent);
  font-size: 18px;
}

.festival-celebration span {
  color: var(--console-text-secondary);
  font-size: 13px;
}

.festival-celebration__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 6px;
}
</style>

<style>
.festival-celebration-modal .ant-modal-content {
  overflow: hidden;
}
</style>
