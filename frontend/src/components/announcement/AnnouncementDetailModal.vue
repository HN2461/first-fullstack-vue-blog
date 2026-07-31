<template>
  <a-modal
    v-model:open="open"
    :title="announcement?.title"
    :footer="null"
    width="560px"
    centered
    class="announce-detail-modal"
  >
    <template v-if="announcement">
      <div class="announce-detail-meta">
        <a-tag :color="getLevelColor(announcement.level)">
          {{ getLevelText(announcement.level) }}
        </a-tag>
        <span>{{ formatDate(announcement.createdAt) }}</span>
      </div>
      <a-divider style="margin: 14px 0" />
      <div class="announce-detail-content">
        <AnnouncementContent :content="announcement.content" />
      </div>
      <div v-if="announcement.link" class="announce-detail-link">
        <LinkOutlined /> <a :href="announcement.link" target="_blank">{{ announcement.link }}</a>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { LinkOutlined } from '@ant-design/icons-vue'
import AnnouncementContent from './AnnouncementContent.vue'

defineProps({
  announcement: {
    type: Object,
    default: null
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
  }
})

const open = defineModel('open', {
  type: Boolean,
  default: false
})
</script>

<style scoped>
.announce-detail-modal :deep(.ant-modal-body) {
  padding: 24px 28px;
}

.announce-detail-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--console-text-secondary, #667085);
}

.announce-detail-content {
  max-height: min(58vh, 460px);
  overflow-y: auto;
  padding-right: 4px;
}

.announce-detail-link {
  margin-top: 12px;
  font-size: 13px;
}
</style>
