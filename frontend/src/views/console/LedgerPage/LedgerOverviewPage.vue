<template>
  <section class="ledger-overview-page">
    <LedgerDashboard
      :summary="summary"
      :group-by="groupBy"
      :loading="loading"
      @update:group-by="handleGroupByChange"
    />
    <LedgerInsights
      :data="insights"
      :loading="loading"
      :book-id="bookId"
      @select-weekday="handleWeekdaySelect"
    />
    <WeekdayDetailModal
      v-model:open="weekdayModalOpen"
      :book-id="bookId"
      :weekday="weekdayModalData.weekday"
      :from="weekdayModalData.from"
      :to="weekdayModalData.to"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import LedgerDashboard from './LedgerDashboard.vue'
import LedgerInsights from './LedgerInsights.vue'
import WeekdayDetailModal from './WeekdayDetailModal.vue'
import { getLedgerInsights, getLedgerSummary } from '@/services/ledger'

const props = defineProps({
  bookId: { type: String, default: '' },
  range: { type: Array, default: () => [] },
  period: { type: String, default: 'thisMonth' },
  refreshKey: { type: Number, default: 0 }
})

const loading = ref(false)
const summary = ref({})
const insights = ref({})
const manualGroupBy = ref(null)

const weekdayModalOpen = ref(false)
const weekdayModalData = reactive({ weekday: '', from: '', to: '' })

/** 根据时间段自动推断 groupBy，也可手动覆盖 */
const groupBy = computed(() => {
  if (manualGroupBy.value) return manualGroupBy.value
  const [from, to] = props.range || []
  if (!from && !to) return 'year'
  if (!from || !to) return 'month'
  const days = Math.ceil((new Date(to) - new Date(from)) / 86400000)
  if (days <= 31) return 'day'
  if (days <= 365) return 'month'
  return 'year'
})

function handleGroupByChange(value) {
  manualGroupBy.value = value
  loadSummary()
}

function handleWeekdaySelect({ weekday, from, to }) {
  weekdayModalData.weekday = weekday
  weekdayModalData.from = from
  weekdayModalData.to = to
  weekdayModalOpen.value = true
}

async function loadSummary() {
  if (!props.bookId) {
    summary.value = {}
    insights.value = {}
    return
  }
  loading.value = true
  try {
    const [from, to] = props.range || []
    const params = {
      bookId: props.bookId,
      from: from || undefined,
      to: to || undefined
    }
    const [summaryData, insightsData] = await Promise.all([
      getLedgerSummary({ ...params, groupBy: groupBy.value }),
      getLedgerInsights(params)
    ])
    summary.value = summaryData
    insights.value = insightsData
  } catch (error) {
    message.error(error.message || '汇总数据加载失败')
  } finally {
    loading.value = false
  }
}

// 时间段变化时重置手动 groupBy
watch(() => props.period, () => {
  manualGroupBy.value = null
})

watch(
  () => [props.bookId, props.range?.[0], props.range?.[1], props.refreshKey],
  loadSummary
)

onMounted(loadSummary)
</script>

<style scoped>
.ledger-overview-page {
  min-width: 0;
  display: grid;
  gap: 12px;
}
</style>
