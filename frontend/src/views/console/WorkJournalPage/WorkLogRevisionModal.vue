<template>
  <a-modal
    :open="open"
    title="工作日记版本记录"
    :width="780"
    :footer="null"
    :body-style="{ maxHeight: '70vh', overflow: 'hidden' }"
    wrap-class-name="work-journal-dialog"
    @cancel="emit('update:open', false)"
  >
    <div class="work-revisions">
      <div class="work-revisions__notice">
        <History :size="16" />
        <span>记录定稿内容在重新打开或再次编辑前的快照，最多保留最近 20 版。</span>
      </div>
      <div v-if="revisions.length" class="work-revisions__list">
        <article v-for="revision in orderedRevisions" :key="`${revision.version}-${revision.capturedAt}`" class="work-revisions__item">
          <div class="work-revisions__header">
            <strong>版本 {{ revision.version }} · {{ revision.title }}</strong>
            <span>{{ formatDateTime(revision.capturedAt) }}</span>
          </div>
          <p v-if="revision.summary" class="work-revisions__summary">{{ revision.summary }}</p>
          <div v-if="revision.accomplishments" class="work-revisions__field"><span>今日完成</span><p>{{ revision.accomplishments }}</p></div>
          <div v-if="revision.blockers" class="work-revisions__field"><span>阻塞与风险</span><p>{{ revision.blockers }}</p></div>
          <div v-if="revision.nextPlan" class="work-revisions__field"><span>后续计划</span><p>{{ revision.nextPlan }}</p></div>
          <pre v-if="revision.contentMarkdown">{{ revision.contentMarkdown }}</pre>
        </article>
      </div>
      <a-empty v-else description="还没有历史版本" />
    </div>
  </a-modal>
</template>

<script setup>
import { computed } from 'vue'
import { History } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  revisions: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:open'])
const orderedRevisions = computed(() => [...props.revisions].reverse())

function formatDateTime(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}
</script>

<style scoped>
.work-revisions {
  max-height: calc(70vh - 40px);
  overflow-y: auto;
  padding: 2px 5px 2px 1px;
}

.work-revisions__notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--console-border, #e5e7eb);
  border-radius: 5px;
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
}

.work-revisions__notice :deep(svg) {
  flex: 0 0 auto;
  color: var(--console-primary, #409eff);
}

.work-revisions__item {
  padding: 15px 2px;
  border-bottom: 1px solid var(--console-border, #e5e7eb);
}

.work-revisions__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.work-revisions__header span {
  color: var(--console-text-secondary, #667085);
  font-size: 11px;
}

.work-revisions__summary {
  margin: 8px 0;
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
}

.work-revisions__field {
  display: grid;
  grid-template-columns: 75px minmax(0, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.work-revisions__field span {
  color: var(--console-text-secondary, #667085);
  font-size: 11px;
}

.work-revisions__field p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.work-revisions__item pre {
  margin: 10px 0 0;
  padding: 10px;
  background: var(--console-surface-muted, #f7f8fa);
  color: var(--console-text-secondary, #667085);
  font-family: inherit;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
