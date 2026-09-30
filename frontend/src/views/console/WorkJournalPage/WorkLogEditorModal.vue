<template>
  <a-modal
    :open="open"
    :title="`${log?.id ? '编辑日报' : '新增日报'} · ${employment?.company || ''}`"
    :width="820"
    :confirm-loading="saving"
    :body-style="{ maxHeight: '70vh', overflow: 'hidden' }"
    wrap-class-name="work-journal-dialog"
    ok-text="保存草稿"
    cancel-text="取消"
    @ok="save('draft')"
    @cancel="close"
  >
    <div class="work-log-editor">
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" class="work-log-editor__form">
        <div class="work-log-editor__section-title">基础信息</div>
        <div class="work-log-editor__meta">
          <a-form-item label="工作经历" name="employmentId" required>
            <a-select v-model:value="form.employmentId" :options="employmentOptions" show-search option-filter-prop="label" placeholder="选择公司与岗位" :disabled="Boolean(log?.id)" />
          </a-form-item>
          <a-form-item label="工作日期" name="workDate" required>
            <a-date-picker v-model:value="form.workDate" value-format="YYYY-MM-DD" format="YYYY-MM-DD" placeholder="选择工作日期" :disabled="Boolean(log?.id)" />
          </a-form-item>
        </div>
        <a-form-item label="日报标题" name="title" required>
          <a-input v-model:value.trim="form.title" :maxlength="160" placeholder="例如：完成订单列表筛选与联调" />
        </a-form-item>
        <a-form-item label="今日摘要">
          <a-textarea v-model:value="form.summary" :maxlength="500" show-count :auto-size="{ minRows: 2, maxRows: 4 }" placeholder="用一到两句话概括今天的主要进展" />
        </a-form-item>

        <div class="work-log-editor__section-title">工作记录</div>
        <a-form-item label="今日完成">
          <a-textarea v-model:value="form.accomplishments" :maxlength="10000" :auto-size="{ minRows: 3, maxRows: 7 }" placeholder="记录完成事项、交付结果和相关沟通" />
        </a-form-item>
        <div class="work-log-editor__grid">
          <a-form-item label="阻塞与风险">
            <a-textarea v-model:value="form.blockers" :maxlength="5000" :auto-size="{ minRows: 3, maxRows: 6 }" placeholder="依赖、待确认问题或风险；没有可留空" />
          </a-form-item>
          <a-form-item label="后续计划">
            <a-textarea v-model:value="form.nextPlan" :maxlength="5000" :auto-size="{ minRows: 3, maxRows: 6 }" placeholder="下一步行动、预期时间和依赖" />
          </a-form-item>
        </div>
        <a-form-item label="补充记录（Markdown）">
          <MdEditor
            v-model="form.contentMarkdown"
            class="work-log-editor__markdown"
            :theme="appStore.isDark ? 'dark' : 'light'"
            language="zh-CN"
            preview-theme="github"
            code-theme="atom"
            :toolbars="markdownToolbars"
            :footers="[]"
            :show-code-row-number="true"
            :tab-width="2"
            :no-upload-img="true"
            placeholder="可补充会议纪要、任务编号、沟通经过或其他上下文"
          />
        </a-form-item>
      </a-form>

      <div class="work-log-editor__footer">
        <span>保存后默认是草稿，可在详情中确认并定稿。</span>
        <a-button type="primary" :loading="saving" :disabled="!canFinalize" @click="save('final')">
          <template #icon><CircleCheck :size="16" /></template>
          保存并定稿
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, defineAsyncComponent, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { CircleCheck } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { createWorkLog, updateWorkLog } from '@/services/workJournal'
import 'md-editor-v3/lib/style.css'
import 'md-editor-v3/lib/preview.css'

const MdEditor = defineAsyncComponent(() => import('md-editor-v3').then((module) => module.MdEditor))
const markdownToolbars = ['bold', 'italic', 'strikeThrough', '-', 'title', 'quote', 'unorderedList', 'orderedList', 'task', '-', 'codeRow', 'code', 'link', 'table', '-', 'revoke', 'next', 'fullscreen']

const props = defineProps({
  open: { type: Boolean, default: false },
  employmentId: { type: String, default: '' },
  employments: { type: Array, default: () => [] },
  log: { type: Object, default: null }
})
const emit = defineEmits(['update:open', 'saved'])
const saving = ref(false)
const formRef = ref(null)
const appStore = useAppStore()
const form = reactive(createEmptyForm())
const rules = {
  employmentId: [{ required: true, message: '请选择工作经历', trigger: 'change' }],
  workDate: [{ required: true, message: '请选择工作日期', trigger: 'change' }],
  title: [{ required: true, whitespace: true, message: '请输入日报标题', trigger: 'blur' }]
}
const employment = computed(() => props.employments.find((item) => item.id === form.employmentId) || null)
const employmentOptions = computed(() => props.employments.map((item) => ({
  value: item.id,
  label: `${item.company} · ${item.position}`
})))
const canFinalize = computed(() => Boolean(form.title.trim() && (form.summary.trim() || form.accomplishments.trim() || form.contentMarkdown.trim())))

function today() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function createEmptyForm() {
  return { employmentId: props.employmentId, workDate: today(), title: '', summary: '', accomplishments: '', blockers: '', nextPlan: '', contentMarkdown: '' }
}

function populateForm() {
  Object.assign(form, {
    employmentId: props.log?.employment || props.employmentId,
    workDate: props.log?.workDate || today(),
    title: props.log?.title || '',
    summary: props.log?.summary || '',
    accomplishments: props.log?.accomplishments || '',
    blockers: props.log?.blockers || '',
    nextPlan: props.log?.nextPlan || '',
    contentMarkdown: props.log?.contentMarkdown || ''
  })
}

async function save(status) {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  saving.value = true
  try {
    const payload = { ...form }
    let savedLog
    if (!payload.employmentId) return
    if (props.log?.id) {
      delete payload.employmentId
      delete payload.workDate
      savedLog = await updateWorkLog(props.log.id, { ...payload, status })
    } else {
      savedLog = await createWorkLog({ ...payload, status })
    }
    message.success(status === 'final' ? '工作日记已定稿' : '工作日记草稿已保存')
    emit('saved', savedLog)
  } catch (error) {
    message.error(error.message || '保存工作日记失败')
  } finally {
    saving.value = false
  }
}

function close() {
  emit('update:open', false)
}

watch(() => [props.open, props.log], ([visible]) => {
  if (visible) populateForm()
}, { immediate: true })

</script>

<style scoped>
.work-log-editor {
  max-height: calc(70vh - 24px);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.work-log-editor > .ant-form {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 2px 8px 4px 2px;
}

.work-log-editor__section-title {
  margin: 2px 0 12px;
  color: var(--console-text, #303133);
  font-size: 13px;
  font-weight: 600;
}

.work-log-editor__meta {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(210px, 0.65fr);
  column-gap: 14px;
}

.work-log-editor :deep(.ant-form-item) {
  margin-bottom: 16px;
}

.work-log-editor :deep(.ant-select),
.work-log-editor :deep(.ant-picker),
.work-log-editor :deep(.ant-input),
.work-log-editor :deep(.ant-input-affix-wrapper) {
  width: 100%;
}

.work-log-editor :deep(.ant-form-item-label) {
  padding-bottom: 6px;
}

.work-log-editor :deep(.ant-form-item-label > label) {
  color: var(--console-text, #303133);
  font-size: 13px;
  font-weight: 500;
}

.work-log-editor__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 14px;
}

.work-log-editor__markdown {
  height: 280px;
  overflow: hidden;
  border: 1px solid var(--console-border, #e5e7eb);
  border-radius: 6px;
}

.work-log-editor__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--console-border, #e5e7eb);
}

.work-log-editor__footer > span {
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
}

@media (max-width: 640px) {
  .work-log-editor__meta,
  .work-log-editor__grid {
    grid-template-columns: 1fr;
  }

  .work-log-editor__footer {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
