<template>
  <section class="work-log-list-page">
    <BlogTable
      ref="tableRef"
      :api-fn="loadLogs"
      :columns="columns"
      :params="filterParams"
      :height="'100%'"
      :page-size="20"
      :show-column-setting="true"
      :scroll="{ x: trash ? 1040 : 1110 }"
    >
      <template #emptyText>
        <WorkJournalEmptyState
          v-if="!trash && !employments.length"
          title="还没有工作经历"
          description="先登记公司和岗位，新增日报时才能选择记录归属。"
        />
        <WorkJournalEmptyState
          v-else-if="hasActiveFilters"
          :title="trash ? '没有匹配的回收站记录' : '没有匹配的日报'"
          description="换一个关键词，或放宽工作经历、状态和日期范围。"
        />
        <WorkJournalEmptyState
          v-else-if="trash"
          title="回收站为空"
          description="移入回收站的日报会保留图片凭证，你可以在这里恢复或永久删除。"
        >
          <a-button type="primary" @click="router.push('/console/work-journal/daily')">查看日报</a-button>
        </WorkJournalEmptyState>
        <WorkJournalEmptyState
          v-else
          title="还没有日报记录"
          description="从一次工作进展开始留痕，图片凭证也可以稍后补充。"
        />
      </template>
      <template #toolbar>
        <span class="work-log-list-page__title">{{ trash ? '回收站' : '日报' }}</span>
        <WorkJournalHelpButton
          :title="trash ? '回收站' : '日报和图片凭证'"
          :intro="trash ? '回收站保存你移除的日报，直到恢复或永久删除。' : '日报是工作日记的主要记录，按工作经历和工作日期留存当日事实及凭证。'"
          :sections="trash ? trashHelpSections : dailyHelpSections"
        />
        <template v-if="employments.length">
          <a-select v-model:value="employmentId" :options="employmentOptions" class="work-log-list-page__employment" show-search option-filter-prop="label" placeholder="全部工作经历" allow-clear @change="applyFilters" />
          <a-input-search v-model:value="keyword" class="work-log-list-page__search" placeholder="搜索标题和工作内容" allow-clear @change="handleKeywordChange" @search="applyFilters" />
          <a-select v-if="!trash" v-model:value="status" class="work-log-list-page__status" show-search option-filter-prop="label" placeholder="全部状态" allow-clear @change="applyFilters">
            <a-select-option value="all">全部状态</a-select-option>
            <a-select-option value="draft">草稿</a-select-option>
            <a-select-option value="final">已定稿</a-select-option>
          </a-select>
          <a-range-picker
            v-model:value="dateRange"
            class="work-log-list-page__date-range"
            :placeholder="['开始日期', '结束日期']"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            allow-clear
            aria-label="工作日期范围"
            @change="handleDateRangeChange"
          />
          <a-button v-if="hasActiveFilters" class="work-log-list-page__reset" @click="clearFilters">重置全部</a-button>
        </template>
        <a-button v-if="!trash && employments.length" type="primary" @click="openCreate">
          <template #icon><Plus :size="15" /></template>
          新增日报
        </a-button>
        <a-button v-else-if="!trash" type="primary" @click="router.push('/console/work-journal/employments')">
          <template #icon><Plus :size="15" /></template>
          新增工作经历
        </a-button>
        <a-tooltip v-else title="刷新回收站">
          <a-button aria-label="刷新回收站" @click="tableRef?.refresh()"><template #icon><RefreshCw :size="15" /></template></a-button>
        </a-tooltip>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'entry'">
          <button class="work-log-list-page__entry" type="button" @click="openDetail(record)">
            <strong>{{ record.title }}</strong>
            <span>{{ record.summary || record.accomplishments || '暂无摘要' }}</span>
          </button>
        </template>
        <template v-else-if="column.key === 'employment'">
          <div class="work-log-list-page__cell-stack"><strong>{{ employmentName(record.employment) }}</strong><span>{{ employmentPosition(record.employment) }}</span></div>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag v-if="trash" color="orange" :bordered="false">回收站</a-tag>
          <a-tag v-else :color="record.status === 'final' ? 'green' : 'default'" :bordered="false">{{ record.status === 'final' ? '已定稿' : '草稿' }}</a-tag>
        </template>
        <template v-else-if="column.key === 'evidence'">
          <span>{{ trash ? '保留' : record.evidence.length ? `${record.evidence.length} 张图片` : '—' }}</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space size="small">
            <a-tooltip title="查看日报和图片凭证">
              <a-button type="text" size="small" aria-label="查看日报" @click="openDetail(record)"><template #icon><Eye :size="15" /></template></a-button>
            </a-tooltip>
            <a-tooltip v-if="!trash" title="编辑日报">
              <a-button type="text" size="small" aria-label="编辑日报" @click="openEdit(record)"><template #icon><PencilLine :size="15" /></template></a-button>
            </a-tooltip>
            <a-tooltip v-if="!trash" title="复制为新日报">
              <a-button type="text" size="small" aria-label="复制日报" @click="openCopy(record)"><template #icon><Copy :size="15" /></template></a-button>
            </a-tooltip>
            <a-tooltip v-if="trash" title="恢复日报">
              <a-button type="text" size="small" aria-label="恢复日报" :loading="busyId === record.id" @click="restore(record)"><template #icon><ArchiveRestore :size="15" /></template></a-button>
            </a-tooltip>
            <a-popconfirm :title="trash ? '永久删除这篇日报及其图片？此操作不可恢复。' : '将这篇日报移入回收站？图片凭证将保留。'" :ok-text="trash ? '永久删除' : '移入回收站'" cancel-text="取消" @confirm="trash ? purge(record) : remove(record)">
              <a-tooltip :title="trash ? '永久删除日报' : '移入回收站'">
                <a-button type="text" size="small" danger :aria-label="trash ? '永久删除日报' : '移入回收站'" :loading="busyId === record.id"><template #icon><Trash2 :size="15" /></template></a-button>
              </a-tooltip>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </BlogTable>

    <WorkLogEditorModal v-model:open="editorOpen" :employments="employments" :employment-id="filterParams.employmentId" :log="editingLog" :source-log="copyingLog" @saved="handleSaved" />
    <a-modal
      :open="Boolean(detailLog)"
      :title="detailLog?.title || '日报详情'"
      :width="880"
      :footer="null"
      :body-style="{ maxHeight: '70vh', overflow: 'hidden' }"
      wrap-class-name="work-journal-dialog"
      @cancel="detailLog = null"
    >
      <div v-if="detailLog" class="work-log-list-page__detail">
        <div class="work-log-list-page__detail-meta">
          <time>{{ detailLog.workDate }}</time>
          <span>{{ employmentName(detailLog.employment) }} · {{ employmentPosition(detailLog.employment) }}</span>
          <a-tag v-if="trash" color="orange" :bordered="false">回收站</a-tag>
          <a-tag v-else :color="detailLog.status === 'final' ? 'green' : 'default'" :bordered="false">{{ detailLog.status === 'final' ? '已定稿' : '草稿' }}</a-tag>
          <a-space v-if="!trash">
            <a-button size="small" @click="editFromDetail"><template #icon><PencilLine :size="14" /></template>编辑</a-button>
            <a-button size="small" @click="openCopy(detailLog)"><template #icon><Copy :size="14" /></template>复制</a-button>
            <a-button v-if="detailLog.status === 'draft'" size="small" type="primary" :loading="busyId === detailLog.id" @click="finalize">定稿</a-button>
            <a-tooltip v-if="detailLog.revisionCount" title="查看日报历史版本">
              <a-button size="small" aria-label="查看日报历史版本" @click="revisionModalOpen = true"><template #icon><History :size="14" /></template></a-button>
            </a-tooltip>
          </a-space>
        </div>
        <div class="work-log-list-page__detail-scroll">
          <p v-if="detailLog.summary" class="work-log-list-page__summary">{{ detailLog.summary }}</p>
          <template v-for="item in detailSections" :key="item.label">
            <section v-if="item.value" class="work-log-list-page__detail-section">
              <h3>{{ item.label }}</h3><p>{{ item.value }}</p>
            </section>
          </template>
          <section v-if="detailLog.contentMarkdown" class="work-log-list-page__detail-section">
            <h3>补充记录</h3><MdPreview :id="`daily-detail-${detailLog.id}`" :model-value="detailLog.contentMarkdown" :theme="appStore.isDark ? 'dark' : 'light'" preview-theme="github" code-theme="atom" />
          </section>
          <div class="work-log-list-page__timestamps"><span>创建 {{ formatDateTime(detailLog.createdAt) }}</span><span>最近修改 {{ formatDateTime(detailLog.updatedAt) }}</span><span v-if="detailLog.finalizedAt">定稿 {{ formatDateTime(detailLog.finalizedAt) }}</span></div>
          <WorkEvidenceGallery :key="detailLog.id" :log="detailLog" :readonly="trash" @changed="reloadDetail" />
        </div>
      </div>
    </a-modal>
    <WorkLogRevisionModal v-model:open="revisionModalOpen" :revisions="detailLog?.revisions || []" />
  </section>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { ArchiveRestore, Copy, Eye, History, PencilLine, Plus, RefreshCw, Trash2 } from 'lucide-vue-next'
import BlogTable from '@/components/BlogTable.vue'
import { deleteWorkLog, listEmployments, listTrashedWorkLogs, listWorkLogs, restoreWorkLog, updateWorkLog } from '@/services/workJournal'
import WorkJournalEmptyState from './WorkJournalEmptyState.vue'
import WorkEvidenceGallery from './WorkEvidenceGallery.vue'
import WorkLogEditorModal from './WorkLogEditorModal.vue'
import WorkLogRevisionModal from './WorkLogRevisionModal.vue'
import WorkJournalHelpButton from './WorkJournalHelpButton.vue'
import 'md-editor-v3/lib/preview.css'

const MdPreview = defineAsyncComponent(() => import('md-editor-v3').then((module) => module.MdPreview))
const props = defineProps({ trash: { type: Boolean, default: false } })
const appStore = useAppStore()
const route = useRoute()
const router = useRouter()
const tableRef = ref(null)
const employments = ref([])
const editorOpen = ref(false)
const editingLog = ref(null)
const copyingLog = ref(null)
const detailLog = ref(null)
const revisionModalOpen = ref(false)
const busyId = ref('')
const initialEmploymentId = typeof route.query.employmentId === 'string' ? route.query.employmentId : undefined
const initialFrom = typeof route.query.from === 'string' ? route.query.from : ''
const initialTo = typeof route.query.to === 'string' ? route.query.to : ''
const filterParams = reactive({ employmentId: initialEmploymentId || undefined, keyword: '', status: undefined, from: initialFrom, to: initialTo })
const employmentId = ref(initialEmploymentId || undefined)
const keyword = ref('')
const status = ref(undefined)
const from = ref(initialFrom)
const to = ref(initialTo)
const dateRange = ref(initialFrom || initialTo ? [initialFrom, initialTo] : [])
const employmentOptions = computed(() => employments.value.map((item) => ({ value: item.id, label: `${item.company} · ${item.position}` })))
const hasActiveFilters = computed(() => Boolean(
  employmentId.value || keyword.value.trim() || (status.value && status.value !== 'all') || from.value || to.value
))
const dailyHelpSections = [
  { heading: '记录与状态', items: ['每个工作经历每天只能有一篇日报，草稿可以持续修改。', '定稿表示当前版本已确认；之后修改会留下历史版本，可从详情查看。', '工作经历筛选会限定公司和岗位范围，关键词同时搜索标题与正文。'] },
  { heading: '复制日报', items: ['点击列表操作栏或详情中的“复制”，可沿用原日报的工作经历、标题、摘要、今日完成、阻塞与风险、后续计划和补充记录。', '复制时工作日期默认今天，可调整日期和工作经历；确认或修改内容后再保存为新日报，取消不会创建记录。', '图片凭证、定稿状态和历史版本不会复制；如果所选工作经历在目标日期已有日报（含回收站记录），请选择其他日期或编辑、恢复已有记录。'] },
  { heading: '图片凭证', items: ['支持 JPG、PNG、GIF、WEBP，每篇日报最多 20 张，单张不超过 15 MB。', '图片会登记在媒体资产的“工作日志”系统分类中，同时保留所属日报关系；工作截图不会以公开地址提供。', '从日报详情的外链图标可跳转到媒体资产统一管理分类，查看引用来源、预览或清理文件。'] }
]
const trashHelpSections = [
  { heading: '恢复与永久删除', items: ['移入回收站的日报会保留正文、历史版本和图片凭证，恢复后回到日报列表。', '永久删除会一并删除日报和图片文件，无法恢复；操作前会再次确认。', '点击操作栏中的眼睛可以只读查看回收记录与图片凭证。'] }
]
const columns = computed(() => [
  { title: '工作日期', dataIndex: 'workDate', key: 'workDate', width: 140, sorter: (a, b) => a.workDate.localeCompare(b.workDate) },
  { title: '日报内容', key: 'entry', width: 380, ellipsis: true },
  { title: '工作经历', key: 'employment', width: 190 },
  { title: '状态', key: 'status', width: 105 },
  { title: '图片凭证', key: 'evidence', width: 110 },
  { title: '操作', key: 'action', width: props.trash ? 120 : 185, fixed: 'right' }
])
const detailSections = computed(() => [
  { label: '今日完成', value: detailLog.value?.accomplishments },
  { label: '阻塞与风险', value: detailLog.value?.blockers },
  { label: '后续计划', value: detailLog.value?.nextPlan }
])

async function loadLogs(params) {
  const list = props.trash ? listTrashedWorkLogs : listWorkLogs
  return list({ ...params, ...filterParams })
}

async function loadEmployments() {
  try {
    employments.value = await listEmployments()
  } catch (error) {
    message.error(error.message || '加载工作经历失败')
  }
}

function reload() {
  filterParams.employmentId = employmentId.value || undefined
  filterParams.keyword = keyword.value.trim()
  filterParams.status = status.value === 'all' ? undefined : status.value
  filterParams.from = from.value
  filterParams.to = to.value
  return tableRef.value?.reload()
}

function applyFilters() {
  return reload()
}

function handleKeywordChange() {
  if (!keyword.value.trim()) return applyFilters()
}

function clearFilters() {
  employmentId.value = undefined
  keyword.value = ''
  status.value = undefined
  from.value = ''
  to.value = ''
  dateRange.value = []
  const query = { ...route.query }
  delete query.employmentId
  delete query.from
  delete query.to
  router.replace({ query })
  return reload()
}

function handleDateRangeChange(value = []) {
  from.value = value?.[0] || ''
  to.value = value?.[1] || ''
  return applyFilters()
}

function openCreate() {
  editingLog.value = null
  copyingLog.value = null
  editorOpen.value = true
}

function openEdit(log) {
  editingLog.value = log
  copyingLog.value = null
  editorOpen.value = true
}

/**
 * 用已有日报预填新建表单，不立即写库。
 * @param {Object} log 当前用户列表或详情中的来源日报。
 * @returns {void} 关闭详情并打开复制表单，保存时由新建接口校验日期冲突。
 */
function openCopy(log) {
  editingLog.value = null
  copyingLog.value = log
  detailLog.value = null
  editorOpen.value = true
}

function openDetail(log) {
  detailLog.value = log
}

function editFromDetail() {
  const log = detailLog.value
  detailLog.value = null
  openEdit(log)
}

async function handleSaved(log) {
  editorOpen.value = false
  await tableRef.value?.refresh()
  detailLog.value = log
}

async function reloadDetail() {
  const id = detailLog.value?.id
  await tableRef.value?.refresh()
  detailLog.value = tableRef.value?.getData().find((item) => item.id === id) || detailLog.value
}

async function finalize() {
  if (!detailLog.value) return
  busyId.value = detailLog.value.id
  try {
    detailLog.value = await updateWorkLog(detailLog.value.id, { status: 'final' })
    message.success('日报已定稿')
    await tableRef.value?.refresh()
  } catch (error) {
    message.error(error.message || '日报定稿失败')
  } finally {
    busyId.value = ''
  }
}

async function remove(log) {
  busyId.value = log.id
  try {
    await deleteWorkLog(log.id)
    message.success('日报已移入回收站，图片凭证已保留')
    if (detailLog.value?.id === log.id) detailLog.value = null
    await tableRef.value?.refresh()
  } catch (error) {
    message.error(error.message || '移入回收站失败')
  } finally {
    busyId.value = ''
  }
}

async function restore(log) {
  busyId.value = log.id
  try {
    await restoreWorkLog(log.id)
    message.success('日报已恢复')
    await tableRef.value?.refresh()
  } catch (error) {
    message.error(error.message || '恢复日报失败')
  } finally {
    busyId.value = ''
  }
}

async function purge(log) {
  busyId.value = log.id
  try {
    await deleteWorkLog(log.id, { permanent: true })
    message.success('日报及图片凭证已永久删除')
    await tableRef.value?.refresh()
  } catch (error) {
    message.error(error.message || '永久删除日报失败')
  } finally {
    busyId.value = ''
  }
}

function employmentName(id) {
  return employments.value.find((item) => item.id === id)?.company || '工作经历'
}

function employmentPosition(id) {
  return employments.value.find((item) => item.id === id)?.position || ''
}

function formatDateTime(value) {
  return value ? new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : ''
}

onMounted(loadEmployments)

watch(() => props.trash, async () => {
  if (props.trash) status.value = ''
  await loadEmployments()
  await tableRef.value?.reload()
})
</script>

<style scoped>
.work-log-list-page {
  height: var(--console-page-available-height, calc(100vh - 190px));
  min-height: 0;
  overflow: hidden;
}

.work-log-list-page :deep(.blog-table__toolbar-left) {
  gap: 8px;
  flex-wrap: wrap;
}

.work-log-list-page__employment {
  width: 188px;
  flex: 0 0 188px;
}

.work-log-list-page__search {
  width: 194px;
  flex: 0 0 194px;
}

.work-log-list-page__status {
  width: 142px;
  flex: 0 0 142px;
}

.work-log-list-page__title {
  flex: 0 0 auto;
  color: var(--console-text, #303133);
  font-weight: 600;
}

.work-log-list-page__date-range {
  width: 224px;
  flex: 0 0 224px;
}

.work-log-list-page__reset {
  flex: 0 0 auto;
}

.work-log-list-page__entry,
.work-log-list-page__cell-stack {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.work-log-list-page__entry {
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.work-log-list-page__entry strong,
.work-log-list-page__cell-stack strong {
  overflow: hidden;
  font-weight: 550;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-log-list-page__entry:hover strong {
  color: var(--console-primary, #409eff);
}

.work-log-list-page__entry span,
.work-log-list-page__cell-stack span {
  overflow: hidden;
  color: var(--console-text-secondary, #606266);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-log-list-page__detail {
  display: flex;
  max-height: calc(70vh - 40px);
  min-height: 300px;
  flex-direction: column;
}

.work-log-list-page__detail-meta {
  display: flex;
  min-height: 44px;
  flex: 0 0 auto;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--console-border, #ebeef5);
  color: var(--console-text-secondary, #606266);
  font-size: 12px;
}

.work-log-list-page__detail-scroll {
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 14px 2px 2px;
}

.work-log-list-page__summary {
  color: var(--console-text-secondary, #606266);
}

.work-log-list-page__detail-section {
  margin: 16px 0;
}

.work-log-list-page__detail-section h3 {
  margin: 0 0 8px;
  font-size: 14px;
}

.work-log-list-page__detail-section p {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.work-log-list-page__timestamps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 12px 0;
  border-top: 1px solid var(--console-border, #ebeef5);
  color: var(--console-text-secondary, #606266);
  font-size: 11px;
}

@media (max-width: 850px) {
  .work-log-list-page {
    height: var(--console-page-available-height, calc(100vh - 130px));
  }

  .work-log-list-page__employment,
  .work-log-list-page__search,
  .work-log-list-page__date-range {
    width: min(100%, 250px);
    flex-basis: min(100%, 250px);
  }

  .work-log-list-page__status {
    width: 142px;
    flex-basis: 142px;
  }

  .work-log-list-page__detail-meta {
    flex-wrap: wrap;
    padding: 8px 0;
  }
}
</style>
