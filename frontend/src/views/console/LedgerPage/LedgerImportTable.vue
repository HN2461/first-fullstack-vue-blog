<template>
  <BlogTable
    ref="tableRef"
    class="ledger-import-table"
    size="small"
    table-layout="fixed"
    :api-fn="loadImports"
    :columns="columns"
    :params="params"
    :page-size="20"
    :page-sizes="['10', '20', '50']"
    :scroll="{ x: 1320 }"
    height="min(68vh, 600px, calc(100dvh - 180px))"
    striped
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'filename'">
        <a-tooltip :title="record.filename">
          <span class="ledger-import-table__text">{{ record.filename }}</span>
        </a-tooltip>
      </template>
      <template v-else-if="column.key === 'book'">
        <a-tooltip :title="bookName(record.bookId)">
          <span class="ledger-import-table__text">{{ bookName(record.bookId) }}</span>
        </a-tooltip>
      </template>
      <template v-else-if="column.key === 'status'">
        <a-tooltip :title="record.errorMessage || undefined">
          <a-tag :color="statusMeta(record.status).color" :bordered="false">
            {{ statusMeta(record.status).label }}
          </a-tag>
        </a-tooltip>
      </template>
      <template v-else-if="statKeys.includes(column.key)">
        <span
          class="ledger-import-table__number"
          :class="{ 'ledger-import-table__danger': ['deleted', 'errors'].includes(column.key) && record.stats?.[column.key] > 0 }"
        >{{ record.stats?.[column.key] || 0 }}</span>
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
  bookOptions: { type: Array, default: () => [] },
  refreshKey: { type: Number, default: 0 }
})

const tableRef = ref(null)
const statKeys = ['inserted', 'updated', 'deleted', 'skipped', 'errors']
const bookNames = computed(() => new Map(props.bookOptions.map((book) => [book.value, book.label])))

const columns = [
  // 固定布局必须给文件名真实列宽，避免长文件名被挤窄后连续换行撑高整行。
  { title: '文件名', key: 'filename', width: 320, fixed: 'left', ellipsis: true },
  { title: '所属账本', key: 'book', width: 180, ellipsis: true },
  { title: '状态', key: 'status', width: 96, align: 'center' },
  ...statKeys.map((key, index) => ({
    title: ['新增', '更新', '删除', '跳过', '错误'][index],
    key,
    width: 76,
    align: 'right'
  })),
  { title: '同步时间', key: 'committedAt', width: 170 },
  { title: '创建时间', key: 'createdAt', width: 170 }
]

const params = computed(() => ({
  // 查看入口默认不带账本条件；保留具体账本参数供独立记录页面复用。
  bookId: props.bookId && props.bookId !== 'all' ? props.bookId : undefined
}))

function bookName(bookId) {
  return bookNames.value.get(bookId) || '账本不可用'
}

function statusMeta(status) {
  const map = {
    previewed: { label: '已预览', color: 'blue' },
    committing: { label: '同步中', color: 'processing' },
    committed: { label: '已同步', color: 'green' },
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
.ledger-import-table {
  height: min(68vh, 600px, calc(100dvh - 180px)) !important;
  min-height: 0;
}

.ledger-import-table :deep(.ant-table-thead > tr > th),
.ledger-import-table :deep(.ant-table-tbody > tr.ant-table-row > td) {
  height: 40px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 20px;
  vertical-align: middle;
  white-space: nowrap;
}

.ledger-import-table :deep(.ant-tag) {
  margin-inline-end: 0;
}

.ledger-import-table__text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ledger-import-table__number {
  color: var(--console-text);
  font-variant-numeric: tabular-nums;
}

.ledger-import-table__muted {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.ledger-import-table__danger {
  color: var(--console-danger, #f56c6c);
}

@media (max-height: 520px) and (min-width: 901px) {
  /* 矮窗口中收缩公共表格的最小滚动高度，给表头和分页保留空间。 */
  .ledger-import-table :deep(.ant-table-body) {
    height: auto !important;
    max-height: max(0px, calc(100dvh - 274px)) !important;
  }
}

@media (max-width: 900px) {
  /* 公共表格在窄屏使用自然高度，这里仅约束弹窗工作区，保留分页和内部滚动。 */
  .ledger-import-table :deep(.blog-table__body) {
    flex: 1 1 0 !important;
    min-height: 0;
    overflow: auto !important;
    overscroll-behavior: contain;
  }
}
</style>
