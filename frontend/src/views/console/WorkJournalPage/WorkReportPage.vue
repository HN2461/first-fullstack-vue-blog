<template>
  <section class="work-report-page">
    <BlogTable
      ref="tableRef"
      :api-fn="loadRows"
      :columns="columns"
      :params="filterParams"
      :height="'100%'"
      :page-size="20"
      :show-column-setting="true"
      :scroll="{ x: 920 }"
    >
      <template #emptyText>
        <WorkJournalEmptyState
          v-if="hasActiveFilters"
          :title="`没有匹配的${reportLabel}`"
          description="换一个关键词、工作经历或报告状态，查看其他汇总。"
        />
        <WorkJournalEmptyState
          v-else-if="!employments.length"
          title="还没有工作经历"
          description="登记公司和岗位后，即可开始记录日报并整理周期汇总。"
        />
        <WorkJournalEmptyState
          v-else
          :title="`还没有保存的${reportLabel}`"
          :description="`完善本周期日报后，即可从日报生成${reportLabel}并继续编辑。`"
        >
          <a-button type="primary" @click="goToDailyLogs">查看日报</a-button>
        </WorkJournalEmptyState>
      </template>
      <template #toolbar>
        <span class="work-report-page__title">{{ reportLabel }}</span>
        <WorkJournalHelpButton :title="reportLabel" :intro="`${reportLabel}从已保存的日报整理为独立文档，生成后可继续编辑、定稿和导出。`" :sections="helpSections" />
        <a-select
          v-model:value="employmentId"
          :options="employmentOptions"
          class="work-report-page__employment"
          show-search
          option-filter-prop="label"
          placeholder="工作经历"
          allow-clear
          @change="reload"
        />
        <a-input-search v-model:value="keyword" class="work-report-page__search" placeholder="搜索报告标题" allow-clear @change="handleKeywordChange" @search="reload" />
        <a-select v-model:value="status" class="work-report-page__status" show-search option-filter-prop="label" placeholder="全部状态" allow-clear @change="reload">
          <a-select-option value="all">全部状态</a-select-option>
          <a-select-option value="draft">草稿</a-select-option>
          <a-select-option value="final">已定稿</a-select-option>
        </a-select>
        <label v-if="employments.length" class="work-report-page__date-label">
          <span>生成日期</span>
          <a-input v-model:value="anchorDate" type="date" class="work-report-page__date" aria-label="选择汇总周期日期" />
          <a-tooltip title="选择某一天，生成其所在自然周或自然月的汇总"><a-button type="text" aria-label="查看汇总周期日期说明"><QuestionCircleOutlined /></a-button></a-tooltip>
        </label>
        <a-button v-if="hasActiveFilters" class="work-report-page__reset" @click="clearFilters">重置全部</a-button>
        <a-button v-if="employments.length" type="primary" :disabled="!employmentId" :loading="creating" @click="createReport">
          <template #icon><Plus :size="15" /></template>
          新建{{ reportLabel }}
        </a-button>
        <a-button v-else @click="router.push('/console/work-journal/employments')">新增工作经历</a-button>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'range'">
          <div class="work-report-page__range"><strong>{{ record.fromDate }} 至 {{ record.toDate }}</strong><span>{{ record.sourceLogIds.length }} 篇日报纳入生成</span></div>
        </template>
        <template v-else-if="column.key === 'employment'">
          <div class="work-report-page__range"><strong>{{ record.company }}</strong><span>{{ record.position }}</span></div>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status === 'final' ? 'green' : 'default'" :bordered="false">{{ record.status === 'final' ? '已定稿' : '草稿' }}</a-tag>
        </template>
        <template v-else-if="column.key === 'updatedAt'">{{ formatDateTime(record.updatedAt) }}</template>
        <template v-else-if="column.key === 'action'">
          <a-space size="small">
            <a-tooltip :title="`查看${reportLabel}`">
              <a-button type="text" size="small" :aria-label="`查看${reportLabel}`" @click="openDetail(record)">
                <template #icon><Eye :size="15" /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip :title="`编辑${reportLabel}`">
              <a-button type="text" size="small" :aria-label="`编辑${reportLabel}`" @click="openEditor(record)">
                <template #icon><PencilLine :size="15" /></template>
              </a-button>
            </a-tooltip>
            <a-popconfirm :title="`删除这篇${reportLabel}？此操作不可恢复。`" ok-text="删除" cancel-text="取消" @confirm="remove(record)">
              <a-tooltip :title="`删除${reportLabel}`">
                <a-button type="text" size="small" danger :aria-label="`删除${reportLabel}`" :loading="deletingId === record.id">
                  <template #icon><Trash2 :size="15" /></template>
                </a-button>
              </a-tooltip>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </BlogTable>

    <WorkReportEditorModal v-model:open="editorOpen" :period="period" :report="activeReport" @saved="handleSaved" />
    <WorkReportDetailModal v-model:open="detailOpen" :period="period" :report="detailReport" />
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { Eye, Plus, PencilLine, Trash2 } from 'lucide-vue-next'
import BlogTable from '@/components/BlogTable.vue'
import { createWorkReport, deleteWorkReport, listEmployments, listWorkReports } from '@/services/workJournal'
import WorkJournalEmptyState from './WorkJournalEmptyState.vue'
import WorkReportEditorModal from './WorkReportEditorModal.vue'
import WorkReportDetailModal from './WorkReportDetailModal.vue'
import WorkJournalHelpButton from './WorkJournalHelpButton.vue'

const props = defineProps({ period: { type: String, default: 'week' } })
const period = computed(() => props.period === 'month' ? 'month' : 'week')
const reportLabel = computed(() => period.value === 'week' ? '周报' : '月报')
const router = useRouter()
const tableRef = ref(null)
const employments = ref([])
const employmentId = ref(undefined)
const keyword = ref('')
const status = ref(undefined)
const anchorDate = ref(today())
const creating = ref(false)
const deletingId = ref('')
const editorOpen = ref(false)
const activeReport = ref(null)
const detailOpen = ref(false)
const detailReport = ref(null)
const filterParams = reactive({ period: period.value, employmentId: undefined, keyword: undefined, status: undefined })
const employmentOptions = computed(() => employments.value.map((item) => ({ value: item.id, label: `${item.company} · ${item.position}` })))
const hasActiveFilters = computed(() => Boolean(employmentId.value || keyword.value.trim() || (status.value && status.value !== 'all')))
const helpSections = computed(() => [
  { heading: '生成与编辑', items: [`先选择工作经历和日期，再生成该周或该月的${reportLabel.value}草稿。`, '系统会把周期内已保存的日报整理成初稿；生成后内容独立保存，后续修改不会反向改写日报。', '查看按钮只读浏览，编辑按钮进入 Markdown 编辑器；定稿与重新打开在编辑器内完成。'] },
  { heading: '状态和删除', items: ['草稿可以继续编辑；已定稿表示汇总当前版本已确认。', '删除仅影响这篇周期汇总，不会删除来源日报、工作经历或图片凭证。'] }
])
const columns = [
  { title: '报告标题', dataIndex: 'title', key: 'title', width: 260, ellipsis: true },
  { title: '工作经历', key: 'employment', width: 190 },
  { title: '汇总周期', key: 'range', width: 230 },
  { title: '状态', key: 'status', width: 100 },
  { title: '最近修改', key: 'updatedAt', width: 160 },
  { title: '操作', key: 'action', width: 132, fixed: 'right' }
]

function today() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
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
  filterParams.keyword = keyword.value.trim() || undefined
  filterParams.status = status.value && status.value !== 'all' ? status.value : undefined
  return tableRef.value?.reload()
}

function clearFilters() {
  employmentId.value = undefined
  keyword.value = ''
  status.value = undefined
  return reload()
}

function handleKeywordChange() {
  if (!keyword.value.trim()) return reload()
}

function goToDailyLogs() {
  const query = employmentId.value ? { employmentId: employmentId.value } : {}
  router.push({ path: '/console/work-journal/daily', query })
}

async function loadRows(params) {
  return listWorkReports({ ...params, ...filterParams, period: period.value })
}

async function createReport() {
  if (!employmentId.value) return
  creating.value = true
  try {
    activeReport.value = await createWorkReport({ employmentId: employmentId.value, period: period.value, date: anchorDate.value })
    editorOpen.value = true
    await tableRef.value?.reload()
  } catch (error) {
    message.error(error.message || `新建${reportLabel.value}失败`)
  } finally {
    creating.value = false
  }
}

function openEditor(report) {
  activeReport.value = report
  editorOpen.value = true
}

function openDetail(report) {
  detailReport.value = report
  detailOpen.value = true
}

async function handleSaved(report) {
  activeReport.value = report
  await tableRef.value?.refresh()
}

async function remove(report) {
  deletingId.value = report.id
  try {
    await deleteWorkReport(report.id)
    message.success(`${reportLabel.value}已删除`)
    await tableRef.value?.refresh()
  } catch (error) {
    message.error(error.message || `删除${reportLabel.value}失败`)
  } finally {
    deletingId.value = ''
  }
}

function formatDateTime(value) {
  return value ? new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : ''
}

onMounted(loadEmployments)

watch(period, async (value) => {
  filterParams.period = value
  await tableRef.value?.reload()
})
</script>

<style scoped>
.work-report-page {
  height: var(--console-page-available-height, calc(100vh - 190px));
  min-height: 0;
  overflow: hidden;
}

.work-report-page :deep(.ant-input-search) {
  width: 230px;
}

.work-report-page__employment {
  width: 210px;
  flex: 0 0 210px;
}

.work-report-page__title {
  flex: 0 0 auto;
  color: var(--console-text, #303133);
  font-weight: 600;
}

.work-report-page__search {
  width: 210px;
  flex: 0 0 210px;
}

.work-report-page__status {
  width: 142px;
  flex: 0 0 142px;
}

.work-report-page__date {
  width: 142px;
  flex: 0 0 142px;
}

.work-report-page__date-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--console-text-secondary, #606266);
  font-size: 12px;
}

.work-report-page__range {
  display: grid;
  gap: 3px;
}

.work-report-page__range strong {
  font-weight: 500;
}

.work-report-page__range span {
  color: var(--console-text-secondary, #606266);
  font-size: 12px;
}

@media (max-width: 800px) {
  .work-report-page {
    height: var(--console-page-available-height, calc(100vh - 130px));
  }

  .work-report-page :deep(.blog-table__toolbar-left) {
    flex-wrap: wrap;
  }

  .work-report-page__employment,
  .work-report-page__search,
  .work-report-page__date {
    width: min(100%, 240px);
    flex: 1 1 160px;
  }

  .work-report-page__date-label {
    flex: 1 1 100%;
    flex-wrap: wrap;
  }

  .work-report-page__status {
    flex: 0 0 142px;
  }
}
</style>
