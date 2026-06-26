<template>
  <div class="announce-panel">
    <div class="announce-panel-header">
      <strong>公告通知</strong>
      <a-button
        v-if="hasUnread"
        type="link"
        size="small"
        @click="$emit('mark-all-read')"
      >
        全部已读
      </a-button>
    </div>
    <div class="announce-panel-body">
      <template v-if="loading">
        <div class="announce-panel-loading">
          <a-spin size="small" />
        </div>
      </template>
      <template v-else-if="announcements.length === 0">
        <a-empty description="暂无公告" :image-style="{ height: '40px' }" />
      </template>
      <template v-else>
        <div
          v-for="item in announcements"
          :key="item.id"
          :class="['announce-panel-item', { 'announce-panel-item--unread': !item.isRead }]"
          @click="$emit('select', item)"
        >
          <div class="announce-panel-item-dot">
            <span v-if="!item.isRead" class="announce-panel-unread-dot" />
          </div>
          <div class="announce-panel-item-body">
            <div class="announce-panel-item-top">
              <a-tag
                :color="getLevelColor(item.level)"
                size="small"
                class="announce-panel-level-tag"
              >
                {{ getLevelText(item.level) }}
              </a-tag>
              <span class="announce-panel-item-time">{{ formatTimeAgo(item.createdAt) }}</span>
            </div>
            <div class="announce-panel-item-title">{{ item.title }}</div>
            <div class="announce-panel-item-snippet">{{ getSnippet(item.content) }}</div>
          </div>
        </div>
      </template>
    </div>
    <div v-if="announcements.length > 0" class="announce-panel-footer">
      <a-button type="link" size="small" block @click="$emit('view-all')">
        查看全部公告
      </a-button>
      <a-button v-if="canManage" type="link" size="small" block @click="$emit('manage')">
        管理公告
      </a-button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['select', 'mark-all-read', 'view-all', 'manage'])

defineProps({
  announcements: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasUnread: {
    type: Boolean,
    default: false
  },
  canManage: {
    type: Boolean,
    default: false
  },
  getLevelText: {
    type: Function,
    required: true
  },
  getLevelColor: {
    type: Function,
    required: true
  },
  formatTimeAgo: {
    type: Function,
    required: true
  },
  getSnippet: {
    type: Function,
    required: true
  }
})
</script>

<style scoped>
.announce-panel {
  width: 380px;
  max-height: 460px;
  display: flex;
  flex-direction: column;
  background: var(--console-surface, #fff);
  color: var(--console-text, #101828);
  border-radius: 10px;
  overflow: hidden;
}

.announce-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--console-border, #e5e7eb);
}

.announce-panel-header strong {
  font-size: 15px;
  font-weight: 600;
}

.announce-panel-body {
  flex: 1;
  overflow-y: auto;
  max-height: 340px;
  padding: 4px 0;
}

.announce-panel-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.announce-panel-item {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.announce-panel-item:hover {
  background: var(--console-surface-hover, #f2f6fc);
}

.announce-panel-item--unread {
  background: var(--console-primary-soft, #eaf2ff);
}

.announce-panel-item--unread:hover {
  background: var(--console-surface-hover, #f2f6fc);
}

.announce-panel-item-dot {
  flex: 0 0 8px;
  padding-top: 6px;
}

.announce-panel-unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: block;
  background: var(--console-primary, #1668dc);
}

.announce-panel-item-body {
  flex: 1;
  min-width: 0;
}

.announce-panel-item-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.announce-panel-level-tag {
  font-size: 11px !important;
  padding: 0 5px !important;
  line-height: 18px !important;
  border: 0 !important;
}

.announce-panel-item-time {
  font-size: 11px;
  color: var(--console-text-secondary, #667085);
}

.announce-panel-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--console-text, #101828);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
}

.announce-panel-item-snippet {
  font-size: 12px;
  color: var(--console-text-secondary, #667085);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

.announce-panel-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  border-top: 1px solid var(--console-border, #e5e7eb);
  text-align: center;
}

.announce-panel-footer :deep(.ant-btn) {
  width: auto;
  min-width: 104px;
  padding-inline: 8px;
}

@media (max-width: 640px) {
  .announce-panel {
    width: min(92vw, 380px);
  }

  .announce-panel-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .announce-panel-footer :deep(.ant-btn) {
    width: 100%;
  }
}
</style>
