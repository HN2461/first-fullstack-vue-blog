<template>
  <span class="notification-tab-label">
    {{ label }}
    <a-badge
      v-if="count"
      :count="count"
      :overflow-count="99"
      size="small"
    />
  </span>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.notification-tab-label {
  display: inline-flex;
  min-width: 54px;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.notification-tab-label :deep(.ant-badge-count) {
  box-shadow: none;
}
</style>
