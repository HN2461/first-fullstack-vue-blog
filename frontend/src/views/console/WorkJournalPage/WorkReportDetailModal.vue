<template>
  <a-modal
    :open="open"
    :title="report?.title || `${label}详情`"
    :width="900"
    :footer="null"
    :body-style="{ maxHeight: '68vh', overflow: 'hidden' }"
    wrap-class-name="work-journal-dialog"
    @cancel="emit('update:open', false)"
  >
    <div v-if="report" class="work-report-detail">
      <div class="work-report-detail__meta">
        <span>{{ report.company }} · {{ report.position }}</span>
        <span>{{ report.fromDate }} 至 {{ report.toDate }}</span>
        <span>{{ report.sourceLogIds?.length || 0 }} 篇日报纳入生成</span>
        <a-tag :color="report.status === 'final' ? 'green' : 'default'" :bordered="false">{{ report.status === 'final' ? '已定稿' : '草稿' }}</a-tag>
      </div>
      <div class="work-report-detail__content">
        <MdPreview
          :id="`work-report-detail-${report.id}`"
          :model-value="report.contentMarkdown || ''"
          :theme="appStore.isDark ? 'dark' : 'light'"
          preview-theme="github"
          code-theme="atom"
        />
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useAppStore } from '@/stores/app'
import 'md-editor-v3/lib/preview.css'

const MdPreview = defineAsyncComponent(() => import('md-editor-v3').then((module) => module.MdPreview))
const props = defineProps({
  open: { type: Boolean, default: false },
  report: { type: Object, default: null },
  period: { type: String, default: 'week' }
})
const emit = defineEmits(['update:open'])
const appStore = useAppStore()
const label = computed(() => props.period === 'month' ? '月报' : '周报')
</script>

<style scoped>
.work-report-detail {
  display: flex;
  max-height: calc(68vh - 40px);
  min-height: 280px;
  flex-direction: column;
}

.work-report-detail__meta {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  padding: 2px 0 12px;
  border-bottom: 1px solid var(--console-border, #ebeef5);
  color: var(--console-text-secondary, #606266);
  font-size: 12px;
}

.work-report-detail__content {
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 16px 4px 4px;
}

@media (max-width: 640px) {
  .work-report-detail {
    min-height: 220px;
  }
}
</style>
