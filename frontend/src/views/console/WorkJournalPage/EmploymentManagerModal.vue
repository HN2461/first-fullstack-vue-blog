<template>
  <a-modal
    :open="open"
    title="工作经历"
    :width="980"
    :confirm-loading="saving"
    :body-style="{ maxHeight: '76vh', overflow: 'hidden' }"
    wrap-class-name="work-journal-dialog"
    ok-text="保存经历"
    cancel-text="关闭"
    :ok-button-props="{ disabled: !form.company.trim() || !form.position.trim() || !form.startedOn }"
    @ok="save"
    @cancel="close"
  >
    <div class="employment-manager">
      <div class="employment-manager__form">
        <div class="employment-manager__heading">
          <strong>{{ editingId ? '编辑经历' : '新增经历' }}</strong>
          <a-button v-if="editingId" size="small" @click="resetForm">新建</a-button>
        </div>
        <a-form layout="vertical">
          <div class="employment-manager__section-title">基本信息</div>
          <div class="employment-manager__grid">
            <a-form-item label="公司名称" required>
              <a-input v-model:value.trim="form.company" :maxlength="120" placeholder="公司或组织名称" />
            </a-form-item>
            <a-form-item label="岗位名称" required>
              <a-input v-model:value.trim="form.position" :maxlength="120" placeholder="岗位或职务" />
            </a-form-item>
            <a-form-item label="部门">
              <a-input v-model:value.trim="form.department" :maxlength="120" placeholder="选填" />
            </a-form-item>
            <a-form-item label="入职日期" required>
              <a-input v-model:value="form.startedOn" type="date" />
            </a-form-item>
            <a-form-item label="离职日期">
              <a-input v-model:value="form.endedOn" type="date" />
            </a-form-item>
          </div>
          <div class="employment-manager__section-title">薪资与工作制度</div>
          <div class="employment-manager__grid">
            <a-form-item label="试用期工资">
              <a-input v-model:value.trim="form.probationSalary" :maxlength="80" placeholder="例如 8K、8000 元" />
            </a-form-item>
            <a-form-item label="转正后工资">
              <a-input v-model:value.trim="form.regularSalary" :maxlength="80" placeholder="例如 10K、10000 元" />
            </a-form-item>
            <a-form-item label="薪资周期">
              <a-select v-model:value="form.salaryUnit" :options="salaryUnitOptions" show-search option-filter-prop="label" allow-clear placeholder="选择薪资周期" />
            </a-form-item>
            <a-form-item label="休息制度">
              <a-select v-model:value="form.workSchedule" :options="workScheduleOptions" show-search option-filter-prop="label" allow-clear placeholder="单双休、大小周等" />
            </a-form-item>
          </div>
          <div class="employment-manager__section-title">考勤规则</div>
          <a-alert
            type="info"
            show-icon
            message="日报填写当天总工时后，系统会按这里的正常工作段推算正常时长和加班时长；修改规则后，历史统计也会按新规则重新计算。"
            class="employment-manager__attendance-tip"
          />
          <div class="employment-manager__attendance-timeline">
            <div v-for="item in attendanceTimeline" :key="item.label" class="employment-manager__attendance-step">
              <span class="employment-manager__attendance-dot" :class="`is-${item.type}`" />
              <div>
                <strong>{{ item.label }}</strong>
                <span>{{ item.range }}</span>
              </div>
            </div>
          </div>
          <div class="employment-manager__attendance-preview">
            <span>每日正常工作时长</span>
            <strong>{{ formatAttendanceMinutes(normalWorkMinutes) }}</strong>
            <span>每周加班目标</span>
            <strong>{{ formatAttendanceMinutes(form.attendanceRule.weeklyOvertimeTargetMinutes) }}</strong>
          </div>
          <div class="employment-manager__grid">
            <a-form-item label="上午工作时间">
              <div class="employment-manager__time-range">
                <a-input v-model:value="form.attendanceRule.morningStartTime" type="time" aria-label="上午工作开始时间" />
                <span>至</span>
                <a-input v-model:value="form.attendanceRule.morningEndTime" type="time" aria-label="上午工作结束时间" />
              </div>
            </a-form-item>
            <a-form-item label="中午休息时间">
              <div class="employment-manager__time-range">
                <a-input v-model:value="form.attendanceRule.lunchBreakStartTime" type="time" aria-label="中午休息开始时间" />
                <span>至</span>
                <a-input v-model:value="form.attendanceRule.lunchBreakEndTime" type="time" aria-label="中午休息结束时间" />
              </div>
            </a-form-item>
            <a-form-item label="下午工作时间">
              <div class="employment-manager__time-range">
                <a-input v-model:value="form.attendanceRule.afternoonStartTime" type="time" aria-label="下午工作开始时间" />
                <span>至</span>
                <a-input v-model:value="form.attendanceRule.afternoonEndTime" type="time" aria-label="下午工作结束时间" />
              </div>
            </a-form-item>
            <a-form-item label="晚间休息时间">
              <div class="employment-manager__time-range">
                <a-input v-model:value="form.attendanceRule.eveningBreakStartTime" type="time" aria-label="晚间休息开始时间" />
                <span>至</span>
                <a-input v-model:value="form.attendanceRule.eveningBreakEndTime" type="time" aria-label="晚间休息结束时间" />
              </div>
            </a-form-item>
            <a-form-item label="加班开始时间">
              <a-input v-model:value="form.attendanceRule.overtimeStartTime" type="time" aria-label="加班开始时间" />
            </a-form-item>
            <a-form-item label="每周加班目标（小时）">
              <a-input-number
                :value="form.attendanceRule.weeklyOvertimeTargetMinutes / 60"
                :min="0"
                :max="168"
                :step="0.5"
                :precision="1"
                @update:value="setWeeklyOvertimeTargetHours"
              />
            </a-form-item>
            <a-form-item label="纳入统计的工作日" class="employment-manager__attendance-days">
              <a-checkbox-group v-model:value="form.attendanceRule.workdays" :options="workdayOptions" />
            </a-form-item>
          </div>
          <div class="employment-manager__section-title">离职联系人</div>
          <div class="employment-manager__grid">
            <a-form-item label="联系人姓名">
              <a-input v-model:value.trim="form.departureContactName" :maxlength="80" placeholder="离职后仍可联系的同事或 HR" />
            </a-form-item>
            <a-form-item label="联系电话">
              <a-input v-model:value.trim="form.departureContactPhone" :maxlength="40" placeholder="手机号或座机" />
            </a-form-item>
            <a-form-item label="联系邮箱">
              <a-input v-model:value.trim="form.departureContactEmail" :maxlength="160" placeholder="选填" />
            </a-form-item>
          </div>
          <div class="employment-manager__section-title">工作内容与公司地址</div>
          <a-form-item label="具体工作内容">
            <a-textarea v-model:value="form.workContent" :maxlength="5000" :auto-size="{ minRows: 3, maxRows: 7 }" placeholder="记录主要负责的项目、职责、技术栈或交付内容" />
          </a-form-item>
          <a-form-item label="公司地址">
            <a-textarea v-model:value="form.companyAddress" :maxlength="300" :auto-size="{ minRows: 2, maxRows: 4 }" placeholder="填写实际办公地址，便于面试和回顾" />
          </a-form-item>
          <a-form-item label="备注">
            <a-textarea v-model:value="form.note" :maxlength="1000" :auto-size="{ minRows: 2, maxRows: 4 }" />
          </a-form-item>
        </a-form>
      </div>

    <div v-if="showList" class="employment-manager__list">
        <div class="employment-manager__list-heading">已记录经历 <span>{{ employments.length }}</span></div>
        <div v-if="employments.length" class="employment-manager__rows">
          <div v-for="item in employments" :key="item.id" class="employment-manager__row">
            <div class="employment-manager__identity">
              <strong>{{ item.company }}</strong>
              <span>{{ item.position }}<template v-if="item.department"> · {{ item.department }}</template></span>
            </div>
            <div class="employment-manager__dates">{{ item.startedOn }} 至 {{ item.endedOn || '至今' }}</div>
            <a-tooltip title="编辑工作经历">
              <a-button type="text" size="small" aria-label="编辑工作经历" @click="edit(item)">
                <template #icon><PencilLine :size="15" /></template>
              </a-button>
            </a-tooltip>
            <a-popconfirm
              title="删除这段工作经历？"
              description="关联的日报、周报、月报和图片凭证都会一并永久删除。"
              ok-text="删除经历"
              cancel-text="取消"
              @confirm="remove(item)"
            >
              <a-tooltip title="删除工作经历及所有关联记录">
                <a-button type="text" size="small" danger :aria-label="`删除 ${item.company} 工作经历`" :loading="deletingId === item.id">
                  <template #icon><Trash2 :size="15" /></template>
                </a-button>
              </a-tooltip>
            </a-popconfirm>
          </div>
        </div>
        <a-empty v-else description="暂无工作经历" :image-style="{ height: '44px' }" />
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { PencilLine, Trash2 } from '@lucide/vue'
import { createEmployment, deleteEmployment, updateEmployment } from '@/services/workJournal'
import { formatAttendanceMinutes, getNormalWorkMinutes } from '@/utils/attendance'

const props = defineProps({
  open: { type: Boolean, default: false },
  employments: { type: Array, default: () => [] },
  initialEmployment: { type: Object, default: null },
  showList: { type: Boolean, default: true }
})
const emit = defineEmits(['update:open', 'saved'])
const saving = ref(false)
const deletingId = ref('')
const editingId = ref('')
const form = reactive(createEmptyForm())
const salaryUnitOptions = ['月薪', '年薪', '时薪', '面议', '其他'].map((value) => ({ value, label: value }))
const workScheduleOptions = ['双休', '单休', '大小周', '轮班制', '不固定', '其他'].map((value) => ({ value, label: value }))
const workdayOptions = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 0, label: '周日' }
]
const normalWorkMinutes = computed(() => getNormalWorkMinutes(form.attendanceRule, form))
const attendanceTimeline = computed(() => [
  { label: '上午正常工作', range: timeRange(form.attendanceRule.morningStartTime, form.attendanceRule.morningEndTime), type: 'work' },
  { label: '午间休息', range: timeRange(form.attendanceRule.lunchBreakStartTime, form.attendanceRule.lunchBreakEndTime), type: 'break' },
  { label: '下午正常工作', range: timeRange(form.attendanceRule.afternoonStartTime, form.attendanceRule.afternoonEndTime), type: 'work' },
  { label: '晚间休息', range: timeRange(form.attendanceRule.eveningBreakStartTime, form.attendanceRule.eveningBreakEndTime), type: 'break' },
  { label: '加班起算', range: form.attendanceRule.overtimeStartTime || '未配置', type: 'overtime' }
])

function timeRange(start, end) {
  if (!start && !end) return '未配置'
  return `${start || '--:--'} 至 ${end || '--:--'}`
}

function createBlankAttendanceRule() {
  return {
    morningStartTime: '', morningEndTime: '', lunchBreakStartTime: '', lunchBreakEndTime: '',
    afternoonStartTime: '', afternoonEndTime: '', eveningBreakStartTime: '', eveningBreakEndTime: '',
    overtimeStartTime: '', weeklyOvertimeTargetMinutes: 420, workdays: [1, 2, 3, 4, 5]
  }
}

function createDefaultAttendanceRule() {
  return {
    ...createBlankAttendanceRule(),
    morningStartTime: '08:30',
    morningEndTime: '12:00',
    lunchBreakStartTime: '12:00',
    lunchBreakEndTime: '13:30',
    afternoonStartTime: '13:30',
    afternoonEndTime: '17:30',
    eveningBreakStartTime: '17:30',
    eveningBreakEndTime: '18:30',
    overtimeStartTime: '18:30'
  }
}

function createEmptyForm() {
  return {
    company: '', department: '', position: '', startedOn: '', endedOn: '',
    probationSalary: '', regularSalary: '', salaryUnit: '', workSchedule: '',
    workStartTime: '', workEndTime: '', attendanceRule: createDefaultAttendanceRule(), departureContactName: '',
    departureContactPhone: '', departureContactEmail: '', workContent: '',
    companyAddress: '', note: ''
  }
}

function resetForm() {
  editingId.value = ''
  Object.assign(form, createEmptyForm())
}

function edit(item) {
  editingId.value = item.id
  Object.assign(form, {
    company: item.company,
    department: item.department || '',
    position: item.position,
    startedOn: item.startedOn,
    endedOn: item.endedOn || '',
    probationSalary: item.probationSalary || '',
    regularSalary: item.regularSalary || '',
    salaryUnit: item.salaryUnit || '',
    workSchedule: item.workSchedule || '',
    workStartTime: item.workStartTime || '',
    workEndTime: item.workEndTime || '',
    attendanceRule: {
      ...createBlankAttendanceRule(),
      ...(item.attendanceRule || {}),
      morningStartTime: item.attendanceRule?.morningStartTime || item.workStartTime || '',
      afternoonEndTime: item.attendanceRule?.afternoonEndTime || item.workEndTime || ''
    },
    departureContactName: item.departureContactName || '',
    departureContactPhone: item.departureContactPhone || '',
    departureContactEmail: item.departureContactEmail || '',
    workContent: item.workContent || '',
    companyAddress: item.companyAddress || '',
    note: item.note || ''
  })
}

async function save() {
  if (!form.company.trim() || !form.position.trim() || !form.startedOn) return
  saving.value = true
  try {
    const payload = { ...form, attendanceRule: { ...form.attendanceRule } }
    payload.workStartTime = payload.attendanceRule.morningStartTime || ''
    payload.workEndTime = payload.attendanceRule.afternoonEndTime || ''
    if (editingId.value) await updateEmployment(editingId.value, payload)
    else await createEmployment(payload)
    message.success(editingId.value ? '工作经历已更新' : '工作经历已创建')
    resetForm()
    emit('saved')
    emit('update:open', false)
  } catch (error) {
    message.error(error.message || '保存工作经历失败')
  } finally {
    saving.value = false
  }
}

function setWeeklyOvertimeTargetHours(value) {
  form.attendanceRule.weeklyOvertimeTargetMinutes = Math.max(0, Math.round(Number(value || 0) * 60))
}

async function remove(item) {
  deletingId.value = item.id
  try {
    await deleteEmployment(item.id)
    if (editingId.value === item.id) resetForm()
    message.success('工作经历及其关联日报、汇总和凭证已删除')
    emit('saved')
  } catch (error) {
    message.error(error.message || '删除工作经历失败')
  } finally {
    deletingId.value = ''
  }
}

function close() {
  emit('update:open', false)
}

watch(() => props.open, (visible) => {
  if (!visible) return
  if (props.initialEmployment) edit(props.initialEmployment)
  else resetForm()
})
</script>

<style scoped>
.employment-manager {
  max-height: calc(68vh - 40px);
  overflow-y: auto;
  padding-right: 4px;
}

.employment-manager__form {
  padding-bottom: 4px;
}

.employment-manager__section-title {
  margin: 4px 0 12px;
  padding-top: 4px;
  border-top: 1px solid var(--console-border, #e5e7eb);
  color: var(--console-text, #303133);
  font-size: 13px;
  font-weight: 600;
}

.employment-manager__section-title:first-child {
  border-top: 0;
  padding-top: 0;
}

.employment-manager__attendance-tip {
  margin: -2px 0 16px;
}

.employment-manager__attendance-timeline {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin: -2px 0 14px;
  padding: 10px;
  border: 1px solid var(--console-border, #e5e7eb);
  border-radius: 6px;
  background: var(--console-surface-subtle, #f8fafc);
}

.employment-manager__attendance-step {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 7px;
}

.employment-manager__attendance-step > div {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.employment-manager__attendance-step strong,
.employment-manager__attendance-step span:not(.employment-manager__attendance-dot) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.employment-manager__attendance-step strong {
  color: var(--console-text, #303133);
  font-size: 12px;
}

.employment-manager__attendance-step span:not(.employment-manager__attendance-dot) {
  color: var(--console-text-secondary, #667085);
  font-size: 11px;
}

.employment-manager__attendance-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  margin-top: 4px;
  border-radius: 50%;
  background: var(--console-text-secondary, #98a2b3);
}

.employment-manager__attendance-dot.is-work { background: var(--console-primary, #409eff); }
.employment-manager__attendance-dot.is-break { background: #98a2b3; }
.employment-manager__attendance-dot.is-overtime { background: #fa8c16; }

.employment-manager__attendance-preview {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 5px 12px;
  margin: -2px 0 16px;
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
}

.employment-manager__attendance-preview strong {
  color: var(--console-text, #303133);
  font-size: 14px;
}

.employment-manager__attendance-days {
  grid-column: 1 / -1;
}

.employment-manager__attendance-days :deep(.ant-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
}

.employment-manager__heading,
.employment-manager__list-heading,
.employment-manager__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.employment-manager__heading {
  margin-bottom: 14px;
  font-size: 14px;
}

.employment-manager__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 14px;
}

.employment-manager__time-range {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.employment-manager__time-range span {
  color: var(--console-text-secondary, #667085);
}

.employment-manager__list {
  border-top: 1px solid var(--console-border, #e5e7eb);
  padding-top: 14px;
}

.employment-manager__list-heading {
  margin-bottom: 6px;
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
}

.employment-manager__list-heading span,
.employment-manager__dates,
.employment-manager__identity span {
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
}

.employment-manager__row {
  min-height: 58px;
  border-bottom: 1px solid var(--console-border, #e5e7eb);
}

.employment-manager__identity {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.employment-manager__identity strong,
.employment-manager__identity span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .employment-manager__grid {
    grid-template-columns: 1fr;
  }

  .employment-manager__dates {
    max-width: 112px;
    text-align: right;
  }

  .employment-manager__attendance-timeline {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
