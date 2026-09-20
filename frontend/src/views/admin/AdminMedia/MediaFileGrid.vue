<template>
  <div class="media-file-grid-wrap">
    <div v-if="loading" class="media-file-grid__state">
      <a-spin tip="正在加载资源" />
    </div>
    <a-empty v-else-if="items.length === 0" class="media-file-grid__state" description="当前文件夹暂无资源" />
    <div v-else class="media-file-grid" :class="{ 'is-selecting': selectedKeys.length > 0 }">
      <article
        v-for="record in items"
        :key="record.id"
        class="media-file-card"
        :class="{ 'is-selected': selectedKeys.includes(record.id) }"
      >
        <div class="media-file-card__select">
          <a-checkbox
            :checked="selectedKeys.includes(record.id)"
            :aria-label="`选择 ${record.originalName}`"
            @click.stop
            @change="toggleSelection(record)"
          />
        </div>
        <button
          type="button"
          class="media-file-card__preview"
          :aria-label="`预览 ${record.originalName}`"
          @click="emit('view', record)"
        >
          <img v-if="record.kind === 'image'" :src="record.url" :alt="record.originalName" loading="lazy">
          <span v-else class="media-file-card__badge" :class="`is-${record.fileClass || 'other'}`">
            {{ getFileBadge(record) }}
          </span>
        </button>
        <div class="media-file-card__info">
          <strong :title="record.originalName">{{ record.originalName }}</strong>
          <span>{{ formatFileSize(record.size) }} · {{ getFileClassLabel(record.fileClass) }}</span>
          <a-badge
            :status="record.usage?.referenceCount > 0 ? 'success' : 'warning'"
            :text="`${record.usage?.usageStatusLabel || '待扫描'} · ${record.usage?.referenceCount || 0}`"
          />
        </div>
        <MediaRowActions
          class="media-file-card__actions"
          @view="emit('view', record)"
          @download="emit('download', record)"
          @rename="emit('rename', record)"
          @move="emit('move', record)"
          @references="emit('references', record)"
          @delete="emit('delete', record)"
        />
      </article>
    </div>

    <div v-if="total > 0" class="media-file-grid__footer">
      <a-pagination
        v-model:current="currentPage"
        v-model:page-size="currentPageSize"
        size="small"
        :total="total"
        :page-size-options="['24', '48', '96']"
        show-size-changer
        :show-total="(value) => `共 ${value} 条`"
        @change="handlePageChange"
        @show-size-change="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import MediaRowActions from './MediaRowActions.vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 24 },
  selectedKeys: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'page-change',
  'selection-change',
  'view',
  'download',
  'rename',
  'move',
  'references',
  'delete'
])

const currentPage = ref(props.page)
const currentPageSize = ref(props.pageSize)

const selectedKeys = computed(() => props.selectedKeys.map(String))

watch(() => props.page, (value) => {
  currentPage.value = value
})

watch(() => props.pageSize, (value) => {
  currentPageSize.value = value
})

function getFileBadge(record) {
  return record.originalName?.split('.').at(-1)?.toUpperCase() || 'FILE'
}

function getFileClassLabel(fileClass) {
  return {
    image: '图片',
    code: '代码',
    document: '文档',
    archive: '压缩包',
    other: '其他'
  }[fileClass] || '其他'
}

function formatFileSize(size = 0) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  if (size >= 1024) return `${Math.ceil(size / 1024)} KB`
  return `${size} B`
}

function toggleSelection(record) {
  const next = selectedKeys.value.includes(record.id)
    ? selectedKeys.value.filter((id) => id !== record.id)
    : [...selectedKeys.value, record.id]
  const rows = props.items.filter((item) => next.includes(item.id))
  emit('selection-change', next, rows)
}

function handlePageChange(page, pageSize) {
  emit('page-change', { page, pageSize })
}

function handlePageSizeChange(page, pageSize) {
  emit('page-change', { page: 1, pageSize })
}
</script>

<style scoped>
.media-file-grid-wrap {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.media-file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
  min-height: 0;
  padding: 2px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.media-file-grid__state {
  display: grid;
  flex: 1;
  min-height: 220px;
  place-items: center;
  color: var(--console-text-secondary);
}

.media-file-card {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 234px;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.media-file-card:hover,
.media-file-card.is-selected {
  border-color: var(--console-primary-strong);
  box-shadow: 0 3px 12px rgb(15 23 42 / 7%);
}

.media-file-card__select {
  position: absolute;
  z-index: 1;
  top: 8px;
  left: 8px;
}

.media-file-card__preview {
  display: grid;
  width: 100%;
  height: 132px;
  flex: 0 0 132px;
  place-items: center;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-bottom: 1px solid var(--console-border);
  background: var(--console-surface-muted);
  cursor: pointer;
}

.media-file-card__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-file-card__badge {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  color: var(--console-text-secondary);
  background: var(--console-surface);
  font-size: 12px;
  font-weight: 700;
}

.media-file-card__badge.is-code { color: #389e0d; }
.media-file-card__badge.is-document { color: #d48806; }
.media-file-card__badge.is-archive { color: #cf1322; }

.media-file-card__info {
  display: grid;
  gap: 5px;
  min-width: 0;
  padding: 10px 11px 8px;
}

.media-file-card__info strong {
  overflow: hidden;
  color: var(--console-text);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-file-card__info > span,
.media-file-card__info :deep(.ant-badge-status-text) {
  overflow: hidden;
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-file-card__actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 8px 8px;
}

.media-file-grid__footer {
  display: flex;
  justify-content: center;
  flex: 0 0 auto;
  padding: 14px 0 2px;
}

@media (max-width: 680px) {
  .media-file-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .media-file-card {
    min-height: 214px;
  }

  .media-file-card__preview {
    height: 104px;
    flex-basis: 104px;
  }

  .media-file-card__info {
    padding: 8px;
  }

  .media-file-card__actions {
    padding: 0 5px 6px;
  }
}

@media (max-width: 380px) {
  .media-file-grid {
    grid-template-columns: 1fr;
  }
}
</style>
