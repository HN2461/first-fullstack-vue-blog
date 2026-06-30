<template>
  <aside class="discussion-list">
    <div class="discussion-list__toolbar">
      <a-input-search v-model:value="keyword" placeholder="筛选讨论" allow-clear />
      <a-tooltip title="新建讨论">
        <a-button type="primary" @click="$emit('create')">
          <template #icon><PlusOutlined /></template>
        </a-button>
      </a-tooltip>
    </div>

    <a-spin :spinning="loading">
      <div v-if="filteredThreads.length" class="discussion-list__items">
        <button
          v-for="thread in filteredThreads"
          :key="thread.id"
          :class="['discussion-list__item', { active: thread.id === activeId }]"
          type="button"
          @click="$emit('select', thread.id)"
        >
          <span class="discussion-list__avatar">{{ getInitial(thread.title) }}</span>
          <span class="discussion-list__body">
            <span class="discussion-list__title-row">
              <strong>{{ thread.title }}</strong>
              <a-badge v-if="thread.unreadCount" :count="thread.unreadCount" :overflow-count="99" />
            </span>
            <span class="discussion-list__preview">{{ thread.lastMessagePreview || '暂无讨论内容' }}</span>
          </span>
          <small>{{ formatRelativeTime(thread.lastMessageAt || thread.updatedAt) }}</small>
        </button>
      </div>

      <div v-else class="discussion-list__empty">
        <MessageOutlined />
        <span>暂无讨论</span>
      </div>
    </a-spin>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'
import { MessageOutlined, PlusOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  threads: {
    type: Array,
    default: () => []
  },
  activeId: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select', 'create'])

const keyword = ref('')
const filteredThreads = computed(() => {
  const text = keyword.value.trim().toLowerCase()
  if (!text) return props.threads
  return props.threads.filter((thread) => {
    return `${thread.title || ''} ${thread.lastMessagePreview || ''}`.toLowerCase().includes(text)
  })
})

function getInitial(title = '') {
  return (title.trim() || '讨').slice(0, 1).toUpperCase()
}

function formatRelativeTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const diff = Date.now() - date.getTime()
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} 小时前`
  return `${date.getMonth() + 1}-${date.getDate()}`
}
</script>
