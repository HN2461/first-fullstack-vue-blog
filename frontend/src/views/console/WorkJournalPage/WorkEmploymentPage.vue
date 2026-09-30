<template>
  <section class="work-employment-page">
    <BlogTable
      ref="tableRef"
      :api-fn="loadRows"
      :columns="columns"
      :height="'100%'"
      :page-size="20"
      :show-column-setting="true"
      :scroll="{ x: 1420 }"
    >
      <template #emptyText>
        <WorkJournalEmptyState
          v-if="keyword.trim()"
          title="没有匹配的工作经历"
          description="检查公司、部门或岗位关键词，也可以清除搜索后查看全部经历。"
        />
        <WorkJournalEmptyState
          v-else
          title="还没有工作经历"
          description="登记公司、岗位和任职时间后，即可将日报与汇总关联到对应经历。"
        />
      </template>
      <template #toolbar>
        <span class="work-employment-page__title">工作经历</span>
        <WorkJournalHelpButton :title="'工作经历'" :intro="'工作经历用于区分不同公司和岗位下的日报及周期汇总。'" :sections="helpSections" />
        <a-input-search v-model:value="keyword" placeholder="搜索公司、部门、岗位或地址" allow-clear @change="handleKeywordChange" @search="reload" />
        <a-button v-if="keyword.trim()" @click="clearSearch">清空关键词</a-button>
        <a-button type="primary" @click="openCreate">
          <template #icon><Plus :size="15" /></template>
          新增工作经历
        </a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'company'">
          <div class="work-employment-page__identity"><strong>{{ record.company }}</strong><span>{{ record.department || '未填写部门' }}</span></div>
        </template>
        <template v-else-if="column.key === 'period'">{{ record.startedOn }} 至 {{ record.endedOn || '至今' }}</template>
        <template v-else-if="column.key === 'salary'">{{ salarySummary(record) }}</template>
        <template v-else-if="column.key === 'schedule'">{{ scheduleSummary(record) }}</template>
        <template v-else-if="column.key === 'address'">{{ record.companyAddress || '—' }}</template>
        <template v-else-if="column.key === 'note'">{{ record.note || '—' }}</template>
        <template v-else-if="column.key === 'action'">
          <a-space size="small">
            <a-tooltip title="查看工作经历">
              <a-button type="text" size="small" aria-label="查看工作经历" @click="openDetail(record)"><template #icon><Eye :size="15" /></template></a-button>
            </a-tooltip>
            <a-tooltip title="编辑工作经历">
              <a-button type="text" size="small" aria-label="编辑工作经历" @click="openEdit(record)"><template #icon><PencilLine :size="15" /></template></a-button>
            </a-tooltip>
            <a-popconfirm
              title="删除这段工作经历？"
              description="关联日报、周报、月报和图片凭证都会一并永久删除。"
              ok-text="删除经历"
              cancel-text="取消"
              @confirm="remove(record)"
            >
              <a-tooltip title="删除经历及其所有记录">
                <a-button type="text" size="small" danger :aria-label="`删除 ${record.company} 工作经历`" :loading="deletingId === record.id"><template #icon><Trash2 :size="15" /></template></a-button>
              </a-tooltip>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </BlogTable>

    <EmploymentManagerModal
      v-model:open="editorOpen"
      :employments="employments"
      :initial-employment="editingEmployment"
      :show-list="false"
      @saved="handleSaved"
    />
    <a-modal
      :open="Boolean(detailEmployment)"
      :title="detailEmployment?.company || '工作经历详情'"
      :width="620"
      :footer="null"
      :body-style="{ maxHeight: '64vh', overflow: 'hidden' }"
      wrap-class-name="work-journal-dialog"
      @cancel="detailEmployment = null"
    >
      <dl v-if="detailEmployment" class="work-employment-page__detail">
        <div><dt>岗位</dt><dd>{{ detailEmployment.position }}</dd></div>
        <div><dt>部门</dt><dd>{{ detailEmployment.department || '未填写' }}</dd></div>
        <div><dt>任职时间</dt><dd>{{ detailEmployment.startedOn }} 至 {{ detailEmployment.endedOn || '至今' }}</dd></div>
        <div><dt>试用期工资</dt><dd>{{ detailEmployment.probationSalary || '未填写' }}</dd></div>
        <div><dt>转正后工资</dt><dd>{{ detailEmployment.regularSalary || '未填写' }}</dd></div>
        <div><dt>薪资周期</dt><dd>{{ detailEmployment.salaryUnit || '未填写' }}</dd></div>
        <div><dt>休息制度</dt><dd>{{ detailEmployment.workSchedule || '未填写' }}</dd></div>
        <div><dt>上班时间</dt><dd>{{ workTimeSummary(detailEmployment) }}</dd></div>
        <div><dt>离职联系人</dt><dd>{{ detailEmployment.departureContactName || '未填写' }}</dd></div>
        <div><dt>联系电话</dt><dd>{{ detailEmployment.departureContactPhone || '未填写' }}</dd></div>
        <div><dt>联系邮箱</dt><dd>{{ detailEmployment.departureContactEmail || '未填写' }}</dd></div>
        <div class="work-employment-page__detail-full"><dt>具体工作内容</dt><dd>{{ detailEmployment.workContent || '未填写' }}</dd></div>
        <div class="work-employment-page__detail-full"><dt>公司地址</dt><dd>{{ detailEmployment.companyAddress || '未填写' }}</dd></div>
        <div class="work-employment-page__detail-note"><dt>备注</dt><dd>{{ detailEmployment.note || '暂无备注' }}</dd></div>
      </dl>
    </a-modal>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { Eye, PencilLine, Plus, Trash2 } from 'lucide-vue-next'
import BlogTable from '@/components/BlogTable.vue'
import { deleteEmployment, listEmployments } from '@/services/workJournal'
import WorkJournalEmptyState from './WorkJournalEmptyState.vue'
import EmploymentManagerModal from './EmploymentManagerModal.vue'
import WorkJournalHelpButton from './WorkJournalHelpButton.vue'

const tableRef = ref(null)
const keyword = ref('')
const employments = ref([])
const editorOpen = ref(false)
const editingEmployment = ref(null)
const deletingId = ref('')
const detailEmployment = ref(null)
const helpSections = [
  { heading: '关联范围', items: ['每段经历代表一家公司的一个任职阶段，日报和周报/月报都会关联到对应经历。', '公司、岗位、工作条件和联系人可以编辑；修正经历信息不会改写日报内容。'] },
  { heading: '删除影响', items: ['删除经历会永久删除该经历下的日报、历史版本、周期汇总及图片资源文件，无法恢复。', '删除前请先通过日报和汇总查看关联记录，确认确实需要整组清理。'] }
]
const columns = [
  { title: '公司', key: 'company', dataIndex: 'company', width: 250 },
  { title: '岗位', key: 'position', dataIndex: 'position', width: 190 },
  { title: '任职时间', key: 'period', width: 230 },
  { title: '薪资', key: 'salary', width: 170 },
  { title: '工作制度', key: 'schedule', width: 150 },
  { title: '公司地址', key: 'address', dataIndex: 'companyAddress', width: 220, ellipsis: true },
  { title: '备注', key: 'note', dataIndex: 'note', ellipsis: true },
  { title: '操作', key: 'action', width: 128, fixed: 'right' }
]

async function loadRows(params = {}) {
  const items = await listEmployments()
  employments.value = items
  const normalizedKeyword = keyword.value.trim().toLowerCase()
  const filtered = normalizedKeyword
    ? items.filter((item) => [item.company, item.department, item.position, item.companyAddress, item.workContent, item.note].some((value) => value?.toLowerCase().includes(normalizedKeyword)))
    : items
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.max(1, Number(params.pageSize) || 20)
  return { items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length }
}

function salarySummary(item) {
  const parts = [item.probationSalary && `试用 ${item.probationSalary}`, item.regularSalary && `转正 ${item.regularSalary}`].filter(Boolean)
  if (item.salaryUnit) parts.push(item.salaryUnit)
  return parts.join(' · ') || '—'
}

function scheduleSummary(item) {
  const schedule = item.workSchedule || ''
  const time = workTimeSummary(item)
  return [schedule, time !== '未填写' && time].filter(Boolean).join(' · ') || '—'
}

function workTimeSummary(item) {
  if (!item.workStartTime && !item.workEndTime) return '未填写'
  return `${item.workStartTime || '--:--'} 至 ${item.workEndTime || '--:--'}`
}

function reload() {
  return tableRef.value?.reload()
}

function clearSearch() {
  keyword.value = ''
  return reload()
}

function handleKeywordChange() {
  if (!keyword.value.trim()) return reload()
}

function openCreate() {
  editingEmployment.value = null
  editorOpen.value = true
}

function openEdit(record) {
  editingEmployment.value = record
  editorOpen.value = true
}

function openDetail(record) {
  detailEmployment.value = record
}

async function handleSaved() {
  await reload()
}

async function remove(record) {
  deletingId.value = record.id
  try {
    await deleteEmployment(record.id)
    message.success('工作经历及其关联记录、图片凭证已删除')
    await reload()
  } catch (error) {
    message.error(error.message || '删除工作经历失败')
  } finally {
    deletingId.value = ''
  }
}

onMounted(reload)
</script>

<style scoped>
.work-employment-page {
  height: var(--console-page-available-height, calc(100vh - 190px));
  min-height: 0;
  overflow: hidden;
}

.work-employment-page :deep(.ant-input-search) {
  width: 250px;
  flex: 0 0 250px;
}

.work-employment-page :deep(.blog-table__toolbar-left) {
  gap: 8px;
}

.work-employment-page__title {
  flex: 0 0 auto;
  color: var(--console-text, #303133);
  font-weight: 600;
}

.work-employment-page__detail {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 20px;
  max-height: calc(64vh - 36px);
  overflow-y: auto;
  margin: 0;
  padding: 0 4px 0 0;
}

.work-employment-page__detail > div {
  padding: 12px 0;
  border-bottom: 1px solid var(--console-border, #ebeef5);
}

.work-employment-page__detail dt {
  margin-bottom: 5px;
  color: var(--console-text-secondary, #606266);
  font-size: 12px;
}

.work-employment-page__detail dd {
  margin: 0;
  color: var(--console-text, #303133);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.work-employment-page__detail-note {
  grid-column: 1 / -1;
}

.work-employment-page__detail-full {
  grid-column: 1 / -1;
}

.work-employment-page__identity {
  display: grid;
  gap: 4px;
}

.work-employment-page__identity span {
  color: var(--console-text-secondary, #606266);
  font-size: 12px;
}

@media (max-width: 850px) {
  .work-employment-page {
    height: var(--console-page-available-height, calc(100vh - 130px));
  }

  .work-employment-page :deep(.ant-input-search) {
    width: min(100%, 280px);
    flex-basis: min(100%, 280px);
  }

  .work-employment-page__detail {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
