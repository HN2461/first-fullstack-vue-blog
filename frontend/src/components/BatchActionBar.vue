<template>
  <div v-if="count > 0" class="batch-action-bar">
    <a-tag color="processing" class="batch-action-bar__count">
      已选 {{ count }} 条
    </a-tag>
    <slot />
    <a-button size="small" @click="$emit('clear')">清空</a-button>
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 0 }
})

defineEmits(['clear'])
</script>

<style scoped>
.batch-action-bar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.batch-action-bar__count {
  margin: 0;
  font-weight: 600;
  white-space: nowrap;
}
</style>
