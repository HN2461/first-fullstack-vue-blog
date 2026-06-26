<template>
  <a-modal
    v-model:open="open"
    title="全部公告"
    :footer="null"
    width="720px"
    centered
    class="announce-timeline-modal"
    :body-style="{ maxHeight: '68vh', overflowY: 'auto' }"
  >
    <div class="announce-timeline-head">
      <span>共 {{ announcements.length }} 条公告</span>
      <a-button
        v-if="hasUnread"
        type="link"
        size="small"
        @click="$emit('mark-all-read')"
      >
        全部已读
      </a-button>
    </div>
    <template v-if="loading">
      <div class="announce-timeline-loading">
        <a-spin size="small" />
      </div>
    </template>
    <a-empty
      v-else-if="announcements.length === 0"
      description="暂无公告"
      :image-style="{ height: '48px' }"
    />
    <a-timeline v-else class="announce-timeline">
      <a-timeline-item
        v-for="item in announcements"
        :key="item.id"
        :color="getTimelineColor(item.level, item.isRead)"
      >
        <article
          :class="['announce-timeline-card', { 'announce-timeline-card--unread': !item.isRead }]"
          @click="$emit('select', item)"
        >
          <div class="announce-timeline-card__top">
            <div>
              <a-tag :color="getLevelColor(item.level)" :bordered="false">
                {{ getLevelText(item.level) }}
              </a-tag>
              <span v-if="!item.isRead" class="announce-timeline-unread">未读</span>
            </div>
            <time>{{ formatDate(item.createdAt) }}</time>
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ getSnippet(item.content, 120) }}</p>
        </article>
      </a-timeline-item>
    </a-timeline>
  </a-modal>
</template>

<script setup>
defineEmits(['select', 'mark-all-read'])

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
  getLevelText: {
    type: Function,
    required: true
  },
  getLevelColor: {
    type: Function,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  },
  getSnippet: {
    type: Function,
    required: true
  }
})

const open = defineModel('open', {
  type: Boolean,
  default: false
})

function getTimelineColor(level, isRead) {
  if (!isRead) return getLevelColor(level)
  return 'gray'
}
</script>

<style scoped>
.announce-timeline-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  color: var(--console-text-secondary, #667085);
  font-size: 13px;
}

.announce-timeline-loading {
  display: flex;
  justify-content: center;
  padding: 56px 0;
}

.announce-timeline {
  padding: 4px 2px 0;
}

.announce-timeline-card {
  padding: 12px 14px;
  border: 1px solid var(--console-border, #e5e7eb);
  border-radius: 8px;
  background: var(--console-surface, #fff);
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease;
}

.announce-timeline-card:hover {
  border-color: color-mix(in srgb, var(--console-primary, #1677ff) 42%, var(--console-border, #e5e7eb));
  background: var(--console-surface-hover, #f7f9fc);
}

.announce-timeline-card--unread {
  border-color: color-mix(in srgb, var(--console-primary, #1677ff) 32%, var(--console-border, #e5e7eb));
  background: color-mix(in srgb, var(--console-primary, #1677ff) 6%, var(--console-surface, #fff));
}

.announce-timeline-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.announce-timeline-card__top > div {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.announce-timeline-card__top time {
  flex: 0 0 auto;
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
}

.announce-timeline-card h3 {
  margin: 0 0 6px;
  color: var(--console-text, #101828);
  font-size: 15px;
  font-weight: 650;
  line-height: 1.5;
}

.announce-timeline-card p {
  margin: 0;
  color: var(--console-text-secondary, #667085);
  font-size: 13px;
  line-height: 1.7;
  word-break: break-word;
}

.announce-timeline-unread {
  color: var(--console-primary, #1677ff);
  font-size: 12px;
  font-weight: 600;
}

@media (max-width: 640px) {
  .announce-timeline-head,
  .announce-timeline-card__top {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
