<template>
  <section class="work-time-stats-page">
    <div class="work-time-stats-page__toolbar">
      <div class="work-time-stats-page__toolbar-left">
        <span class="work-time-stats-page__title">工时统计</span>
        <WorkJournalHelpButton title="工时统计" intro="按工作经历和自然周汇总日报中的总时长，使用考勤规则拆分正常时长与加班时长。" :sections="helpSections" />
        <a-select
          v-model:value="employmentId"
          class="work-time-stats-page__employment"
          :options="employmentOptions"
          show-search
          option-filter-prop="label"
          placeholder="选择工作经历"
          @change="reload"
        />
        <label class="work-time-stats-page__date-label">
          <span>周内日期</span>
          <a-input v-model:value="anchorDate" type="date" aria-label="选择周内日期" @change="reload" />
        </label>
        <a-button-group v-if="employmentId">
          <a-button aria-label="上一周" @click="shiftWeek(-1)">上一周</a-button>
          <a-button @click="setToday">本周</a-button>
          <a-button aria-label="下一周" @click="shiftWeek(1)">下一周</a-button>
        </a-button-group>
      </div>
      <div class="work-time-stats-page__toolbar-right">
        <a-tooltip title="前往工作经历配置考勤规则">
          <a-button v-if="employmentId" aria-label="配置考勤规则" @click="goToEmploymentConfig">
            <template #icon><Settings2 :size="15" /></template>
            配置规则
          </a-button>
        </a-tooltip>
        <a-tooltip title="刷新工时统计">
          <a-button aria-label="刷新工时统计" :loading="loading" @click="refresh"><template #icon><RefreshCw :size="15" /></template></a-button>
        </a-tooltip>
      </div>
    </div>

    <WorkJournalEmptyState
      v-if="!employments.length"
      title="还没有工作经历"
      description="先登记公司、岗位和考勤规则，再开始统计每周加班时长。"
    >
      <a-button type="primary" @click="router.push('/console/work-journal/employments')">新增工作经历</a-button>
    </WorkJournalEmptyState>

    <template v-else>
      <div v-if="summary" class="work-time-stats-page__summary" :class="{ 'is-complete': summary.remainingMinutes === 0 }">
        <div class="work-time-stats-page__summary-period">
          <span>统计周期</span>
          <strong>{{ summary.from }} 至 {{ summary.to }}</strong>
          <small>{{ summary.employment.company }} · {{ summary.employment.position }}</small>
        </div>
        <div class="work-time-stats-page__metric">
          <span>本周目标</span>
          <strong>{{ formatMinutes(summary.targetMinutes) }}</strong>
        </div>
        <div class="work-time-stats-page__metric">
          <span>合计加班</span>
          <strong>{{ formatMinutes(summary.overtimeMinutes) }}</strong>
        </div>
        <div class="work-time-stats-page__metric">
          <span>{{ summary.remainingMinutes ? '还差' : '已超出' }}</span>
          <strong>{{ formatMinutes(summary.remainingMinutes || summary.excessMinutes) }}</strong>
        </div>
        <div class="work-time-stats-page__metric">
          <span>总工作时长</span>
          <strong>{{ formatMinutes(summary.totalMinutes) }}</strong>
        </div>
        <div class="work-time-stats-page__progress">
          <div class="work-time-stats-page__progress-heading">
            <span>{{ summary.remainingMinutes ? '目标完成进度' : '本周目标已完成' }}</span>
            <strong>{{ progressPercent }}%</strong>
          </div>
          <a-progress :percent="progressPercent" :show-info="false" :status="summary.remainingMinutes ? 'active' : 'success'" />
          <small v-if="summary.draft?.overtimeMinutes">草稿暂计 {{ formatMinutes(summary.draft.overtimeMinutes) }}，已定稿 {{ formatMinutes(summary.confirmed?.overtimeMinutes || 0) }}</small>
        </div>
      </div>

      <BlogTable
        ref="tableRef"
        :api-fn="loadRows"
        :params="tableParams"
        :columns="columns"
        :height="'100%'"
        :page-size="20"
        :hide-pagination="true"
        :show-column-setting="true"
        :scroll="{ x: 960 }"
      >
        <template #emptyText>
          <WorkJournalEmptyState
            v-if="summary?.ruleConfigured === false"
            title="考勤规则尚未完整配置"
            description="请在工作经历中配置至少一段正常工作时间，历史日报才能推算加班时长。"
          >
            <a-button type="primary" @click="goToEmploymentConfig">配置考勤规则</a-button>
          </WorkJournalEmptyState>
          <WorkJournalEmptyState v-else title="本周还没有日报" description="在日报中记录工作时长后，这里会自动汇总本周正常与加班时长。" />
        </template>
        <template #toolbar>
          <span class="work-time-stats-page__table-title">每日明细</span>
          <a-tag v-if="summary" :color="summary.ruleConfigured ? 'blue' : 'default'" :bordered="false">
            {{ summary.ruleConfigured ? '按考勤规则推算' : '仅记录总时长' }}
          </a-tag>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'workDate'">
            <div class="work-time-stats-page__date-cell"><strong>{{ record.workDate }}</strong><span>{{ weekdayLabel(record.workDate) }}</span></div>
          </template>
          <template v-else-if="column.key === 'title'">
            <div class="work-time-stats-page__title-cell"><strong>{{ record.title }}</strong><span>{{ record.status === 'final' ? '已定稿' : '草稿' }}</span></div>
          </template>
          <template v-else-if="column.key === 'total'">{{ formatMinutes(record.attendance.totalMinutes) }}</template>
          <template v-else-if="column.key === 'normal'">{{ formatMinutes(record.attendance.normalMinutes) }}</template>
          <template v-else-if="column.key === 'overtime'"><a-tag :color="record.attendance.overtimeMinutes ? 'orange' : 'default'" :bordered="false">{{ formatMinutes(record.attendance.overtimeMinutes) }}</a-tag></template>
          <template v-else-if="column.key === 'source'">{{ record.attendance.source === 'rule_inferred' ? '规则推算' : '未配置规则' }}</template>
        </template>
      </BlogTable>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { RefreshCw, Settings2 } from '@lucide/vue'
import BlogTable from '@/components/BlogTable.vue'
import { getAttendanceSummary, listEmployments } from '@/services/workJournal'
import WorkJournalEmptyState from './WorkJournalEmptyState.vue'
import WorkJournalHelpButton from './WorkJournalHelpButton.vue'

const router = useRouter()
const tableRef = ref(null)
const employments = ref([])
const employmentId = ref('')
const anchorDate = ref(today())
const summary = ref(null)
const loading = ref(false)
const tableParams = reactive({ employmentId: '', date: anchorDate.value })
const employmentOptions = computed(() => employments.value.map((item) => ({ value: item.id, label: `${item.company} · ${item.position}` })))
const progressPercent = computed(() => {
  if (!summary.value?.targetMinutes) return summary.value?.overtimeMinutes ? 100 : 0
  return Math.min(100, Math.round((summary.value.overtimeMinutes / summary.value.targetMinutes) * 100))
})
const helpSections = [
  { heading: '统计口径', items: ['统计按周一至周日汇总，目标来自当前工作经历的考勤规则。', '历史日报只有总时长时，系统按正常工作段推算加班时长，并在明细中标记为规则推算。', '没有完整正常工作时间时只显示总时长，不会猜测加班时长。'] },
  { heading: '规则调整', items: ['工作经历中的考勤规则会作为日报统计的默认规则；修改规则后，历史统计会按新规则重新计算。', '周末是否计入统计由工作经历的工作日配置决定。'] }
]
const columns = [
  { title: '工作日期', key: 'workDate', width: 150 },
  { title: '日报', key: 'title', width: 300, ellipsis: true },
  { title: '总时长', key: 'total', width: 130 },
  { title: '正常时长', key: 'normal', width: 130 },
  { title: '加班时长', key: 'overtime', width: 140 },
  { title: '计算方式', key: 'source', width: 130 }
]

function today() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function formatMinutes(value) {
  const minutes = Math.max(0, Math.round(Number(value) || 0))
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (!hours) return `${remainder} 分钟`
  if (!remainder) return `${hours} 小时`
  return `${hours} 小时 ${remainder} 分钟`
}

function weekdayLabel(value) {
  const date = new Date(`${value}T00:00:00.000Z`)
  return ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getUTCDay()] || ''
}

function shiftDate(value, days) {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function shiftWeek(offset) {
  anchorDate.value = shiftDate(anchorDate.value, offset * 7)
  reload()
}

function setToday() {
  anchorDate.value = today()
  reload()
}

function goToEmploymentConfig() {
  router.push({ path: '/console/work-journal/employments', query: { employmentId: employmentId.value } })
}

async function loadRows(params = {}) {
  tableParams.employmentId = employmentId.value
  tableParams.date = anchorDate.value
  if (!employmentId.value) {
    summary.value = null
    return { items: [], total: 0, page: 1, pageSize: params.pageSize || 20 }
  }
  loading.value = true
  try {
    summary.value = await getAttendanceSummary({ employmentId: employmentId.value, date: anchorDate.value })
    const items = summary.value.items || []
    return { items, total: items.length, page: 1, pageSize: items.length || 20 }
  } catch (error) {
    summary.value = null
    message.error(error.message || '加载工时统计失败')
    return { items: [], total: 0, page: 1, pageSize: params.pageSize || 20 }
  } finally {
    loading.value = false
  }
}

function reload() {
  return tableRef.value?.reload()
}

function refresh() {
  return tableRef.value?.refresh()
}

async function loadEmployments() {
  try {
    employments.value = await listEmployments()
    if (!employmentId.value && employments.value.length) employmentId.value = employments.value[0].id
    await reload()
  } catch (error) {
    message.error(error.message || '加载工作经历失败')
  }
}

onMounted(loadEmployments)
</script>

<style scoped>
.work-time-stats-page {
  display: flex;
  height: var(--console-page-available-height, calc(100vh - 190px));
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.work-time-stats-page__toolbar {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 16px;
  border: 1px solid var(--console-border, #f0f0f0);
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  background: var(--console-surface, #fff);
}

.work-time-stats-page__toolbar-left,
.work-time-stats-page__toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.work-time-stats-page__toolbar-left { min-width: 0; flex: 1; }
.work-time-stats-page__toolbar-right { flex: 0 0 auto; }
.work-time-stats-page__title,
.work-time-stats-page__table-title { color: var(--console-text, #303133); font-weight: 600; }
.work-time-stats-page__employment { width: 220px; }
.work-time-stats-page__date-label { display: inline-flex; align-items: center; gap: 6px; color: var(--console-text-secondary, #606266); font-size: 12px; }
.work-time-stats-page__date-label input { width: 142px; }

.work-time-stats-page__summary {
  display: grid;
  grid-template-columns: minmax(220px, 1.5fr) repeat(4, minmax(130px, 1fr));
  flex: 0 0 auto;
  gap: 1px;
  margin-bottom: 10px;
  border: 1px solid var(--console-border, #ebeef5);
  border-radius: 0 0 8px 8px;
  background: var(--console-border, #ebeef5);
  overflow: hidden;
}

.work-time-stats-page__summary > div {
  min-height: 78px;
  padding: 14px 16px;
  background: var(--console-surface, #fff);
}

.work-time-stats-page__summary-period,
.work-time-stats-page__metric { display: grid; align-content: center; gap: 4px; }
.work-time-stats-page__summary span,
.work-time-stats-page__summary small { color: var(--console-text-secondary, #667085); font-size: 12px; }
.work-time-stats-page__summary strong { color: var(--console-text, #303133); font-size: 18px; font-weight: 600; }
.work-time-stats-page__summary-period strong { font-size: 14px; }
.work-time-stats-page__summary.is-complete .work-time-stats-page__metric:nth-last-child(2) strong { color: #389e0d; }

.work-time-stats-page__progress {
  display: grid;
  grid-column: 1 / -1;
  gap: 6px;
  padding: 10px 16px 12px !important;
}

.work-time-stats-page__progress-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
}

.work-time-stats-page__progress-heading strong {
  color: var(--console-text, #303133);
  font-size: 13px;
}

.work-time-stats-page__progress :deep(.ant-progress) {
  line-height: 1;
}

.work-time-stats-page__progress small {
  color: var(--console-text-secondary, #667085);
  font-size: 11px;
}

.work-time-stats-page > :deep(.blog-table) { min-height: 0; flex: 1 1 0; border-radius: 8px; }
.work-time-stats-page__date-cell,
.work-time-stats-page__title-cell { display: grid; min-width: 0; gap: 3px; }
.work-time-stats-page__date-cell span,
.work-time-stats-page__title-cell span { color: var(--console-text-secondary, #667085); font-size: 12px; }
.work-time-stats-page__title-cell strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

@media (max-width: 900px) {
  .work-time-stats-page { height: var(--console-page-available-height, calc(100vh - 130px)); }
  .work-time-stats-page__toolbar { flex-direction: column; align-items: stretch; }
  .work-time-stats-page__toolbar-right { justify-content: flex-end; }
  .work-time-stats-page__summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .work-time-stats-page__summary-period { grid-column: 1 / -1; }
  .work-time-stats-page__progress { grid-column: 1 / -1; }
}

@media (max-width: 560px) {
  .work-time-stats-page__employment { width: min(100%, 280px); }
  .work-time-stats-page__date-label { width: 100%; justify-content: space-between; }
  .work-time-stats-page__date-label input { flex: 1; }
  .work-time-stats-page__summary > div { padding: 12px; }
}
</style>
