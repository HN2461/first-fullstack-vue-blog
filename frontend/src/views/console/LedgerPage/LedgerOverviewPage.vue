<template>
  <section class="ledger-overview-page">
    <!-- 控制栏：内嵌于页面顶部，无独立边框，和仪表盘融为一体 -->
    <div class="ledger-overview-controls">
      <a-segmented v-model:value="quickRange" :options="quickRangeOptions" @change="applyQuickRange" />
      <a-select
        v-model:value="groupBy"
        class="ledger-overview-select"
        :options="groupOptions"
        show-search
        option-filter-prop="label"
        @change="loadSummary"
      />
      <span class="ledger-overview-spacer" />
      <a-space size="small" wrap>
        <a-tooltip title="管理支出和收入分类">
          <a-button size="small" @click="$emit('open-categories')">
            <template #icon><AppstoreOutlined /></template>
            分类
          </a-button>
        </a-tooltip>
        <a-tooltip title="新增自定义分类字段">
          <a-button size="small" @click="$emit('open-category-modal')">
            <template #icon><TagsOutlined /></template>
            新增分类
          </a-button>
        </a-tooltip>
        <a-tooltip title="查看历史导入批次">
          <a-button size="small" @click="importsOpen = true">
            <template #icon><HistoryOutlined /></template>
            导入记录
          </a-button>
        </a-tooltip>
        <a-button size="small" type="primary" @click="$emit('open-import')">
          <template #icon><UploadOutlined /></template>
          导入 Excel
        </a-button>
      </a-space>
    </div>

    <LedgerDashboard :summary="summary" :group-by="groupBy" :loading="loading" />

    <a-modal
      v-model:open="importsOpen"
      title="导入记录"
      :footer="null"
      width="920px"
      :body-style="{ maxHeight: '68vh', overflowY: 'auto' }"
      destroy-on-close
    >
      <LedgerImportTable :book-id="bookId" :refresh-key="refreshKey" />
    </a-modal>
  </section>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { AppstoreOutlined, HistoryOutlined, TagsOutlined, UploadOutlined } from '@ant-design/icons-vue'
import LedgerDashboard from './LedgerDashboard.vue'
import LedgerImportTable from './LedgerImportTable.vue'
import { getLedgerSummary } from '@/services/ledger'
import { QUICK_RANGE_OPTIONS, getQuickRangeDates } from './ledgerUtils'

const props = defineProps({
  bookId: { type: String, default: '' },
  range: { type: Array, default: () => [] },
  refreshKey: { type: Number, default: 0 }
})

const emit = defineEmits(['open-categories', 'open-category-modal', 'open-import'])

const loading = ref(false)
const importsOpen = ref(false)
const summary = ref({})
const groupBy = ref('month')
const quickRange = ref('year')
const localRange = ref([])

const quickRangeOptions = QUICK_RANGE_OPTIONS

const groupOptions = [
  { label: '按日看趋势', value: 'day' },
  { label: '按月看趋势', value: 'month' },
  { label: '按年看趋势', value: 'year' },
  { label: '总览', value: 'all' }
]

function formatRangeValue(range = localRange.value) {
  const [from, to] = range || []
  return [
    from ? from.format?.('YYYY-MM-DD') || from : '',
    to ? to.format?.('YYYY-MM-DD') || to : ''
  ]
}

function applyQuickRange() {
  const dates = getQuickRangeDates(quickRange.value)
  if (dates) {
    localRange.value = dates
  }
  // 根据范围自动选择合适的分组
  if (quickRange.value === 'week' || quickRange.value === 'month' || quickRange.value === 'last30') {
    groupBy.value = 'day'
  } else if (quickRange.value === 'year' || quickRange.value === 'last3m') {
    groupBy.value = 'month'
  } else if (quickRange.value === 'all') {
    groupBy.value = 'year'
  }
  loadSummary()
}

function handleRangeChange() {
  quickRange.value = 'custom'
  loadSummary()
}

async function loadSummary() {
  if (!props.bookId) {
    summary.value = {}
    return
  }
  loading.value = true
  try {
    const [from, to] = formatRangeValue()
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
  () => [props.bookId, props.refreshKey],
  loadSummary
)

watch(
  () => [props.range?.[0], props.range?.[1]],
  () => {
    if (!props.range?.[0] && !props.range?.[1]) return
    quickRange.value = 'custom'
    localRange.value = props.range.filter(Boolean)
    loadSummary()
  }
)

onMounted(() => {
  applyQuickRange()
})
</script>

<style scoped>
.ledger-overview-page {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.ledger-overview-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
  padding: 0 2px;
}

.ledger-overview-spacer {
  flex: 1;
}

.ledger-overview-select {
  width: 140px;
}

@media (max-width: 900px) {
  .ledger-overview-controls {
    gap: 6px;
  }

  .ledger-overview-select {
    width: 100%;
  }
}
</style>
