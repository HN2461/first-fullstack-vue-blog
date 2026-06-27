<template>
  <a-popover
    v-model:open="open"
    trigger="click"
    placement="bottomRight"
    overlay-class-name="festival-countdown-popover"
  >
    <a-tooltip :title="tooltipTitle">
      <a-button
        class="enterprise-icon-action festival-countdown__trigger"
        type="text"
        aria-label="节日倒计时"
      >
        <template #icon><CalendarOutlined /></template>
      </a-button>
    </a-tooltip>

    <template #content>
      <section class="festival-countdown__panel" :style="panelStyle">
        <header class="festival-countdown__hero">
          <div class="festival-countdown__hero-main">
            <span class="festival-countdown__eyebrow">{{ lunarSummary || '今日节令' }}</span>
            <strong>{{ nextFestival?.name || '节日倒计时' }}</strong>
            <small>{{ nextFestivalSummary }}</small>
          </div>
          <button
            v-if="activeFestival"
            class="festival-countdown__atmosphere"
            type="button"
            @click="$emit('toggle-atmosphere')"
          >
            {{ atmosphereVisible ? '关闭氛围' : '打开氛围' }}
          </button>
        </header>

        <div v-if="nextFestival" class="festival-countdown__focus">
          <div class="festival-countdown__orbit" aria-hidden="true">
            <span>{{ nextFestival.icons?.[0] || '✨' }}</span>
          </div>
          <div class="festival-countdown__focus-copy">
            <strong>{{ nextFestival.daysUntil === 0 ? '就是今天' : `还有 ${nextFestival.daysUntil} 天` }}</strong>
            <span>{{ nextFestival.text }} · {{ formatFriendlyDate(nextFestival.date) }}</span>
            <div class="festival-countdown__progress" aria-hidden="true">
              <i :style="{ width: `${progressPercent}%` }"></i>
            </div>
          </div>
        </div>

        <div class="festival-countdown__stats">
          <span>
            <strong>{{ todayCount }}</strong>
            <small>今日</small>
          </span>
          <span>
            <strong>{{ monthCount }}</strong>
            <small>30 天内</small>
          </span>
          <span :title="majorFestivalLabel">
            <strong>{{ majorCount }}</strong>
            <small>重点节日</small>
          </span>
        </div>

        <div class="festival-countdown__view-tabs" role="tablist" aria-label="倒计时视图">
          <button
            type="button"
            :class="{ active: activeView === 'upcoming' }"
            @click="activeView = 'upcoming'"
          >
            即将到来
          </button>
          <button
            type="button"
            :class="{ active: activeView === 'history' }"
            @click="activeView = 'history'"
          >
            已度过
          </button>
        </div>

        <p class="festival-countdown__major-note">重点节日：{{ majorFestivalLabel }}</p>

        <div class="festival-countdown__filters" role="tablist" aria-label="节日类型筛选">
          <button
            v-for="filter in filters"
            :key="filter.key"
            type="button"
            :class="{ active: activeFilter === filter.key }"
            @click="activeFilter = filter.key"
          >
            {{ filter.label }}
          </button>
        </div>

        <div class="festival-countdown__list">
          <button
            v-for="item in visibleItems"
            :key="`${item.key}-${item.date}`"
            class="festival-countdown__item"
            type="button"
            @click="$emit('select', item)"
          >
            <span class="festival-countdown__icon">{{ item.icons?.[0] || '✨' }}</span>
            <span class="festival-countdown__body">
              <strong>{{ item.name }}</strong>
              <small>{{ item.source }} · {{ formatFriendlyDate(item.date) }} · {{ item.text }}</small>
            </span>
            <span class="festival-countdown__days">
              {{ formatDistance(item) }}
            </span>
          </button>
          <a-empty v-if="!visibleItems.length" description="暂无匹配节日" :image-style="{ height: '42px' }" />
        </div>
      </section>
    </template>
  </a-popover>
</template>

<script setup>
import { computed, ref } from 'vue'
import { CalendarOutlined } from '@ant-design/icons-vue'
import './FestivalCountdownPanel.css'

const props = defineProps({
  schedule: { type: Array, default: () => [] },
  history: { type: Array, default: () => [] },
  lunarSummary: { type: String, default: '' },
  activeFestival: { type: Object, default: null },
  atmosphereVisible: { type: Boolean, default: false }
})

defineEmits(['select', 'toggle-atmosphere'])

const open = ref(false)
const activeFilter = ref('all')
const activeView = ref('upcoming')
const majorFestivalLabel = '元旦、春节、中秋、国庆、生日'
const filters = [
  { key: 'all', label: '全部' },
  { key: 'lunar', label: '传统' },
  { key: 'solar', label: '公历' },
  { key: 'solar-term', label: '节气' },
  { key: 'birthday', label: '生日' }
]

const nextFestival = computed(() => props.schedule[0] || null)
const todayCount = computed(() => props.schedule.filter((item) => item.daysUntil === 0).length)
const monthCount = computed(() => props.schedule.filter((item) => item.daysUntil <= 30).length)
const majorCount = computed(() => props.schedule.filter((item) => item.level === 'major').length)
const progressPercent = computed(() => {
  const days = nextFestival.value?.daysUntil ?? 60
  return Math.max(8, Math.round((1 - Math.min(days, 60) / 60) * 100))
})
const filteredSchedule = computed(() => {
  const source = activeView.value === 'history' ? props.history : props.schedule
  if (activeFilter.value === 'all') return source
  return source.filter((item) => item.type === activeFilter.value)
})
const visibleItems = computed(() => filteredSchedule.value)
const panelStyle = computed(() => ({
  '--festival-countdown-accent': nextFestival.value?.accent || '#1677ff',
  '--festival-countdown-tint': nextFestival.value?.tint || '#eff6ff'
}))
const nextFestivalSummary = computed(() => {
  if (!nextFestival.value) return '近 10 个节日'
  if (nextFestival.value.daysUntil === 0) return `${nextFestival.value.source} · 今天`
  return `${nextFestival.value.source} · ${formatFriendlyDate(nextFestival.value.date)}`
})
const tooltipTitle = computed(() => {
  if (!nextFestival.value) return '节日倒计时'
  return nextFestival.value.daysUntil === 0
    ? `${nextFestival.value.name} · 今天`
    : `${nextFestival.value.name} · 还有 ${nextFestival.value.daysUntil} 天`
})

function formatFriendlyDate(dateKey) {
  const [year, month, day] = String(dateKey || '').split('-')
  if (!year || !month || !day) return dateKey || ''
  return `${Number(month)}月${Number(day)}日`
}

function formatDistance(item) {
  if (item.daysUntil === 0) return '今天'
  if (item.daysUntil > 0) return `${item.daysUntil}天`
  return `已过${Math.abs(item.daysUntil)}天`
}
</script>
