<template>
  <BlogTable
    ref="tableRef"
    :api-fn="loadImports"
    :columns="columns"
    :params="params"
    :page-size="10"
    :page-sizes="['10', '20', '50']"
    :scroll="{ x: 900 }"
    :height="'360px'"
    striped
    column-border
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'status'">
        <a-tag :color="statusMeta(record.status).color" :bordered="false">
          {{ statusMeta(record.status).label }}
        </a-tag>
      </template>
      <template v-else-if="column.key === 'stats'">
        <div class="ledger-import-table__stats">
          <span>新增 {{ record.stats?.inserted || 0 }}</span>
          <span>更新 {{ record.stats?.updated || 0 }}</span>
          <span>跳过 {{ record.stats?.skipped || 0 }}</span>
          <span>错误 {{ record.stats?.errors || 0 }}</span>
        </div>
      </template>
      <template v-else-if="column.key === 'committedAt'">
        <span class="ledger-import-table__muted">{{ formatTime(record.committedAt) }}</span>
      </template>
      <template v-else-if="column.key === 'createdAt'">
        <span class="ledger-import-table__muted">{{ formatTime(record.createdAt) }}</span>
      </template>
    </template>
  </BlogTable>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import BlogTable from '@/components/BlogTable.vue'
import { listLedgerImports } from '@/services/ledger'
import { formatTime } from './ledgerUtils'

const props = defineProps({
  bookId: { type: String, default: '' },
  refreshKey: { type: Number, default: 0 }
})

const tableRef = ref(null)

const columns = [
  { title: '文件名', dataIndex: 'filename', key: 'filename', minWidth: 220, fixed: 'left' },
  { title: '状态', key: 'status', width: 100, align: 'center' },
  { title: '识别统计', key: 'stats', width: 280 },
  { title: '模板', dataIndex: 'templateType', key: 'templateType', width: 180 },
  { title: '合并时间', key: 'committedAt', width: 170 },
  { title: '创建时间', key: 'createdAt', width: 170 }
]

const params = computed(() => ({
  bookId: props.bookId || undefined
}))

function statusMeta(status) {
  const map = {
    previewed: { label: '已预览', color: 'blue' },
    committed: { label: '已合并', color: 'green' },
    failed: { label: '失败', color: 'red' }
  }
  return map[status] || { label: '未知', color: 'default' }
}

function loadImports(query) {
  return listLedgerImports(query)
}

function reload() {
  tableRef.value?.reload?.()
}

function refresh() {
  tableRef.value?.refresh?.()
}

watch(
  () => props.refreshKey,
  () => reload()
)

defineExpose({ reload, refresh })
</script>

<style scoped>
.ledger-import-table__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  color: var(--console-text);
  font-size: 12px;
}

.ledger-import-table__muted {
  color: var(--console-text-secondary);
  font-size: 12px;
}

@media (max-width: 760px) {
  .ledger-import-table__stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
