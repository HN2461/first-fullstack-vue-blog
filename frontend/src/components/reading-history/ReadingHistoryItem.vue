<template>
  <article class="reading-history-item">
    <button class="reading-history-item__main" type="button" @click="$emit('continue', item)">
      <span class="reading-history-item__title">{{ item.article?.title || '文章已不可用' }}</span>
      <span class="reading-history-item__meta">
        <span>{{ item.article?.category?.name || '未分类' }}</span>
        <span>{{ formatReadingHistoryTime(item.lastReadAt) }}</span>
        <span v-if="hasArticleChangedSinceReading(item)" class="reading-history-item__updated">文章已更新</span>
      </span>
      <span class="reading-history-item__progress">
        <a-progress
          :percent="Math.round(item.progressPercent || 0)"
          :show-info="false"
          size="small"
          :status="item.completedAt ? 'success' : 'normal'"
        />
        <strong>{{ item.completedAt ? '已读完' : `${Math.round(item.progressPercent || 0)}%` }}</strong>
      </span>
    </button>

    <a-dropdown trigger="click">
      <a-button class="reading-history-item__more" type="text" aria-label="阅读记录操作" @click.stop>
        <template #icon><MoreOutlined /></template>
      </a-button>
      <template #overlay>
        <a-menu @click="handleAction">
          <a-menu-item key="restart">
            <template #icon><ReloadOutlined /></template>
            从头阅读
          </a-menu-item>
          <a-menu-item key="remove" danger>
            <template #icon><DeleteOutlined /></template>
            移除记录
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </article>
</template>

<script setup>
import { DeleteOutlined, MoreOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { formatReadingHistoryTime, hasArticleChangedSinceReading } from '@/utils/readingHistory'

const props = defineProps({
  item: { type: Object, required: true }
})

const emit = defineEmits(['continue', 'restart', 'remove'])

function handleAction({ key }) {
  emit(key, props.item)
}
</script>

<style scoped>
.reading-history-item {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 36px;
  align-items: center;
  gap: 4px;
  min-width: 0;
  border-bottom: 1px solid var(--console-border);
}

.reading-history-item__main {
  min-width: 0;
  display: grid;
  gap: 7px;
  border: 0;
  padding: 13px 4px;
  color: var(--console-text);
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.reading-history-item__main:hover .reading-history-item__title {
  color: var(--console-primary-strong);
}

.reading-history-item__title {
  overflow: hidden;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reading-history-item__meta {
  display: flex;
  align-items: center;
  gap: 6px 10px;
  min-width: 0;
  flex-wrap: wrap;
  color: var(--console-text-secondary);
  font-size: 12px;
}

.reading-history-item__updated {
  color: var(--color-warning, #d97706);
}

.reading-history-item__progress {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 52px;
  align-items: center;
  gap: 10px;
}

.reading-history-item__progress strong {
  color: var(--console-text-secondary);
  font-size: 12px;
  text-align: right;
  white-space: nowrap;
}

.reading-history-item__more {
  width: 36px;
  height: 36px;
  color: var(--console-text-secondary);
}
</style>
