<template>
  <article class="timeline-entry">
    <header class="timeline-entry__head">
      <div>
        <time class="timeline-entry__time">{{ formatDateTime(record.occurredAt) }}</time>
        <h3>{{ record.title }}</h3>
      </div>
      <span class="timeline-entry__category" :style="categoryStyle">
        <span class="timeline-entry__category-dot" />
        {{ record.category || '手动记录' }}
      </span>
    </header>
    <p class="timeline-entry__detail">{{ record.detail }}</p>
    <footer class="timeline-entry__meta">
      <span>{{ sourceText }}</span>
      <span v-if="record.legacyId">#{{ record.legacyId }}</span>
    </footer>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { getCategoryTone } from './timelineMeta'

const props = defineProps({
  record: {
    type: Object,
    required: true
  }
})

const sourceMap = {
  legacy_daily: '旧站今日消息',
  legacy_history: '旧站历史消息',
  legacy_manual: '旧站手动消息',
  current_project: '当前项目记录',
  collaboration_daily: '每日协作记录',
  manual: '手动新增'
}

const categoryStyle = computed(() => {
  const tone = getCategoryTone(props.record.category || '手动记录')
  return {
    '--timeline-category-text': tone.text,
    '--timeline-category-bg': tone.bg,
    '--timeline-category-border': tone.border,
    '--timeline-category-dot': tone.dot
  }
})
const sourceText = computed(() => sourceMap[props.record.source] || '项目记录')

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
