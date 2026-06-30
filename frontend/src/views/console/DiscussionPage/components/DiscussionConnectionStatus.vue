<template>
  <div
    v-if="visible"
    class="discussion-connection-status"
    :class="{ 'discussion-connection-status--warning': status.reconnecting || status.connecting }"
  >
    <span class="discussion-connection-status__dot" />
    <span class="discussion-connection-status__text">{{ statusText }}</span>
    <a-button size="small" type="link" @click="$emit('reconnect')">
      重新连接
    </a-button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['reconnect'])

const visible = computed(() => {
  return !props.status.connected && (
    props.status.connecting ||
    props.status.reconnecting ||
    props.status.manualReconnectRequired ||
    props.status.lastError ||
    props.status.lastReason
  )
})

const statusText = computed(() => {
  if (props.status.connecting) return '消息服务连接中'
  if (props.status.reconnecting) {
    const attempt = props.status.reconnectAttempt ? `第 ${props.status.reconnectAttempt} 次` : ''
    return `消息连接异常，正在${attempt}重连`
  }
  if (props.status.manualReconnectRequired) return '消息连接已断开，请重新连接'
  return props.status.lastError || props.status.lastReason || '消息连接异常'
})
</script>
