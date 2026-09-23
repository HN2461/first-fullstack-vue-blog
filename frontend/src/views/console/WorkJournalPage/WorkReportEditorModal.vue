<template>
  <a-modal
    :open="open"
    :title="report?.id ? `编辑${reportLabel}` : `${reportLabel}草稿`"
    :width="900"
    :footer="null"
    :body-style="{ maxHeight: '70vh', overflow: 'hidden' }"
    wrap-class-name="work-journal-dialog"
    @cancel="emit('update:open', false)"
  >
    <div class="work-report-editor">
      <div class="work-report-editor__meta">
        <a-form-item label="报告标题">
          <a-input v-model:value="form.title" :maxlength="160" />
        </a-form-item>
        <div class="work-report-editor__range">
          <span>{{ report?.company }}</span>
          <span>{{ report?.fromDate }} 至 {{ report?.toDate }}</span>
          <a-tag :color="form.status === 'final' ? 'green' : 'default'" :bordered="false">{{ form.status === 'final' ? '已定稿' : '草稿' }}</a-tag>
        </div>
      </div>
      <MdEditor
        v-model="form.contentMarkdown"
        class="work-report-editor__markdown"
        :theme="appStore.isDark ? 'dark' : 'light'"
        language="zh-CN"
        preview-theme="github"
        code-theme="atom"
        :toolbars="toolbars"
        :footers="[]"
        :no-upload-img="true"
      />
      <div class="work-report-editor__actions">
        <a-button :loading="saving" @click="save('draft')">保存草稿</a-button>
        <a-button type="primary" :loading="saving" :disabled="!form.contentMarkdown.trim()" @click="save(form.status === 'final' ? 'draft' : 'final')">
          {{ form.status === 'final' ? '重新打开为草稿' : '保存并定稿' }}
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, defineAsyncComponent, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useAppStore } from '@/stores/app'
import { updateWorkReport } from '@/services/workJournal'
import 'md-editor-v3/lib/style.css'

const MdEditor = defineAsyncComponent(() => import('md-editor-v3').then((module) => module.MdEditor))
const toolbars = ['bold', 'italic', '-', 'title', 'quote', 'unorderedList', 'orderedList', 'task', '-', 'code', 'link', 'table', '-', 'revoke', 'next', 'fullscreen']
const props = defineProps({
  open: { type: Boolean, default: false },
  report: { type: Object, default: null },
  period: { type: String, default: 'week' }
})
const emit = defineEmits(['update:open', 'saved'])
const appStore = useAppStore()
const saving = ref(false)
const form = reactive({ title: '', contentMarkdown: '', status: 'draft' })
const reportLabel = computed(() => props.period === 'week' ? '周报' : '月报')

watch(() => [props.open, props.report], ([visible, report]) => {
  if (!visible || !report) return
  form.title = report.title
  form.contentMarkdown = report.contentMarkdown || ''
  form.status = report.status || 'draft'
}, { immediate: true })

async function save(status) {
  if (!props.report?.id) return
  saving.value = true
  try {
    const updated = await updateWorkReport(props.report.id, { ...form, status })
    form.status = updated.status
    message.success(status === 'final' ? `${reportLabel.value}已定稿` : `${reportLabel.value}已保存`)
    emit('saved', updated)
  } catch (error) {
    message.error(error.message || `保存${reportLabel.value}失败`)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.work-report-editor {
  display: flex;
  max-height: calc(70vh - 40px);
  min-height: 400px;
  flex-direction: column;
  gap: 12px;
}

.work-report-editor__meta {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) auto;
  align-items: end;
  gap: 14px;
}

.work-report-editor__meta :deep(.ant-form-item) {
  margin-bottom: 0;
}

.work-report-editor__range {
  display: flex;
  min-height: 56px;
  align-items: center;
  gap: 10px;
  color: var(--console-text-secondary, #606266);
  font-size: 12px;
}

.work-report-editor__markdown {
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
  border: 1px solid var(--console-border, #dcdfe6);
  border-radius: 6px;
}

.work-report-editor__actions {
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--console-border, #ebeef5);
}

@media (max-width: 700px) {
  .work-report-editor__meta {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .work-report-editor__range {
    min-height: 36px;
    flex-wrap: wrap;
  }
}
</style>
