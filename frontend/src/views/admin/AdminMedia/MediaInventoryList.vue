<template>
  <div class="inventory-list" :class="{ 'is-loading': loading }">
    <div class="inventory-list__head">
      <a-checkbox
        :checked="allSelectableSelected"
        :indeterminate="partiallySelected"
        :disabled="selectableItems.length === 0"
        aria-label="全选可登记资源"
        @change="emit('select-all', $event.target.checked)"
      />
      <span>资源</span>
      <span>类型</span>
      <span>大小</span>
      <span>更新时间</span>
      <span>操作</span>
    </div>

    <a-spin :spinning="loading">
      <div v-if="items.length" class="inventory-list__body">
        <article v-for="record in items" :key="record.id" class="inventory-row">
          <div class="inventory-row__select">
            <a-checkbox
              :checked="selectedKeySet.has(record.id)"
              :disabled="record.source?.type === 'avatar'"
              :aria-label="`选择 ${record.originalName}`"
              @change="emit('selection-change', { id: record.id, checked: $event.target.checked })"
            />
          </div>

          <div class="inventory-row__resource">
            <div class="inventory-row__thumb" :class="`is-${record.fileClass || 'other'}`">
              <img v-if="record.kind === 'image'" :src="record.url" :alt="record.originalName" loading="lazy">
              <span v-else>{{ getFileBadge(record) }}</span>
            </div>
            <div class="inventory-row__details">
              <div class="inventory-row__title">
                <strong>{{ record.originalName }}</strong>
                <a-tag v-if="record.suspectedTest" :bordered="false" color="red">疑似测试</a-tag>
                <a-tag :bordered="false" :color="getSourceColor(record.source?.type)">
                  {{ record.source?.label || '上传目录' }}
                </a-tag>
                <a-tag v-if="record.usage?.referenceCount > 0" :bordered="false" color="green">
                  引用 {{ record.usage.referenceCount }}
                </a-tag>
                <a-tag v-if="record.protected" :bordered="false" color="orange">清理受保护</a-tag>
              </div>
              <span class="inventory-row__path">{{ record.relativePath }}</span>
            </div>
          </div>

          <div class="inventory-row__type">
            <a-tag :bordered="false" :color="getFileClassColor(record.fileClass)">
              {{ getFileClassLabel(record.fileClass) }}
            </a-tag>
          </div>
          <span class="inventory-row__size">{{ formatFileSize(record.size) }}</span>
          <time class="inventory-row__time">{{ formatDate(record.mtime) }}</time>
          <a-button type="link" size="small" @click="emit('open-detail', record)">详情</a-button>
        </article>
      </div>
      <a-empty v-else-if="!loading" description="没有符合条件的未登记资源" :image-style="{ height: '56px' }" />
    </a-spin>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedKeys: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['selection-change', 'select-all', 'open-detail'])

const selectedKeySet = computed(() => new Set(props.selectedKeys))
const selectableItems = computed(() => props.items.filter((item) => item.source?.type !== 'avatar'))
const allSelectableSelected = computed(() => (
  selectableItems.value.length > 0 && selectableItems.value.every((item) => selectedKeySet.value.has(item.id))
))
const partiallySelected = computed(() => (
  !allSelectableSelected.value && selectableItems.value.some((item) => selectedKeySet.value.has(item.id))
))

const fileClassOptions = [
  { label: '图片', value: 'image' },
  { label: '代码', value: 'code' },
  { label: '文档', value: 'document' },
  { label: '压缩包', value: 'archive' },
  { label: '其他', value: 'other' }
]

function formatFileSize(size = 0) {
  if (size >= 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`
  }
  if (size >= 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }
  return `${size} B`
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString('zh-CN') : '-'
}

function getFileBadge(record) {
  return record.originalName?.split('.').at(-1)?.toUpperCase() || 'FILE'
}

function getFileClassLabel(value) {
  return fileClassOptions.find((item) => item.value === value)?.label || '其他'
}

function getFileClassColor(value) {
  const map = {
    image: 'blue',
    code: 'geekblue',
    document: 'green',
    archive: 'orange',
    other: 'default'
  }
  return map[value] || 'default'
}

function getSourceColor(value) {
  return ({ avatar: 'purple', media: 'blue', test: 'red', upload: 'default' })[value] || 'default'
}

</script>

<style scoped>
.inventory-list {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
}

.inventory-list__head,
.inventory-row {
  display: grid;
  grid-template-columns: 32px minmax(300px, 1fr) 72px 88px 152px 52px;
  align-items: center;
  column-gap: 12px;
}

.inventory-list__head {
  min-height: 42px;
  padding: 0 12px;
  color: var(--console-text-secondary);
  border-bottom: 1px solid var(--console-border);
  background: var(--console-surface-muted);
  font-size: 12px;
  font-weight: 600;
}

.inventory-list__body {
  max-height: min(34vh, 360px);
  overflow-y: auto;
}

.inventory-row {
  min-height: 86px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--console-border);
}

.inventory-row:last-child {
  border-bottom: 0;
}

.inventory-row:hover {
  background: var(--console-surface-hover);
}

.inventory-row__resource {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.inventory-row__thumb {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--console-border);
  border-radius: 6px;
  color: var(--console-text-secondary);
  background: var(--console-surface-muted);
  font-size: 10px;
  font-weight: 700;
}

.inventory-row__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.inventory-row__thumb.is-image {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #2563eb;
}

.inventory-row__thumb.is-code {
  border-color: #c7d2fe;
  background: #eef2ff;
  color: #4f46e5;
}

.inventory-row__thumb.is-document {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #16a34a;
}

.inventory-row__thumb.is-archive {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #ea580c;
}

.inventory-row__details {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.inventory-row__title {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.inventory-row__title strong {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  color: var(--console-text);
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inventory-row__path {
  overflow: hidden;
  color: var(--console-text-secondary);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inventory-row__type,
.inventory-row__size,
.inventory-row__time {
  color: var(--console-text);
  font-size: 13px;
  white-space: nowrap;
}

.inventory-row__time {
  color: var(--console-text-secondary);
}

@media (max-width: 767px) {
  .inventory-list {
    overflow-x: auto;
  }

  .inventory-list__head,
  .inventory-row {
    min-width: 820px;
  }
}
</style>
