<template>
  <div class="message-panel">
    <div class="message-panel-header">
      <strong>站内消息</strong>
      <a-button v-if="messages.length" type="link" size="small" @click="$emit('clear')">
        清空列表
      </a-button>
    </div>

    <div class="message-panel-body">
      <a-empty
        v-if="!messages.length"
        description="暂无消息"
        :image-style="{ height: '40px' }"
      />
      <button
        v-for="item in messages"
        v-else
        :key="item.id"
        class="message-panel-item"
        type="button"
        @click="$emit('select', item)"
      >
        <span class="message-panel-item__icon">
          <MessageOutlined />
        </span>
        <span class="message-panel-item__body">
          <span class="message-panel-item__top">
            <strong>{{ item.title }}</strong>
            <time>{{ formatTimeAgo(item.createdAt) }}</time>
          </span>
          <span class="message-panel-item__text">{{ item.content }}</span>
        </span>
      </button>
    </div>

    <div class="message-panel-footer">
      <a-button type="link" size="small" block @click="$emit('view-discussions')">
        进入项目讨论
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { MessageOutlined } from '@ant-design/icons-vue'

defineEmits(['select', 'clear', 'view-discussions'])

defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  formatTimeAgo: {
    type: Function,
    required: true
  }
})
</script>

<style scoped>
.message-panel {
  display: flex;
  width: 380px;
  max-height: 460px;
  flex-direction: column;
  overflow: hidden;
  background: var(--console-surface, #fff);
  color: var(--console-text, #101828);
}

.message-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 8px;
  border-bottom: 1px solid var(--console-border, #e5e7eb);
}

.message-panel-header strong {
  font-size: 15px;
  font-weight: 600;
}

.message-panel-body {
  max-height: 324px;
  overflow-y: auto;
  padding: 4px 0;
}

.message-panel-item {
  display: flex;
  width: 100%;
  gap: 10px;
  padding: 12px 14px;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;
}

.message-panel-item:hover {
  background: var(--console-surface-hover, #f2f6fc);
}

.message-panel-item__icon {
  display: inline-flex;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: var(--console-primary-soft, #eaf2ff);
  color: var(--console-primary, #1668dc);
}

.message-panel-item__body {
  min-width: 0;
  flex: 1;
}

.message-panel-item__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.message-panel-item__top strong {
  min-width: 0;
  overflow: hidden;
  color: var(--console-text, #101828);
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-panel-item__top time {
  flex: 0 0 auto;
  color: var(--console-text-secondary, #667085);
  font-size: 11px;
}

.message-panel-item__text {
  display: block;
  overflow: hidden;
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-panel-footer {
  padding: 8px 12px;
  border-top: 1px solid var(--console-border, #e5e7eb);
}

@media (max-width: 640px) {
  .message-panel {
    width: min(92vw, 380px);
  }
}
</style>
