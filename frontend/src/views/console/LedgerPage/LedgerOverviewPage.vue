<template>
  <section class="ledger-overview-page">
    <LedgerDashboard :summary="summary" :group-by="groupBy" :loading="loading" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import LedgerDashboard from './LedgerDashboard.vue'
import { getLedgerSummary } from '@/services/ledger'

const props = defineProps({
  bookId: { type: String, default: '' },
  range: { type: Array, default: () => [] },
  refreshKey: { type: Number, default: 0 }
})

const loading = ref(false)
const summary = ref({})

/**
 * 根据日期跨度自动推断 groupBy：
 * - 32 天以内 → 按日
 * - 3 个月以内 → 按月
 * - 超过 3 个月 → 按月
 * - 无范围（全部）→ 按年
 */
const groupBy = computed(() => {
  const [from, to] = props.range || []
  if (!from && !to) return 'year'
  if (!from || !to) return 'month'
  const days = Math.ceil((new Date(to) - new Date(from)) / 86400000)
  if (days <= 31) return 'day'
  if (days <= 365) return 'month'
  return 'year'
})

async function loadSummary() {
  if (!props.bookId) {
    summary.value = {}
    return
  }
  loading.value = true
  try {
    const [from, to] = props.range || []
    summary.value = await getLedgerSummary({
      bookId: props.bookId,
      from: from || undefined,
      to: to || undefined,
      groupBy: groupBy.value
    })
  } catch (error) {
    message.error(error.message || '汇总数据加载失败')
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.bookId, props.range?.[0], props.range?.[1], props.refreshKey],
  loadSummary
)

onMounted(loadSummary)
</script>

<style scoped>
.ledger-overview-page {
  min-width: 0;
}
</style>
