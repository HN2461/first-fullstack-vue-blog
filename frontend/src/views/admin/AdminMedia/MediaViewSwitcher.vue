<template>
  <div class="media-view-switcher" role="group" aria-label="资源视图切换">
    <a-tooltip title="列表视图">
      <a-button
        type="text"
        size="small"
        :class="{ 'is-active': modelValue === 'list' }"
        aria-label="列表视图"
        @click="select('list')"
      >
        <template #icon><UnorderedListOutlined /></template>
      </a-button>
    </a-tooltip>
    <a-tooltip title="文件夹视图">
      <a-button
        type="text"
        size="small"
        :class="{ 'is-active': modelValue === 'folders' }"
        aria-label="文件夹视图"
        @click="select('folders')"
      >
        <template #icon><AppstoreOutlined /></template>
      </a-button>
    </a-tooltip>
  </div>
</template>

<script setup>
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'list'
  }
})

const emit = defineEmits(['update:modelValue'])

function select(value) {
  if (props.modelValue !== value) {
    emit('update:modelValue', value)
  }
}
</script>

<style scoped>
.media-view-switcher {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--console-border);
  border-radius: 6px;
  background: var(--console-surface-muted);
}

.media-view-switcher :deep(.ant-btn) {
  width: 30px;
  min-width: 30px;
  height: 28px;
  padding: 0;
  color: var(--console-text-secondary);
}

.media-view-switcher :deep(.ant-btn.is-active) {
  color: var(--console-primary-strong);
  background: var(--console-surface);
  box-shadow: 0 1px 3px rgb(15 23 42 / 8%);
}
</style>
