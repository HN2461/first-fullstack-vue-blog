<template>
  <article
    class="media-folder-card"
    :class="{ 'is-system': folder.system }"
    role="button"
    tabindex="0"
    @click="emit('open', folder)"
    @keydown.enter.prevent="emit('open', folder)"
    @keydown.space.prevent="emit('open', folder)"
  >
    <div class="media-folder-card__icon" aria-hidden="true">
      <FolderOpenOutlined />
    </div>
    <div class="media-folder-card__body">
      <div class="media-folder-card__title" :title="folder.name">
        <strong>{{ folder.name }}</strong>
      </div>
      <div class="media-folder-card__meta">
        <span>{{ folder.count || 0 }} 个资源</span>
        <a-tag v-if="folder.system" class="media-folder-card__system-tag" :bordered="true" color="blue">系统</a-tag>
      </div>
      <small class="media-folder-card__description" :title="folder.ownerName ? `归属：${folder.ownerName}` : (folder.description || '资源分类文件夹')">
        {{ folder.ownerName ? `归属：${folder.ownerName}` : (folder.description || '资源分类文件夹') }}
      </small>
    </div>
    <RightOutlined class="media-folder-card__arrow" aria-hidden="true" />
  </article>
</template>

<script setup>
import { FolderOpenOutlined, RightOutlined } from '@ant-design/icons-vue'

defineProps({
  folder: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['open'])
</script>

<style scoped>
.media-folder-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
  min-height: 104px;
  padding: 13px 14px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  cursor: pointer;
  transition: border-color 0.16s ease, background 0.16s ease, transform 0.16s ease;
}

.media-folder-card:hover,
.media-folder-card:focus-visible {
  border-color: var(--console-primary-strong);
  background: var(--console-surface-hover);
  outline: none;
  transform: translateY(-1px);
}

.media-folder-card.is-system {
  background: var(--console-surface-muted);
}

.media-folder-card__icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 8px;
  color: var(--console-primary-strong);
  background: var(--console-primary-soft);
  font-size: 20px;
}

.media-folder-card.is-system .media-folder-card__icon {
  color: var(--console-text-secondary);
  background: var(--console-surface);
}

.media-folder-card__body {
  display: grid;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.media-folder-card__title {
  display: block;
  min-width: 0;
}

.media-folder-card__title strong {
  display: -webkit-box;
  min-width: 0;
  overflow: hidden;
  color: var(--console-text);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow-wrap: anywhere;
}

.media-folder-card__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  margin-top: 3px;
}

.media-folder-card__meta > span,
.media-folder-card__description {
  overflow: hidden;
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-folder-card__description {
  display: -webkit-box;
  margin: 0;
  white-space: normal;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow-wrap: anywhere;
}

.media-folder-card__system-tag {
  flex: 0 0 auto;
  margin: 0;
  padding-inline: 5px;
  border-radius: 4px;
  font-size: 11px;
  line-height: 18px;
}

.media-folder-card__arrow {
  flex: 0 0 auto;
  margin-top: 3px;
  color: var(--console-text-tertiary, var(--console-text-secondary));
  font-size: 12px;
}
</style>
