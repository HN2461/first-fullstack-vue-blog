<template>
  <article class="timeline-entry">
    <header class="timeline-entry__head">
      <div>
        <time class="timeline-entry__time">{{ formatDateTime(record.occurredAt) }}</time>
        <h3>{{ record.title }}</h3>
      </div>
      <div class="timeline-entry__actions">
        <span class="timeline-entry__category" :style="categoryStyle">
          <span class="timeline-entry__category-dot" />
          {{ record.category || '手动记录' }}
        </span>
        <a-tooltip title="编辑记录">
          <a-button class="timeline-entry__edit" shape="circle" size="small" @click="$emit('edit', record)">
            <template #icon><EditOutlined /></template>
          </a-button>
        </a-tooltip>
      </div>
    </header>
    <div class="timeline-entry__detail">
      <ol v-if="orderedDetailParts.length" class="timeline-entry__detail-list">
        <li v-for="part in orderedDetailParts" :key="part.key">
          <span class="timeline-entry__detail-index">{{ part.index }}</span>
          <span>{{ part.text }}</span>
        </li>
      </ol>
      <template v-else>
        <p v-for="part in plainDetailParts" :key="part.key">{{ part.text }}</p>
      </template>
    </div>
    <footer class="timeline-entry__meta">
      <span>{{ sourceText }}</span>
      <span v-if="record.legacyId">#{{ record.legacyId }}</span>
    </footer>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { EditOutlined } from '@ant-design/icons-vue'
import { getCategoryTone } from './timelineMeta'

const props = defineProps({
  record: {
    type: Object,
    required: true
  }
})

defineEmits(['edit'])

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
const orderedDetailParts = computed(() => parseOrderedDetail(props.record.detail))
const plainDetailParts = computed(() => {
  const lines = String(props.record.detail || '').split(/\n+/).map((item) => item.trim()).filter(Boolean)
  const parts = lines.length ? lines : ['-']
  return parts.map((text, index) => ({
    key: `${index}-${text.slice(0, 20)}`,
    text
  }))
})

function parseOrderedDetail(detail) {
  const text = String(detail || '').trim()
  if (!text) return []

  const matches = [...text.matchAll(/(^|[\s。；;，,])(\d+)[.、]\s*/g)]
  if (matches.length < 2) return []

  return matches.map((match, index) => {
    const start = match.index + match[0].length
    const end = matches[index + 1]?.index ?? text.length
    return {
      key: `${match[2]}-${index}`,
      index: match[2],
      text: text.slice(start, end).trim()
    }
  }).filter((item) => item.text)
}

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
