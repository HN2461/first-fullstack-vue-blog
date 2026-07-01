<template>
  <div class="bookmark-list-panel">
    <div class="bookmark-list-panel__head">
      <div class="bookmark-list-panel__title">
        <span>{{ title }}</span>
        <small>{{ total }} 条</small>
      </div>
      <div class="bookmark-list-panel__tools">
        <a-checkbox
          :checked="allSelected"
          :indeterminate="hasPartialSelected"
          @change="$emit('toggle-all', $event.target.checked)"
        >
          全选
        </a-checkbox>
        <a-button size="small" :disabled="!selectedCount" @click="$emit('move-selected')">
          <template #icon><SwapOutlined /></template>
          移动
        </a-button>
      </div>
    </div>

    <a-spin :spinning="loading">
      <div v-if="bookmarks.length" class="bookmark-list">
        <article
          v-for="bookmark in bookmarks"
          :key="bookmark.id"
          class="bookmark-row"
          draggable="true"
          @dragstart="$emit('drag-start', bookmark.id)"
          @dragend="$emit('drag-end')"
          @dragover.prevent
          @drop="$emit('drop', bookmark.id)"
        >
          <div class="bookmark-row__select">
            <a-checkbox
              :checked="selectedIds.includes(bookmark.id)"
              @change="$emit('toggle-select', bookmark.id, $event.target.checked)"
            />
            <span class="bookmark-row__drag"><DragOutlined /></span>
          </div>
          <div class="bookmark-row__main">
            <a-popover overlay-class-name="bookmark-preview-popover" placement="topLeft">
              <template #content>
                <div class="bookmark-preview">
                  <strong>{{ bookmark.title }}</strong>
                  <a :href="bookmark.url" target="_blank" rel="noreferrer">{{ bookmark.url }}</a>
                  <div v-if="bookmark.tags?.length" class="bookmark-preview__tags">
                    <a-tag v-for="tag in bookmark.tags" :key="tag" :bordered="false">{{ tag }}</a-tag>
                  </div>
                  <p v-if="bookmark.note">{{ bookmark.note }}</p>
                </div>
              </template>
              <a class="bookmark-row__title" :href="bookmark.url" target="_blank" rel="noreferrer">
                {{ bookmark.title }}
              </a>
            </a-popover>
            <a-tooltip :title="bookmark.url" overlay-class-name="bookmark-soft-tooltip">
              <span class="bookmark-row__url">{{ bookmark.url }}</span>
            </a-tooltip>
          </div>
          <div class="bookmark-row__meta">
            <a-tooltip v-if="bookmark.tags?.length" overlay-class-name="bookmark-soft-tooltip">
              <template #title>{{ bookmark.tags.join('，') }}</template>
              <span class="bookmark-row__tags">
                <TagsOutlined />
                {{ bookmark.tags.join('，') }}
              </span>
            </a-tooltip>
            <a-tooltip v-if="bookmark.note" overlay-class-name="bookmark-soft-tooltip">
              <template #title>{{ bookmark.note }}</template>
              <span class="bookmark-row__note">
                <FileTextOutlined />
                {{ bookmark.note }}
              </span>
            </a-tooltip>
            <span class="bookmark-row__time">{{ formatTime(bookmark.updatedAt) }}</span>
          </div>
          <div class="bookmark-row__actions">
            <a-tooltip title="打开链接">
              <a-button size="small" :href="bookmark.url" target="_blank">
                <template #icon><ExportOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="编辑">
              <a-button size="small" @click="$emit('edit', bookmark)">
                <template #icon><EditOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="删除">
              <a-button size="small" danger @click="$emit('remove', bookmark)">
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </a-tooltip>
          </div>
        </article>
      </div>

      <a-empty v-else class="bookmark-empty" description="暂无书签" />
    </a-spin>

    <div v-if="total > pageSize" class="bookmark-list-panel__pager">
      <a-pagination
        :current="page"
        :page-size="pageSize"
        :total="total"
        show-less-items
        @change="$emit('page-change', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import {
  DeleteOutlined,
  DragOutlined,
  EditOutlined,
  ExportOutlined,
  FileTextOutlined,
  SwapOutlined,
  TagsOutlined
} from '@ant-design/icons-vue'
import { formatTime } from './bookmarkUtils'

defineProps({
  bookmarks: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  title: { type: String, default: '全部书签' },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 },
  selectedIds: { type: Array, default: () => [] },
  selectedCount: { type: Number, default: 0 },
  allSelected: { type: Boolean, default: false },
  hasPartialSelected: { type: Boolean, default: false }
})

defineEmits(['edit', 'remove', 'page-change', 'drag-start', 'drag-end', 'drop', 'toggle-select', 'toggle-all', 'move-selected'])
</script>

<style scoped>
.bookmark-list-panel {
  min-width: 0;
  height: fit-content;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  overflow: hidden;
}

.bookmark-list-panel__head {
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--console-border);
  padding: 0 14px;
}

.bookmark-list-panel__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.bookmark-list-panel__title span {
  color: var(--console-text);
  font-weight: 650;
}

.bookmark-list-panel__title small {
  color: var(--console-text-secondary);
}

.bookmark-list-panel__tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bookmark-list {
  display: grid;
}

.bookmark-row {
  display: grid;
  grid-template-columns: 48px minmax(220px, 1.4fr) minmax(220px, 1fr) max-content;
  gap: 12px;
  align-items: center;
  min-height: 68px;
  border-bottom: 1px solid var(--console-border);
  padding: 10px 14px;
  background: var(--console-surface);
}

.bookmark-row:hover {
  background: var(--console-surface-hover);
}

.bookmark-row__select {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.bookmark-row__drag {
  color: var(--console-text-secondary);
  cursor: grab;
}

.bookmark-row__main,
.bookmark-row__meta {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.bookmark-row__title,
.bookmark-row__url,
.bookmark-row__tags,
.bookmark-row__note,
.bookmark-row__time {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookmark-row__title {
  color: var(--console-text);
  font-weight: 650;
}

.bookmark-row__url {
  color: var(--console-primary-strong);
  font-size: 12px;
}

.bookmark-row__tags,
.bookmark-row__note,
.bookmark-row__time {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--console-text-secondary);
  font-size: 12px;
}

.bookmark-row__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.bookmark-list-panel__pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px 14px;
}

.bookmark-empty {
  padding: 72px 0;
}

.bookmark-preview {
  width: min(420px, calc(100vw - 64px));
  display: grid;
  gap: 8px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.bookmark-preview strong {
  color: var(--console-text);
}

.bookmark-preview a {
  color: var(--console-primary-strong);
  word-break: break-all;
}

.bookmark-preview p {
  margin: 0;
  color: var(--console-text-secondary);
  white-space: pre-wrap;
}

.bookmark-preview__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

:global(.bookmark-soft-tooltip .ant-tooltip-inner) {
  max-width: min(420px, calc(100vw - 48px));
  border-radius: 8px;
  line-height: 1.6;
  overflow-wrap: anywhere;
  word-break: break-word;
}

:global(.bookmark-preview-popover .ant-popover-inner) {
  max-width: min(460px, calc(100vw - 48px));
  border-radius: 8px;
}

@media (max-width: 1080px) {
  .bookmark-row {
    grid-template-columns: 44px minmax(0, 1fr) max-content;
  }

  .bookmark-row__meta {
    grid-column: 2 / 3;
  }

  .bookmark-row__actions {
    grid-row: 1 / 3;
    grid-column: 3 / 4;
  }
}

@media (max-width: 680px) {
  .bookmark-row {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .bookmark-row__actions {
    grid-column: 2 / 3;
    grid-row: auto;
  }
}
</style>
