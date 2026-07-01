<template>
  <div class="message-panel">
    <div class="message-panel-body">
      <div v-if="!messages.length" class="message-panel-empty">
        <MessageOutlined />
        <strong>暂无讨论消息</strong>
        <span>离开讨论页后，新消息会在这里集中提醒。</span>
      </div>
      <button
        v-for="item in messages"
        v-else
        :key="item.id"
        class="message-panel-item"
        type="button"
        @click="$emit('select', item)"
      >
        <span class="message-panel-item__icon">
          <NotificationOutlined v-if="isPurgeNotice(item)" />
          <MessageOutlined v-else />
        </span>
        <span class="message-panel-item__body">
          <span class="message-panel-item__top">
            <strong>{{ item.title }}</strong>
            <time>{{ formatTimeAgo(item.createdAt) }}</time>
          </span>
          <span class="message-panel-item__text">{{ item.content }}</span>
          <span class="message-panel-item__meta">
            <span>{{ item.threadId ? '点击进入对应讨论' : '点击进入项目讨论' }}</span>
            <RightOutlined />
          </span>
        </span>
      </button>
    </div>

    <div class="message-panel-footer">
      <a-button
        v-if="messages.length"
        size="small"
        @click="$emit('clear')"
      >
        清空列表
      </a-button>
      <a-button type="primary" size="small" @click="$emit('view-discussions')">
        进入项目讨论
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { MessageOutlined, NotificationOutlined, RightOutlined } from '@ant-design/icons-vue'

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

function isPurgeNotice(item) {
  return String(item?.id || '').startsWith('purged-')
}
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

.message-panel-body {
  max-height: 324px;
  overflow-y: auto;
  padding: 6px 0;
}

.message-panel-empty {
  display: flex;
  min-height: 220px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  padding: 28px 24px;
  color: var(--console-text-secondary, #667085);
  text-align: center;
}

.message-panel-empty .anticon {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--console-border, #e5e7eb);
  border-radius: 8px;
  background: var(--console-surface-muted, #f8fafc);
  color: var(--console-primary, #1668dc);
  font-size: 18px;
}

.message-panel-empty strong {
  color: var(--console-text, #101828);
  font-size: 14px;
  font-weight: 600;
}

.message-panel-empty span {
  max-width: 240px;
  font-size: 12px;
  line-height: 1.6;
}

.message-panel-item {
  display: flex;
  width: 100%;
  gap: 10px;
  padding: 12px 16px;
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
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
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

.message-panel-item__meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  color: var(--console-primary, #1668dc);
  font-size: 11px;
}

.message-panel-item__meta .anticon {
  font-size: 10px;
}

.message-panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--console-border, #e5e7eb);
  background: var(--console-surface, #fff);
}

@media (max-width: 640px) {
  .message-panel {
    width: min(92vw, 380px);
  }
}
</style>
