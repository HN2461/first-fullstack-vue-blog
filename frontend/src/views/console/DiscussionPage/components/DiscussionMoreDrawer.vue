<template>
  <a-drawer
    :open="open"
    title="讨论状态"
    placement="right"
    width="380"
    @close="$emit('update:open', false)"
  >
    <div class="discussion-more-drawer">
      <section class="discussion-more-drawer__metric">
        <span>当前会话服务器存储</span>
        <strong>{{ formatSize(threadStorage.totalBytes) }}</strong>
        <a-progress :percent="usagePercent" :status="usageStatus" />
        <small>占建议上限 {{ usagePercent }}% · 建议上限 {{ formatSize(limitBytes) }}</small>
        <small>{{ threadStorage.messageCount }} 条消息 · {{ threadStorage.attachmentCount }} 个附件</small>
        <small>文本 {{ formatSize(threadStorage.textBytes) }} / 附件 {{ formatSize(threadStorage.attachmentBytes) }}</small>
      </section>

      <section v-if="storage?.global" class="discussion-more-drawer__metric">
        <span>当前会话占讨论模块</span>
        <strong>{{ globalUsagePercent }}%</strong>
        <a-progress :percent="globalUsagePercent" :show-info="false" />
        <small>当前会话 {{ formatSize(threadStorage.totalBytes) }} / 全部讨论 {{ formatSize(storage.global.totalBytes) }}</small>
      </section>

      <section class="discussion-more-drawer__actions">
        <a-button danger block :loading="clearing" @click="$emit('clear-my-view')">
          清除我的当前会话记录
        </a-button>
        <p>仅让你不再看到当前会话已有记录，不会删除服务器文件，也不会影响其他成员。</p>
      </section>

      <section v-if="storage?.global" class="discussion-more-drawer__metric">
        <span>讨论模块总存储</span>
        <strong>{{ formatSize(storage.global.totalBytes) }}</strong>
        <small>{{ storage.global.messageCount }} 条消息 · {{ storage.global.attachmentCount }} 个附件</small>
      </section>

      <section v-if="storage?.global" class="discussion-more-drawer__actions">
        <a-button danger block :loading="purging" @click="$emit('purge-thread')">
          清理当前会话服务器记录
        </a-button>
        <a-button danger block :loading="purgingAll" @click="$emit('purge-all')">
          清理全部讨论历史
        </a-button>
        <p>超级管理员操作会删除服务器消息和附件，并向相关成员发布清理通知。</p>
      </section>
    </div>
  </a-drawer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  storage: {
    type: Object,
    default: null
  },
  limitBytes: {
    type: Number,
    default: 50 * 1024 * 1024
  },
  clearing: {
    type: Boolean,
    default: false
  },
  purging: {
    type: Boolean,
    default: false
  },
  purgingAll: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:open', 'clear-my-view', 'purge-thread', 'purge-all'])

const threadStorage = computed(() => {
  return props.storage?.thread || {
    messageCount: 0,
    attachmentCount: 0,
    textBytes: 0,
    attachmentBytes: 0,
    totalBytes: 0
  }
})

const usagePercent = computed(() => {
  return Math.min(100, Math.round((threadStorage.value.totalBytes / props.limitBytes) * 100))
})

const globalUsagePercent = computed(() => {
  const total = props.storage?.global?.totalBytes || 0
  if (!total) return 0
  return Math.min(100, Math.round((threadStorage.value.totalBytes / total) * 100))
})

const usageStatus = computed(() => {
  if (usagePercent.value >= 90) return 'exception'
  if (usagePercent.value >= 70) return 'active'
  return 'normal'
})

function formatSize(size = 0) {
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${(size / 1024 / 1024).toFixed(1)}MB`
}
</script>
