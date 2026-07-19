<template>
  <section class="bookmark-comparison">
    <BlogTable
      v-if="primaryId && secondaryId"
      ref="tableRef"
      :api-fn="loadComparison"
      :columns="columns"
      :params="tableParams"
      :scroll="{ x: 1180 }"
      :row-selection="rowSelection"
      :show-column-setting="true"
      column-border
      striped
      @selection-change="handleSelectionChange"
      @data-change="handleDataChange"
    >
      <template #toolbar>
        <div class="comparison-toolbar">
          <a-select
            v-model:value="primaryId"
            class="comparison-toolbar__select"
            show-search
            option-filter-prop="label"
            :options="workspaceOptions"
            placeholder="选择主书签库"
            @change="handlePrimaryChange"
          />
          <SwapRightOutlined class="comparison-toolbar__arrow" />
          <a-select
            v-model:value="secondaryId"
            class="comparison-toolbar__select"
            show-search
            option-filter-prop="label"
            :options="secondaryOptions"
            placeholder="选择对比书签库"
            @change="reloadComparison"
          />
          <a-input-search
            v-model:value="keyword"
            class="comparison-toolbar__search"
            allow-clear
            placeholder="搜索名称、URL 或目录"
            @search="applyKeyword"
            @change="handleKeywordChange"
          />
          <a-button type="primary" :disabled="!selectedIds.length" @click="openCopy(selectedIds)">
            添加到主库{{ selectedIds.length ? `（${selectedIds.length}）` : '' }}
          </a-button>
        </div>
        <div class="comparison-filters">
          <button
            v-for="item in statusOptions"
            :key="item.value"
            type="button"
            :class="['comparison-filter', { active: status === item.value }]"
            @click="changeStatus(item.value)"
          >
            {{ item.label }} <span>{{ item.count }}</span>
          </button>
        </div>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="statusMeta(record).color">{{ statusMeta(record).label }}</a-tag>
        </template>
        <template v-else-if="column.key === 'bookmark'">
          <div class="comparison-bookmark">
            <strong>{{ displayBookmark(record)?.title }}</strong>
            <a-tooltip :title="displayBookmark(record)?.url">
              <a :href="displayBookmark(record)?.url" target="_blank" rel="noreferrer">
                {{ displayBookmark(record)?.url }}
              </a>
            </a-tooltip>
          </div>
        </template>
        <template v-else-if="column.key === 'primaryPath'">
          <span :class="{ 'comparison-path--empty': !record.primary }">
            {{ record.primary?.folderPath || '—' }}
          </span>
        </template>
        <template v-else-if="column.key === 'secondaryPath'">
          <span :class="{ 'comparison-path--empty': !record.secondary }">
            {{ record.secondary?.folderPath || '—' }}
          </span>
        </template>
        <template v-else-if="column.key === 'difference'">
          <a-space :size="4" wrap>
            <a-tag v-if="record.folderDifferent">目录不同</a-tag>
            <a-tag v-if="record.titleDifferent">标题不同</a-tag>
            <span v-if="!record.folderDifferent && !record.titleDifferent">—</span>
          </a-space>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button
            v-if="record.status === 'secondary_only'"
            type="link"
            size="small"
            @click="openCopy([record.secondary.id])"
          >
            添加到主库
          </a-button>
          <span v-else class="comparison-action-muted">无需补充</span>
        </template>
      </template>
    </BlogTable>

    <a-empty v-else description="至少创建两个书签库后才能进行对比" />

    <BookmarkCopyModal
      v-model:open="copyModalOpen"
      :count="copyIds.length"
      :folders="primaryFolders"
      :target-workspace="primaryWorkspace"
      :submitting="copying"
      @submit="submitCopy"
    />
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { SwapRightOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { compareBookmarkWorkspaces, copyComparisonBookmarks, listBookmarkFolders } from '@/services/bookmark'
import BookmarkCopyModal from './BookmarkCopyModal.vue'

const props = defineProps({
  workspaces: { type: Array, default: () => [] },
  defaultPrimaryId: { type: String, default: '' }
})
const emit = defineEmits(['changed'])
const tableRef = ref(null)
const primaryId = ref('')
const secondaryId = ref('')
const keyword = ref('')
const status = ref('secondary_only')
const selectedIds = ref([])
const copyIds = ref([])
const primaryFolders = ref([])
const copyModalOpen = ref(false)
const copying = ref(false)
const stats = reactive({ total: 0, common: 0, secondaryOnly: 0, primaryOnly: 0, folderDiff: 0, titleDiff: 0, differences: 0 })
let keywordTimer = null

const columns = [
  { title: '状态', key: 'status', width: 110, fixed: 'left' },
  { title: '书签', key: 'bookmark', width: 330 },
  { title: '主库位置', key: 'primaryPath', width: 220 },
  { title: '辅库位置', key: 'secondaryPath', width: 220 },
  { title: '差异', key: 'difference', width: 150 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' }
]
const tableParams = reactive({ status: 'secondary_only', keyword: '' })
const workspaceOptions = computed(() => props.workspaces.map((item) => ({
  label: `${item.name}${item.isPrimary ? '（主）' : ''}`,
  value: item.id
})))
const secondaryOptions = computed(() => workspaceOptions.value.filter((item) => item.value !== primaryId.value))
const primaryWorkspace = computed(() => props.workspaces.find((item) => item.id === primaryId.value))
const statusOptions = computed(() => [
  { label: '辅库独有', value: 'secondary_only', count: stats.secondaryOnly },
  { label: '主库独有', value: 'primary_only', count: stats.primaryOnly },
  { label: '目录不同', value: 'folder_diff', count: stats.folderDiff },
  { label: '标题不同', value: 'title_diff', count: stats.titleDiff },
  { label: '双方都有', value: 'common', count: stats.common },
  { label: '全部差异', value: 'differences', count: stats.differences }
])
const rowSelection = computed(() => ({
  getCheckboxProps: (record) => ({ disabled: record.status !== 'secondary_only' })
}))

watch(() => [props.workspaces, props.defaultPrimaryId], initializeSelection, { immediate: true, deep: true })

function initializeSelection() {
  if (!props.workspaces.length) return
  const requested = props.defaultPrimaryId || props.workspaces.find((item) => item.isPrimary)?.id
  if (!props.workspaces.some((item) => item.id === primaryId.value)) primaryId.value = requested || props.workspaces[0].id
  if (!secondaryOptions.value.some((item) => item.value === secondaryId.value)) secondaryId.value = secondaryOptions.value[0]?.value || ''
}

async function loadComparison(params) {
  const result = await compareBookmarkWorkspaces({
    ...params,
    primaryWorkspaceId: primaryId.value,
    secondaryWorkspaceId: secondaryId.value
  })
  Object.assign(stats, result.stats || {})
  return result
}

function handleDataChange({ raw }) {
  Object.assign(stats, raw?.stats || {})
}

function handleSelectionChange(keys, rows) {
  selectedIds.value = rows.filter((row) => row.status === 'secondary_only').map((row) => row.secondary.id)
}

function handlePrimaryChange() {
  secondaryId.value = secondaryOptions.value[0]?.value || ''
  reloadComparison()
}

function changeStatus(value) {
  status.value = value
  tableParams.status = value
  selectedIds.value = []
  tableRef.value?.clearSelection?.()
  tableRef.value?.reload?.()
}

function applyKeyword() {
  tableParams.keyword = keyword.value.trim()
  tableRef.value?.reload?.()
}

function handleKeywordChange() {
  clearTimeout(keywordTimer)
  keywordTimer = setTimeout(applyKeyword, 300)
}

function reloadComparison() {
  selectedIds.value = []
  tableRef.value?.clearSelection?.()
  tableRef.value?.reload?.()
}

function displayBookmark(record) {
  return record.secondary || record.primary
}

function statusMeta(record) {
  const map = {
    secondary_only: { label: '辅库独有', color: 'orange' },
    primary_only: { label: '主库独有', color: 'blue' },
    folder_diff: { label: '目录不同', color: 'purple' },
    title_diff: { label: '标题不同', color: 'cyan' },
    common: { label: '双方都有', color: 'green' }
  }
  return map[record.status] || map.common
}

async function openCopy(ids) {
  copyIds.value = ids
  try {
    primaryFolders.value = await listBookmarkFolders(primaryId.value)
    copyModalOpen.value = true
  } catch (error) {
    message.error(error.message || '主书签库目录加载失败')
  }
}

async function submitCopy(targetFolderId) {
  copying.value = true
  try {
    const result = await copyComparisonBookmarks({
      sourceWorkspaceId: secondaryId.value,
      targetWorkspaceId: primaryId.value,
      targetFolderId,
      bookmarkIds: copyIds.value
    })
    message.success(`已添加 ${result.inserted || 0} 条，跳过 ${result.skipped || 0} 条`)
    copyModalOpen.value = false
    selectedIds.value = []
    tableRef.value?.clearSelection?.()
    await tableRef.value?.reload?.()
    emit('changed')
  } catch (error) {
    message.error(error.message || '添加到主书签库失败')
  } finally {
    copying.value = false
  }
}
</script>

<style scoped>
.bookmark-comparison {
  min-width: 0;
}

.comparison-toolbar,
.comparison-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
}

.comparison-toolbar__select {
  width: 210px;
}

.comparison-toolbar__arrow {
  color: var(--console-text-secondary);
  font-size: 18px;
}

.comparison-toolbar__search {
  width: 280px;
}

.comparison-filters {
  margin-top: 10px;
}

.comparison-filter {
  padding: 4px 10px;
  border: 1px solid var(--console-border);
  border-radius: 999px;
  color: var(--console-text-secondary);
  background: var(--console-surface);
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.comparison-filter:hover,
.comparison-filter.active {
  border-color: var(--console-primary-strong);
  color: var(--console-primary-strong);
  background: var(--console-primary-soft);
}

.comparison-filter span {
  margin-left: 4px;
  font-variant-numeric: tabular-nums;
}

.comparison-bookmark {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.comparison-bookmark strong,
.comparison-bookmark a {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comparison-bookmark a {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.comparison-path--empty,
.comparison-action-muted {
  color: var(--console-text-secondary);
}

@media (max-width: 900px) {
  .comparison-toolbar__select,
  .comparison-toolbar__search {
    width: 100%;
  }

  .comparison-toolbar__arrow {
    display: none;
  }
}
</style>
