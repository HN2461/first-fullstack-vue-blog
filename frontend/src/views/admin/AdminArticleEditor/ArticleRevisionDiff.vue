<template>
  <div class="revision-diff">
    <p v-if="!changes.length">两份稿件内容一致。</p>
    <div v-for="change in changes" :key="change.label" class="revision-field">
      <strong>{{ change.label }}</strong>
      <div class="revision-values">
        <section><small>{{ beforeLabel }}</small><pre>{{ change.before || '（空）' }}</pre></section>
        <section><small>{{ afterLabel }}</small><pre>{{ change.after || '（空）' }}</pre></section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  before: { type: Object, default: null },
  after: { type: Object, required: true },
  beforeLabel: { type: String, default: '已发布' },
  afterLabel: { type: String, default: '当前稿件' },
  categories: { type: Array, default: () => [] },
  tags: { type: Array, default: () => [] }
})
const names = { title: '标题', summary: '摘要', contentMarkdown: '正文', category: '分类', tags: '标签', cover: '封面', isRecommended: '推荐', resources: '附件' }
function formatValue(field, value) {
  if (field === 'category') return props.categories.find((item) => item.id === value)?.name || value || ''
  if (field === 'tags') return (value || []).map((id) => props.tags.find((item) => item.id === id)?.name || id).join('、')
  if (field === 'resources') return (value || []).map((item) => [item.name, item.url, item.description, item.kind, item.fileSize, item.mimeType, item.mediaId].filter(Boolean).join(' · ')).join('\n')
  if (field === 'isRecommended') return value ? '是' : '否'
  return String(value || '')
}
function changedLines(before, after) {
  const oldLines = before.split('\n')
  const newLines = after.split('\n')
  let start = 0
  let end = 0
  const limit = Math.min(oldLines.length, newLines.length)
  while (start < limit && oldLines[start] === newLines[start]) start++
  while (start + end < limit && oldLines[oldLines.length - end - 1] === newLines[newLines.length - end - 1]) end++
  // 只移除两端相同的行，保留多处修改之间的上下文，长文比对也只占线性内存。
  return [oldLines.slice(start, oldLines.length - end).join('\n'), newLines.slice(start, newLines.length - end).join('\n')]
}
const changes = computed(() => Object.entries(names).flatMap(([field, label]) => {
  const before = formatValue(field, props.before?.[field])
  const after = formatValue(field, props.after[field])
  if (before === after) return []
  const [oldValue, newValue] = field === 'contentMarkdown' ? changedLines(before, after) : [before, after]
  return [{ label, before: oldValue, after: newValue }]
}))
</script>

<style scoped>
.revision-field { margin: 12px 0; }
.revision-values { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.revision-values section { border: 1px solid var(--console-border, #909399); border-radius: 6px; padding: 8px; }
.revision-values pre { white-space: pre-wrap; overflow-wrap: anywhere; max-height: 30vh; overflow: auto; margin: 4px 0; }
@media (max-width: 600px) { .revision-values { grid-template-columns: 1fr; } }
</style>
